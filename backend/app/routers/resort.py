from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from ..database import get_session
from ..repositories import resort_repo
from ..schemas.resort import ResortUpdate

router = APIRouter(prefix='/api/v1/resort', tags=['resort'])

EMPTY_RESORT = {
    'id': 1,
    'name': 'My Resort',
    'currency': '\u20B9',
    'phone': '',
    'email': '',
    'address': '',
    'check_in_time': '14:00',
    'check_out_time': '11:00',
    'tax_rate': 5.0,
    'whatsapp_phone': '',
    'total_rooms': 0,
}


@router.get('')
async def get_resort(session: AsyncSession = Depends(get_session)):
    resort = await resort_repo.get_resort(session)
    if not resort:
        return EMPTY_RESORT
    return resort


@router.put('')
async def update_resort(data: ResortUpdate, session: AsyncSession = Depends(get_session)):
    payload = data.model_dump(exclude_unset=True)
    resort = await resort_repo.get_resort(session)
    if not resort:
        resort = await resort_repo.create_resort(session, payload)
    else:
        resort = await resort_repo.update_resort(session, resort, payload)
    return resort
