from datetime import datetime, timedelta, timezone
from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncSession
from ..models.room import Room
from ..models.guest import Guest
from ..models.booking import Booking
from ..models.seasonal import SeasonalRule
from ..models.resort import Resort
from ..repositories import room_repo, guest_repo, booking_repo, seasonal_repo, resort_repo

WEEKEND_WEEKDAYS = {4, 5}
TAX_RATE = 5


def fmt(d):
    return d.strftime('%Y-%m-%d')


def add_days(d, n):
    return d + timedelta(days=n)


def compute_total(price, weekend_price, check_in, check_out):
    base = 0
    for i in range((check_out - check_in).days):
        day = check_in + timedelta(days=i)
        if weekend_price and day.weekday() in WEEKEND_WEEKDAYS:
            base += weekend_price
        else:
            base += price
    return round(base * (1 + TAX_RATE / 100))


async def seed_demo_data(session: AsyncSession) -> dict:
    now_dt = datetime.now(timezone.utc)
    today = now_dt.date()
    today_str = fmt(today)

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
        {'name': 'Arjun Menon', 'email': 'arjun@demo.com', 'phone': '1111111111', 'city': 'Kochi', 'total_bookings': 5, 'total_spent': 63600, 'last_stay': today_str, 'vip': True},
        {'name': 'Lakshmi Nair', 'email': 'lakshmi@demo.com', 'phone': '2222222222', 'city': 'Thrissur', 'total_bookings': 3, 'total_spent': 27150, 'last_stay': fmt(add_days(today, 2)), 'vip': False},
        {'name': 'Rohan Shetty', 'email': 'rohan@demo.com', 'phone': '3333333333', 'city': 'Kozhikode', 'total_bookings': 6, 'total_spent': 100050, 'last_stay': fmt(add_days(today, -3)), 'vip': True},
        {'name': 'Anjali Pillai', 'email': 'anjali@demo.com', 'phone': '4444444444', 'city': 'Thiruvananthapuram', 'total_bookings': 1, 'total_spent': 7875, 'last_stay': fmt(add_days(today, 3))},
        {'name': 'Vikram Rao', 'email': 'vikram@demo.com', 'phone': '5555555555', 'city': 'Palakkad', 'total_bookings': 2, 'total_spent': 12600, 'last_stay': fmt(add_days(today, 5)), 'vip': True},
        {'name': 'Meera Krishnan', 'email': 'meera@demo.com', 'phone': '6666666666', 'city': 'Kottayam', 'total_bookings': 3, 'total_spent': 45600, 'last_stay': fmt(add_days(today, -10))},
        {'name': 'Aditya Nambiar', 'email': 'aditya@demo.com', 'phone': '7777777777', 'city': 'Alappuzha', 'total_bookings': 2, 'total_spent': 40950, 'last_stay': fmt(add_days(today, -5))},
        {'name': 'Sneha Kurup', 'email': 'sneha@demo.com', 'phone': '8888888888', 'city': 'Kannur', 'total_bookings': 4, 'total_spent': 74650, 'last_stay': fmt(add_days(today, -1)), 'vip': True},
        {'name': 'Divya Warrier', 'email': 'divya@demo.com', 'phone': '9999999999', 'city': 'Ernakulam', 'total_bookings': 1, 'total_spent': 7350, 'last_stay': fmt(add_days(today, 7))},
        {'name': 'Aparna Das', 'email': 'aparna@demo.com', 'phone': '1212121212', 'city': 'Kasargod', 'total_bookings': 1, 'total_spent': 20475, 'last_stay': fmt(add_days(today, 9))},
        {'name': 'Rahul Dev', 'email': 'rahul@demo.com', 'phone': '1313131313', 'city': 'Wayanad', 'total_bookings': 1, 'total_spent': 15750, 'last_stay': fmt(add_days(today, -6))},
    ]
    bookings_data = [
        {'guest_index': 0, 'room_index': 0, 'check_in': fmt(add_days(today, -3)), 'check_out': fmt(add_days(today, -1)), 'adults': 2, 'status': 'Checked Out', 'payment_status': 'Paid', 'payment_method': 'Online', 'source': 'Website', 'created': fmt(add_days(today, -25))},
        {'guest_index': 3, 'room_index': 0, 'check_in': fmt(add_days(today, 1)), 'check_out': fmt(add_days(today, 3)), 'adults': 2, 'status': 'Confirmed', 'payment_status': 'Paid', 'payment_method': 'Online', 'source': 'Website', 'created': fmt(add_days(today, -5))},
        {'guest_index': 8, 'room_index': 0, 'check_in': fmt(add_days(today, 5)), 'check_out': fmt(add_days(today, 7)), 'adults': 2, 'status': 'Pending', 'payment_status': 'Pending', 'payment_method': 'Pay at Hotel', 'source': 'WhatsApp', 'created': fmt(add_days(today, -1))},
        {'guest_index': 1, 'room_index': 1, 'check_in': today_str, 'check_out': fmt(add_days(today, 2)), 'adults': 2, 'status': 'Confirmed', 'payment_status': 'Pending', 'payment_method': 'Pay at Hotel', 'source': 'Direct', 'special_requests': 'Late check-in please', 'created': fmt(add_days(today, -7))},
        {'guest_index': 4, 'room_index': 1, 'check_in': fmt(add_days(today, 3)), 'check_out': fmt(add_days(today, 5)), 'adults': 2, 'status': 'Pending', 'payment_status': 'Pending', 'payment_method': 'Pay at Hotel', 'source': 'Phone', 'special_requests': 'Anniversary celebration', 'created': fmt(add_days(today, -2))},
        {'guest_index': 5, 'room_index': 2, 'check_in': fmt(add_days(today, 2)), 'check_out': fmt(add_days(today, 4)), 'adults': 2, 'status': 'Confirmed', 'payment_status': 'Paid', 'payment_method': 'Online', 'source': 'Booking.com', 'special_requests': 'Airport transfer', 'created': fmt(add_days(today, -12))},
        {'guest_index': 9, 'room_index': 2, 'check_in': fmt(add_days(today, 6)), 'check_out': fmt(add_days(today, 9)), 'adults': 2, 'children': 1, 'status': 'Pending', 'payment_status': 'Pending', 'payment_method': 'Pay at Hotel', 'source': 'WhatsApp', 'created': fmt(add_days(today, -1))},
        {'guest_index': 2, 'room_index': 3, 'check_in': today_str, 'check_out': fmt(add_days(today, 2)), 'adults': 2, 'status': 'Confirmed', 'payment_status': 'Paid', 'payment_method': 'Online', 'source': 'Website', 'created': fmt(add_days(today, -10))},
        {'guest_index': 6, 'room_index': 3, 'check_in': fmt(add_days(today, 3)), 'check_out': fmt(add_days(today, 6)), 'adults': 2, 'children': 1, 'status': 'Confirmed', 'payment_status': 'Paid', 'payment_method': 'Online', 'source': 'Booking.com', 'created': fmt(add_days(today, -8))},
        {'guest_index': 10, 'room_index': 3, 'check_in': fmt(add_days(today, -8)), 'check_out': fmt(add_days(today, -6)), 'adults': 2, 'status': 'Checked Out', 'payment_status': 'Paid', 'payment_method': 'Cash', 'source': 'Direct', 'created': fmt(add_days(today, -30))},
        {'guest_index': 0, 'room_index': 4, 'check_in': fmt(add_days(today, -20)), 'check_out': fmt(add_days(today, -18)), 'adults': 2, 'status': 'Checked Out', 'payment_status': 'Paid', 'payment_method': 'Online', 'source': 'Direct', 'created': fmt(add_days(today, -40))},
        {'guest_index': 5, 'room_index': 4, 'check_in': fmt(add_days(today, 7)), 'check_out': fmt(add_days(today, 10)), 'adults': 2, 'children': 1, 'status': 'Cancelled', 'payment_status': 'Refunded', 'payment_method': 'Online', 'source': 'Website', 'special_requests': 'Early check-in', 'created': fmt(add_days(today, -15))},
        {'guest_index': 7, 'room_index': 5, 'check_in': fmt(add_days(today, -3)), 'check_out': today_str, 'adults': 3, 'status': 'Confirmed', 'payment_status': 'Paid', 'payment_method': 'Cash', 'source': 'Direct', 'special_requests': 'Need extra towels', 'created': fmt(add_days(today, -14))},
        {'guest_index': 2, 'room_index': 5, 'check_in': fmt(add_days(today, 1)), 'check_out': fmt(add_days(today, 4)), 'adults': 5, 'children': 1, 'status': 'Confirmed', 'payment_status': 'Paid', 'payment_method': 'Online', 'source': 'Direct', 'special_requests': 'Conference setup', 'created': fmt(add_days(today, -6))},
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
        check_in = datetime.strptime(bd['check_in'], '%Y-%m-%d').date()
        check_out = datetime.strptime(bd['check_out'], '%Y-%m-%d').date()
        bd['guest_id'] = guest.id
        bd['room_id'] = room.id
        bd['nights'] = (check_out - check_in).days
        bd['total'] = compute_total(room.price, room.weekend_price, check_in, check_out)
        bd['children'] = bd.get('children', 0)
        bd['special_requests'] = bd.get('special_requests', '')
        bd['created_at'] = datetime.fromisoformat(bd.pop('created') + 'T00:00:00+00:00').replace(tzinfo=None)
        bd.pop('guest_index')
        bd.pop('room_index')
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
            'tax_rate': TAX_RATE,
            'total_rooms': 6,
        })

    return {'rooms': len(created_rooms), 'guests': len(created_guests), 'bookings': len(bookings_data), 'seasonal': len(seasonal_data)}
