from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from ..models.booking import Booking


async def get_all_bookings(session: AsyncSession) -> list[Booking]:
    result = await session.execute(select(Booking).order_by(Booking.created_at.desc()))
    return list(result.scalars().all())


async def get_booking_by_id(session: AsyncSession, booking_id: str) -> Booking | None:
    return await session.get(Booking, booking_id)


async def get_bookings_by_guest(session: AsyncSession, guest_id: str) -> list[Booking]:
    result = await session.execute(
        select(Booking).where(Booking.guest_id == guest_id).order_by(Booking.created_at.desc())
    )
    return list(result.scalars().all())


async def get_bookings_by_date_range(session: AsyncSession, start: str, end: str) -> list[Booking]:
    result = await session.execute(
        select(Booking).where(Booking.check_in <= end, Booking.check_out > start)
    )
    return list(result.scalars().all())


async def create_booking(session: AsyncSession, data: dict) -> Booking:
    booking = Booking(**data)
    session.add(booking)
    await session.flush()
    return booking


async def update_booking(session: AsyncSession, booking: Booking, data: dict) -> Booking:
    for key, value in data.items():
        if value is not None:
            setattr(booking, key, value)
    await session.flush()
    return booking


async def delete_booking(session: AsyncSession, booking: Booking) -> None:
    await session.delete(booking)
    await session.flush()
