from fastapi import APIRouter, Depends, HTTPException, Request, Response
from hmac import compare_digest
from sqlalchemy.ext.asyncio import AsyncSession

from ..auth import (
    create_access_token,
    get_current_user,
    get_user_by_email,
    hash_password,
    set_auth_cookie,
    clear_auth_cookie,
    utcnow,
    verify_password,
)
from ..config import settings
from ..database import get_session
from ..models.user import User
from ..request_ip import client_ip
from ..schemas.auth import ChangePasswordRequest, LoginRequest, UserResponse
from ..services.audit_service import log_event

router = APIRouter(prefix='/api/v1/auth', tags=['auth'])


@router.post('/login', response_model=UserResponse)
async def login(
    data: LoginRequest,
    request: Request,
    response: Response,
    session: AsyncSession = Depends(get_session),
):
    if not settings.admin_email or not settings.admin_password:
        raise HTTPException(status_code=503, detail='Admin credentials not configured')
    email = data.email.lower()
    ip = client_ip(request)
    if email != settings.admin_email.lower():
        await log_event('login_failed', None, ip, email)
        raise HTTPException(status_code=401, detail='Invalid credentials')

    user = await get_user_by_email(session, email)

    if user is None:
        if not compare_digest(data.password.encode(), settings.admin_password.encode()):
            await log_event('login_failed', None, ip, email)
            raise HTTPException(status_code=401, detail='Invalid credentials')
        user = User(
            email=email,
            password_hash=hash_password(data.password),
            must_change_password=True,
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)
    else:
        if not user.is_active:
            await log_event('login_failed', user.id, ip, 'inactive')
            raise HTTPException(status_code=401, detail='Invalid credentials')
        if user.must_change_password:
            if not compare_digest(data.password.encode(), settings.admin_password.encode()):
                await log_event('login_failed', user.id, ip, 'bootstrap secret mismatch')
                raise HTTPException(status_code=401, detail='Invalid credentials')
            if not verify_password(data.password, user.password_hash):
                user.password_hash = hash_password(data.password)
                user.password_changed_at = utcnow()
                await session.commit()
        else:
            if not verify_password(data.password, user.password_hash):
                await log_event('login_failed', user.id, ip)
                raise HTTPException(status_code=401, detail='Invalid credentials')

    set_auth_cookie(response, create_access_token(user))
    await log_event('login_success', user.id, ip)
    return user


@router.post('/change-password')
async def change_password(
    data: ChangePasswordRequest,
    request: Request,
    response: Response,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    ip = client_ip(request)
    if not verify_password(data.current_password, user.password_hash):
        await log_event('password_change_failed', user.id, ip, 'wrong current password')
        raise HTTPException(status_code=401, detail='Current password is incorrect')
    if data.new_password == data.current_password:
        await log_event('password_change_failed', user.id, ip, 'new equals current')
        raise HTTPException(status_code=400, detail='New password must be different from current')
    user.password_hash = hash_password(data.new_password)
    user.must_change_password = False
    user.password_changed_at = utcnow()
    await session.commit()
    set_auth_cookie(response, create_access_token(user))
    await log_event('password_changed', user.id, ip)
    return {'ok': True}


@router.post('/logout')
async def logout(
    request: Request,
    response: Response,
):
    clear_auth_cookie(response)
    await log_event('logout', None, client_ip(request))
    return {'ok': True}


@router.get('/me', response_model=UserResponse)
async def me(user: User = Depends(get_current_user)):
    return user
