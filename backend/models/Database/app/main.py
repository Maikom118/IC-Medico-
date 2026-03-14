from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from app.database import Base, engine
from sqlalchemy import inspect, text

from app.models import Paciente, TipoLaudo, LaudoBase, LaudoPaciente, Audio, LaudoChunks, Medico, Secretaria

from app.routes.pacientes import router as pacientes_router
from app.routes.laudos import router as laudos_router
from app.routes.audios import router as audios_router
from app.routes.exames import router as exames_router
from app.routes.auth import router as auth_router
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
    "https://www.homol.iamedbr.com",  # Homologação
    "https://homol.iamedbr.com",
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
app.include_router(auth_router, prefix="/api")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


# Proxy OCR via backend to avoid direct reverse-proxy routing issues.
# Dokploy can place services in different projects/networks, so we try fallback endpoints.
OCR_SERVICE_URL = os.getenv("OCR_SERVICE_URL", "http://ic-medico-ocr:8000")
OCR_SERVICE_URLS = os.getenv("OCR_SERVICE_URLS", "").strip()


def _ocr_base_urls() -> list[str]:
    candidates: list[str] = []

    if OCR_SERVICE_URLS:
        candidates.extend([u.strip().rstrip("/") for u in OCR_SERVICE_URLS.split(",") if u.strip()])

    if OCR_SERVICE_URL:
        candidates.append(OCR_SERVICE_URL.rstrip("/"))

    # Common service names in compose/swam and docker host fallbacks.
    candidates.extend(
        [
            "http://ic-medico-ocr:8000",
            "http://ocr:8000",
            "http://host.docker.internal:8000",
            "http://172.17.0.1:8000",
            "http://187.77.58.55:8000",
        ]
    )

    # Remove duplicates preserving order.
    seen = set()
    unique = []
    for url in candidates:
        if url not in seen:
            unique.append(url)
            seen.add(url)
    return unique


@app.post("/api/ocr-proxy")
async def ocr_proxy(image: UploadFile = File(...)):
    try:
        image_bytes = await image.read()
        timeout = httpx.Timeout(120.0, connect=10.0)
        last_error = None
        response = None

        async with httpx.AsyncClient(timeout=timeout) as client:
            for base_url in _ocr_base_urls():
                files = {
                    "image": (
                        image.filename or "documento.jpg",
                        image_bytes,
                        image.content_type or "application/octet-stream",
                    )
                }
                try:
                    response = await client.post(f"{base_url}/api/ocr", files=files)
                    # 2xx or 4xx means OCR answered; only keep trying on gateway/server errors.
                    if response.status_code < 500 or response.status_code == 500:
                        break
                    last_error = f"{base_url} respondeu {response.status_code}"
                except httpx.RequestError as exc:
                    last_error = f"{base_url} indisponivel: {exc}"
                    continue

        if response is None:
            raise HTTPException(status_code=502, detail=last_error or "OCR indisponivel")

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
        last_error = None
        response = None
        async with httpx.AsyncClient(timeout=timeout) as client:
            for base_url in _ocr_base_urls():
                try:
                    response = await client.get(f"{base_url}/api/rg/ultimo")
                    if response.status_code < 500 or response.status_code == 500:
                        break
                    last_error = f"{base_url} respondeu {response.status_code}"
                except httpx.RequestError as exc:
                    last_error = f"{base_url} indisponivel: {exc}"
                    continue

        if response is None:
            raise HTTPException(status_code=502, detail=last_error or "OCR indisponivel")

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



def _ensure_laudo_medico_column() -> None:
    inspector = inspect(engine)
    table_names = inspector.get_table_names()

    if "laudo_paciente" not in table_names:
        return

    columns = {col["name"] for col in inspector.get_columns("laudo_paciente")}

    if "medico_id" in columns:
        return

    with engine.begin() as conn:
        conn.execute(text("ALTER TABLE laudo_paciente ADD COLUMN medico_id INTEGER"))


Base.metadata.create_all(bind=engine)
_ensure_laudo_medico_column()

