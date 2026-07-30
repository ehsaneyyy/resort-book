from sqlmodel import SQLModel, Field
from datetime import datetime, timezone
import uuid


def new_id():
    return 'SP' + str(uuid.uuid4())[:4].upper()


def now():
    return datetime.now(timezone.utc)


class SeasonalRule(SQLModel, table=True):
    __tablename__ = 'seasonal_rules'

    id: str = Field(default_factory=new_id, primary_key=True)
    name: str = Field(max_length=100)
    start_date: str = Field(max_length=10)
    end_date: str = Field(max_length=10)
    adjustment: int = Field(default=0)
    type: str = Field(default='percentage', max_length=20)
    room_types: list[str] | None = Field(default=None)
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=now)
    updated_at: datetime = Field(default_factory=now, sa_column_kwargs={'onupdate': now})
