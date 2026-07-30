from sqlmodel import SQLModel, Field, Column
from sqlalchemy import JSON
from datetime import datetime, timezone
import uuid


def new_id():
    return str(uuid.uuid4())[:8]


def now():
    return datetime.now(timezone.utc)


class Room(SQLModel, table=True):
    __tablename__ = 'rooms'

    id: str = Field(default_factory=new_id, primary_key=True)
    name: str = Field(max_length=100)
    type: str = Field(max_length=50)
    price: int = Field(ge=0)
    weekend_price: int | None = Field(default=None, ge=0)
    capacity: int = Field(default=2, ge=1)
    beds: str = Field(default='1 Queen Bed')
    size: int = Field(default=0, ge=0)
    floor: int = Field(default=1)
    status: str = Field(default='available', max_length=20)
    amenities: list[str] = Field(default_factory=list, sa_column=Column(JSON))
    description: str = Field(default='')
    created_at: datetime = Field(default_factory=now)
    updated_at: datetime = Field(default_factory=now, sa_column_kwargs={'onupdate': now})
