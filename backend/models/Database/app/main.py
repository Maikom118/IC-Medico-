from fastapi import FastAPI
from app.database import Base, engine

from app.routes.pacientes import router as pacientes_router
from app.routes.laudos import router as laudos_router
from fastapi.middleware.cors import CORSMiddleware


Base.metadata.create_all(bind=engine)

app = FastAPI()


# 🚨 CORS — isso é OBRIGATÓRIO no browser
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Vite
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(pacientes_router)
app.include_router(laudos_router)


