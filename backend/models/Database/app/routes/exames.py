
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from requests import Session
from app.database import SessionLocal
from app.models import Audio, Exame, LaudoPaciente, LaudoPaciente
import os

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

@router.post("/laudos/{laudo_id}/exames", status_code=201)
def upload_exame(
    laudo_id: int,
    files: list[UploadFile] = File(...),
    tipo: str = Form(...),
    db: Session = Depends(get_db),
):
    laudo = db.query(LaudoPaciente).filter_by(id=laudo_id).first()
    if not laudo:
        raise HTTPException(404, "Laudo não encontrado")

    pasta_laudo = f"uploads/exames/laudo_{laudo_id}"
    os.makedirs(pasta_laudo, exist_ok=True)

    exames_salvos = []

    for file in files:
        nome_arquivo = f"{uuid.uuid4()}_{file.filename}"
        caminho = os.path.join(pasta_laudo, nome_arquivo)

        with open(caminho, "wb") as f:
            f.write(file.file.read())

        exame = Exame(
            laudo_id=laudo_id,
            tipo_arquivo=tipo,
            caminho_arquivo=caminho,
        )

        db.add(exame)
        exames_salvos.append(exame)

    db.commit()

    return exames_salvos


@router.get("/laudos/{laudo_id}/exames")
def listar_exames(laudo_id: int, db: Session = Depends(get_db)):
    exames = db.query(Exame).filter_by(laudo_id=laudo_id).all()

    return [
        {
            "id": e.id,
            "tipo": e.tipo,
            "descricao": e.descricao,
            "url": f"http://localhost:8100/{e.caminho_arquivo}",
            "data_upload": e.data_upload,
        }
        for e in exames
    ]