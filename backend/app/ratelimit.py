import time

from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

WRITE_METHODS = ('POST', 'PUT', 'PATCH', 'DELETE')

_instances: list['RateLimitMiddleware'] = []


def reset_rate_limits() -> None:
    for instance in _instances:
        instance.hits.clear()


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, limit: int = 30, window: int = 60, auth_failure_limit: int = 10):
        super().__init__(app)
        self.limit = limit
        self.window = window
        self.auth_failure_limit = auth_failure_limit
        self.hits = {}
        _instances.append(self)

    async def dispatch(self, request: Request, call_next):
        ip = request.client.host if request.client else 'unknown'
        now = time.monotonic()
        if request.method in WRITE_METHODS:
            key = (ip, request.method)
            bucket = self.hits.setdefault(key, [])
            bucket[:] = [t for t in bucket if now - t < self.window]
            if len(bucket) >= self.limit:
                return JSONResponse(
                    status_code=429,
                    content={'detail': 'Rate limit exceeded. Try again later.'},
                    headers={'Retry-After': str(int(self.window))},
                )
            bucket.append(now)
        response = await call_next(request)
        if response.status_code == 401:
            key = (ip, 'auth-failure')
            bucket = self.hits.setdefault(key, [])
            bucket[:] = [t for t in bucket if now - t < self.window]
            if len(bucket) >= self.auth_failure_limit:
                return JSONResponse(
                    status_code=429,
                    content={'detail': 'Too many failed attempts. Try again later.'},
                    headers={'Retry-After': str(int(self.window))},
                )
            bucket.append(now)
        return response
