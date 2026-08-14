from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query

from sqlalchemy.orm import Session
from sqlalchemy import desc

from src.core.database import db as get_db
from src.core.dependencies import get_current_user, require_roles

from src.models.user import User, UserRole
from src.models.event import Event, EventStatus
from src.schemas.event_schema import EventCreate, EventUpdate, EventResponse
from src.models.seat import Seat, SeatStatus
from src.schemas.seats_schema import SeatResponse

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
@router.get("/organizer/my-events", response_model = List[EventResponse], summary = "Lista os eventos do organizador logado")
def list_organizer_events(
    status: Optional[EventStatus] = None,
    limit: int = Query(10, ge=1, le=100, title="Limite de eventos por página"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ORGANIZER]))
):
    query = db.query(Event).filter(Event.organizer_id == current_user.id)

    if status:
        query = query.filter(Event.status == status)

    query = query.order_by(Event.event_date.desc())

    if limit:
        query = query.limit(limit)

    return query.all()


# detalhes do evento
@router.get("/{event_id}", response_model = EventResponse, summary = "Detalhes do evento pelo ID")
def get_event_details(event_id: int, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code = status.HTTP_404_NOT_FOUND, detail = "Evento não encontrado")
    
    return event


# listar assentos disponiveis
@router.get("/{event_id}/seats", response_model=List[SeatResponse], summary="Lista os assentos do evento")
def get_event_seats(event_id: int, db: Session = Depends(get_db)):

    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Evento não encontrado")
    
    seats = db.query(Seat).filter(Seat.event_id == event_id).order_by(Seat.id.asc()).all()
    
    # Se o evento ainda não tem assentos cadastrados, gera uma grade padrão de A1 até H12
    if not seats or len(seats) != event.total_capacity:
        if seats:
            db.query(Seat).filter(Seat.event_id == event_id, Seat.status == SeatStatus.AVAILABLE).delete()
            db.commit()
            
        new_seats = generate_seats(event.id, event.total_capacity)
        db.add_all(new_seats)
        db.commit()
        seats = db.query(Seat).filter(Seat.event_id == event_id).order_by(Seat.id.asc()).all()
    return seats


def generate_seats(event_id: int, total_capacity: int) -> List[Seat]:
    seats = 0
    if total_capacity >= 10:
        seats = 10
    else:
        seats = total_capacity
    
    new_seats = []

    for i in range(total_capacity):
        row = i // seats
        asc_row = chr(65 + row)
        seat_number = (i % seats) + 1
        label = f"{asc_row}{seat_number}"

        new_seats.append(Seat(
            event_id=event_id,
            label=label,
            status=SeatStatus.AVAILABLE
        ))

    return new_seats


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

    seats = generate_seats(event.id, event.total_capacity)
    db.add_all(seats)
    db.commit()

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
