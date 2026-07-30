from sqlmodel import SQLModel, Field
from datetime import datetime, timezone


def new_id():
    return 'G' + str(uuid.uuid4())[:4].upper()


import uuid


def now():
    return datetime.now(timezone.utc)


class Guest(SQLModel, table=True):
    __tablename__ = 'guests'

    id: str = Field(default_factory=lambda: 'G' + str(uuid.uuid4())[:4].upper(), primary_key=True)
    name: str = Field(max_length=100)
    email: str = Field(default='', max_length=200)
    phone: str = Field(default='', max_length=20)
    city: str = Field(default='', max_length=100)
    total_bookings: int = Field(default=0, ge=0)
    total_spent: int = Field(default=0, ge=0)
    last_stay: str | None = Field(default=None, max_length=10)
    vip: bool = Field(default=False)
    notes: str = Field(default='')
    id_type: str = Field(default='', max_length=50)
    id_number: str = Field(default='', max_length=50)
    created_at: datetime = Field(default_factory=now)
    updated_at: datetime = Field(default_factory=now, sa_column_kwargs={'onupdate': now})
