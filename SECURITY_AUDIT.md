# SECURITY AUDIT — ResortBook / DoGuest Admin

Scope: full stack (FastAPI backend on Render/Neon, React SPA on Vercel).
Date: 2026-08-05. Branch: `audit/security-pass`.

## Summary

No P0 (critical, remotely exploitable) issues found. All P1 findings fixed in this branch.
Four items are documented as open product/ops decisions with recommendations, not silent fixes.
Backend Python dependencies are clean (`pip-audit` against `requirements.txt` + `requirements-dev.txt`: 0 known vulns).
Frontend: 1 dev-only transitive vuln cleared with `npm audit fix`; 2 remaining `react-router` advisories are RSC-mode-only and not reachable by this SPA (see P2-4).

Phase 3 (real auth) resolves all four open items except the Neon tier upgrade for PITR, which is documented as an ops step.

## Priority table

| # | Priority | File:Line | Issue | Exploit / Impact | Fix (status) |
|---|----------|-----------|-------|------------------|--------------|
| 1 | P1 | `backend/app/ratelimit.py:26-55` (was: only writes throttled, socket-IP only) | Token brute-force was unthrottled: `GET`/`HEAD` never counted, auth failures never tracked; client identity came from the raw socket peer (`request.client.host`), which on Render is the load balancer, so all requests shared one bucket | Unlimited `401` attempts against the single `ADMIN_TOKEN` (only credential), no lockout | Client IP parsed from `X-Forwarded-For` (leftmost, the original client appended by the LB) with socket fallback; per-IP auth-failure window (10/window) **plus a global auth-failure bucket (50/window)** so header-spoofing cannot rotate past the throttle. Write limiter uses the same IP source. Config: `RATE_LIMIT_AUTH_FAILURES`, `RATE_LIMIT_GLOBAL_AUTH_FAILURES`. Regression tests: `test_auth_failure_throttle`, `test_auth_throttle_cannot_be_bypassed_with_spoofed_ip`. **FIXED** |
| 2 | P1 | `backend/app/main.py` (no body-size guard) | No request-body size limit | JSON-body DoS: arbitrary large POST/PUT payloads buffered and parsed | New `backend/app/body_limit.py` `MaxBodySizeMiddleware` (pure ASGI, rejects with `413` once > `MAX_BODY_BYTES`). Config: `MAX_BODY_BYTES` (default 1,000,000). Regression test: `test_body_size_limit_413`. **FIXED** |
| 3 | P1 | `backend/app/auth.py:13` (was: `!=` compare) | Non-constant-time token comparison on the only credential | Timing side-channel leaks token-prefix validity over the network | `hmac.compare_digest` over UTF-8 bytes. **FIXED** |
| 4 | P1 | `backend/app/services/stats_service.py:17-28` (was: `select(Booking)` + Python filters) | `/api/v1/stats` loaded every booking row into memory per request | Memory grows with table size; slow on large data (seed: 14 rows, prod: small, but unbounded) | All aggregation now in SQL (`count`/`sum` + `case`), identical response shape. Regression test: `test_stats_aggregation`. **FIXED** |
| 5 | P2 | `backend/app/schemas/booking.py:13-16,27` + `backend/app/routers/bookings.py:34` | Client could set `status`/`payment_status` on create (e.g. bypass the PATCH `/status` endpoint and create "Confirmed"); PUT allowed arbitrary `status` strings | Unauthorized state changes / booking forging past frontend constraints | Create now force-sets `status='Pending'`, `payment_status='Pending'` server-side; `status` on PUT and the PATCH endpoint validated against `VALID_STATUSES` via `booking_service.validate_status`. Regression tests: `test_create_booking_forces_pending`, `test_update_booking_rejects_invalid_status`. **FIXED** |
| 6 | P2 | `vercel.json` | Response headers lacked `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` | MIME-sniffing / framing / referrer leakage on the SPA | Headers added. **FIXED** |
| 7 | P2 | `backend/app/routers/bookings.py:69` (was) | Status whitelist lived in the router, duplicating business logic | Drift risk, violates Router→Service layering | Moved to `booking_service.VALID_STATUSES` + `validate_status`. **FIXED** |

