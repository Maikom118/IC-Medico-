# Multi-stage build para Backend FastAPI

# Stage 1: Builder
FROM python:3.11-slim as builder

WORKDIR /app/build

# Instalar dependências de build
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements
COPY requirements.txt .

# Instalar dependências Python
RUN pip install --user --no-cache-dir -r requirements.txt

# Stage 2: Runtime
FROM python:3.11-slim

WORKDIR /app

# Instalar curl para healthcheck
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copiar dependências Python do builder
COPY --from=builder /app/build/.local /root/.local

# Adicionar bin do Python ao PATH
ENV PATH=/root/.local/bin:$PATH \
    PYTHONUNBUFFERED=1 \
    PORT=8100

# Copiar código da aplicação
COPY requirements.txt .
COPY app ./app

# Criar diretórios necessários
RUN mkdir -p /app/uploads /var/log/backend

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=45s --retries=5 \
    CMD curl -f http://localhost:8100/docs || exit 1

# Expor porta
EXPOSE 8100

# Comando para iniciar a aplicação
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8100"]
