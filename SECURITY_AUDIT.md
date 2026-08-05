# SECURITY AUDIT — ResortBook / DoGuest Admin

Scope: full stack (FastAPI backend on Render/Neon, React SPA on Vercel).
Date: 2026-08-05. Branch: `audit/security-pass`.

## Summary

No P0 (critical, remotely exploitable) issues found. All P1 findings fixed in this branch.
Four items are documented as open product/ops decisions with recommendations, not silent fixes.
Backend Python dependencies are clean (`pip-audit` against `requirements.txt` + `requirements-dev.txt`: 0 known vulns).
Frontend: 1 dev-only transitive vuln cleared with `npm audit fix`; 2 remaining `react-router` advisories are RSC-mode-only and not reachable by this SPA (see P2-4).

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
- **CSRF**: authentication is Bearer-header only; no cookies set; `withCredentials` never used. Nothing to CSRF.
- **CSP**: already present in `vercel.json` — `script-src 'self'`, `connect-src` pinned to the Render API, `frame-src 'self'`.
- **Auth fail-closed**: `ADMIN_TOKEN` empty → every request 401 (`auth.py:13`). No default/backdoor token.
- **Session hygiene**: `database.py:18` `expire_on_commit=False`; `get_session` closes via `async with` and rolls back on error.
- **`created_at` integrity**: not client-settable (absent from schemas; Pydantic ignores unknown fields).
- **Pricing integrity**: `nights`/`total` always server-computed (`bookings.py:33-36`), client-sent values overwritten; frontend totals use the same `computeBookingTotal`/`compute_total` logic.
- **IDOR (Object-Level Authorization) — NOT APPLICABLE, by design**: there is no per-user resource ownership anywhere. Every route sits behind the single `require_admin` bearer dependency (`main.py:39-45`); guests/rooms/bookings are resort-owned global resources, not user-scoped. A caller either presents the one admin token (full access) or fails auth before any object is resolved — there is no authorization boundary between two legitimate users to violate. This remains true only as long as no multi-user/authz feature is added; revisit with the JWT work (see open items).
- **Error responses**: 401/404/409/422 do not leak internals.

## Open items — needs a product/ops decision (NOT fixed, by design)

| Area | Detail | Recommendation |
|------|--------|----------------|
| Multi-user auth | Single shared `ADMIN_TOKEN`, no roles, no revocation. Building JWT/accounts is a product change, not a security patch | Adopt real auth (OAuth2 + httpOnly cookies, or JWT in an httpOnly cookie) when multi-user is needed. Flagged, not bolt-on |
| Token storage | `src/api/client.js` keeps the token in `sessionStorage`; any future XSS would read it. No XSS sink exists today | Move to httpOnly cookie once JWT path exists; keep CSP as defense-in-depth |
| Backups | Neon free tier: no PITR / no automated backups | Upgrade Neon tier or add scheduled `pg_dump` to external storage |
| Rate limiter persistence | In-memory sliding window — resets on restart, per-instance (Render free tier can run >1 instance) | Move to Redis/DB-backed limiter when multi-instance is provisioned |

## Dependency audit

- Backend: `pip-audit` on `requirements.txt` + `requirements-dev.txt` → **0 known vulnerabilities**.
- Frontend: `npm audit fix` cleared `brace-expansion` (dev-only, nested under `eslint-plugin-react`). Remaining: `react-router`/`react-router-dom` 7.12.x `GHSA-qwww-vcr4-c8h2` — verified against the advisory page, which states: **"This only affects your application if you are using the unstable RSC APIs"**. This project uses plain `BrowserRouter` client rendering with no RSC, loaders, or actions, so the affected code path is unreachable. **Patched version: 8.3.0** (advisory lists `>= 7.12.0, < 8.3.0` as affected). Not upgraded here because 8.x is a major-bump behavior change on an unreachable path; if the team wants it clean, bump `react-router-dom` to `^8.3.0` in a separate change and re-run the build/smoke test. Decision recorded, not silently skipped.

## Regression coverage added

`backend/tests/test_security_controls.py`:
- auth-failure throttle (401→429 transition)
- request body size limit (413)
- create forces `Pending` status (server-authoritative)
- PUT/PATCH status validation (400 on bogus status, 200 on valid)
- stats SQL aggregation response shape (counts, occupied, occupancy%)

Suite: **36/36 passing**. Frontend `oxlint` clean, `npm run build` clean.
