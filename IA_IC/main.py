from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from src.model_arch import GeradorLaudo

load_dotenv()

import os

app = FastAPI()

# 🔓 LIBERA O FRONT
allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://www.iamedbr.com",
    "https://iamedbr.com",
]

# Em desenvolvimento, permitir qualquer origem
if os.getenv("NODE_ENV") == "development":
    allowed_origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

gerador = GeradorLaudo()

class SintomasRequest(BaseModel):
    sintomas: str

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "ia",
        "timestamp": os.environ.get("TIMESTAMP", "N/A")
    }

@app.post("/gerar-laudo")
def gerar_laudo(data: SintomasRequest):
    return gerador.gerar(data.sintomas)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8200)
