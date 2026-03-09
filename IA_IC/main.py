import os
import httpx
import shutil
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# 🔓 Configuração de CORS (Igual ao da IA para manter consistência)
allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://www.iamedbr.com",
    "https://iamedbr.com",
]

if os.getenv("NODE_ENV") == "development":
    allowed_origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configurações de diretório
UPLOAD_DIR = "temp_audios"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# 🎙️ Simulando a função de transcrição (Substitua pela sua chamada real ao Whisper)
async def transcrever_audio(caminho_arquivo: str) -> str:
    # Aqui entraria o seu: model.transcribe(caminho_arquivo)
    # Por agora, vamos assumir que o texto foi extraído com sucesso
    return "Texto extraído do áudio pelo Whisper"

@app.post("/transcrever-e-gerar-laudo")
@app.post("/api/transcricao/transcrever-e-gerar-laudo")
async def transcrever_e_gerar_laudo(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    tipo_exame: str = Form("Geral")  # 👈 1. RECEBE O TIPO DO EXAME DO REACT
):
    temp_path = os.path.join(UPLOAD_DIR, file.filename)
    
    try:
        # Salva o arquivo temporariamente
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # 1️⃣ Transcrição (Whisper)
        # texto_transcrito = await transcrever_audio(temp_path)
        # Vamos usar um placeholder, mas aqui você usa o seu código atual do Whisper
        texto_transcrito = "Simulação de transcrição médica" 

        # 2️⃣ CHAMA A API DE IA (Porta 8200) REPASSANDO O BASTÃO
        ia_url = os.environ.get("IA_URL", "http://localhost:8200")
        
        async with httpx.AsyncClient(timeout=120) as client:
            print(f"🚀 Enviando para IA: {tipo_exame}")
            
            response = await client.post(
                f"{ia_url}/api/ia/gerar-laudo",
                json={
                    "sintomas": texto_transcrito,
                    "tipo_exame": tipo_exame  # 👈 2. REPASSA O NOME DO EXAME PARA A IA
                }
            )

        if response.status_code != 200:
            raise HTTPException(
                status_code=500, 
                detail=f"IA erro {response.status_code}: {response.text}"
            )

        return response.json()

    except Exception as e:
        print(f"❌ ERRO NA TRANSCRIÇÃO: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    
    finally:
        # Limpeza do arquivo temporário
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.get("/health")
def health():
    return {"status": "healthy", "service": "transcricao"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8300)