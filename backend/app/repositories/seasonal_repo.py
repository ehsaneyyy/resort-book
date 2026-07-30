from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from ..models.seasonal import SeasonalRule


async def get_all_rules(session: AsyncSession) -> list[SeasonalRule]:
    result = await session.execute(select(SeasonalRule).order_by(SeasonalRule.name))
    return list(result.scalars().all())


async def get_rule_by_id(session: AsyncSession, rule_id: str) -> SeasonalRule | None:
    return await session.get(SeasonalRule, rule_id)


async def create_rule(session: AsyncSession, data: dict) -> SeasonalRule:
    rule = SeasonalRule(**data)
    session.add(rule)
    await session.flush()
    return rule


async def update_rule(session: AsyncSession, rule: SeasonalRule, data: dict) -> SeasonalRule:
    for key, value in data.items():
        if value is not None:
            setattr(rule, key, value)
    await session.flush()
    return rule


async def delete_rule(session: AsyncSession, rule: SeasonalRule) -> None:
    await session.delete(rule)
    await session.flush()
