from pydantic import BaseModel


class SeasonalRuleCreate(BaseModel):
    name: str
    start_date: str
    end_date: str
    adjustment: int = 0
    type: str = 'percentage'
    room_types: list[str] | None = None
    is_active: bool = True


class SeasonalRuleUpdate(BaseModel):
    name: str | None = None
    start_date: str | None = None
    end_date: str | None = None
    adjustment: int | None = None
    type: str | None = None
    room_types: list[str] | None = None
    is_active: bool | None = None
