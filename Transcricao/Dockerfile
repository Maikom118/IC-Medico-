# ===========================================
# TRANSCRIÇÃO SERVICE - Python + Whisper
# ===========================================
FROM python:3.11-slim

# Instalar dependências de sistema (incluindo build tools para compilação de pacotes)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    curl \
    build-essential \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Atualizar pip e setuptools
RUN pip install --upgrade pip setuptools wheel

# Criar diretório da aplicação
WORKDIR /app

# Copiar requirements
COPY requirements.txt .

# Instalar dependências Python
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código da aplicação
COPY . .

# Criar diretórios necessários
RUN mkdir -p /app/uploads /app/models /var/log/transcricao

# Expor porta  
EXPOSE 8300

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=45s --retries=3 \
  CMD curl -f http://localhost:8300/health || exit 1

# Comando para iniciar o servidor
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8300", "--workers", "2"]
