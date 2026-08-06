from test_booking_rules import payload


def rule(**overrides):
    data = {
        'name': 'Test Peak',
        'start_date': '2027-08-05',
        'end_date': '2027-08-09',
        'adjustment': 20,
        'type': 'percentage',
        'room_types': ['Standard'],
        'is_active': True,
    }
    data.update(overrides)
    return data


async def add_rule(client, **overrides):
    return await client.post('/api/v1/seasonal-rules', json=rule(**overrides))


async def create(client, room_id, guest_id, check_in, check_out):
    return await client.post('/api/v1/bookings', json=payload(room_id, guest_id, check_in, check_out))


async def test_seasonal_boost_weekend(client, test_room, test_guest):
    assert (await add_rule(client)).status_code == 201
    r = await create(client, test_room.id, test_guest.id, '2027-08-05', '2027-08-07')
    assert r.status_code == 201
    assert r.json()['total'] == 9450


async def test_seasonal_applies_per_night(client, test_room, test_guest):
    await add_rule(client, end_date='2027-08-05')
    r = await create(client, test_room.id, test_guest.id, '2027-08-05', '2027-08-07')
    assert r.status_code == 201
    assert r.json()['total'] == 8610


async def test_seasonal_room_type_filter(client, test_room, test_guest):
    await add_rule(client, room_types=['Deluxe'])
    r = await create(client, test_room.id, test_guest.id, '2027-08-05', '2027-08-07')
    assert r.status_code == 201
    assert r.json()['total'] == 7875


async def test_seasonal_inactive_ignored(client, test_room, test_guest):
    await add_rule(client, is_active=False)
    r = await create(client, test_room.id, test_guest.id, '2027-08-05', '2027-08-07')
    assert r.status_code == 201
    assert r.json()['total'] == 7875


async def test_seasonal_discount_weekday(client, test_room, test_guest):
    await add_rule(client, start_date='2027-08-02', end_date='2027-08-03', adjustment=-10)
    r = await create(client, test_room.id, test_guest.id, '2027-08-02', '2027-08-04')
    assert r.status_code == 201
    assert r.json()['total'] == 6615


async def test_seasonal_adjustments_combine(client, test_room, test_guest):
    await add_rule(client, start_date='2027-08-02', end_date='2027-08-03', adjustment=20, name='A')
    await add_rule(client, start_date='2027-08-02', end_date='2027-08-03', adjustment=10, name='B')
    r = await create(client, test_room.id, test_guest.id, '2027-08-02', '2027-08-04')
    assert r.status_code == 201
    assert r.json()['total'] == 9555


async def test_seasonal_rules_require_auth(anon_client):
    assert (await anon_client.post('/api/v1/seasonal-rules', json=rule())).status_code == 401
    assert (await anon_client.get('/api/v1/seasonal-rules')).status_code == 401
