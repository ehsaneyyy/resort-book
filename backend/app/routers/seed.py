from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from ..database import get_session
from ..services.seed_service import seed_demo_data

router = APIRouter(prefix='/api/v1', tags=['seed'])


@router.post('/seed')
async def seed_data(session: AsyncSession = Depends(get_session)):
    result = await seed_demo_data(session)
    return {'message': 'Demo data loaded', 'counts': result}
