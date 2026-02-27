FROM python:3.11-slim

# Instalar FFmpeg
RUN apt-get update && \
    apt-get install -y --no-install-recommends ffmpeg && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar arquivos
COPY . .

# Instalar dependências Python
RUN pip install --no-cache-dir \
    fastapi \
    uvicorn[standard] \
    python-multipart \
    openai-whisper \
    httpx

# Expor porta
EXPOSE 8300

# Iniciar serviço
CMD ["python", "main.py"]
