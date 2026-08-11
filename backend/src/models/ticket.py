from datetime import datetime
import enum
import uuid
from sqlalchemy import String, DateTime, Enum, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional

from src.core.database import Base


class TicketStatus(str, enum.Enum):
    VALID = "VALID"
    USED = "USED"
    CANCELLED = "CANCELLED"


class Ticket(Base):
    __tablename__ = "tickets"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id"), nullable=False, index=True)
    event_id: Mapped[int] = mapped_column(ForeignKey("events.id"), nullable=False, index=True)


    ticket_code: Mapped[str] = mapped_column(
        String(36),
        unique=True,
        index=True,
        default=lambda: str(uuid.uuid4()),
        nullable=False
    )


    share_link: Mapped[str] = mapped_column(
        String(36),
        unique=True,
        index=True,
        default=lambda: str(uuid.uuid4()),
        nullable=False
    )

    status: Mapped[TicketStatus] = mapped_column(
        Enum(TicketStatus),
        default=TicketStatus.VALID,
        nullable=False,
        index=True
    )


    validated_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    validated_by: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)

    # Relacionamentos
    order: Mapped["Order"] = relationship("Order", back_populates="tickets")
    event: Mapped["Event"] = relationship("Event", back_populates="tickets")
    validator: Mapped[Optional["User"]] = relationship(
        "User",
        back_populates="validated_tickets",
        foreign_keys=[validated_by]
    )
