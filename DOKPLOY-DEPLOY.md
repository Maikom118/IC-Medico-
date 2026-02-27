# 🚀 Deploy OCR e Transcrição na Hostinger com Dokploy

## 📋 O que é Dokploy?

Dokploy é uma plataforma open-source de deploy que facilita o deploy de aplicações Docker em VPS. É similar ao Heroku/Vercel mas auto-hospedado.

---

## 🔧 Pré-requisitos

### 1. Instalar Dokploy na VPS Hostinger

Conecte na sua VPS via SSH e execute:

```bash
# Conectar na VPS
ssh root@seu-ip-hostinger

# Instalar Dokploy (requer Docker)
curl -sSL https://dokploy.com/install.sh | sh

# Ou manualmente:
# 1. Instalar Docker
curl -fsSL https://get.docker.com | sh

# 2. Clone o Dokploy
git clone https://github.com/Dokploy/dokploy.git
cd dokploy
docker compose up -d
```

### 2. Acessar o Painel Dokploy

Depois da instalação, acesse:
- `http://seu-ip-vps:3000` (ou a porta configurada)
- Crie sua conta de administrador

---

## 📦 Estrutura dos Serviços

Vamos fazer deploy de 3 serviços:

1. **Backend API** (FastAPI - Python) - Porta 8100
2. **OCR Service** (Node.js) - Porta 8000
3. **Transcrição Service** (Python + Whisper) - Porta 8300

---

## 🎯 Passo a Passo

### OPÇÃO 1: Deploy via Docker Compose (Recomendado)

#### 1. Preparar o Repositório

Na sua máquina local:

```powershell
# Adicionar arquivos ao Git
git add .
git commit -m "Configure services for Dokploy deployment"
git push origin main
```

#### 2. No Painel Dokploy

1. **Criar Novo Projeto:**
   - Clique em "New Project"
   - Nome: `ic-medico-services`

2. **Adicionar Aplicação - OCR + Transcrição:**
   - Tipo: `Docker Compose`
   - Repository: URL do seu repositório Git
   - Branch: `main` (ou `prod`)
   - Docker Compose File: `docker-compose.services.yml`
   - Build Path: `/`

3. **Configurar Variáveis de Ambiente:**
   ```
   NODE_ENV=production
   PYTHONUNBUFFERED=1
   ```

4. **Configurar Portas (Port Mapping):**
   - Container Port 8000 → Host Port 8000 (OCR)
   - Container Port 8300 → Host Port 8300 (Transcrição)

5. **Configurar Domínio:**
   - Domain: `iamedbr.com`
   - Paths:
     - `/api/ocr` → Port 8000
     - `/transcrever-e-gerar-laudo` → Port 8300

6. **Deploy:**
   - Clique em "Deploy"
   - Aguarde o build e deploy completar

#### 3. Backend API (Separado)

1. **Criar Nova Aplicação:**
   - Nome: `ic-medico-backend`
   - Tipo: `Dockerfile`
   - Dockerfile path: `backend/models/Database/Dockerfile`

2. **Configurar Variáveis:**
   ```
   DB_HOST=seu-db-host
   DB_PORT=5432
   DB_NAME=ic_medico
   DB_USER=postgres
   DB_PASSWORD=sua-senha
   ```

3. **Port Mapping:**
   - Container Port 8100 → Host Port 8100

4. **Domain Path:**
   - `/pacientes` → Port 8100
   - `/laudos` → Port 8100
   - `/exames` → Port 8100
   - `/audios` → Port 8100

---

### OPÇÃO 2: Deploy Manual Individual

Se preferir fazer deploy de cada serviço separadamente:

#### A. Deploy do OCR Service

No Dokploy:

1. **New Application** → `ic-medico-ocr`
2. **Build Settings:**
   - Type: `Dockerfile`
   - Dockerfile: `DockerfileOCR` (vamos criar)
   - Build Context: `/OCR`
3. **Network:**
   - Port: 8000 → 8000
4. **Domain:**
   - `iamedbr.com/api/ocr`

#### B. Deploy do Transcrição Service

1. **New Application** → `ic-medico-transcricao`
2. **Build Settings:**
   - Type: `Dockerfile`
   - Dockerfile: `DockerfileTranscricao` (vamos criar)
   - Build Context: `/Transcricao`
3. **Network:**
   - Port: 8300 → 8300
4. **Domain:**
   - `iamedbr.com/transcrever-e-gerar-laudo`

---

## 🐳 Dockerfiles Individuais (para Opção 2)

### DockerfileOCR
```dockerfile
FROM node:20-alpine

WORKDIR /app

# Instalar tesseract
RUN apk add --no-cache tesseract-ocr tesseract-ocr-data-por

# Copiar e instalar dependências
COPY OCR/package*.json ./
RUN npm ci --only=production

# Copiar código
COPY OCR/ .
COPY por.traineddata /usr/share/tessdata/

EXPOSE 8000

CMD ["node", "server.js"]
```

