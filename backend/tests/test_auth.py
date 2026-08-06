from conftest import ADMIN_EMAIL, ADMIN_PASSWORD


async def test_rooms_requires_auth(anon_client):
    assert (await anon_client.get('/api/v1/rooms')).status_code == 401


async def test_rooms_rejects_invalid_cookie(anon_client):
    anon_client.cookies.set('access_token', 'not-a-jwt')
    r = await anon_client.get('/api/v1/rooms')
    assert r.status_code == 401


async def test_login_bad_password(anon_client):
    r = await anon_client.post(
        '/api/v1/auth/login',
        json={'email': ADMIN_EMAIL, 'password': 'wrong-password-1'},
    )
    assert r.status_code == 401


async def test_login_unknown_email(anon_client):
    r = await anon_client.post(
        '/api/v1/auth/login',
        json={'email': 'nobody@test.com', 'password': ADMIN_PASSWORD},
    )
    assert r.status_code == 401


async def test_login_short_password_rejected(anon_client):
    r = await anon_client.post(
        '/api/v1/auth/login',
        json={'email': ADMIN_EMAIL, 'password': 'short'},
    )
    assert r.status_code == 422


async def test_login_sets_http_only_cookie(anon_client):
    r = await anon_client.post(
        '/api/v1/auth/login',
        json={'email': ADMIN_EMAIL, 'password': ADMIN_PASSWORD},
    )
    assert r.status_code == 200
    assert r.json()['must_change_password'] is False


async def test_rooms_ok_with_auth(client):
    r = await client.get('/api/v1/rooms')
    assert r.status_code == 200
    assert len(r.json()) == 6


async def test_bookings_ok_with_auth(client):
    r = await client.get('/api/v1/bookings')
    assert r.status_code == 200
    assert len(r.json()) == 14


async def test_me_returns_admin(client):
    r = await client.get('/api/v1/auth/me')
    assert r.status_code == 200
    body = r.json()
    assert body['email'] == ADMIN_EMAIL
    assert body['must_change_password'] is False


async def test_change_password_flow(client):
    r = await client.post('/api/v1/auth/change-password', json={
        'current_password': ADMIN_PASSWORD,
        'new_password': 'brand-new-password-456',
    })
    assert r.status_code == 200
    me = await client.get('/api/v1/auth/me')
    assert me.json()['must_change_password'] is False


async def test_login_with_new_password(client):
    await client.post('/api/v1/auth/change-password', json={
        'current_password': ADMIN_PASSWORD,
        'new_password': 'brand-new-password-456',
    })
    r = await client.post('/api/v1/auth/login', json={
        'email': ADMIN_EMAIL,
        'password': 'brand-new-password-456',
    })
    assert r.status_code == 200


async def test_old_password_rejected_after_change(client):
    await client.post('/api/v1/auth/change-password', json={
        'current_password': ADMIN_PASSWORD,
        'new_password': 'brand-new-password-456',
    })
    r = await client.post('/api/v1/auth/login', json={
        'email': ADMIN_EMAIL,
        'password': ADMIN_PASSWORD,
    })
    assert r.status_code == 401


async def test_change_password_wrong_current(client):
    r = await client.post('/api/v1/auth/change-password', json={
        'current_password': 'not-the-password',
        'new_password': 'brand-new-password-456',
    })
    assert r.status_code == 401


async def test_logout_clears_cookie(client):
    r = await client.post('/api/v1/auth/logout')
    assert r.status_code == 200
    assert r.cookies.get('access_token') in ('', None)
    assert (await client.get('/api/v1/rooms')).status_code == 401


async def test_login_unconfigured_503(anon_client, monkeypatch):
    from app.config import settings
    monkeypatch.setattr(settings, 'admin_password', '')
    r = await anon_client.post(
        '/api/v1/auth/login',
        json={'email': ADMIN_EMAIL, 'password': ADMIN_PASSWORD},
    )
    assert r.status_code == 503
