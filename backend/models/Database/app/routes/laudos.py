from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..models import Laudo
from ..schemas import LaudoCreate

router = APIRouter(prefix="/laudos")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/")
def criar_laudo(laudo: LaudoCreate, db: Session = Depends(get_db)):
    novo = Laudo(**laudo.dict())
    db.add(novo)
    db.commit()
    db.refresh(novo)
    return novo

@router.get("/")
def listar_laudos(db: Session = Depends(get_db)):
    return db.query(Laudo).all()