## Checked — no issue found

- **XSS sinks**: grep for `dangerouslySetInnerHTML` / `innerHTML` / `eval` / `document.write` across `src/` — zero matches. All user data (notes, requests, guest names) rendered as escaped JSX text.
- **SQL injection**: no `text()` / f-string SQL anywhere in `backend/app`; all queries are ORM/parameter-bound (confirmed by grep).
- **CSRF**: auth is a JWT in an HttpOnly cookie (`SameSite=Lax`, `Secure` in production) with `withCredentials`. SameSite=Lax prevents cross-site requests from carrying the cookie on POST/PUT/PATCH/DELETE (only top-level GET navigations send it), and all state-changing endpoints require JSON bodies the frontend sends with `Content-Type: application/json` — a cross-site HTML form cannot issue them. No `Access-Control-Allow-Origin: *`; CORS is pinned to configured origins.
- **CSP**: already present in `vercel.json` — `script-src 'self'`, `connect-src` pinned to the Render API, `frame-src 'self'`.
- **Auth fail-closed**: `JWT_SECRET` empty → token decode fails → every protected route 401. Login requires `ADMIN_EMAIL`/`ADMIN_PASSWORD` configured (503 otherwise). No default/backdoor credential.
- **Session hygiene**: `database.py:18` `expire_on_commit=False`; `get_session` closes via `async with` and rolls back on error.
- **Password storage**: Argon2 (`pwdlib[argon2]`), default recommended params, `PasswordHash.recommended()`. No plaintext or reversible storage.
- **Token expiry & rotation**: JWTs expire (`JWT_EXPIRY_MINUTES`, default 480) and carry a `pwd` claim = `password_changed_at` timestamp; any password change invalidates every previously issued token (verified in `get_current_user`).
- **`created_at` integrity**: not client-settable (absent from schemas; Pydantic ignores unknown fields).
- **Pricing integrity**: `nights`/`total` always server-computed (`bookings.py:33-36`), client-sent values overwritten; frontend totals use the same `computeBookingTotal`/`compute_total` logic.
- **IDOR (Object-Level Authorization) — NOT APPLICABLE, by design**: there is no per-user resource ownership anywhere. Every route sits behind the single `require_admin` dependency (`main.py:39-45`); guests/rooms/bookings are resort-owned global resources, not user-scoped. A caller either presents a valid session cookie (full access) or fails auth before any object is resolved — there is no authorization boundary between two legitimate users to violate.
- **Error responses**: 401/404/409/422 do not leak internals.

## Open items — needs a product/ops decision (NOT fixed, by design)

| Area | Detail | Recommendation |
|------|--------|----------------|
| Backups / PITR | Neon free tier: no PITR / no automated backups | Upgrade Neon tier or add scheduled `pg_dump` to external storage — see `PITR` section below for the exact steps |

## PITR (point-in-time recovery) runbook

Neon Postgres PITR requires a paid tier; enable it in the Neon console under **Project → Settings → Branching / Time travel**.

1. In the Neon dashboard open the project, go to **Settings → Time Travel** (or **Branching**), and enable *Point-in-time recovery* (retention up to 7 days on paid tiers; choose the retention window you need).
2. On Vercel, add an env var `DATABASE_URL` that targets a fixed branch name (`…/branches/<branch>/neondb`) so restores don't silently pin to a moving default branch.
3. To restore to an earlier point in time: **Project → Branches → Restore**, pick the branch + timestamp, and confirm. This creates a new branch; promote it via **Set as primary** and redeploy Vercel with the new `DATABASE_URL`.
4. Until PITR is enabled, keep the manual JSON Export from Settings (**Data & Backup → Export Backup**) as the fallback; it is intentionally kept client-side and covers all tables.

Note: `rate_limits` and `security_events` rows are safe to lose on restore (they are ephemeral security telemetry, not bookable data).

## Resolved in Phase 3 (real auth)

