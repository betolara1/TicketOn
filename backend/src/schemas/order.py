from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from src.models.order import PaymentStatus
from src.schemas.ticket import TicketResponse
from src.schemas.event import EventResponse


# compra do ticket (Checkout)
class OrderCreate(BaseModel):
    event_id: int = Field(..., gt=0, example=1)
    seat_ids: List[int] = Field(..., min_length=1, description="IDs dos assentos escolhidos")
    payment_method: Optional[str] = Field(..., description="Método de pagamento")

    
# Resposta do Pedido
class OrderResponse(BaseModel):
    id: int
    customer_id: int
    event_id: int
    quantity: int
    total_amount: float
    payment_status: PaymentStatus
    created_at: datetime
    event: Optional[EventResponse] = None
    tickets: List[TicketResponse] = []
    
    model_config = ConfigDict(from_attributes=True)