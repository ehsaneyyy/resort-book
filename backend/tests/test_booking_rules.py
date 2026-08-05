from conftest import AUTH


def payload(room_id, guest_id, check_in, check_out, total=1):
    return {
        'guest_id': guest_id,
        'room_id': room_id,
        'check_in': check_in,
        'check_out': check_out,
        'nights': 99,
        'adults': 2,
        'children': 0,
        'total': total,
        'status': 'Pending',
        'payment_status': 'Pending',
        'payment_method': 'Pay at Hotel',
        'source': 'Direct',
        'special_requests': '',
        'created_at': '2026-01-01',
    }


async def create(client, room_id, guest_id, check_in, check_out, total=1):
    return await client.post('/api/v1/bookings', headers=AUTH, json=payload(room_id, guest_id, check_in, check_out, total))


async def test_server_prices_weekend_nights(client, test_room, test_guest):
    r = await create(client, test_room.id, test_guest.id, '2027-08-06', '2027-08-08', total=1)
    assert r.status_code == 201
    body = r.json()
    assert body['total'] == 8400
    assert body['nights'] == 2


async def test_server_prices_weekday_nights(client, test_room, test_guest):
    r = await create(client, test_room.id, test_guest.id, '2027-08-02', '2027-08-04', total=1)
    assert r.status_code == 201
    assert r.json()['total'] == 7350


async def test_server_prices_mixed_nights(client, test_room, test_guest):
    r = await create(client, test_room.id, test_guest.id, '2027-08-05', '2027-08-07', total=1)
    assert r.status_code == 201
    assert r.json()['total'] == 7875


async def test_client_total_ignored(client, test_room, test_guest):
    r = await create(client, test_room.id, test_guest.id, '2027-08-02', '2027-08-04', total=5)
    assert r.status_code == 201
    assert r.json()['total'] == 7350


async def test_client_nights_recomputed(client, test_room, test_guest):
    r = await create(client, test_room.id, test_guest.id, '2027-08-02', '2027-08-06', total=1)
    assert r.status_code == 201
    assert r.json()['nights'] == 4


async def test_overlap_rejected_409(client, test_room, test_guest):
    assert (await create(client, test_room.id, test_guest.id, '2027-08-06', '2027-08-08')).status_code == 201
    r = await create(client, test_room.id, test_guest.id, '2027-08-07', '2027-08-09')
    assert r.status_code == 409


async def test_pending_booking_blocks_overlap(client, test_room, test_guest):
    assert (await create(client, test_room.id, test_guest.id, '2027-08-06', '2027-08-08')).status_code == 201
    r = await create(client, test_room.id, test_guest.id, '2027-08-07', '2027-08-09')
    assert r.status_code == 409


async def test_adjacent_dates_allowed(client, test_room, test_guest):
    assert (await create(client, test_room.id, test_guest.id, '2027-08-06', '2027-08-08')).status_code == 201
    r = await create(client, test_room.id, test_guest.id, '2027-08-08', '2027-08-10')
    assert r.status_code == 201


async def test_cancelled_does_not_block(client, test_room, test_guest):
    created = await create(client, test_room.id, test_guest.id, '2027-08-06', '2027-08-08')
    assert created.status_code == 201
    bid = created.json()['id']
    cancel = await client.patch(f'/api/v1/bookings/{bid}/status', headers=AUTH, json={'status': 'Cancelled'})
    assert cancel.status_code == 200
    r = await create(client, test_room.id, test_guest.id, '2027-08-06', '2027-08-08')
    assert r.status_code == 201


async def test_bad_date_format_422(client, test_room, test_guest):
    r = await create(client, test_room.id, test_guest.id, '2027/08/06', '2027-08-08')
    assert r.status_code == 422


async def test_checkout_not_after_checkin_422(client, test_room, test_guest):
    r = await create(client, test_room.id, test_guest.id, '2027-08-08', '2027-08-08')
    assert r.status_code == 422


async def test_update_overlap_409(client, test_room, test_guest):
    a = await create(client, test_room.id, test_guest.id, '2027-08-06', '2027-08-08')
    b = await create(client, test_room.id, test_guest.id, '2027-08-10', '2027-08-12')
    bid = b.json()['id']
    r = await client.put(
        f'/api/v1/bookings/{bid}', headers=AUTH,
        json={'check_in': '2027-08-07', 'check_out': '2027-08-09'},
    )
    assert r.status_code == 409
    assert a.status_code == 201


async def test_update_recomputes_total(client, test_room, test_guest):
    created = await create(client, test_room.id, test_guest.id, '2027-08-02', '2027-08-04')
    assert created.json()['total'] == 7350
    bid = created.json()['id']
    r = await client.put(
        f'/api/v1/bookings/{bid}', headers=AUTH,
        json={'check_in': '2027-08-06', 'check_out': '2027-08-08', 'total': 5},
    )
    assert r.status_code == 200
    assert r.json()['total'] == 8400


async def test_update_total_only_ignored(client, test_room, test_guest):
    created = await create(client, test_room.id, test_guest.id, '2027-08-02', '2027-08-04')
    bid = created.json()['id']
    r = await client.put(f'/api/v1/bookings/{bid}', headers=AUTH, json={'total': 5})
    assert r.status_code == 200
    assert r.json()['total'] == 7350


async def test_create_missing_room_400(client, test_guest):
    r = await create(client, 'does-not-exist', test_guest.id, '2027-08-02', '2027-08-04')
    assert r.status_code == 400


async def test_invalid_status_400(client, test_room, test_guest):
    created = await create(client, test_room.id, test_guest.id, '2027-08-02', '2027-08-04')
    bid = created.json()['id']
    r = await client.patch(f'/api/v1/bookings/{bid}/status', headers=AUTH, json={'status': 'Nope'})
    assert r.status_code == 400