- **Multi-user auth (open item)**: replaced the single shared `ADMIN_TOKEN` with a JWT in an HttpOnly `SameSite=Lax` cookie (`backend/app/auth.py`), Argon2 password hashing (`pwdlib[argon2]`), and a single admin account provisioned on first login from `ADMIN_EMAIL`/`ADMIN_PASSWORD` env vars with `must_change_password=True` (forced password change on first sign-in — `backend/app/routers/auth.py`). Endpoints: `POST /api/v1/auth/login`, `POST /api/v1/auth/logout`, `POST /api/v1/auth/change-password`, `GET /api/v1/auth/me`. Login returns 503 when env creds are unconfigured. Tokens expire (`JWT_EXPIRY_MINUTES`) and are invalidated on password change via the `pwd` claim. Regression tests: `tests/test_auth.py`.
- **Token storage (open item)**: frontend no longer keeps any token in `sessionStorage`; `src/api/client.js` uses `withCredentials` and relies on the server cookie. The old `doguest_token` storage and Bearer-header interceptor were removed. Frontend tests: `src/pages/Login.test.jsx`, `src/components/ChangePasswordForm.test.jsx`.
- **Rate limiter persistence (open item)**: `backend/app/ratelimit.py` rewritten from an in-memory dict to a Postgres-backed window (table `rate_limits`) — survives restarts and is correct across multiple instances (Render can run >1). Same semantics kept: write bucket, per-IP auth-failure bucket, global auth-failure bucket, `X-Forwarded-For` parsing, `429` + `Retry-After`. Tests: `tests/test_rate_limit.py`, `tests/test_security_controls.py`.
- **Audit log (new, closes a review gap)**: `security_events` table records login success/failure, password changes, and logouts with user id + client IP (`backend/app/services/audit_service.py`). Written in a dedicated committed session so failed-login events survive the request's rollback. Tests: `tests/test_audit.py`.
- **Pydantic constraints**: login/change-password schemas enforce email format (`EmailStr`) and `min_length=8` passwords (`backend/app/schemas/auth.py`).

## Resolved after this audit

- **Demo-data auto-seed footgun**: the client auto-seeded (`POST /api/v1/seed`) whenever `GET /resort` returned 404, so a brand-new production DB would silently fill with demo rooms/guests/bookings. Now: seeding is gated behind `SEED_ENABLED` (default `false`, returns 403 when off — `seed.py`), `GET /resort` returns an empty shell and `PUT /resort` upserts (`resort.py`), and the frontend auto-seed + `useSeedDemo` were removed. Owner-first-run is via Settings on a fresh DB. Regression tests: `tests/test_onboarding.py`.

## Dependency audit

- Backend: `pip-audit` on `requirements.txt` + `requirements-dev.txt` → **0 known vulnerabilities**.
- Frontend: `npm audit fix` cleared `brace-expansion` (dev-only, nested under `eslint-plugin-react`). `react-router`/`react-router-dom` `GHSA-qwww-vcr4-c8h2` ("RSC Mode CSRF Bypass…") — verified against the advisory page: affected `>= 7.12.0, < 7.18.2` and `>= 8.0.0, < 8.3.0`; **patched `>= 7.18.2` and `>= 8.3.0`**. Advisory also states: **"This only affects your application if you are using the unstable RSC APIs"** — this project uses plain `BrowserRouter` client rendering with no RSC, loaders, or actions, so the affected code path is unreachable. Bumped `react-router-dom` to **7.18.2** (patched; `react-router-dom` is not published on the v8 line). Note: `npm audit` may still list this advisory because the registry advisory metadata lags the GitHub advisory's patched-range update; verified against the GitHub advisory page. Frontend tests added with Vitest (see `src/**/*.test.*`).

## Regression coverage added

`backend/tests/test_security_controls.py`:
- auth-failure throttle (401→429 transition)
- request body size limit (413)
- create forces `Pending` status (server-authoritative)
- PUT/PATCH status validation (400 on bogus status, 200 on valid)
- stats SQL aggregation response shape (counts, occupied, occupancy%)

`backend/tests/test_auth.py`: cookie auth required, invalid-cookie 401, login success/failure/validation, forced password change flow, token invalidation on password change, logout clears cookie, 503 when env unconfigured.
`backend/tests/test_audit.py`: login success/failure, password change, and logout are recorded.

Suite: **55/55 backend passing** (Phase 1-3), **36/36 frontend passing**. Frontend `oxlint` clean, `npm run build` clean.
