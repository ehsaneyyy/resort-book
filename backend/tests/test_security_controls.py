async def test_auth_failure_throttle(anon_client):
    statuses = []
    for _ in range(12):
        r = await anon_client.get('/api/v1/rooms')
        statuses.append(r.status_code)
    assert statuses.count(401) == 10
    assert statuses.count(429) == 2


async def test_auth_throttle_cannot_be_bypassed_with_spoofed_ip(anon_client):
    statuses = []
    for i in range(55):
        r = await anon_client.get(
            '/api/v1/rooms',
            headers={'X-Forwarded-For': f'203.0.113.{i}'},
        )
        statuses.append(r.status_code)
    assert statuses.count(401) == 50
    assert statuses.count(429) == 5


async def test_body_size_limit_413(client):
    r = await client.post('/api/v1/rooms', json={
        'name': 'x' * 1_200_000,
        'type': 'Standard', 'floor': 1, 'price': 100, 'weekend_price': 120,
        'capacity': 2, 'beds': '1 Queen Bed', 'size': 280,
        'amenities': ['AC'], 'description': 'Test',
    })
    assert r.status_code == 413


async def test_create_booking_forces_pending(client, test_room, test_guest):
    r = await client.post('/api/v1/bookings', json={
        'guest_id': test_guest.id,
        'room_id': test_room.id,
        'check_in': '2027-08-06', 'check_out': '2027-08-08',
        'nights': 2, 'adults': 2, 'children': 0,
        'status': 'Confirmed', 'payment_status': 'Paid',
        'source': 'Direct',
    })
    assert r.status_code == 201
    assert r.json()['status'] == 'Pending'
    assert r.json()['payment_status'] == 'Pending'


async def test_update_booking_rejects_invalid_status(client, test_room, test_guest):
    created = await client.post('/api/v1/bookings', json={
        'guest_id': test_guest.id,
        'room_id': test_room.id,
        'check_in': '2027-08-06', 'check_out': '2027-08-08',
        'nights': 2, 'adults': 2, 'children': 0, 'source': 'Direct',
    })
    booking_id = created.json()['id']
    r = await client.put(f'/api/v1/bookings/{booking_id}', json={'status': 'Bogus'})
    assert r.status_code == 400
    ok = await client.put(f'/api/v1/bookings/{booking_id}', json={'status': 'Checked Out', 'payment_status': 'Paid'})
    assert ok.status_code == 200
    assert ok.json()['status'] == 'Checked Out'


async def test_stats_aggregation(client):
    r = await client.get('/api/v1/stats')
    assert r.status_code == 200
    data = r.json()
    assert data['total_rooms'] == 6
    assert data['total_guests'] == 11
    assert data['total_bookings'] == 14
    assert data['confirmed'] == 7
    assert data['pending'] == 3
    assert data['checked_out'] == 3
    assert data['cancelled'] == 1
    assert data['occupied'] == 2
    assert data['occupancy_pct'] == 33
    assert isinstance(data['today_revenue'], int)
    assert data['today_revenue'] >= 0
