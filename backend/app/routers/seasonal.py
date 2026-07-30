from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from ..database import get_session
from ..repositories import seasonal_repo
from ..schemas.seasonal import SeasonalRuleCreate, SeasonalRuleUpdate

router = APIRouter(prefix='/api/v1/seasonal-rules', tags=['seasonal-rules'])


@router.get('')
async def list_rules(session: AsyncSession = Depends(get_session)):
    rules = await seasonal_repo.get_all_rules(session)
    return rules


@router.get('/{rule_id}')
async def get_rule(rule_id: str, session: AsyncSession = Depends(get_session)):
    rule = await seasonal_repo.get_rule_by_id(session, rule_id)
    if not rule:
        raise HTTPException(404, 'Rule not found')
    return rule


@router.post('', status_code=201)
async def create_rule(data: SeasonalRuleCreate, session: AsyncSession = Depends(get_session)):
    rule = await seasonal_repo.create_rule(session, data.model_dump())
    return rule


@router.put('/{rule_id}')
async def update_rule(rule_id: str, data: SeasonalRuleUpdate, session: AsyncSession = Depends(get_session)):
    rule = await seasonal_repo.get_rule_by_id(session, rule_id)
    if not rule:
        raise HTTPException(404, 'Rule not found')
    updated = await seasonal_repo.update_rule(session, rule, data.model_dump(exclude_unset=True))
    return updated


@router.delete('/{rule_id}', status_code=204)
async def delete_rule(rule_id: str, session: AsyncSession = Depends(get_session)):
    rule = await seasonal_repo.get_rule_by_id(session, rule_id)
    if not rule:
        raise HTTPException(404, 'Rule not found')
    await seasonal_repo.delete_rule(session, rule)
