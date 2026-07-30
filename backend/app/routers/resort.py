from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from ..database import get_session
from ..repositories import resort_repo
from ..schemas.resort import ResortUpdate

router = APIRouter(prefix='/api/v1/resort', tags=['resort'])


@router.get('')
async def get_resort(session: AsyncSession = Depends(get_session)):
    resort = await resort_repo.get_resort(session)
    if not resort:
        raise HTTPException(404, 'Resort not configured. Run seed first.')
    return resort


@router.put('')
async def update_resort(data: ResortUpdate, session: AsyncSession = Depends(get_session)):
    resort = await resort_repo.get_resort(session)
    if not resort:
        raise HTTPException(404, 'Resort not configured. Run seed first.')
    updated = await resort_repo.update_resort(session, resort, data.model_dump(exclude_unset=True))
    return updated
