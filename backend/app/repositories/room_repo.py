from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from ..models.room import Room


async def get_all_rooms(session: AsyncSession) -> list[Room]:
    result = await session.execute(select(Room).order_by(Room.name))
    return list(result.scalars().all())


async def get_room_by_id(session: AsyncSession, room_id: str) -> Room | None:
    return await session.get(Room, room_id)


async def create_room(session: AsyncSession, data: dict) -> Room:
    room = Room(**data)
    session.add(room)
    await session.flush()
    return room


async def update_room(session: AsyncSession, room: Room, data: dict) -> Room:
    for key, value in data.items():
        if value is not None:
            setattr(room, key, value)
    await session.flush()
    return room


async def delete_room(session: AsyncSession, room: Room) -> None:
    await session.delete(room)
    await session.flush()
