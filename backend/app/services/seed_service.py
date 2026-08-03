from datetime import datetime, timedelta, timezone
from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncSession
from ..models.room import Room
from ..models.guest import Guest
from ..models.booking import Booking
from ..models.seasonal import SeasonalRule
from ..models.resort import Resort
from ..repositories import room_repo, guest_repo, booking_repo, seasonal_repo, resort_repo


def fmt(d):
    return d.strftime('%Y-%m-%d')


def add_days(d, n):
    return d + timedelta(days=n)


async def seed_demo_data(session: AsyncSession) -> dict:
    now_dt = datetime.now(timezone.utc)
    today_str = fmt(now_dt)

    await session.execute(delete(Booking))
    await session.execute(delete(Guest))
    await session.execute(delete(Room))
    await session.execute(delete(SeasonalRule))
    await session.execute(delete(Resort))

    rooms_data = [
        {'name': 'Standard Double', 'type': 'Standard', 'floor': 1, 'price': 3500, 'weekend_price': 4000, 'capacity': 2, 'beds': '1 Queen Bed', 'size': 280, 'amenities': ['AC', 'WiFi', 'TV', 'Hot Water', 'Desk'], 'description': 'Cozy room with queen bed, perfect for couples.'},
        {'name': 'Deluxe Double', 'type': 'Deluxe', 'floor': 2, 'price': 5500, 'weekend_price': 6500, 'capacity': 4, 'beds': '1 King Bed', 'size': 380, 'amenities': ['AC', 'WiFi', 'TV', 'Balcony', 'Mini Bar', 'Desk'], 'description': 'Spacious deluxe room with king bed and private balcony.'},
        {'name': 'Deluxe Sea View', 'type': 'Deluxe', 'floor': 2, 'price': 6500, 'weekend_price': 7500, 'capacity': 3, 'beds': '1 King Bed', 'size': 400, 'amenities': ['AC', 'WiFi', 'TV', 'Balcony', 'Mini Bar', 'Sea View'], 'description': 'Deluxe room with stunning sea views.'},
        {'name': 'Premium Suite', 'type': 'Suite', 'floor': 3, 'price': 7500, 'weekend_price': 9000, 'capacity': 4, 'beds': '1 King Bed', 'size': 520, 'amenities': ['AC', 'WiFi', 'TV', 'Balcony', 'Mini Bar', 'Hot Tub', 'Sitting Area'], 'description': 'Luxurious suite with separate living area.'},
        {'name': 'Executive Suite', 'type': 'Premium Suite', 'floor': 3, 'price': 9500, 'weekend_price': 11000, 'capacity': 4, 'beds': '1 King Bed', 'size': 650, 'amenities': ['AC', 'WiFi', 'TV', 'Balcony', 'Mini Bar', 'Jacuzzi', 'Sitting Area', 'Dining'], 'description': 'Ultra-luxurious suite with private jacuzzi.'},
        {'name': 'Beachfront Villa', 'type': 'Villa', 'floor': 0, 'price': 11000, 'weekend_price': 13000, 'capacity': 6, 'beds': '2 King Beds', 'size': 900, 'amenities': ['AC', 'WiFi', 'Pool Access', 'Kitchen', '2 Bedrooms', 'Living Room', 'Patio'], 'description': 'Spacious 2-bedroom villa with beachfront access.'},
    ]
    guests_data = [
        {'name': 'Arjun Menon', 'email': 'arjun@demo.com', 'phone': '1111111111', 'city': 'Kochi', 'total_bookings': 3, 'total_spent': 34650, 'last_stay': today_str, 'vip': True},
        {'name': 'Lakshmi Nair', 'email': 'lakshmi@demo.com', 'phone': '2222222222', 'city': 'Thrissur', 'total_bookings': 2, 'total_spent': 15750, 'last_stay': fmt(add_days(now_dt, -2)), 'vip': False},
        {'name': 'Rohan Shetty', 'email': 'rohan@demo.com', 'phone': '3333333333', 'city': 'Kozhikode', 'total_bookings': 5, 'total_spent': 89200, 'last_stay': fmt(add_days(now_dt, -5)), 'vip': True},
        {'name': 'Anjali Pillai', 'email': 'anjali@demo.com', 'phone': '4444444444', 'city': 'Thiruvananthapuram', 'total_bookings': 1, 'total_spent': 11550, 'last_stay': fmt(add_days(now_dt, 3))},
        {'name': 'Vikram Rao', 'email': 'vikram@demo.com', 'phone': '5555555555', 'city': 'Palakkad', 'total_bookings': 4, 'total_spent': 52800, 'last_stay': fmt(add_days(now_dt, 2)), 'vip': True},
        {'name': 'Meera Krishnan', 'email': 'meera@demo.com', 'phone': '6666666666', 'city': 'Kottayam', 'total_bookings': 2, 'total_spent': 29925, 'last_stay': fmt(add_days(now_dt, -10))},
        {'name': 'Aditya Nambiar', 'email': 'aditya@demo.com', 'phone': '7777777777', 'city': 'Alappuzha', 'total_bookings': 1, 'total_spent': 15000, 'last_stay': fmt(add_days(now_dt, 1))},
        {'name': 'Sneha Kurup', 'email': 'sneha@demo.com', 'phone': '8888888888', 'city': 'Kannur', 'total_bookings': 6, 'total_spent': 78400, 'last_stay': fmt(add_days(now_dt, -1)), 'vip': True},
    ]
    bookings_data = [
        {'guest_index': 0, 'room_index': 1, 'check_in': today_str, 'check_out': fmt(add_days(now_dt, 2)), 'nights': 2, 'adults': 2, 'total': 11550, 'status': 'Confirmed', 'payment_status': 'Pending', 'payment_method': 'Pay at Hotel', 'source': 'Direct', 'special_requests': 'Late check-in please', 'created': fmt(add_days(now_dt, -7))},
        {'guest_index': 1, 'room_index': 3, 'check_in': today_str, 'check_out': fmt(add_days(now_dt, 2)), 'nights': 2, 'adults': 2, 'total': 15750, 'status': 'Confirmed', 'payment_status': 'Paid', 'payment_method': 'Online', 'source': 'Website', 'created': fmt(add_days(now_dt, -10))},
        {'guest_index': 2, 'room_index': 5, 'check_in': fmt(add_days(now_dt, -2)), 'check_out': fmt(add_days(now_dt, 1)), 'nights': 3, 'adults': 4, 'children': 1, 'total': 34650, 'status': 'Confirmed', 'payment_status': 'Paid', 'payment_method': 'Online', 'source': 'Direct', 'special_requests': 'Need extra towels', 'created': fmt(add_days(now_dt, -14))},
        {'guest_index': 3, 'room_index': 1, 'check_in': fmt(add_days(now_dt, 3)), 'check_out': fmt(add_days(now_dt, 5)), 'nights': 2, 'adults': 2, 'total': 11550, 'status': 'Pending', 'payment_status': 'Pending', 'payment_method': 'Pay at Hotel', 'source': 'Phone', 'special_requests': 'Anniversary celebration', 'created': fmt(add_days(now_dt, -2))},
        {'guest_index': 4, 'room_index': 0, 'check_in': fmt(add_days(now_dt, 2)), 'check_out': fmt(add_days(now_dt, 4)), 'nights': 2, 'adults': 2, 'total': 7350, 'status': 'Confirmed', 'payment_status': 'Paid', 'payment_method': 'Online', 'source': 'Website', 'created': fmt(add_days(now_dt, -5))},
        {'guest_index': 5, 'room_index': 4, 'check_in': fmt(add_days(now_dt, 7)), 'check_out': fmt(add_days(now_dt, 10)), 'nights': 3, 'adults': 2, 'children': 1, 'total': 29925, 'status': 'Cancelled', 'payment_status': 'Refunded', 'payment_method': 'Online', 'source': 'Website', 'special_requests': 'Early check-in', 'created': fmt(add_days(now_dt, -20))},
        {'guest_index': 6, 'room_index': 3, 'check_in': fmt(add_days(now_dt, 1)), 'check_out': fmt(add_days(now_dt, 4)), 'nights': 3, 'adults': 2, 'total': 22500, 'status': 'Confirmed', 'payment_status': 'Paid', 'payment_method': 'Online', 'source': 'Booking.com', 'special_requests': 'Airport transfer', 'created': fmt(add_days(now_dt, -12))},
        {'guest_index': 7, 'room_index': 5, 'check_in': fmt(add_days(now_dt, -3)), 'check_out': today_str, 'nights': 3, 'adults': 3, 'total': 33000, 'status': 'Confirmed', 'payment_status': 'Paid', 'payment_method': 'Cash', 'source': 'Direct', 'created': fmt(add_days(now_dt, -15))},
        {'guest_index': 0, 'room_index': 4, 'check_in': fmt(add_days(now_dt, -20)), 'check_out': fmt(add_days(now_dt, -18)), 'nights': 2, 'adults': 2, 'total': 19000, 'status': 'Checked Out', 'payment_status': 'Paid', 'payment_method': 'Online', 'source': 'Direct', 'created': fmt(add_days(now_dt, -30))},
        {'guest_index': 2, 'room_index': 5, 'check_in': fmt(add_days(now_dt, -30)), 'check_out': fmt(add_days(now_dt, -26)), 'nights': 4, 'adults': 5, 'children': 1, 'total': 44000, 'status': 'Checked Out', 'payment_status': 'Paid', 'payment_method': 'Online', 'source': 'Direct', 'special_requests': 'Conference setup', 'created': fmt(add_days(now_dt, -40))},
    ]
    seasonal_data = [
        {'name': 'Peak Season', 'start_date': '2026-03-01', 'end_date': '2026-06-30', 'adjustment': 30, 'type': 'percentage', 'is_active': True},
        {'name': 'Festive Season', 'start_date': '2026-10-15', 'end_date': '2026-12-31', 'adjustment': 20, 'type': 'percentage', 'is_active': True},
        {'name': 'Monsoon Discount', 'start_date': '2026-06-15', 'end_date': '2026-09-30', 'adjustment': -15, 'type': 'percentage', 'is_active': True},
        {'name': 'Weekend Premium', 'start_date': '2026-01-01', 'end_date': '2026-12-31', 'adjustment': 15, 'type': 'percentage', 'is_active': True},
    ]

    created_guests = []
    created_rooms = []

    for rd in rooms_data:
        room = await room_repo.create_room(session, rd)
        created_rooms.append(room)

    for gd in guests_data:
        guest = await guest_repo.create_guest(session, gd)
        created_guests.append(guest)

    for bd in bookings_data:
        guest = created_guests[bd['guest_index']]
        room = created_rooms[bd['room_index']]
        bd['guest_id'] = guest.id
        bd['room_id'] = room.id
        bd.pop('guest_index')
        bd.pop('room_index')
        bd['created_at'] = datetime.fromisoformat(bd.pop('created') + 'T00:00:00+00:00').replace(tzinfo=None)
        await booking_repo.create_booking(session, bd)

    for sd in seasonal_data:
        await seasonal_repo.create_rule(session, sd)

    existing = await resort_repo.get_resort(session)
    if not existing:
        await resort_repo.create_resort(session, {
            'name': 'DoGuest Demo Resort',
            'currency': '\u20B9',
            'phone': '+91 99999 99999',
            'whatsapp_phone': '+919999999999',
            'email': 'resort@demo.com',
            'address': 'Beach Road, Fort Kochi, Kerala 682001',
            'check_in_time': '14:00',
            'check_out_time': '11:00',
            'tax_rate': 5,
            'total_rooms': 6,
        })

    return {'rooms': len(created_rooms), 'guests': len(created_guests), 'bookings': len(bookings_data), 'seasonal': len(seasonal_data)}
