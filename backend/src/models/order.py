from datetime import datetime
import enum
from sqlalchemy import DateTime, Enum, Integer, Numeric, ForeignKey, func, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List, Optional

from src.core.database import Base


class PaymentStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    FAILED = "FAILED"


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    customer_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    event_id: Mapped[int] = mapped_column(ForeignKey("events.id"), nullable=False, index=True)

    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    total_amount: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    
    payment_status: Mapped[PaymentStatus] = mapped_column(
        Enum(PaymentStatus),
        default=PaymentStatus.PENDING,
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relacionamentos
    customer: Mapped["User"] = relationship("User", back_populates="orders")
    event: Mapped["Event"] = relationship("Event", back_populates="orders")
    tickets: Mapped[List["Ticket"]] = relationship("Ticket", back_populates="order", cascade="all, delete-orphan")

    stripe_payment_intent_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

