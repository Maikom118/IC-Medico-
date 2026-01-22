from fastapi import FastAPI
from app.database import Base, engine

from app.routes.pacientes import router as pacientes_router
from app.routes.laudos import router as laudos_router

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(pacientes_router)
app.include_router(laudos_router)
