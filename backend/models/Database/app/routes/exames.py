
from fastapi import APIRouter, Depends, File, Form, HTTPException,  Request, UploadFile
from requests import Session
from app.database import SessionLocal
from app.models import Audio, Exame, LaudoPaciente, LaudoPaciente
import os
from pathlib import Path

import uuid



router = APIRouter(prefix="/exames", tags=["Exames"])


# Dependência do banco
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()



UPLOAD_DIR = "uploads/exames"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/exames/laudos/{laudo_id}/exames")
def listar_exames_laudo(
    laudo_id: int,
    request: Request,
    db: Session = Depends(get_db),
):
    exames = db.query(Exame).filter(Exame.laudo_id == laudo_id).all()

    return [
        {
            "id": e.id,
            "url": str(request.base_url) + Path(e.caminho_arquivo).name
        }
        for e in exames
    ]


@router.get("/laudos/{laudo_id}/exames")
def listar_exames_laudo(
    laudo_id: int,
    request: Request,
    db: Session = Depends(get_db),
):
    exames = db.query(Exame).filter(Exame.laudo_id == laudo_id).all()

    return [
        {
            "id": e.id,
            "tipo": e.tipo_arquivo,
            "url": str(request.base_url) + Path(e.caminho_arquivo).as_posix(),
            "data_upload": e.data_upload,
        }
        for e in exames
    ]