from sqlmodel import SQLModel, Field
from datetime import datetime, timezone


def now():
    return datetime.now(timezone.utc).replace(tzinfo=None)


class Resort(SQLModel, table=True):
    __tablename__ = 'resort'

    id: int = Field(default=1, primary_key=True)
    name: str = Field(default='My Resort', max_length=100)
    currency: str = Field(default='\u20B9', max_length=10)
    phone: str = Field(default='', max_length=20)
    whatsapp_phone: str = Field(default='', max_length=20)
    email: str = Field(default='', max_length=200)
    address: str = Field(default='', max_length=500)
    check_in_time: str = Field(default='14:00', max_length=5)
    check_out_time: str = Field(default='11:00', max_length=5)
    tax_rate: float = Field(default=5.0, ge=0, le=100)
    total_rooms: int = Field(default=0, ge=0)
    created_at: datetime = Field(default_factory=now)
    updated_at: datetime = Field(default_factory=now, sa_column_kwargs={'onupdate': now})
