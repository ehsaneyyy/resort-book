from sqlalchemy.ext.asyncio import AsyncSession
from ..models.booking import Booking
from ..models.room import Room
from ..models.guest import Guest
from ..repositories import booking_repo


async def get_dashboard_stats(session: AsyncSession) -> dict:
    from sqlmodel import select, func

    total_rooms_result = await session.execute(select(func.count(Room.id)))
    total_rooms = total_rooms_result.scalar() or 0

    total_guests_result = await session.execute(select(func.count(Guest.id)))
    total_guests = total_guests_result.scalar() or 0

    result = await session.execute(select(Booking))
    all_bookings: list[Booking] = list(result.scalars().all())

    confirmed = [b for b in all_bookings if b.status == 'Confirmed']
    pending = [b for b in all_bookings if b.status == 'Pending']
    checked_out = [b for b in all_bookings if b.status == 'Checked Out']
    cancelled = [b for b in all_bookings if b.status == 'Cancelled']

    from datetime import timezone, datetime
    today_str = datetime.now(timezone.utc).strftime('%Y-%m-%d')
    occupied = len([b for b in confirmed if today_str >= b.check_in and today_str < b.check_out])
    today_revenue = sum(b.total for b in all_bookings if b.check_in == today_str and b.status in ('Confirmed', 'Pending'))

    return {
        'total_rooms': total_rooms,
        'total_guests': total_guests,
        'total_bookings': len(all_bookings),
        'confirmed': len(confirmed),
        'pending': len(pending),
        'checked_out': len(checked_out),
        'cancelled': len(cancelled),
        'occupied': occupied,
        'occupancy_pct': round((occupied / total_rooms) * 100) if total_rooms else 0,
        'today_revenue': today_revenue,
    }
