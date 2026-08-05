from datetime import date, datetime, timedelta
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from ..repositories import booking_repo, room_repo, resort_repo

WEEKEND_WEEKDAYS = {4, 5}


def parse_date(value: str) -> date:
    try:
        return datetime.strptime(value, '%Y-%m-%d').date()
    except (TypeError, ValueError):
        raise HTTPException(status_code=422, detail=f'Invalid date, expected YYYY-MM-DD: {value}')


def overlaps(check_in: str, check_out: str, other_in: str, other_out: str) -> bool:
    return check_in < other_out and other_in < check_out


def night_price(room, check_in: date, nights: int) -> int:
    total = 0
    for i in range(nights):
        day = check_in + timedelta(days=i)
        if room.weekend_price is not None and day.weekday() in WEEKEND_WEEKDAYS:
            total += room.weekend_price
        else:
            total += room.price
    return total


async def compute_total(session: AsyncSession, room, check_in: date, nights: int) -> int:
    resort = await resort_repo.get_resort(session)
    tax_rate = resort.tax_rate if resort else 0
    base = night_price(room, check_in, nights)
    return round(base * (1 + tax_rate / 100))


async def validate_booking(
    session: AsyncSession,
    room,
    check_in: str,
    check_out: str,
    exclude_booking_id: str | None = None,
) -> tuple[int, int]:
    in_date = parse_date(check_in)
    out_date = parse_date(check_out)
    if out_date <= in_date:
        raise HTTPException(status_code=422, detail='Check-out must be after check-in')
    nights = (out_date - in_date).days
    if nights < 1:
        raise HTTPException(status_code=422, detail='Booking must be at least one night')

    existing = await booking_repo.get_all_bookings(session)
    conflicts = []
    for booking in existing:
        if exclude_booking_id and booking.id == exclude_booking_id:
            continue
        if booking.room_id != room.id:
            continue
        if booking.status in ('Cancelled', 'Checked Out'):
            continue
        if overlaps(check_in, check_out, booking.check_in, booking.check_out):
            conflicts.append(booking)

    if conflicts:
        raise HTTPException(
            status_code=409,
            detail='Room already booked for those dates',
        )

    total = await compute_total(session, room, in_date, nights)
    return nights, total
