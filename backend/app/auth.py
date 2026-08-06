from datetime import datetime, timedelta, timezone

import jwt
from fastapi import Depends, HTTPException, Request, Response
from pwdlib import PasswordHash
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from .config import settings
from .database import get_session
from .models.user import User

password_hash = PasswordHash.recommended()

TOKEN_COOKIE = 'access_token'


def hash_password(password: str) -> str:
    return password_hash.hash(password)


def utcnow():
    return datetime.now(timezone.utc).replace(tzinfo=None)


def verify_password(password: str, hashed: str) -> bool:
    try:
        return password_hash.verify(password, hashed)
    except Exception:
        return False


def _pwd_ts(user: User) -> int:
    return int(user.password_changed_at.replace(tzinfo=timezone.utc).timestamp())


def create_access_token(user: User) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        'sub': str(user.id),
        'iat': now,
        'exp': now + timedelta(minutes=settings.jwt_expiry_minutes),
        'pwd': _pwd_ts(user),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm='HS256')


def _cookie_attrs(request: Request) -> dict:
    secure = settings.is_production or request.url.scheme == 'https'
    return {'samesite': 'none' if secure else 'lax', 'secure': secure}


def set_auth_cookie(request: Request, response: Response, token: str) -> None:
    response.set_cookie(
        key=TOKEN_COOKIE,
        value=token,
        httponly=True,
        max_age=settings.jwt_expiry_minutes * 60,
        path='/',
        **_cookie_attrs(request),
    )


def clear_auth_cookie(request: Request, response: Response) -> None:
    response.delete_cookie(key=TOKEN_COOKIE, path='/', **_cookie_attrs(request))


async def get_current_user(
    request: Request,
    session: AsyncSession = Depends(get_session),
) -> User:
    token = request.cookies.get(TOKEN_COOKIE)
    if not token:
        raise HTTPException(status_code=401, detail='Unauthorized')
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=['HS256'])
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail='Unauthorized')
    try:
        user = await session.get(User, int(payload['sub']))
    except (TypeError, ValueError):
        raise HTTPException(status_code=401, detail='Unauthorized')
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail='Unauthorized')
    if payload.get('pwd') != _pwd_ts(user):
        raise HTTPException(status_code=401, detail='Unauthorized')
    return user


def require_admin(user: User = Depends(get_current_user)) -> User:
    return user


async def get_user_by_email(session: AsyncSession, email: str) -> User | None:
    result = await session.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()
