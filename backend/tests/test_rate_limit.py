from conftest import AUTH


async def test_write_rate_limit_429(client, test_room, test_guest):
    responses = []
    for i in range(35):
        r = await client.post(
            '/api/v1/bookings', headers=AUTH,
            json={
                'guest_id': test_guest.id,
                'room_id': test_room.id,
                'check_in': '2027-08-06',
                'check_out': '2027-08-08',
                'adults': 2,
                'children': 0,
                'status': 'Pending',
                'payment_status': 'Pending',
                'source': 'Direct',
            },
        )
        responses.append(r.status_code)
    assert 429 in responses
