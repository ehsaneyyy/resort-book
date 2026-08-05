async def test_health_public(client):
    r = await client.get('/api/v1/health')
    assert r.status_code == 200
    assert r.json() == {'status': 'ok'}
