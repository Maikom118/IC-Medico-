from pydantic import BaseModel, EmailStr
from datetime import date, datetime
from typing import List, Optional


# ---------- PACIENTE ----------

class PacienteBase(BaseModel):
    nome: str
    cpf: str
    rg: str
    data_nascimento: datetime


class PacienteCreate(BaseModel):
    nome: str
    rg: str
    cpf: str
    data_nascimento: datetime
   


class PacienteResponse(PacienteBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class PacienteOut(PacienteBase):
    id: int
    data_criacao: date | None = None  # se existir no model

    class Config:
        from_attributes = True

        
# ---------- LAUDO DO PACIENTE ----------

class LaudoBaseCreate(BaseModel):
    tipo_laudo_id: int
    titulo: Optional[str]
    conteudo: str

class TipoLaudoCreate(BaseModel):
    titulo: str
    tipo_laudo_id: int
    tipo_conteudo: str  # "PDF" ou "TEXTO"
    conteudo_texto: Optional[str] = None

class LaudoPacienteCreate(BaseModel):
    paciente_id: int
    tipo_laudo_id: int
    conteudo: str
    status: str


class LaudoResponse(LaudoPacienteCreate):
    id: int
    paciente_id: int
    data_criacao: datetime
    data_atualizacao: datetime

    class Config:
        from_attributes = True


class LaudoPacienteResponse(BaseModel):
    id: int
    paciente_id: int
    tipo_laudo_id: int
    conteudo: str
    status: str
    criado_em: datetime

    class Config:
        from_attributes = True

# ---------- AUDIO DO MÉDICO ----------



class AudioBase(BaseModel):
    laudo_id: int


class AudioCreate(AudioBase):
    """
    Usado apenas para referência lógica.
    O upload real do arquivo é feito via UploadFile (FormData).
    """
    pass


class AudioResponse(AudioBase):
    id: int
    caminho_arquivo: str
    duracao: int
    criado_em: datetime
    
    class Config:
        from_attributes = True

# ---------- EXAME FOTO ----------


class ExameBase(BaseModel):
    tipo_arquivo: str
    caminho_arquivo: str

class ExameCreate(ExameBase):
    laudo_id: int

class ExameOut(ExameBase):
    id: int
    laudo_id: int
    data_upload: datetime

    class Config:
        from_attributes = True 