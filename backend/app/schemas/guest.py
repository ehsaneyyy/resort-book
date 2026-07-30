from pydantic import BaseModel


class GuestCreate(BaseModel):
    name: str
    email: str = ''
    phone: str = ''
    city: str = ''
    vip: bool = False
    notes: str = ''
    id_type: str = ''
    id_number: str = ''


class GuestUpdate(BaseModel):
    name: str | None = None
    email: str | None = None
    phone: str | None = None
    city: str | None = None
    vip: bool | None = None
    notes: str | None = None
    id_type: str | None = None
    id_number: str | None = None
