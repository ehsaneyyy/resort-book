from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from ..database import get_session
from ..repositories import booking_repo, guest_repo, room_repo
from ..schemas.booking import BookingCreate, BookingUpdate, BookingStatusUpdate
from ..services import booking_service

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
    nights, total = await booking_service.validate_booking(session, room, data.check_in, data.check_out)
    payload = data.model_dump()
    payload['nights'] = nights
    payload['total'] = total
    payload['status'] = 'Pending'
    payload['payment_status'] = 'Pending'
    booking = await booking_repo.create_booking(session, payload)
    return booking


@router.put('/{booking_id}')
async def update_booking(booking_id: str, data: BookingUpdate, session: AsyncSession = Depends(get_session)):
    booking = await booking_repo.get_booking_by_id(session, booking_id)
    if not booking:
        raise HTTPException(404, 'Booking not found')
    room = await room_repo.get_room_by_id(session, booking.room_id)
    payload = data.model_dump(exclude_unset=True)
    payload.pop('total', None)
    if 'status' in payload:
        booking_service.validate_status(payload['status'])
    dates_changed = 'check_in' in payload or 'check_out' in payload
    if dates_changed:
        check_in = payload.get('check_in', booking.check_in)
        check_out = payload.get('check_out', booking.check_out)
        if not room:
            raise HTTPException(400, 'Room not found')
        nights, total = await booking_service.validate_booking(
            session, room, check_in, check_out, exclude_booking_id=booking.id
        )
        payload['nights'] = nights
        payload['total'] = total
    updated = await booking_repo.update_booking(session, booking, payload)
    return updated


@router.patch('/{booking_id}/status')
async def update_booking_status(booking_id: str, data: BookingStatusUpdate, session: AsyncSession = Depends(get_session)):
    booking = await booking_repo.get_booking_by_id(session, booking_id)
    if not booking:
        raise HTTPException(404, 'Booking not found')
    booking_service.validate_status(data.status)
    updated = await booking_repo.update_booking(session, booking, {'status': data.status})
    return updated


@router.delete('/{booking_id}', status_code=204)
async def delete_booking(booking_id: str, session: AsyncSession = Depends(get_session)):
    booking = await booking_repo.get_booking_by_id(session, booking_id)
    if not booking:
        raise HTTPException(404, 'Booking not found')
    await booking_repo.delete_booking(session, booking)
