# ===========================================
# TRANSCRIÇÃO SERVICE - Python + Whisper
# ===========================================
FROM python:3.11-slim

# Instalar dependências de sistema
RUN apt-get update && apt-get install -y \
    ffmpeg curl build-essential python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Pin setuptools antes de tudo
RUN pip install --no-cache-dir "setuptools==81.0.0" "wheel==0.46.3"

# Upgrade pip isolado
RUN pip install --no-cache-dir --upgrade "pip==24.3"

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt   # ou adicione --no-build-isolation se precisar

COPY . .
RUN mkdir -p /app/uploads /app/models /var/log/transcricao

# Expor porta  
EXPOSE 8300

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=45s --retries=3 \
  CMD curl -f http://localhost:8300/health || exit 1

# Comando para iniciar o servidor
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8300", "--workers", "2"]
