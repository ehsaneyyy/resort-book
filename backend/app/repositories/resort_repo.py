from sqlalchemy.ext.asyncio import AsyncSession
from ..models.resort import Resort


async def get_resort(session: AsyncSession) -> Resort | None:
    return await session.get(Resort, 1)


async def create_resort(session: AsyncSession, data: dict) -> Resort:
    resort = Resort(id=1, **data)
    session.add(resort)
    await session.flush()
    return resort


async def update_resort(session: AsyncSession, resort: Resort, data: dict) -> Resort:
    for key, value in data.items():
        if value is not None:
            setattr(resort, key, value)
    await session.flush()
    return resort
