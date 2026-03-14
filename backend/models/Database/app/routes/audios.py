import datetime
from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Audio, LaudoPaciente
from app.routes.auth import TokenUser, get_current_medico
import os
import uuid
from datetime import datetime
from pathlib import Path


router = APIRouter(prefix="/audios", tags=["Áudios"])


# Dependência do banco
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _obter_laudo_do_medico(db: Session, laudo_id: int, medico_id: int) -> LaudoPaciente:
    laudo = (
        db.query(LaudoPaciente)
        .filter(LaudoPaciente.id == laudo_id, LaudoPaciente.medico_id == medico_id)
        .first()
    )
    if not laudo:
        raise HTTPException(status_code=404, detail="Laudo não encontrado")
    return laudo


UPLOAD_DIR = "uploads/audios"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/laudos/paciente/{laudo_id}/audio", status_code=201)
def upload_audio_laudo(
   
    laudo_id: int,
    audio: UploadFile = File(...),
    duracao: int = 0,
    current_user: TokenUser = Depends(get_current_medico),
    db: Session = Depends(get_db),
):
    _obter_laudo_do_medico(db, laudo_id, current_user.id)

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


@router.get("/laudos/{laudo_id}")
def listar_audios_laudo(
    laudo_id: int,
    request: Request,
    current_user: TokenUser = Depends(get_current_medico),
    db: Session = Depends(get_db),
):
    _obter_laudo_do_medico(db, laudo_id, current_user.id)

    audios = (
        db.query(Audio)
        .filter(Audio.laudo_id == laudo_id)
        .order_by(Audio.data_upload.desc())
        .all()
    )

    return [
        {
            "id": a.id,
            "laudo_id": a.laudo_id,
            "url": str(request.base_url) + Path(a.caminho_arquivo).as_posix(),
            "duracao": a.duracao,
            "data_upload": a.data_upload,
        }
        for a in audios
    ]