from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Paciente
from app.schemas import PacienteCreate

router = APIRouter(
    prefix="/pacientes",
    tags=["Pacientes"]
)


# Dependência do banco
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("", status_code=status.HTTP_201_CREATED)
def criar_paciente(
    paciente: PacienteCreate,
    db: Session = Depends(get_db)
):
    novo = Paciente(**paciente.model_dump())
    db.add(novo)
    db.commit()
    db.refresh(novo)
    return novo


@router.get("/{id}")
def buscar_por_id(
    id: int,
    db: Session = Depends(get_db)
):
    paciente = db.query(Paciente).filter(Paciente.id == id).first()

    if not paciente:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paciente não encontrado"
        )

    return paciente
