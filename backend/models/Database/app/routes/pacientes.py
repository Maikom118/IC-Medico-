from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Paciente
from app.schemas import PacienteCreate

router = APIRouter(
    prefix="/pacientes",
    tags=["Pacientes"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("", status_code=201)
def criar_paciente(paciente: PacienteCreate, db: Session = Depends(get_db)):
    novo = Paciente(**paciente.model_dump())
    db.add(novo)
    db.commit()
    db.refresh(novo)
    return novo
