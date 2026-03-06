from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from app.database import Base, engine

from app.models import Paciente, TipoLaudo, LaudoBase, LaudoPaciente, Audio, LaudoChunks, Medico, Secretaria

from app.routes.pacientes import router as pacientes_router
from app.routes.laudos import router as laudos_router
from app.routes.audios import router as audios_router
from app.routes.exames import router as exames_router
from fastapi.middleware.cors import CORSMiddleware




import os
import httpx

app = FastAPI()

# 🚨 CORS — isso é OBRIGATÓRIO no browser
allowed_origins = [
    "http://localhost:3000",  # Desenvolvimento local
    "http://127.0.0.1:3000",
    "https://www.iamedbr.com",  # Produção
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

app.include_router(pacientes_router, prefix="/api")
app.include_router(laudos_router, prefix="/api")
app.include_router(audios_router, prefix="/api")
app.include_router(exames_router, prefix="/api")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


# Proxy OCR via backend to avoid direct reverse-proxy routing issues.
OCR_SERVICE_URL = os.getenv("OCR_SERVICE_URL", "http://ic-medico-ocr:8000")


@app.post("/api/ocr-proxy")
async def ocr_proxy(image: UploadFile = File(...)):
    try:
        image_bytes = await image.read()
        files = {
            "image": (
                image.filename or "documento.jpg",
                image_bytes,
                image.content_type or "application/octet-stream",
            )
        }

        timeout = httpx.Timeout(120.0, connect=10.0)
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(f"{OCR_SERVICE_URL}/api/ocr", files=files)

        content_type = response.headers.get("content-type", "")
        if "application/json" in content_type:
            return JSONResponse(status_code=response.status_code, content=response.json())

        return JSONResponse(
            status_code=response.status_code,
            content={"status": "erro", "mensagem": response.text},
        )
    except httpx.RequestError as exc:
        raise HTTPException(status_code=502, detail=f"Falha ao conectar no OCR: {exc}")
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Erro interno no proxy OCR: {exc}")


@app.get("/api/rg-proxy/ultimo")
async def rg_ultimo_proxy():
    try:
        timeout = httpx.Timeout(20.0, connect=10.0)
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.get(f"{OCR_SERVICE_URL}/api/rg/ultimo")

        content_type = response.headers.get("content-type", "")
        if "application/json" in content_type:
            return JSONResponse(status_code=response.status_code, content=response.json())

        return JSONResponse(
            status_code=response.status_code,
            content={"status": "erro", "mensagem": response.text},
        )
    except httpx.RequestError as exc:
        raise HTTPException(status_code=502, detail=f"Falha ao conectar no OCR: {exc}")
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Erro interno no proxy OCR: {exc}")



Base.metadata.create_all(bind=engine)

