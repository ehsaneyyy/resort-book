from sqlmodel import select

from conftest import ADMIN_EMAIL, ADMIN_PASSWORD
from app.database import async_session_factory
from app.models.security_event import SecurityEvent


async def _events(event_type: str) -> list[SecurityEvent]:
    async with async_session_factory() as s:
        result = await s.execute(select(SecurityEvent).where(SecurityEvent.event_type == event_type))
        return list(result.scalars().all())


async def test_login_success_logged(anon_client):
    r = await anon_client.post(
        '/api/v1/auth/login',
        json={'email': ADMIN_EMAIL, 'password': ADMIN_PASSWORD},
    )
    assert r.status_code == 200
    events = await _events('login_success')
    assert len(events) == 1
    assert events[0].user_id is not None


async def test_login_failure_logged(anon_client):
    r = await anon_client.post(
        '/api/v1/auth/login',
        json={'email': ADMIN_EMAIL, 'password': 'wrong-password-1'},
    )
    assert r.status_code == 401
    assert len(await _events('login_failed')) == 1


async def test_password_change_logged(client):
    r = await client.post('/api/v1/auth/change-password', json={
        'current_password': ADMIN_PASSWORD,
        'new_password': 'brand-new-password-456',
    })
    assert r.status_code == 200
    assert len(await _events('password_changed')) == 1


async def test_logout_logged(client):
    r = await client.post('/api/v1/auth/logout')
    assert r.status_code == 200
    assert len(await _events('logout')) == 1
