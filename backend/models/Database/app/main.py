from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.database import Base, engine

from app.models import Paciente, TipoLaudo, LaudoBase, LaudoPaciente, Audio, LaudoChunks, Medico, Secretaria

from app.routes.pacientes import router as pacientes_router
from app.routes.laudos import router as laudos_router
from app.routes.audios import router as audios_router
from app.routes.exames import router as exames_router
from fastapi.middleware.cors import CORSMiddleware




import os

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



Base.metadata.create_all(bind=engine)

