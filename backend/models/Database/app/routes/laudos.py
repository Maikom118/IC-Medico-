from fastapi import APIRouter, Depends, Form, HTTPException, Response, status, UploadFile, File
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import LaudoBase, TipoConteudoLaudo, TipoLaudo
from app.models import LaudoPaciente
from app.schemas import LaudoResponse, TipoLaudoCreate
from app.schemas import LaudoPacienteCreate, LaudoPacienteResponse
import os
import shutil
from fastapi.responses import FileResponse

router = APIRouter(prefix="/laudos", tags=["Laudos"])


# Dependência do banco
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# 🔹 READ – Visualizar PDF do Laudo Base
@router.get("/base/pdf/{laudo_id}")
def visualizar_pdf_laudo_base(
    laudo_id: int,
    db: Session = Depends(get_db)
):
    laudo = db.query(LaudoBase).get(laudo_id)

    if not laudo or laudo.tipo_conteudo != TipoConteudoLaudo.PDF:
        raise HTTPException(status_code=404, detail="PDF não encontrado")

    return FileResponse(
        laudo.arquivo_pdf,
        media_type="application/pdf",
        filename=os.path.basename(laudo.arquivo_pdf)
    )

# 🔹 CREATE – Laudo Base (MODELO)
@router.post("/base", status_code=201)
def criar_laudo_base(
    titulo: str = Form(...),
    tipo_laudo_id: int = Form(...),
    tipo_conteudo: TipoConteudoLaudo = Form(...),
    conteudo_texto: str | None = Form(None),
    arquivo: UploadFile | None = File(None),
    db: Session = Depends(get_db)
):
    if tipo_conteudo == TipoConteudoLaudo.PDF and not arquivo:
        raise HTTPException(
            status_code=400,
            detail="PDF é obrigatório quando tipo_conteudo=PDF"
        )

    if tipo_conteudo == TipoConteudoLaudo.TEXTO and not conteudo_texto:
        raise HTTPException(
            status_code=400,
            detail="Conteúdo em texto é obrigatório"
        )

    novo = LaudoBase(
        titulo=titulo,
        tipo_laudo_id=tipo_laudo_id,
        tipo_conteudo=tipo_conteudo,   # ✅ JÁ É ENUM
        conteudo=conteudo_texto,
        arquivo_pdf=arquivo.filename if arquivo else None
    )

    db.add(novo)
    db.commit()
    db.refresh(novo)
    return novo


# 🔹 READ – Laudos Base
@router.get("/base")
def listar_laudos_base(db: Session = Depends(get_db)):
    return (
        db.query(LaudoBase)
        .filter(LaudoBase.ativo == True)
        .all()
    )



# 🔹 CREATE – Tipo de Laudo (BASE)
@router.post("/tipos", status_code=status.HTTP_201_CREATED)
def criar_tipo_laudo(
    laudo: TipoLaudoCreate,
    db: Session = Depends(get_db)
):
    novo = TipoLaudo(**laudo.model_dump())
    db.add(novo)
    db.commit()
    db.refresh(novo)
    return novo


# 🔹 READ – Tipos de Laudo
@router.get("/tipos")
def listar_tipos_laudo(db: Session = Depends(get_db)):
    return db.query(TipoLaudo).all()



# 🔹 CREATE – Laudo do Paciente

@router.post("/paciente", status_code=201, response_model=LaudoPacienteResponse) #lembrar de trocar
def criar_laudo_paciente(
    data: LaudoPacienteCreate,
    db: Session = Depends(get_db)
):
    novo = LaudoPaciente(
        paciente_id=data.paciente_id,
        tipo_laudo_id=data.tipo_laudo_id,
        conteudo=data.conteudo,
        status=data.status,
    )

    db.add(novo)
    db.commit()
    db.refresh(novo)

    return novo


# 🔹 READ – Laudos do Paciente
@router.get("/paciente/{paciente_id}")
def obter_laudo_paciente(paciente_id: int, db: Session = Depends(get_db)):
    laudo = (
        db.query(LaudoPaciente)
        .filter(LaudoPaciente.paciente_id == paciente_id)
        .order_by(LaudoPaciente.criado_em.desc())
        .first()
    )

    return laudo  # ← pode ser None, e tá tudo bem



# 🔹 READ – Baixar PDF do Laudo do Paciente
@router.get("/paciente/{laudo_id}/pdf")
def baixar_pdf(
    laudo_id: int,
    db: Session = Depends(get_db)
):
    laudo = db.query(LaudoPaciente).get(laudo_id)

    if not laudo:
        raise HTTPException(status_code=404, detail="Laudo não encontrado")

    return Response(
        content=laudo.pdf,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"inline; filename=laudo_{laudo_id}.pdf"
        }
    )

