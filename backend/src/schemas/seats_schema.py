from pydantic import BaseModel, ConfigDict
from typing import Optional
from src.models.seat import SeatStatus

class SeatResponse(BaseModel):
    id: int
    event_id: int
    label: str
    status: SeatStatus
    ticket_id: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)
