from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from ..database import get_session
from ..services.stats_service import get_dashboard_stats

router = APIRouter(prefix='/api/v1', tags=['stats'])


@router.get('/stats')
async def dashboard_stats(session: AsyncSession = Depends(get_session)):
    stats = await get_dashboard_stats(session)
    return stats
