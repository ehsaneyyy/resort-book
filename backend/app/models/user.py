from sqlmodel import SQLModel, Field
from datetime import datetime, timezone


def now():
    return datetime.now(timezone.utc).replace(tzinfo=None)


class User(SQLModel, table=True):
    __tablename__ = 'users'

    id: int = Field(primary_key=True)
    email: str = Field(max_length=200, unique=True, index=True)
    password_hash: str = Field(max_length=300)
    must_change_password: bool = Field(default=True)
    is_active: bool = Field(default=True)
    password_changed_at: datetime = Field(default_factory=now)
    created_at: datetime = Field(default_factory=now)
    updated_at: datetime = Field(default_factory=now, sa_column_kwargs={'onupdate': now})
