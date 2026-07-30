from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from ..database import get_session
from ..repositories import room_repo
from ..schemas.room import RoomCreate, RoomUpdate

router = APIRouter(prefix='/api/v1/rooms', tags=['rooms'])


@router.get('')
async def list_rooms(session: AsyncSession = Depends(get_session)):
    rooms = await room_repo.get_all_rooms(session)
    return rooms


@router.get('/{room_id}')
async def get_room(room_id: str, session: AsyncSession = Depends(get_session)):
    room = await room_repo.get_room_by_id(session, room_id)
    if not room:
        raise HTTPException(404, 'Room not found')
    return room


@router.post('', status_code=201)
async def create_room(data: RoomCreate, session: AsyncSession = Depends(get_session)):
    room = await room_repo.create_room(session, data.model_dump())
    return room


@router.put('/{room_id}')
async def update_room(room_id: str, data: RoomUpdate, session: AsyncSession = Depends(get_session)):
    room = await room_repo.get_room_by_id(session, room_id)
    if not room:
        raise HTTPException(404, 'Room not found')
    updated = await room_repo.update_room(session, room, data.model_dump(exclude_unset=True))
    return updated


@router.delete('/{room_id}', status_code=204)
async def delete_room(room_id: str, session: AsyncSession = Depends(get_session)):
    room = await room_repo.get_room_by_id(session, room_id)
    if not room:
        raise HTTPException(404, 'Room not found')
    await room_repo.delete_room(session, room)
