
from fastapi import APIRouter, Depends, File, Form, HTTPException,  Request, UploadFile
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Audio, Exame, LaudoPaciente
from app.routes.auth import TokenUser, get_current_medico
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


def _obter_laudo_do_medico(db: Session, laudo_id: int, medico_id: int) -> LaudoPaciente:
    laudo = (
        db.query(LaudoPaciente)
        .filter(LaudoPaciente.id == laudo_id, LaudoPaciente.medico_id == medico_id)
        .first()
    )
    if not laudo:
        raise HTTPException(status_code=404, detail="Laudo não encontrado")
    return laudo



UPLOAD_DIR = "uploads/exames"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/exames/laudos/{laudo_id}/exames")
def listar_exames_laudo(
    laudo_id: int,
    request: Request,
    current_user: TokenUser = Depends(get_current_medico),
    db: Session = Depends(get_db),
):
    _obter_laudo_do_medico(db, laudo_id, current_user.id)
    exames = db.query(Exame).filter(Exame.laudo_id == laudo_id).all()

    return [
        {
            "id": e.id,
            "url": str(request.base_url) + Path(e.caminho_arquivo).as_posix()
        }
        for e in exames
    ]


@router.get("/laudos/{laudo_id}/exames")
def listar_exames_laudo(
    laudo_id: int,
    request: Request,
    current_user: TokenUser = Depends(get_current_medico),
    db: Session = Depends(get_db),
):
    _obter_laudo_do_medico(db, laudo_id, current_user.id)
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


@router.post("/laudos/{laudo_id}/exames")
async def upload_exames_laudo(
    laudo_id: int,
    files: list[UploadFile] = File(...),
    tipo: str = Form("Exame"),
    descricao: str = Form(None),
    request: Request = None,
    current_user: TokenUser = Depends(get_current_medico),
    db: Session = Depends(get_db),
):
    """Upload de múltiplas imagens de exames para um laudo"""
    
    # Verificar se o laudo existe
    _obter_laudo_do_medico(db, laudo_id, current_user.id)
    
    exames_salvos = []
    
    laudo_dir = Path(UPLOAD_DIR) / f"laudo_{laudo_id}"
    laudo_dir.mkdir(parents=True, exist_ok=True)

    for file in files:
        # Gerar nome único para o arquivo
        file_extension = Path(file.filename).suffix
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = laudo_dir / unique_filename
        
        # Salvar arquivo no disco
        content = await file.read()
        with open(file_path, "wb") as f:
            f.write(content)
        
        # Criar registro no banco
        novo_exame = Exame(
            laudo_id=laudo_id,
            tipo_arquivo=tipo,
            caminho_arquivo=str(file_path),
        )
        db.add(novo_exame)
        db.commit()
        db.refresh(novo_exame)
        
        exames_salvos.append({
            "id": novo_exame.id,
            "tipo": novo_exame.tipo_arquivo,
            "url": str(request.base_url) + file_path.as_posix(),
            "data_upload": novo_exame.data_upload,
        })
    
    return exames_salvos


@router.delete("/{exame_id}")
def deletar_exame(
    exame_id: int,
    current_user: TokenUser = Depends(get_current_medico),
    db: Session = Depends(get_db),
):
    """Deletar uma imagem de exame"""
    
    exame = db.query(Exame).filter(Exame.id == exame_id).first()
    if not exame:
        raise HTTPException(status_code=404, detail="Exame não encontrado")

    _obter_laudo_do_medico(db, exame.laudo_id, current_user.id)
    
    # Deletar arquivo do disco
    if os.path.exists(exame.caminho_arquivo):
        os.remove(exame.caminho_arquivo)
    
    # Deletar do banco
    db.delete(exame)
    db.commit()
    
    return {"message": "Exame deletado com sucesso"}