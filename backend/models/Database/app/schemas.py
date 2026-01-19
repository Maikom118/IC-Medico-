from pydantic import BaseModel
from typing import Optional

class LaudoCreate(BaseModel):
    titulo: str
    conteudo: Optional[str]
    status: str
