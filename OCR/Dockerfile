# ===========================================
# OCR SERVICE - Node.js + Tesseract
# ===========================================
FROM node:20-alpine

# Instalar dependências do sistema
RUN apk add --no-cache \
    tesseract-ocr \
    tesseract-ocr-data-por \
    curl

# Criar diretório da aplicação
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências do Node
RUN npm ci --only=production

# Copiar código da aplicação
COPY . .

# Criar diretórios necessários
RUN mkdir -p /app/uploads /tmp/ocr /var/log/ocr

# Expor porta
EXPOSE 8000

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Comando para iniciar o servidor
CMD ["node", "ocr-limpo.js"]
