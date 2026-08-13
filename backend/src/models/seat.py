from datetime import datetime
import enum
import uuid
from sqlalchemy import String, DateTime, Enum, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional

from src.core.database import Base


class SeatStatus(str, enum.Enum):
    AVAILABLE = "AVAILABLE"
    RESERVED = "RESERVED"
    SOLD = "SOLD"

class Seat(Base):
    __tablename__ = "seats"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    event_id: Mapped[int] = mapped_column(ForeignKey("events.id"), nullable=False, index=True)
    label: Mapped[str] = mapped_column(String(20), nullable=False)  # "A5"
    status: Mapped[SeatStatus] = mapped_column(Enum(SeatStatus), default=SeatStatus.AVAILABLE, nullable=False)
    ticket_id: Mapped[Optional[int]] = mapped_column(ForeignKey("tickets.id"), nullable=True)

    __table_args__ = (UniqueConstraint("event_id", "label", name="uq_event_seat"),)