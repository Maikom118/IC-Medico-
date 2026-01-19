from fastapi import FastAPI
from app.database import engine
from .models import Base
from .routes import laudos

Base.metadata.create_all(bind=engine)

app = FastAPI(title="API de Laudos")
app.include_router(laudos.router)

@app.get("/")
def root():
    return {"status": "API rodando"}
