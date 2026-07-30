from pydantic import BaseModel


class ResortUpdate(BaseModel):
    name: str | None = None
    currency: str | None = None
    phone: str | None = None
    whatsapp_phone: str | None = None
    email: str | None = None
    address: str | None = None
    check_in_time: str | None = None
    check_out_time: str | None = None
    tax_rate: float | None = None
    total_rooms: int | None = None
