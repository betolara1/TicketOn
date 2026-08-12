from src.routers.auth import router as auth_router
from src.routers.events import router as events_router
from src.routers.ticketmaster import router as ticketmaster_router


__all__ = [
    "auth_router",
    "events_router",
    "ticketmaster_router"
]
