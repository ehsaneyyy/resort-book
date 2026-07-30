from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from ..database import get_session
from ..repositories import booking_repo, guest_repo, room_repo
from ..schemas.booking import BookingCreate, BookingUpdate, BookingStatusUpdate

router = APIRouter(prefix='/api/v1/bookings', tags=['bookings'])


@router.get('')
async def list_bookings(session: AsyncSession = Depends(get_session)):
    bookings = await booking_repo.get_all_bookings(session)
    return bookings


@router.get('/{booking_id}')
async def get_booking(booking_id: str, session: AsyncSession = Depends(get_session)):
    booking = await booking_repo.get_booking_by_id(session, booking_id)
    if not booking:
        raise HTTPException(404, 'Booking not found')
    return booking


@router.post('', status_code=201)
async def create_booking(data: BookingCreate, session: AsyncSession = Depends(get_session)):
    guest = await guest_repo.get_guest_by_id(session, data.guest_id)
    if not guest:
        raise HTTPException(400, 'Guest not found')
    room = await room_repo.get_room_by_id(session, data.room_id)
    if not room:
        raise HTTPException(400, 'Room not found')
    booking = await booking_repo.create_booking(session, data.model_dump())
    return booking


@router.put('/{booking_id}')
async def update_booking(booking_id: str, data: BookingUpdate, session: AsyncSession = Depends(get_session)):
    booking = await booking_repo.get_booking_by_id(session, booking_id)
    if not booking:
        raise HTTPException(404, 'Booking not found')
    updated = await booking_repo.update_booking(session, booking, data.model_dump(exclude_unset=True))
    return updated


@router.patch('/{booking_id}/status')
async def update_booking_status(booking_id: str, data: BookingStatusUpdate, session: AsyncSession = Depends(get_session)):
    booking = await booking_repo.get_booking_by_id(session, booking_id)
    if not booking:
        raise HTTPException(404, 'Booking not found')
    valid = ['Pending', 'Confirmed', 'Checked Out', 'Cancelled']
    if data.status not in valid:
        raise HTTPException(400, f'Invalid status. Must be one of: {", ".join(valid)}')
    updated = await booking_repo.update_booking(session, booking, {'status': data.status})
    return updated


@router.delete('/{booking_id}', status_code=204)
async def delete_booking(booking_id: str, session: AsyncSession = Depends(get_session)):
    booking = await booking_repo.get_booking_by_id(session, booking_id)
    if not booking:
        raise HTTPException(404, 'Booking not found')
    await booking_repo.delete_booking(session, booking)
