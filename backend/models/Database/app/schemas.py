from pydantic import BaseModel, EmailStr
from datetime import datetime
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


# ---------- LAUDO ----------

class LaudoBase(BaseModel):
    titulo: Optional[str]
    conteudo: Optional[str]
    status: str


class LaudoCreate(LaudoBase):
    paciente_id: int


class LaudoResponse(LaudoBase):
    id: int
    paciente_id: int
    data_criacao: datetime
    data_atualizacao: datetime

    class Config:
        from_attributes = True
