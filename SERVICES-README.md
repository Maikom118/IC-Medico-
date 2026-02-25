# Serviços IC-Medico - OCR e Transcrição

Este diretório contém os Dockerfiles e configurações para executar os serviços de OCR e Transcrição de áudio na VPS.

## 📋 Serviços

### 1. **OCR** (porta 8000)
- Servidor Node.js/Express
- Processa imagens com Tesseract.js
- Endpoint: `POST /api/ocr`

### 2. **Transcrição** (porta 8300)
- API FastAPI (Python)
- Transcreve áudio usando Whisper
- Endpoint: `POST /transcrever-e-gerar-laudo`

## 🚀 Como usar

### Opção 1: Docker Compose (Recomendado)

```bash
# Build e iniciar os serviços
docker-compose -f docker-compose.services.yml up --build -d

# Ver logs
docker-compose -f docker-compose.services.yml logs -f

# Parar serviços
docker-compose -f docker-compose.services.yml down
```

### Opção 2: Docker direto

```bash
# Build da imagem
docker build -f Dockerfile.services -t ic-medico-services .

# Executar container
docker run -d \
  --name ic-medico-services \
  -p 8000:8000 \
  -p 8300:8300 \
  --restart unless-stopped \
  ic-medico-services

# Ver logs
docker logs -f ic-medico-services
```

## 🔧 Configuração na VPS

### 1. Fazer upload dos arquivos necessários

```bash
# Na sua máquina local
scp -r OCR/ Transcricao/ Dockerfile.services docker-compose.services.yml user@sua-vps:/path/to/projeto/
```

### 2. Conectar na VPS e executar

```bash
ssh user@sua-vps
cd /path/to/projeto
docker-compose -f docker-compose.services.yml up -d
```

### 3. Verificar status

```bash
# Verificar se os containers estão rodando
docker ps

# Testar OCR
curl -X POST http://localhost:8000/api/ocr \
  -F "image=@test-image.jpg"

# Testar Transcrição
curl -X POST http://localhost:8300/transcrever-e-gerar-laudo \
  -F "file=@test-audio.mp3"
```

## 🔌 Portas expostas

- **8000**: Serviço de OCR
- **8300**: Serviço de Transcrição

## 📦 Dependências instaladas

### Sistema
- Tesseract OCR (com português)
- FFmpeg
- Python 3
- Node.js 20

### Python
- FastAPI
- Uvicorn
- OpenAI Whisper
- httpx

### Node.js
- Express
- Multer
- Tesseract.js
- Sharp
- CORS

## 🔍 Troubleshooting

### Ver logs em tempo real
```bash
docker logs -f ic-medico-services
```

### Entrar no container
```bash
docker exec -it ic-medico-services bash
```

### Verificar processos internos
```bash
docker exec ic-medico-services supervisorctl status
```

### Reiniciar serviços específicos
```bash
# Reiniciar OCR
docker exec ic-medico-services supervisorctl restart ocr

# Reiniciar Transcrição
docker exec ic-medico-services supervisorctl restart transcricao
```

## 📝 Notas

- O Whisper usa o modelo "small" por padrão (melhor equilíbrio entre performance e qualidade)
- O primeiro carregamento pode demorar enquanto o modelo Whisper é baixado
- Os logs ficam em `/var/log/` dentro do container
- Use `docker-compose` para facilitar o deployment e gerenciamento

## 🔄 Atualizações

Para atualizar os serviços:

```bash
# Parar containers
docker-compose -f docker-compose.services.yml down

# Rebuild
docker-compose -f docker-compose.services.yml build --no-cache

# Iniciar novamente
docker-compose -f docker-compose.services.yml up -d
```
