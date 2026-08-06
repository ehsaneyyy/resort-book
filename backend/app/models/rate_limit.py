from sqlmodel import SQLModel, Field, UniqueConstraint
from datetime import datetime, timezone


def now():
    return datetime.now(timezone.utc).replace(tzinfo=None)


class RateLimit(SQLModel, table=True):
    __tablename__ = 'rate_limits'
    __table_args__ = (UniqueConstraint('bucket', 'window_start', name='uq_rate_limit_bucket_window'),)

    id: int = Field(primary_key=True)
    bucket: str = Field(max_length=160)
    window_start: int = Field(index=True)
    hits: int = Field(default=0)
    limit: int = Field(default=30)
    updated_at: datetime = Field(default_factory=now, sa_column_kwargs={'onupdate': now})
