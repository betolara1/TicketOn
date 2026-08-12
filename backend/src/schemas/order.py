from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from src.models.order import PaymentStatus
from src.schemas.ticket import TicketResponse
from src.schemas.event import EventResponse


# compra do ticket (Checkout)
class OrderCreate(BaseModel):
    event_id: int = Field(..., gt=0, example=1)
    quantity: int = Field(..., gt=0, le=10, example=2, description="Quantidade de ingressos (máx 10)")
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