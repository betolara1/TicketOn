from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, ConfigDict, field_validator
from typing import Optional
import re
from src.models.user import UserRole


# Base comum com os campos compartilhados
class UserBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, example="João Silva")
    email: EmailStr = Field(..., example="joao@email.com")
    role: UserRole = Field(default=UserRole.CUSTOMER, example=UserRole.CUSTOMER)
    model_config = ConfigDict(extra="forbid")


    @field_validator("email", mode="before")
    @classmethod
    def sanitize_email(cls, v: str) -> str:
        if isinstance(v, str):
            return v.strip().lower()
        return v

    @field_validator("name", mode="before")
    @classmethod
    def sanitize_name(cls, v: str) -> str:
        if isinstance(v, str):
            return v.strip()
        return v


# cadastro da senha
class UserCreate(UserBase):
    password: str = Field(
        ...,
        min_length=8,
        max_length=72,  # Limite de segurança do Bcrypt
        example="SenhaForte@123"
    )

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        if not re.search(r"[A-Z]", v):
            raise ValueError("A senha deve conter pelo menos uma letra maiúscula.")
        if not re.search(r"[a-z]", v):
            raise ValueError("A senha deve conter pelo menos uma letra minúscula.")
        if not re.search(r"\d", v):
            raise ValueError("A senha deve conter pelo menos um número.")
        if not re.search(r"[@$!%*?&#^()_\-+={}[\]:;<>,.?/|~]", v):
            raise ValueError("A senha deve conter pelo menos um caractere especial (@$!%*? etc).")
        return v


# Login
class UserLogin(BaseModel):
    email: EmailStr = Field(..., example="joao@email.com")
    password: str = Field(..., example="SenhaForte@123")
    model_config = ConfigDict(extra="forbid")
    @field_validator("email", mode="before")
    @classmethod
    def sanitize_email(cls, v: str) -> str:
        if isinstance(v, str):
            return v.strip().lower()
        return v


# Resposta da API (envia só o que o front precisa ler)
class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: UserRole
    created_at: datetime

    # Permite ler dados direto da instância do SQLAlchemy
    model_config = ConfigDict(from_attributes=True)


# Token retornado no login
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# Payload do JWT
class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None
    exp: Optional[int] = None