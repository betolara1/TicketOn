import uuid
from typing import List
import stripe
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from src.core.config import settings
from src.core.database import db as get_db
from src.core.dependencies import get_current_user

from src.models.user import User
from src.models.event import Event, EventStatus
from src.models.order import Order, PaymentStatus
from src.models.ticket import Ticket, TicketStatus
from src.models.seat import Seat, SeatStatus
from src.schemas.order_schema import OrderCreate, OrderResponse
from src.services.payment_service import PaymentService

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

    quantity = len(order_in.seat_ids) if order_in.seat_ids else order_in.quantity

    if event.available_capacity < quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Não há ingressos suficientes disponíveis. Restam apenas {event.available_capacity}."
        )
    

    total_amount = float(event.ticket_price) * quantity


    seats = []
    if order_in.seat_ids:
        seats = db.query(Seat).filter(Seat.id.in_(order_in.seat_ids), Seat.event_id == event.id).with_for_update().all()
        if len(seats) != len(order_in.seat_ids):
            raise HTTPException(400, "Algum assento selecionado não existe.")
        for seat in seats:
            if seat.status != SeatStatus.AVAILABLE:
                raise HTTPException(400, f"Assento {seat.label} já foi vendido.")
            seat.status = SeatStatus.SOLD

    new_order = Order(
        customer_id=current_user.id,
        event_id = event.id,
        quantity = len(seats),
        total_amount = total_amount,
        payment_status = PaymentStatus.PENDING
    )

    db.add(new_order)
    db.flush()

    if total_amount > 0:
        try:
            intent = PaymentService.create_payment(total_amount, new_order.id)

            if intent.status != "succeeded":
                new_order.payment_status = PaymentStatus.CANCELED

                for seat in seats:
                    seat.status = SeatStatus.AVAILABLE
                db.commit()

                raise HTTPException(status_code=402, detail=f"Pagamento não concluído: {intent.status}")

            new_order.stripe_payment_intent_id = intent.id

        except stripe.error.StripeError as e:
            new_order.payment_status = PaymentStatus.CANCELED

            for seat in seats:
                seat.status = SeatStatus.AVAILABLE

            db.commit()

            raise HTTPException(status_code=402, detail=f"Pagamento recusado: {str(e)}")

    new_order.payment_status = PaymentStatus.APPROVED
    
    # Atualiza a capacidade disponível do evento
    event.available_capacity -= quantity
    # Gera os bilhetes com QR Code único para cada ingresso
    for i in range(quantity):
        ticket = Ticket(
            order_id = new_order.id,
            event_id = event.id,
            ticket_code = str(uuid.uuid4()),
            share_link = str(uuid.uuid4()),
            status = TicketStatus.VALID
        )
        db.add(ticket)
        db.flush()
        if seats and i < len(seats):
            seats[i].ticket_id = ticket.id
    db.commit()
    db.refresh(new_order)
    return new_order


@router.post("/{id}/cancel", summary="Cancelar pedido e devolver ingressos/assentos ao estoque")
def cancel_order(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    order = db.query(Order).filter(Order.id == id).with_for_update().first()

    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pedido não encontrado.")

    if order.customer_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Não é possível cancelar o pedido de outro usuário.")
    
    if order.payment_status == PaymentStatus.CANCELED:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Este pedido já foi recusado/cancelado.")

    for ticket in order.tickets:
        if ticket.status == TicketStatus.USED:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Não é possível cancelar: um ou mais ingressos deste pedido já foram utilizados na portaria.")
    
    for ticket in order.tickets:
        ticket.status = TicketStatus.CANCELLED
        
    ticket_ids = [t.id for t in order.tickets]
    if ticket_ids:
        seats = db.query(Seat).filter(Seat.ticket_id.in_(ticket_ids)).all()
        for seat in seats:
            seat.status = SeatStatus.AVAILABLE
            seat.ticket_id = None

    event = db.query(Event).filter(Event.id == order.event_id).with_for_update().first()
    if event:
        event.available_capacity += order.quantity

    order.payment_status = PaymentStatus.CANCELED
    
    db.commit()
    db.refresh(order)
    return {"message": "Pedido cancelado com sucesso e assentos devolvidos ao estoque."}


@router.get("", response_model = List[OrderResponse], summary = "Lista todos os pedidos do usuário")
def list_my_orders(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Order).filter(Order.customer_id == current_user.id).order_by(desc(Order.created_at)).all()


@router.post("/payments/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, settings.STRIPE_WEBHOOK_SECRET)
    except (ValueError, stripe.error.SignatureVerificationError):
        raise HTTPException(status_code=400, detail="Webhook inválido.")

    if event["type"] == "payment_intent.succeeded":
        intent = event["data"]["object"]
        order = db.query(Order).filter(Order.stripe_payment_intent_id == intent["id"]).first()
        if order:
            order.payment_status = PaymentStatus.APPROVED
            db.commit()
    return {"received": True}