from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from ..models.guest import Guest


async def get_all_guests(session: AsyncSession) -> list[Guest]:
    result = await session.execute(select(Guest).order_by(Guest.name))
    return list(result.scalars().all())


async def get_guest_by_id(session: AsyncSession, guest_id: str) -> Guest | None:
    return await session.get(Guest, guest_id)


async def create_guest(session: AsyncSession, data: dict) -> Guest:
    guest = Guest(**data)
    session.add(guest)
    await session.flush()
    return guest


async def update_guest(session: AsyncSession, guest: Guest, data: dict) -> Guest:
    for key, value in data.items():
        if value is not None:
            setattr(guest, key, value)
    await session.flush()
    return guest


async def delete_guest(session: AsyncSession, guest: Guest) -> None:
    await session.delete(guest)
    await session.flush()
