from datetime import datetime
import enum
from sqlalchemy import String, DateTime, Enum, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List

from src.core.database import Base


class UserRole(str, enum.Enum):
    ORGANIZER = "ORGANIZER"
    CUSTOMER = "CUSTOMER"
    STAFF = "STAFF"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(150), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)

    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole),
        default=UserRole.CUSTOMER,
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        nullable=False
    )
    
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )

    # Relacionamentos
    organized_events: Mapped[List["Event"]] = relationship("Event", back_populates="organizer")
    orders: Mapped[List["Order"]] = relationship("Order", back_populates="customer")
    validated_tickets: Mapped[List["Ticket"]] = relationship(
        "Ticket",
        back_populates="validator",
        foreign_keys="Ticket.validated_by"
    )
