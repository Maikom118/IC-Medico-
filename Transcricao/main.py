import os
import shutil
import whisper
from fastapi import FastAPI, UploadFile, File, BackgroundTasks
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware

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
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- CARREGAMENTO DO MODELO ---
print("[STATUS] Carregando modelo Whisper (aguarde)...")
try:
    model = whisper.load_model("small")
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
@app.post("/transcrever")
async def transcrever_audio(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):
    temp_filename = os.path.join(pasta_projeto, f"temp_{file.filename}")

    try:
        # Salva o arquivo temporário
        with open(temp_filename, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Limpeza automática
        def limpar():
            try:
                if os.path.exists(temp_filename):
                    os.remove(temp_filename)
            except:
                pass

        background_tasks.add_task(limpar)

        print(f"[PROCESSANDO] Audio salvo em: {temp_filename}")

        # Transcrição
        options = {
            "language": "pt",
            "initial_prompt": "Laudo medico."
        }

        result = model.transcribe(
            temp_filename,
            fp16=False,
            **options
        )

        texto = result["text"].strip()

        print(f"[SUCESSO] Texto: {texto[:3000]}...")

        return {
            "texto_transcrito": texto
        }

    except Exception as e:
        erro_msg = str(e)
        print(f"[ERRO 500] {erro_msg}")

        if "WinError 2" in erro_msg:
            print("[DICA] O Python nao achou o FFmpeg. Verifique a pasta!")

        return JSONResponse(
            status_code=500,
            content={"detail": erro_msg}
        )

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
