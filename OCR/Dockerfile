FROM node:20-alpine

# Instalar tesseract-ocr
RUN apk add --no-cache \
    tesseract-ocr \
    tesseract-ocr-data-por

WORKDIR /app

# Copiar package.json e instalar dependências
COPY package*.json ./
RUN npm ci --only=production

# Copiar código do OCR
COPY . .

# Copiar dados do tesseract (português)


# Expor porta
EXPOSE 8000

# Iniciar serviço
CMD ["node", "server.js"]
