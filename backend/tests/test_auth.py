from conftest import AUTH


async def test_rooms_requires_token(client):
    assert (await client.get('/api/v1/rooms')).status_code == 401


async def test_rooms_wrong_token(client):
    r = await client.get('/api/v1/rooms', headers={'Authorization': 'Bearer nope'})
    assert r.status_code == 401


async def test_rooms_malformed_header(client):
    r = await client.get('/api/v1/rooms', headers={'Authorization': 'Basic abc'})
    assert r.status_code == 401


async def test_rooms_ok_with_token(client):
    r = await client.get('/api/v1/rooms', headers=AUTH)
    assert r.status_code == 200
    assert len(r.json()) == 6


async def test_bookings_ok_with_token(client):
    r = await client.get('/api/v1/bookings', headers=AUTH)
    assert r.status_code == 200
    assert len(r.json()) == 14
