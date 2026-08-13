from asyncio import base_events
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from src.core.database import db as get_db
from src.core.dependencies import get_current_user, require_roles
from src.models.user import User, UserRole
from src.models.ticket import Ticket, TicketStatus
from src.schemas.ticket import (TicketResponse, TicketPublicResponse, TicketValidateRequest, TicketValidateResponse)
from src.services.qrcode_service import verify_qr_payload, build_qr_payload, generate_qr_image_base64

router = APIRouter(prefix = "/tickets", tags= ["Ingressos/Portaria"])

# Ingressos do usuário 
@router.get("/my-tickets", response_model = List[TicketResponse], summary = "Lista os ingressos do usuário")
def list_my_tickets(db:Session = Depends(get_db), current_user = Depends(get_current_user)):
    tickets =  db.query(Ticket).join(Ticket.order).filter(Ticket.order.has(customer_id = current_user.id)).order_by(desc(Ticket.created_at)).all()

    result = []
    for t in tickets:
        payload = build_qr_payload(t.ticket_code)
        item = TicketResponse.model_validate(t)
        item.qr_code_base64 = generate_qr_image_base64(payload)
        result.append(item)
    
    return result


# Visualizar Ingresso Compartilhado
@router.get("/share/{share_link}", response_model = TicketPublicResponse, summary = "Visualiza um ingresso pelo link de compartilhamento")
def get_shared_ticket(share_link: str, db: Session = Depends(get_db)):
    ticket = db.query(Ticket).filter(Ticket.share_link == share_link).first()

    if not ticket:
        raise HTTPException(status_code = status.HTTP_404_NOT_FOUND, detail = "Ingresso não encontrado")
    
    event = ticket.event

    return TicketPublicResponse(
        ticket_code = ticket.ticket_code,
        share_link = ticket.share_link,
        status = ticket.status,
        event_title = event.title,
        venue_name = event.venue_name,
        venue_city = event.venue_city,
        event_date = event.event_date,
        banner_url = event.banner_url
    )



# Validação de Ingresso na Portaria
@router.post("/validate", response_model=TicketValidateResponse, summary="Valida a entrada de um participante escaneando o código do QR Code (Portaria/Staff)")
def validate_ticket_entrance(payload: TicketValidateRequest, db: Session = Depends(get_db), current_user: User = Depends(require_roles([UserRole.STAFF, UserRole.ORGANIZER]))):
    
    ticket_code = verify_qr_payload(payload.ticket_code)
    if ticket_code is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="QR Code inválido.")
    
    ticket = db.query(Ticket).filter(Ticket.ticket_code == ticket_code).with_for_update().first()
    
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="QR Code inválido! Ingresso não encontrado no sistema.")

    if ticket.status == TicketStatus.USED:
        hora_formatada = ticket.validated_at.strftime('%d/%m/%Y às %H:%M:%S') if ticket.validated_at else "horário anterior"
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"ALERTA: Este ingresso JÁ FOI UTILIZADO em {hora_formatada}!")

    if ticket.status == TicketStatus.CANCELLED:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Este ingresso foi CANCELADO e não permite entrada.")
    
    # Marca o ingresso como USADO
    now = datetime.now()
    ticket.status = TicketStatus.USED
    ticket.validated_at = now
    ticket.validated_by = current_user.id

    db.commit()
    db.refresh(ticket)

    return TicketValidateResponse(
        success=True,
        message="Acesso Liberado! Ingresso válido.",
        ticket_code=ticket.ticket_code,
        event_title=ticket.event.title,
        validated_at=now,
        validated_by_name=current_user.name
    )
