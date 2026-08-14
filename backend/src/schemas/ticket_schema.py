from datetime import datetime
from pydantic import BaseModel, ConfigDict
from typing import Optional
from src.models.ticket import TicketStatus
from src.schemas.event_schema import EventResponse


# Base comum com os campos compartilhados
class TicketResponse(BaseModel):
    id: int
    order_id: int
    event_id: int
    ticket_code: str
    share_link: str
    status: TicketStatus
    validated_at: Optional[datetime] = None
    created_at: datetime
    event: Optional[EventResponse] = None
    qr_code_base64: Optional[str] = None
    qr_payload: str = ""

    model_config = ConfigDict(from_attributes=True)


# Resposta do Ingresso para compartilhamento
class TicketPublicResponse(BaseModel):
    ticket_code: str
    share_link: str
    status: TicketStatus
    event_title: str
    venue_name: str
    venue_city: str
    event_date: datetime
    banner_url: Optional[str] = None

    
# Payload de validação na portaria
class TicketValidateRequest(BaseModel):
    ticket_code: str


# Resposta da validação na portaria
class TicketValidateResponse(BaseModel):
    success: bool
    message: str
    status: str = "VALID"
    ticket_code: str
    event_title: str
    participant_name: Optional[str] = None
    seat_label: Optional[str] = None
    validated_at: datetime
    validated_by_name: str