from pydantic import BaseModel


class RoomCreate(BaseModel):
    name: str
    type: str = 'Standard'
    price: int = 0
    weekend_price: int | None = None
    capacity: int = 2
    beds: str = '1 Queen Bed'
    size: int = 0
    floor: int = 1
    amenities: list[str] = []
    description: str = ''


class RoomUpdate(BaseModel):
    name: str | None = None
    type: str | None = None
    price: int | None = None
    weekend_price: int | None = None
    capacity: int | None = None
    beds: str | None = None
    size: int | None = None
    floor: int | None = None
    status: str | None = None
    amenities: list[str] | None = None
    description: str | None = None
