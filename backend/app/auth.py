import hmac

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from .config import settings

bearer_scheme = HTTPBearer(auto_error=False)


def require_admin(credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme)) -> None:
    if credentials is None or credentials.scheme.lower() != 'bearer':
        raise HTTPException(status_code=401, detail='Unauthorized')
    if not settings.admin_token or not hmac.compare_digest(
        credentials.credentials.encode('utf-8'),
        settings.admin_token.encode('utf-8'),
    ):
        raise HTTPException(status_code=401, detail='Unauthorized')
