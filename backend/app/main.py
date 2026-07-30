from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel
from .database import engine
from .routers import rooms, guests, bookings, seasonal, resort, seed, stats


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
    yield


app = FastAPI(title='ResortBook API', version='1.0.0', lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(rooms.router)
app.include_router(guests.router)
app.include_router(bookings.router)
app.include_router(seasonal.router)
app.include_router(resort.router)
app.include_router(seed.router)
app.include_router(stats.router)


@app.get('/api/v1/health')
async def health_check():
    return {'status': 'ok'}
