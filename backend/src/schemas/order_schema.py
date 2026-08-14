from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from src.models.order import PaymentStatus
from src.schemas.ticket_schema import TicketResponse
from src.schemas.event_schema import EventResponse


# compra do ticket (Checkout)
class OrderCreate(BaseModel):
    event_id: int = Field(..., gt=0, example=1)    
    quantity: int = Field(default=1, gt=0, description="Quantidade de ingressos")
    seat_ids: Optional[List[int]] = Field(default=None, description="IDs dos assentos (opcional)")
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