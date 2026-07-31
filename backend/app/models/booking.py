from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime, timezone
import uuid


def new_id():
    return 'RB' + str(uuid.uuid4())[:4].upper()


def now():
    return datetime.now(timezone.utc).replace(tzinfo=None)


class Booking(SQLModel, table=True):
    __tablename__ = 'bookings'

    id: str = Field(default_factory=new_id, primary_key=True)
    guest_id: str = Field(foreign_key='guests.id', max_length=20)
    room_id: str = Field(foreign_key='rooms.id', max_length=20)
    check_in: str = Field(max_length=10)
    check_out: str = Field(max_length=10)
    nights: int = Field(ge=1)
    adults: int = Field(default=2, ge=1)
    children: int = Field(default=0, ge=0)
    total: int = Field(ge=0)
    status: str = Field(default='Pending', max_length=20)
    payment_status: str = Field(default='Pending', max_length=20)
    payment_method: str = Field(default='Pay at Hotel', max_length=50)
    source: str = Field(default='Direct', max_length=50)
    special_requests: str = Field(default='')
    created_at: datetime = Field(default_factory=now)
    updated_at: datetime = Field(default_factory=now, sa_column_kwargs={'onupdate': now})
