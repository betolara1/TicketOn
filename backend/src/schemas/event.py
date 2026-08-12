from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from src.models.event import EventStatus
from src.schemas.user import UserResponse


# Base comum com os campos compartilhados
class TicketmasterEventItem(BaseModel):
    external_id: str
    title: str
    category: Optional[str] = "Geral"
    banner_url: Optional[str] = None
    suggested_venue: Optional[str] = None
    suggested_city: Optional[str] = None


# 2. Base comum do Evento local
class EventBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=200, example="Show Especial do Metallica")
    description: Optional[str] = Field(None, example="Turnê ao vivo no estádio.")
    banner_url: Optional[str] = Field(None, example="")
    category: Optional[str] = Field(default="Música", example="Música")
    venue_name: str = Field(..., min_length=2, max_length=150, example="Moruntri")
    venue_city: str = Field(..., min_length=2, max_length=100, example="São Paulo")
    event_date: datetime = Field(..., example="2026-11-20T20:00:00")
    total_capacity: int = Field(..., gt=0, example=500)
    ticket_price: float = Field(..., ge=0.0, example=150.00)
    external_tm_id: Optional[str] = Field(None, example="vvG1YZ9R7kp3k_")


# Criação do Evento (Organizador)
class EventCreate(EventBase):
    pass


# Atualização do Evento
class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    banner_url: Optional[str] = None
    category: Optional[str] = None
    venue_name: Optional[str] = None
    venue_city: Optional[str] = None
    event_date: Optional[datetime] = None
    total_capacity: Optional[int] = Field(None, gt=0)
    ticket_price: Optional[float] = Field(None, ge=0.0)
    status: Optional[EventStatus] = None


# resposta da API
class EventResponse(EventBase):
    id: int
    organizer_id: int
    available_capacity: int
    status: EventStatus
    created_at: datetime
    organizer: Optional[UserResponse] = None

    model_config = ConfigDict(from_attributes=True)
