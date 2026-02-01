import datetime
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from requests import Session
from app.database import SessionLocal
from app.models import Audio, LaudoPaciente, LaudoPaciente
import os
import shutil
import uuid
from datetime import datetime


router = APIRouter(prefix="/audios", tags=["Áudios"])


# Dependência do banco
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


UPLOAD_DIR = "uploads/audios"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/laudos/paciente/{laudo_id}/audio", status_code=201)
def upload_audio_laudo(
   
    laudo_id: int,
    audio: UploadFile = File(...),
    duracao: int = 0,
    db: Session = Depends(get_db),
):
    # 🔎 verifica se o laudo existe
    laudo = db.query(LaudoPaciente).filter(LaudoPaciente.id == laudo_id).first()
    if not laudo:
        raise HTTPException(status_code=404, detail="Laudo não encontrado")

    # 💾 salva arquivo
    filename = f"{uuid.uuid4()}.webm"
    file_path = os.path.join(UPLOAD_DIR, filename)

    with open(file_path, "wb") as f:
        f.write(audio.file.read())

    # 🧾 salva no banco
    novo_audio = Audio(
        
        laudo_id=laudo_id,
        caminho_arquivo=file_path,
        duracao=duracao,
        data_upload=datetime.utcnow(),
    )

    db.add(novo_audio)
    db.commit()
    db.refresh(novo_audio)

    return {
        "id": novo_audio.id,
        "laudo_id": laudo_id,
        "caminho_arquivo": file_path,
        "duracao": duracao,
    }