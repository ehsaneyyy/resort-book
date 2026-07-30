from pydantic import BaseModel


class BookingCreate(BaseModel):
    guest_id: str
    room_id: str
    check_in: str
    check_out: str
    nights: int
    adults: int = 2
    children: int = 0
    total: int = 0
    status: str = 'Pending'
    payment_status: str = 'Pending'
    payment_method: str = 'Pay at Hotel'
    source: str = 'Direct'
    special_requests: str = ''


class BookingUpdate(BaseModel):
    check_in: str | None = None
    check_out: str | None = None
    nights: int | None = None
    adults: int | None = None
    children: int | None = None
    total: int | None = None
    status: str | None = None
    payment_status: str | None = None
    payment_method: str | None = None
    source: str | None = None
    special_requests: str | None = None


class BookingStatusUpdate(BaseModel):
    status: str
