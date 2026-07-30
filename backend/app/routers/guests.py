from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from ..database import get_session
from ..repositories import guest_repo, booking_repo
from ..schemas.guest import GuestCreate, GuestUpdate

router = APIRouter(prefix='/api/v1/guests', tags=['guests'])


@router.get('')
async def list_guests(session: AsyncSession = Depends(get_session)):
    guests = await guest_repo.get_all_guests(session)
    return guests


@router.get('/{guest_id}')
async def get_guest(guest_id: str, session: AsyncSession = Depends(get_session)):
    guest = await guest_repo.get_guest_by_id(session, guest_id)
    if not guest:
        raise HTTPException(404, 'Guest not found')
    return guest


@router.get('/{guest_id}/bookings')
async def get_guest_bookings(guest_id: str, session: AsyncSession = Depends(get_session)):
    guest = await guest_repo.get_guest_by_id(session, guest_id)
    if not guest:
        raise HTTPException(404, 'Guest not found')
    bookings = await booking_repo.get_bookings_by_guest(session, guest_id)
    return bookings


@router.post('', status_code=201)
async def create_guest(data: GuestCreate, session: AsyncSession = Depends(get_session)):
    guest = await guest_repo.create_guest(session, data.model_dump())
    return guest


@router.put('/{guest_id}')
async def update_guest(guest_id: str, data: GuestUpdate, session: AsyncSession = Depends(get_session)):
    guest = await guest_repo.get_guest_by_id(session, guest_id)
    if not guest:
        raise HTTPException(404, 'Guest not found')
    updated = await guest_repo.update_guest(session, guest, data.model_dump(exclude_unset=True))
    return updated


@router.delete('/{guest_id}', status_code=204)
async def delete_guest(guest_id: str, session: AsyncSession = Depends(get_session)):
    guest = await guest_repo.get_guest_by_id(session, guest_id)
    if not guest:
        raise HTTPException(404, 'Guest not found')
    await guest_repo.delete_guest(session, guest)
