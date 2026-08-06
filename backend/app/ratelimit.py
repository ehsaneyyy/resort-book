import time

from fastapi import Request
from fastapi.responses import JSONResponse
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.middleware.base import BaseHTTPMiddleware

from .database import async_session_factory
from .models.rate_limit import RateLimit
from .request_ip import client_ip

WRITE_METHODS = ('POST', 'PUT', 'PATCH', 'DELETE')


async def reset_rate_limits() -> None:
    async with async_session_factory() as session:
        await session.execute(delete(RateLimit))
        await session.commit()


async def _hit(bucket: str, window: int, limit: int) -> int:
    now = int(time.time())
    async with async_session_factory() as session:
        await session.execute(delete(RateLimit).where(RateLimit.window_start < now - window))
        result = await session.execute(
            select(RateLimit)
            .where(RateLimit.bucket == bucket, RateLimit.window_start >= now - window)
            .order_by(RateLimit.window_start.desc())
            .limit(1)
        )
        row = result.scalar_one_or_none()
        if row:
            row.hits += 1
            hits = row.hits
        else:
            session.add(RateLimit(bucket=bucket, window_start=now, hits=1, limit=limit))
            hits = 1
        await session.commit()
    return hits


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, limit: int = 30, window: int = 60, auth_failure_limit: int = 10, global_auth_failure_limit: int = 50):
        super().__init__(app)
        self.limit = limit
        self.window = window
        self.auth_failure_limit = auth_failure_limit
        self.global_auth_failure_limit = global_auth_failure_limit

    async def dispatch(self, request: Request, call_next):
        ip = client_ip(request)
        if request.method in WRITE_METHODS:
            hits = await _hit(f'write:{ip}:{request.method}', self.window, self.limit)
            if hits > self.limit:
                return JSONResponse(
                    status_code=429,
                    content={'detail': 'Rate limit exceeded. Try again later.'},
                    headers={'Retry-After': str(int(self.window))},
                )
        response = await call_next(request)
        if response.status_code == 401:
            hits = await _hit(f'auth:{ip}', self.window, self.auth_failure_limit)
            global_hits = await _hit('auth:global', self.window, self.global_auth_failure_limit)
            if hits > self.auth_failure_limit or global_hits > self.global_auth_failure_limit:
                return JSONResponse(
                    status_code=429,
                    content={'detail': 'Too many failed attempts. Try again later.'},
                    headers={'Retry-After': str(int(self.window))},
                )
        return response
