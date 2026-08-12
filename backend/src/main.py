from fastapi import FastAPI, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text

from src.core.config import settings
from src.core.database import db
from src.routers import auth_router, events_router, ticketmaster_router, orders_router, tickets_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="API para Plataforma de Gestão de Eventos, Compra e Validação de Ingressos.",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(events_router, prefix=settings.API_V1_STR)
app.include_router(ticketmaster_router, prefix=settings.API_V1_STR)
app.include_router(orders_router, prefix=settings.API_V1_STR)
app.include_router(tickets_router, prefix=settings.API_V1_STR)

@app.get(
    "/health",
    tags=["Healthcheck"],
    status_code=status.HTTP_200_OK,
    summary="Verifica o status da API e a conexão com o MySQL"
)

def health_check(db: Session = Depends(db)):
    try:
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        db_status = f"disconnected: {str(e)}"

    return {
        "status": "healthy",
        "database": db_status,
        "version": settings.VERSION,
        "environment": "development"
    }


@app.get("/", tags=["Root"])
def root():
    return {
        "message": f"Bem-vindo à {settings.PROJECT_NAME}!",
        "docs": "/docs",
        "health": "/health"
    }
