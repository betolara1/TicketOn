from src.routers.auth_routers import router as auth_router
from src.routers.events_routers import router as events_router
from src.routers.ticketmaster_routers import router as ticketmaster_router
from src.routers.orders_routers import router as orders_router
from src.routers.tickets_routers import router as tickets_router


__all__ = [
    "auth_router",
    "events_router",
    "ticketmaster_router",
    "orders_router",
    "tickets_router"
]
