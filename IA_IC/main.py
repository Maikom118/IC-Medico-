from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from src.model_arch import GeradorLaudo

load_dotenv()

app = FastAPI()

# 🔓 LIBERA O FRONT
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # em produção, restringir
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

gerador = GeradorLaudo()

class SintomasRequest(BaseModel):
    sintomas: str

@app.post("/gerar-laudo")
def gerar_laudo(data: SintomasRequest):
    return gerador.gerar(data.sintomas)
