from sqlmodel import SQLModel, Field
from datetime import datetime, timezone


def now():
    return datetime.now(timezone.utc).replace(tzinfo=None)


class SecurityEvent(SQLModel, table=True):
    __tablename__ = 'security_events'

    id: int = Field(primary_key=True)
    user_id: int | None = Field(default=None, foreign_key='users.id')
    event_type: str = Field(max_length=50)
    ip: str = Field(default='', max_length=45)
    detail: str = Field(default='', max_length=500)
    created_at: datetime = Field(default_factory=now, index=True)
