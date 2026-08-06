from sqlalchemy import text

from conftest import AUTH
from app.database import async_session_factory


async def _clear_resort():
    async with async_session_factory() as s:
        await s.execute(text('DELETE FROM resort'))
        await s.commit()


async def test_get_resort_returns_shell_on_empty_db(client):
    await _clear_resort()
    r = await client.get('/api/v1/resort', headers=AUTH)
    assert r.status_code == 200
    data = r.json()
    assert data['id'] == 1
    assert data['name'] == 'My Resort'
    assert data['tax_rate'] == 5.0
    assert data['check_in_time'] == '14:00'


async def test_put_resort_creates_when_missing(client):
    await _clear_resort()
    r = await client.put('/api/v1/resort', headers=AUTH, json={'name': 'Shoreline', 'tax_rate': 12})
    assert r.status_code == 200
    assert r.json()['name'] == 'Shoreline'
    g = await client.get('/api/v1/resort', headers=AUTH)
    assert g.status_code == 200
    assert g.json()['name'] == 'Shoreline'
    assert g.json()['tax_rate'] == 12


async def test_put_resort_updates_existing(client):
    r = await client.put('/api/v1/resort', headers=AUTH, json={'name': 'Updated Resort'})
    assert r.status_code == 200
    assert r.json()['name'] == 'Updated Resort'


async def test_seed_disabled_returns_403(client, monkeypatch):
    from app.config import settings
    monkeypatch.setattr(settings, 'seed_enabled', False)
    r = await client.post('/api/v1/seed', headers=AUTH)
    assert r.status_code == 403


async def test_seed_enabled_works(client, monkeypatch):
    from app.config import settings
    monkeypatch.setattr(settings, 'seed_enabled', True)
    async with async_session_factory() as s:
        await s.execute(text('DELETE FROM bookings'))
        await s.execute(text('DELETE FROM rooms'))
        await s.execute(text('DELETE FROM guests'))
        await s.execute(text('DELETE FROM seasonal_rules'))
        await s.execute(text('DELETE FROM resort'))
        await s.commit()
    r = await client.post('/api/v1/seed', headers=AUTH)
    assert r.status_code == 200
    assert r.json()['message'] == 'Demo data loaded'
