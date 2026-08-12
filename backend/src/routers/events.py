from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query

from sqlalchemy.orm import Session
from sqlalchemy import desc

from src.core.database import db as get_db
from src.core.dependencies import get_current_user, require_roles

from src.models.user import User, UserRole
from src.models.event import Event, EventStatus
from src.schemas.event import EventCreate, EventUpdate, EventResponse

router = APIRouter(prefix="/events", tags=["Eventos"])

# lista dos eventos disponiveis
@router.get("", response_model = List[EventResponse], summary="Lista todos os eventos")
def list_published_events(
    category: Optional[str] = Query(None, alias="category", title="Categoria do evento"),
    city: Optional[str] = Query(None, alias="city", title="Cidade do evento"),
    limit: int = Query(10, ge=1, le=100, title="Limite de eventos por página"),
    search: Optional[str] = Query(None, alias="search", title="Busca por nome ou descrição"),
    db: Session = Depends(get_db)
):
    query = db.query(Event).filter(Event.status == EventStatus.PUBLISHED)

    if category:
        query = query.filter(Event.category.ilike(f"%{category}%"))
    
    if city:
        query = query.filter(Event.venue_city.ilike(f"%{city}%"))

    if search:
        query = query.filter(Event.title.ilike(f"%{search}%"))

    return query.order_by(Event.event_date.asc()).limit(limit).all()


# lista os eventos do organizador logado
@router.get("/organizer/myevents", response_model = List[EventResponse], summary = "Lista os eventos do organizador logado")
def list_organizer_events(
    status: Optional[EventStatus] = None,
    limit: int = Query(10, ge=1, le=100, title="Limite de eventos por página"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ORGANIZER]))
):
    query = db.query(Event).filter(Event.organizer_id == current_user.id)

    if status:
        query = query.filter(Event.status == status)

    if limit:
        query = query.limit(limit)

    return query.order_by(Event.event_date.desc()).all()


# detalhes do evento
@router.get("/{event_id}", response_model = EventResponse, summary = "Detalhes do evento pelo ID")
def get_event_details(event_id: int, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code = status.HTTP_404_NOT_FOUND, detail = "Evento não encontrado")
    return event


# criar evento (somente o organizador)
@router.post("", response_model = EventResponse, status_code = status.HTTP_201_CREATED, summary = "Criar evento")
def create_event(
    event_create: EventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ORGANIZER]))
):
    event = Event(
        organizer_id=current_user.id,
        title=event_create.title,
        description=event_create.description,
        banner_url=event_create.banner_url,
        category=event_create.category,
        venue_name=event_create.venue_name,
        venue_city=event_create.venue_city,
        event_date=event_create.event_date,
        total_capacity=event_create.total_capacity,
        available_capacity=event_create.total_capacity,
        ticket_price=event_create.ticket_price,
        status=EventStatus.PUBLISHED
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event

# atualizar evento
@router.put("/{event_id}", response_model = EventResponse, summary = "Atualizar evento")
def update_event(
    event_id: int,
    event_update: EventUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ORGANIZER]))
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code = status.HTTP_404_NOT_FOUND, detail = "Evento não encontrado")
        
    if event.organizer_id != current_user.id:
        raise HTTPException(status_code = status.HTTP_403_FORBIDDEN, detail = "Você não tem permissão para atualizar este evento")

    event.title = event_update.title
    event.description = event_update.description
    event.banner_url = event_update.banner_url
    event.category = event_update.category
    event.venue_name = event_update.venue_name
    event.venue_city = event_update.venue_city
    event.event_date = event_update.event_date
    event.total_capacity = event_update.total_capacity
    event.ticket_price = event_update.ticket_price
    event.status = event_update.status
    db.commit()
    db.refresh(event)
    return event


# deletar evento
@router.delete("/{event_id}", status_code = status.HTTP_204_NO_CONTENT, summary = "Deletar evento")
def delete_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ORGANIZER]))
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code = status.HTTP_404_NOT_FOUND, detail = "Evento não encontrado")
    if event.organizer_id != current_user.id:
        raise HTTPException(status_code = status.HTTP_403_FORBIDDEN, detail = "Você não tem permissão para deletar este evento")
    db.delete(event)
    db.commit()
    return