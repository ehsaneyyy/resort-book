from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from ..database import get_session
from ..services.seed_service import seed_demo_data
from ..config import settings

router = APIRouter(prefix='/api/v1', tags=['seed'])


@router.post('/seed')
async def seed_data(session: AsyncSession = Depends(get_session)):
    if not settings.seed_enabled:
        raise HTTPException(403, 'Seeding is disabled')
    result = await seed_demo_data(session)
    return {'message': 'Demo data loaded', 'counts': result}
