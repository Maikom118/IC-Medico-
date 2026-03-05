import os
import shutil

from faster_whisper import WhisperModel
from fastapi import FastAPI, UploadFile, File, BackgroundTasks, requests
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import requests
import httpx


import uvicorn
import sys

# --- DIAGNOSTICO DE PASTA ---
pasta_projeto = os.path.dirname(os.path.abspath(__file__))
caminho_ffmpeg = os.path.join(pasta_projeto, "ffmpeg.exe")
nome_arquivo_html = "index.html"
caminho_html = os.path.join(pasta_projeto, nome_arquivo_html)

print("\n" + "=" * 50)
print(f"[DIAGNOSTICO] Pasta do projeto: {pasta_projeto}")
print(f"[PROCURANDO] FFmpeg em: {caminho_ffmpeg}")

if os.path.exists(caminho_ffmpeg):
    print("[SUCESSO] FFmpeg ENCONTRADO! Configurando PATH...")
    os.environ["PATH"] += os.pathsep + pasta_projeto
else:
    print("[ERRO CRITICO] ffmpeg.exe NAO ESTA AQUI!")
    print(f"[DICA] Mova o ffmpeg.exe para: {pasta_projeto}")

print("=" * 50 + "\n")

app = FastAPI()

# --- CORS (OBRIGATÓRIO PARA REACT) ---
allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://www.iamedbr.com",
    "https://iamedbr.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- HEALTH CHECK ---
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "transcricao",
        "timestamp": os.environ.get("TIMESTAMP", "N/A")
    }

# --- CARREGAMENTO DO MODELO ---
print("[STATUS] Carregando modelo Whisper (aguarde)...")
try:
    model = WhisperModel("small", device="cpu", compute_type="int8")
    print("[STATUS] Modelo carregado!")
except Exception as e:
    print(f"[ERRO] Falha ao carregar modelo: {e}")

# --- ROTA 1: SERVE O SITE ---
@app.get("/")
async def ler_site():
    if os.path.exists(caminho_html):
        with open(caminho_html, "r", encoding="utf-8") as f:
            conteudo = f.read()
        return HTMLResponse(content=conteudo)
    else:
        return HTMLResponse(
            content=f"<h1>Erro: O arquivo index.html nao esta na pasta {pasta_projeto}</h1>"
        )

# --- ROTA 2: PROCESSA O AUDIO ---
@app.post("/transcrever-e-gerar-laudo")
@app.post("/api/transcricao/transcrever-e-gerar-laudo")
async def transcrever_e_gerar_laudo(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):
    temp_filename = os.path.join(pasta_projeto, f"temp_{file.filename}")

    try:
        # Salva áudio temporário
        with open(temp_filename, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        background_tasks.add_task(
            lambda: os.path.exists(temp_filename) and os.remove(temp_filename)
        )

        # 1️⃣ Transcrição
        segments, info = model.transcribe(
            temp_filename,
            language="pt"
        )
        
        texto = " ".join([segment.text for segment in segments]).strip()

        if not texto:
            raise Exception("Transcrição vazia")

        # 2️⃣ Chama IA de laudo (ASSÍNCRONO)
        async with httpx.AsyncClient(timeout=120) as client:
            response = await client.post(
                "http://127.0.0.1:8200/gerar-laudo",
                json={ "sintomas": texto }
            )

        response.raise_for_status()
        laudo = response.json()

        # 3️⃣ Retorna só o laudo
        return { "laudo": laudo }

    except Exception as e:
        print(" ERRO NA ROTA /transcrever-e-gerar-laudo")
        print(e)

        return JSONResponse(
            status_code=500,
            content={ "detail": str(e) }
        )

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8300)
