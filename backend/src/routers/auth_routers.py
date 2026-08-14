from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from src.core.database import db as get_db
from src.core.security import get_password_hash, verify_password, create_access_token
from src.core.dependencies import get_current_user
from src.models.user import User
from src.schemas.user_schema import UserCreate, UserLogin, UserResponse, Token

router = APIRouter(prefix="/auth", tags=["Autenticação"])


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Cadastra um novo usuário (Organizador, Cliente ou Portaria)"
)
def register(user_in: UserCreate, db: Session = Depends(get_db)):

    # Verifica se o e-mail já está em uso
    existing_user = db.query(User).filter(User.email == user_in.email).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Já existe um usuário cadastrado com este e-mail."
        )

    # Cria novo usuário
    new_user = User(
        name=user_in.name,
        email=user_in.email,
        password_hash=get_password_hash(user_in.password),
        role=user_in.role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@router.post(
    "/login",
    response_model=Token,
    summary="Realiza login e retorna o Token JWT de acesso"
)
def login(login_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):

    # Busca o usuário pelo e-mail
    user = db.query(User).filter(User.email == login_data.username).first()

    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha incorretos.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Token de acesso
    access_token = create_access_token(subject=user.id, role=user.role.value)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


@router.get(
    "/my-data",
    response_model=UserResponse,
    summary="Retorna os dados do usuário atualmente autenticado"
)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
