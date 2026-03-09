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

try:
    gerador = GeradorLaudo()
    print("✅ GeradorLaudo inicializado com sucesso")
except Exception as e:
    import traceback
    print("❌ ERRO ao inicializar GeradorLaudo:", traceback.format_exc())
    gerador = None

# ⚠️ AQUI ESTÁ A CORREÇÃO: Adicionamos o 'tipo_exame' no modelo
class SintomasRequest(BaseModel):
    sintomas: str
    tipo_exame: str = "Geral" # Valor padrão para não quebrar requisições antigas

@app.get("/health")
@app.get("/api/ia/health")
def health_check():
    return {
        "status": "healthy",
        "service": "ia",
        "gerador_ok": gerador is not None,
        "groq_key_set": bool(os.getenv("GROQ_API_KEY")),
        "timestamp": os.environ.get("TIMESTAMP", "N/A")
    }

@app.post("/test")
@app.post("/api/ia/test")
def test_ia():
    """Testa a conexão com Groq sem precisar de áudio"""
    from fastapi import HTTPException
    if gerador is None:
        raise HTTPException(status_code=503, detail="GeradorLaudo não inicializado — veja logs do container")
    try:
        # ⚠️ CORREÇÃO: Passando um tipo de exame padrão no teste
        resultado = gerador.gerar("Paciente com febre e dor de cabeça", "Geral")
        return {"status": "ok", "laudo": resultado}
    except Exception as e:
        import traceback
        tb = traceback.format_exc()
        print("❌ ERRO em /test:", tb)
        raise HTTPException(status_code=500, detail=tb)

@app.post("/gerar-laudo")
@app.post("/api/ia/gerar-laudo")
def gerar_laudo(data: SintomasRequest):
    from fastapi import HTTPException
    if gerador is None:
        raise HTTPException(status_code=503, detail="GeradorLaudo não inicializado — verifique GROQ_API_KEY nos logs do container")
    try:
        # ⚠️ CORREÇÃO PRINCIPAL: Passando sintomas E tipo_exame para o gerador
        return gerador.gerar(data.sintomas, data.tipo_exame)
    except Exception as e:
        import traceback
        print("❌ ERRO em /gerar-laudo:", traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8200)