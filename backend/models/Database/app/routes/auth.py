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


class RegisterRequest(BaseModel):
    nome: str
    email: EmailStr
    senha: str
    role: str  # "medico" ou "secretaria"


class RegisterResponse(BaseModel):
    id: int
    nome: str
    email: str
    role: str


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


@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    """
    Cria um novo médico ou secretária.
    Role aceita: 'medico' ou 'secretaria'.
    """

    if body.role not in ("medico", "secretaria"):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Role inválida. Use 'medico' ou 'secretaria'.",
        )

    # Verifica email duplicado em ambas as tabelas
    email_em_uso = (
        db.query(Medico).filter(Medico.email == body.email).first()
        or db.query(Secretaria).filter(Secretaria.email == body.email).first()
    )
    if email_em_uso:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email já cadastrado.",
        )

    senha_hash = pwd_context.hash(body.senha)

    if body.role == "medico":
        novo = Medico(nome=body.nome, email=body.email, senha_hash=senha_hash)
        db.add(novo)
        db.flush()   # popula novo.id antes do commit, sem SELECT extra
        novo_id = novo.id
        db.commit()
        return RegisterResponse(id=novo_id, nome=body.nome, email=body.email, role="medico")

    novo = Secretaria(nome=body.nome, email=body.email, senha_hash=senha_hash)
    db.add(novo)
    db.flush()
    novo_id = novo.id
    db.commit()
    return RegisterResponse(id=novo_id, nome=body.nome, email=body.email, role="secretaria")