from datetime import datetime, timezone

from sqlalchemy import case
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import func, select

from ..models.booking import Booking
from ..models.room import Room
from ..models.guest import Guest


async def get_dashboard_stats(session: AsyncSession) -> dict:
    total_rooms = (await session.execute(select(func.count(Room.id)))).scalar() or 0
    total_guests = (await session.execute(select(func.count(Guest.id)))).scalar() or 0

    counts = (await session.execute(
        select(
            func.count(Booking.id),
            func.coalesce(func.sum(case((Booking.status == 'Confirmed', 1), else_=0)), 0),
            func.coalesce(func.sum(case((Booking.status == 'Pending', 1), else_=0)), 0),
            func.coalesce(func.sum(case((Booking.status == 'Checked Out', 1), else_=0)), 0),
            func.coalesce(func.sum(case((Booking.status == 'Cancelled', 1), else_=0)), 0),
        )
    )).one()
    total_bookings, confirmed, pending, checked_out, cancelled = (int(v) for v in counts)

    today_str = datetime.now(timezone.utc).strftime('%Y-%m-%d')

    occupied = (await session.execute(
        select(func.count(Booking.id)).where(
            Booking.status == 'Confirmed',
            Booking.check_in <= today_str,
            Booking.check_out > today_str,
        )
    )).scalar() or 0

    today_revenue = (await session.execute(
        select(func.coalesce(func.sum(Booking.total), 0)).where(
            Booking.check_in == today_str,
            Booking.status.in_(('Confirmed', 'Pending')),
        )
    )).scalar() or 0

    return {
        'total_rooms': total_rooms,
        'total_guests': total_guests,
        'total_bookings': total_bookings,
        'confirmed': confirmed,
        'pending': pending,
        'checked_out': checked_out,
        'cancelled': cancelled,
        'occupied': occupied,
        'occupancy_pct': round((occupied / total_rooms) * 100) if total_rooms else 0,
        'today_revenue': today_revenue,
    }
