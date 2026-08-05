from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.gzip import GZipMiddleware
from sqlmodel import SQLModel
from .database import engine
from .auth import require_admin
from .body_limit import MaxBodySizeMiddleware
from .ratelimit import RateLimitMiddleware
from .routers import rooms, guests, bookings, seasonal, resort, seed, stats


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
    yield


from .config import settings

app = FastAPI(title='ResortBook API', version='1.0.0', lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.add_middleware(GZipMiddleware, minimum_size=500)

app.add_middleware(
    MaxBodySizeMiddleware,
    max_bytes=settings.max_body_bytes,
)

app.add_middleware(
    RateLimitMiddleware,
    limit=settings.rate_limit_writes,
    window=settings.rate_limit_window,
    auth_failure_limit=settings.rate_limit_auth_failures,
)

app.include_router(rooms.router, dependencies=[Depends(require_admin)])
app.include_router(guests.router, dependencies=[Depends(require_admin)])
app.include_router(bookings.router, dependencies=[Depends(require_admin)])
app.include_router(seasonal.router, dependencies=[Depends(require_admin)])
app.include_router(resort.router, dependencies=[Depends(require_admin)])
app.include_router(seed.router, dependencies=[Depends(require_admin)])
app.include_router(stats.router, dependencies=[Depends(require_admin)])


@app.get('/api/v1/health')
@app.head('/api/v1/health')
async def health_check():
    return {'status': 'ok'}