### DockerfileTranscricao
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Instalar ffmpeg
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

# Copiar e instalar dependências
COPY Transcricao/ .
RUN pip install --no-cache-dir fastapi uvicorn[standard] python-multipart openai-whisper httpx

EXPOSE 8300

CMD ["python", "main.py"]
```

---

## 🌐 Configuração de Domínio

### No Dokploy:

1. **Settings → Domains**
2. Adicionar domínio: `iamedbr.com`
3. **SSL/TLS:** Habilitar (Dokploy usa Let's Encrypt automaticamente)

### Configurar Rotas:

| Path | Service | Port |
|------|---------|------|
| `/` | Frontend | 80 |
| `/api/ocr` | OCR | 8000 |
| `/transcrever-e-gerar-laudo` | Transcrição | 8300 |
| `/pacientes` | Backend | 8100 |
| `/laudos` | Backend | 8100 |
| `/exames` | Backend | 8100 |
| `/audios` | Backend | 8100 |

---

## 🔐 Configurar SSL

Dokploy configura SSL automaticamente, mas você pode verificar:

1. **Domains → SSL Certificate**
2. Habilitar "Auto SSL" (Let's Encrypt)
3. Force HTTPS redirect

---

## 📊 Monitoramento no Dokploy

Depois do deploy:

1. **Logs:** Ver logs em tempo real de cada serviço
2. **Metrics:** CPU, RAM, Network usage
3. **Health Checks:** Configurar endpoints de health
4. **Auto-restart:** Já vem configurado

---

## 🔄 CI/CD - Deploy Automático

### Configurar Webhook no GitHub:

1. No Dokploy, vá em **Application → Settings → Webhooks**
2. Copie a URL do webhook
3. No GitHub: **Repository → Settings → Webhooks**
4. Cole a URL e configure:
   - Events: `push`
   - Branch: `main` ou `prod`

Agora todo `git push` fará deploy automático!

---

## 🧪 Testar os Serviços

```bash
# Testar OCR
curl -X POST https://iamedbr.com/api/ocr \
  -F "image=@test.jpg"

# Testar Transcrição
curl -X POST https://iamedbr.com/transcrever-e-gerar-laudo \
  -F "file=@audio.mp3"

# Testar Backend
curl https://iamedbr.com/pacientes
```

---

## 💡 Dicas Importantes

### 1. Recursos da VPS
- **Mínimo:** 4GB RAM (Whisper usa bastante)
- **Recomendado:** 8GB RAM + 4 CPUs
- **Disco:** ~10GB para imagens + modelos

### 2. Otimização de Whisper
Se a transcrição estiver lenta, use modelo menor:

```python
# Em Transcricao/main.py
model = whisper.load_model("tiny")  # Mais rápido
# Opções: tiny, base, small, medium, large
```

### 3. Cache do Docker
Configure Docker build cache no Dokploy para builds mais rápidos.

### 4. Logs e Debug
- Veja logs em tempo real no Dokploy
- Configure alertas para erros
- Use `docker logs <container>` se necessário

---

## 🚨 Troubleshooting

### Serviço não inicia
```bash
# Ver logs
dokploy logs ic-medico-services

# Ou via Docker
docker ps -a
docker logs <container-id>
```

### Erro de memória (Whisper)
```bash
# Verificar uso de RAM
free -h

# Adicionar swap
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### Portas já em uso
```bash
# Ver o que está usando a porta
sudo netstat -tlnp | grep :8000
sudo lsof -i :8000

# Parar processo
sudo kill -9 <PID>
```

### Build falha
- Verifique se tem espaço em disco: `df -h`
- Limpe builds antigos: `docker system prune -a`
- Verifique logs de build no Dokploy

---

## ✅ Checklist Final

- [ ] Dokploy instalado na VPS
- [ ] Repositório Git configurado
- [ ] Dockerfile ou Docker Compose pronto
- [ ] Variáveis de ambiente configuradas
- [ ] Portas mapeadas corretamente
- [ ] Domínio configurado
- [ ] SSL ativo
- [ ] Health checks funcionando
- [ ] Logs sem erros críticos
- [ ] Testes de endpoint OK
- [ ] CI/CD configurado (opcional)

---

## 🎉 Pronto!

Com Dokploy você tem:
- ✅ Deploy automático via Git
- ✅ SSL gratuito (Let's Encrypt)
- ✅ Logs e métricas em tempo real
- ✅ Auto-restart dos serviços
- ✅ Painel visual fácil de usar
- ✅ Rollback fácil de versões

**Qualquer `git push` vai fazer deploy automático!** 🚀
