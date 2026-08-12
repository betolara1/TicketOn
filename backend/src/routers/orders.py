import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from src.core.database import db as get_db
from src.core.dependencies import get_current_user

from src.models.user import User
from src.models.event import Event, EventStatus
from src.models.order import Order, PaymentStatus
from src.models.ticket import Ticket, TicketStatus
from src.schemas.order import OrderCreate, OrderResponse

router = APIRouter(prefix = "/orders", tags = ["Pedidos e Checkout"])

@router.post("", response_model = OrderResponse, status_code = status.HTTP_201_CREATED, summary = "Finalizar Compra de Ingressos")
def create_order(
    order_in: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    event = db.query(Event).filter(Event.id == order_in.event_id).with_for_update().first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Evento não encontrado.")

    if event.status != EventStatus.PUBLISHED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Este evento não está aberto para vendas."
        )

    if event.available_capacity < order_in.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Não há ingressos suficientes. Disponíveis: {event.available_capacity}"
        )

    total_amount = float(event.ticket_price) * order_in.quantity

    event.available_capacity -= order_in.quantity

    new_order = Order(
        customer_id=current_user.id,
        event_id=event.id,
        quantity=order_in.quantity,
        total_amount=total_amount,
        payment_status=PaymentStatus.APPROVED
    )

    db.add(new_order)
    db.flush()


    for _ in range(order_in.quantity):
        ticket = Ticket(
            order_id=new_order.id,
            event_id=event.id,
            ticket_code=str(uuid.uuid4()),
            share_link=str(uuid.uuid4()),
            status=TicketStatus.VALID
        )
        db.add(ticket)

    db.commit()
    db.refresh(new_order)

    return new_order



@router.get("", response_model = List[OrderResponse], summary = "Lista todos os pedidos do usuário")
def list_my_orders(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Order).filter(Order.customer_id == current_user.id).order_by(desc(Order.created_at)).all()
