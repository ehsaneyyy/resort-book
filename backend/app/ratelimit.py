import time

from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

WRITE_METHODS = ('POST', 'PUT', 'PATCH', 'DELETE')

_instances: list['RateLimitMiddleware'] = []


def _client_ip(request: Request) -> str:
    forwarded = request.headers.get('x-forwarded-for')
    if forwarded:
        return forwarded.split(',')[0].strip()
    return request.client.host if request.client else 'unknown'


def reset_rate_limits() -> None:
    for instance in _instances:
        instance.hits.clear()


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, limit: int = 30, window: int = 60, auth_failure_limit: int = 10, global_auth_failure_limit: int = 50):
        super().__init__(app)
        self.limit = limit
        self.window = window
        self.auth_failure_limit = auth_failure_limit
        self.global_auth_failure_limit = global_auth_failure_limit
        self.hits = {}
        _instances.append(self)

    async def dispatch(self, request: Request, call_next):
        ip = _client_ip(request)
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
            global_key = ('global', 'auth-failure')
            global_bucket = self.hits.setdefault(global_key, [])
            global_bucket[:] = [t for t in global_bucket if now - t < self.window]
            if len(bucket) >= self.auth_failure_limit or len(global_bucket) >= self.global_auth_failure_limit:
                return JSONResponse(
                    status_code=429,
                    content={'detail': 'Too many failed attempts. Try again later.'},
                    headers={'Retry-After': str(int(self.window))},
                )
            bucket.append(now)
            global_bucket.append(now)
        return response
