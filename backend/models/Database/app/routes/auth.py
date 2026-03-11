import os
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from jose import jwt
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr

from app.database import SessionLocal
from app.models import Medico, Secretaria

router = APIRouter(prefix="/auth", tags=["auth"])

# ---------------------------------------------------------------------------
# Dependência do banco
# ---------------------------------------------------------------------------

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ---------------------------------------------------------------------------
# Configurações de segurança
# ---------------------------------------------------------------------------

SECRET_KEY = os.getenv("SECRET_KEY", "TROQUE_ESSA_CHAVE_EM_PRODUCAO_por_algo_muito_secreto")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 8  # 8 horas

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ---------------------------------------------------------------------------
# Schemas locais (simples, sem importar schemas.py para não criar dependência)
# ---------------------------------------------------------------------------

class LoginRequest(BaseModel):
    email: EmailStr
    senha: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    nome: str
    email: str


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def _create_token(data: dict) -> str:
    payload = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload.update({"exp": expire})
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


# ---------------------------------------------------------------------------
# Endpoint
# ---------------------------------------------------------------------------

@router.post("/login", response_model=LoginResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    """
    Tenta autenticar primeiro na tabela `medico`, depois em `secretaria`.
    Retorna um JWT com a role embutida.
    """

    # ----- Médico -----
    medico: Medico | None = db.query(Medico).filter(
        Medico.email == body.email
    ).first()

    if medico and _verify_password(body.senha, medico.senha_hash):
        token = _create_token({
            "sub": str(medico.id),
            "role": "medico",
            "email": medico.email,
            "nome": medico.nome,
        })
        return LoginResponse(
            access_token=token,
            role="medico",
            nome=medico.nome,
            email=medico.email,
        )

    # ----- Secretaria -----
    secretaria: Secretaria | None = db.query(Secretaria).filter(
        Secretaria.email == body.email
    ).first()

    if secretaria and _verify_password(body.senha, secretaria.senha_hash):
        token = _create_token({
            "sub": str(secretaria.id),
            "role": "secretaria",
            "email": secretaria.email,
            "nome": secretaria.nome,
        })
        return LoginResponse(
            access_token=token,
            role="secretaria",
            nome=secretaria.nome,
            email=secretaria.email,
        )

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Email ou senha inválidos",
    )
