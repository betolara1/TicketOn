from datetime import datetime
import enum
from sqlalchemy import String, Text, DateTime, Enum, Integer, Numeric, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List, Optional

from src.core.database import Base


class EventStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    PUBLISHED = "PUBLISHED"
    FINISHED = "FINISHED"
    CANCELLED = "CANCELLED"


class Event(Base):
    __tablename__ = "events"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    organizer_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)

    # Dados da Ticketmaster
    external_tm_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    banner_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    category: Mapped[Optional[str]] = mapped_column(String(50), nullable=True) 


    venue_name: Mapped[str] = mapped_column(String(150), nullable=False)
    venue_city: Mapped[str] = mapped_column(String(100), nullable=False)
    event_date: Mapped[datetime] = mapped_column(DateTime, nullable=False, index=True)


    total_capacity: Mapped[int] = mapped_column(Integer, nullable=False)
    available_capacity: Mapped[int] = mapped_column(Integer, nullable=False)
    ticket_price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)


    status: Mapped[EventStatus] = mapped_column(
        Enum(EventStatus),
        default=EventStatus.PUBLISHED,
        nullable=False,
        index=True
    )
    
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relacionamentos
    organizer: Mapped["User"] = relationship("User", back_populates="organized_events")
    orders: Mapped[List["Order"]] = relationship("Order", back_populates="event")
    tickets: Mapped[List["Ticket"]] = relationship("Ticket", back_populates="event")
