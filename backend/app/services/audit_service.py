from ..database import async_session_factory
from ..models.security_event import SecurityEvent


async def log_event(
    event_type: str,
    user_id: int | None = None,
    ip: str = '',
    detail: str = '',
) -> None:
    async with async_session_factory() as session:
        session.add(
            SecurityEvent(
                event_type=event_type,
                user_id=user_id,
                ip=ip,
                detail=detail[:500],
            )
        )
        await session.commit()
