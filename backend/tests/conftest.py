import os

os.environ['DATABASE_URL'] = 'sqlite+aiosqlite:///./test_resort.db'
os.environ['ADMIN_TOKEN'] = 'test-token'
os.environ['CORS_ORIGINS'] = 'http://localhost'

from contextlib import asynccontextmanager

import httpx
import pytest
from sqlmodel import SQLModel

from app.main import app
from app.database import engine, async_session_factory
from app.services.seed_service import seed_demo_data
from app.repositories import room_repo, guest_repo

AUTH = {'Authorization': 'Bearer test-token'}


@asynccontextmanager
async def _client():
    async with app.router.lifespan_context(app):
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url='http://test') as c:
            yield c


@pytest.fixture(autouse=True)
async def reset_db():
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)
        await conn.run_sync(SQLModel.metadata.create_all)
    async with async_session_factory() as s:
        await seed_demo_data(s)
        await s.commit()
    yield


@pytest.fixture
async def client():
    async with _client() as c:
        yield c


@pytest.fixture
async def test_room():
    async with async_session_factory() as s:
        room = await room_repo.create_room(s, {
            'name': 'Test Room', 'type': 'Standard', 'floor': 1,
            'price': 3500, 'weekend_price': 4000, 'capacity': 2,
            'beds': '1 Queen Bed', 'size': 280,
            'amenities': ['AC'], 'description': 'Test',
        })
        await s.commit()
        return room


@pytest.fixture
async def test_guest():
    async with async_session_factory() as s:
        guest = await guest_repo.create_guest(s, {
            'name': 'Test Guest', 'phone': '9999999999',
            'email': 'test@demo.com', 'city': 'Kochi',
            'total_bookings': 0, 'total_spent': 0, 'last_stay': None,
            'vip': False, 'notes': '',
        })
        await s.commit()
        return guest
