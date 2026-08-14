from typing import List, Optional
from fastapi import APIRouter, Depends, Query

from src.core.dependencies import get_current_user
from src.models.user import User

from src.schemas.event_schema import TicketmasterEventItem
from src.services.ticketmaster_service import TicketmasterService

router = APIRouter(prefix="/ticketmaster", tags=["Ticketmaster"])

@router.get("/events", response_model=List[TicketmasterEventItem], summary="Busca shows e atrações na API da Ticketmaster para inspirar a criação de eventos")
async def search_ticketmaster_events(
    keyword: Optional[str] = None,
    city: Optional[str] = None,
    size: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_current_user) 
):
    return await TicketmasterService.search_events(keyword=keyword, city=city, size=size)
