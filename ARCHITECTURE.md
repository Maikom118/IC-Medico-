# 🏗️ Arquitetura de Deploy - IC-Medico com Dokploy

```
┌─────────────────────────────────────────────────────────────┐
│                    DOMÍNIO: iamedbr.com                     │
│                    (SSL/HTTPS Automático)                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
      ┌──────────────────────────────┐
      │   NGINX / Reverse Proxy      │
      │  (Gerenciado pelo Dokploy)   │
      └──────────────┬─────────────────┘
                     │
         ┌───────────┼───────────┬──────────┐
         ▼           ▼           ▼          ▼
    ┌────────┐ ┌─────────┐ ┌──────────┐ ┌──────────┐
    │Frontend│ │ Backend │ │   OCR    │ │Transcrição│
    │ (HTML/ │ │  API    │ │ Service  │ │  Service  │
    │  JS)   │ │(FastAPI)│ │(Node.js) │ │ (Python)  │
    │        │ │ Port    │ │  Port    │ │   Port    │
    │   /    │ │  8100   │ │  8000    │ │   8300    │
    └────────┘ └────┬────┘ └──────────┘ └──────────┘
                    │
                    ▼
            ┌───────────────┐
            │   PostgreSQL  │
            │   Database    │
            │  (Hostinger)  │
            └───────────────┘
```

---

## 📦 Componentes

### 1. Frontend (Static Files)
- **Tecnologia:** React + TypeScript + Vite
- **Deploy:** Build estático servido via Nginx
- **Localização:** `/` na raiz do domínio
- **Build:** `npm run build` → pasta `dist/`

### 2. Backend API (FastAPI)
- **Tecnologia:** Python FastAPI
- **Porta:** 8100
- **Endpoints:**
  - `/pacientes` - CRUD de pacientes
  - `/laudos` - Gerenciamento de laudos
  - `/exames` - Exames médicos
  - `/audios` - Gerenciamento de áudios
  - `/uploads` - Arquivos estáticos
- **Database:** PostgreSQL
- **Container:** `ic-medico-backend`

### 3. OCR Service
- **Tecnologia:** Node.js + Tesseract.js
- **Porta:** 8000
- **Endpoints:**
  - `/api/ocr` - Processar imagens
  - `/api/rg/ultimo` - Último RG processado
- **Recursos:** Tesseract OCR + Sharp
- **Container:** `ic-medico-ocr`

### 4. Transcrição Service
- **Tecnologia:** Python + OpenAI Whisper
- **Porta:** 8300
- **Endpoints:**
  - `/transcrever-e-gerar-laudo` - Transcrever áudio
- **Recursos:** FFmpeg + Whisper AI (modelo small)
- **Memory:** 4GB (Whisper precisa de RAM)
- **Container:** `ic-medico-transcricao`

---

## 🔄 Fluxo de Dados

### Cadastro de Paciente com OCR:
```
Frontend → Upload Imagem RG
    ↓
OCR Service (porta 8000)
    ↓
Tesseract processa imagem
    ↓
Extrai: Nome, RG, CPF, Data Nascimento
    ↓
Backend API (porta 8100)
    ↓
Salva no PostgreSQL
    ↓
Retorna dados para Frontend
```

### Transcrição de Áudio:
```
Frontend → Upload Áudio
    ↓
Transcrição Service (porta 8300)
    ↓
Whisper AI transcreve
    ↓
Texto transcrito
    ↓
Backend API (porta 8100)
    ↓
Salva laudo no PostgreSQL
    ↓
Retorna para Frontend
```

---

## 🌐 Rotas do Nginx (Dokploy gerencia automaticamente)

```nginx
# Frontend
https://iamedbr.com/
    → Arquivos estáticos (build/)

# Backend API
https://iamedbr.com/pacientes
https://iamedbr.com/laudos
https://iamedbr.com/exames
https://iamedbr.com/audios
    → Proxy para localhost:8100

# OCR Service
https://iamedbr.com/api/ocr
    → Proxy para localhost:8000

# Transcrição Service
https://iamedbr.com/transcrever-e-gerar-laudo
    → Proxy para localhost:8300
```

---

## 🐳 Containers Docker

```
┌─────────────────────────────────────────────┐
│              VPS Hostinger                  │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │         Dokploy Manager             │   │
│  │      (Painel Web :3000)             │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  Container: ic-medico-backend       │   │
│  │  Image: python:3.11-slim            │   │
│  │  Port: 8100                         │   │
│  │  RAM: 1GB                           │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  Container: ic-medico-ocr           │   │
│  │  Image: node:20-alpine              │   │
│  │  Port: 8000                         │   │
│  │  RAM: 512MB                         │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  Container: ic-medico-transcricao   │   │
│  │  Image: python:3.11-slim            │   │
│  │  Port: 8300                         │   │
│  │  RAM: 4GB (Whisper!)                │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  PostgreSQL Database                │   │
│  │  (Pode ser externo ou container)    │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

---

## 📊 Recursos Necessários (VPS)

### Mínimo Recomendado:
- **CPU:** 2-4 cores
- **RAM:** 6-8GB
  - Backend: 1GB
  - OCR: 512MB
  - Transcrição: 4GB (Whisper!)
  - Dokploy: 512MB
  - Sistema: 1GB
- **Disco:** 20-30GB
  - Sistema: 10GB
  - Docker images: 5GB
  - Whisper models: 1-3GB
  - Uploads/dados: 5-10GB

### Ideal:
- **CPU:** 4-8 cores
- **RAM:** 16GB
- **Disco:** 50-100GB SSD

---

## 🔐 Segurança

### SSL/TLS:
- ✅ Let's Encrypt (grátis, renovação automática)
- ✅ Force HTTPS redirect
- ✅ HSTS headers

### CORS:
- ✅ Configurado em todos os serviços
- ✅ Apenas domínios permitidos

### Firewall:
```bash
# Portas abertas necessárias:
22   - SSH
80   - HTTP (redirect para HTTPS)
443  - HTTPS
3000 - Dokploy (pode bloquear depois do setup)
```

---

## 🔄 CI/CD Flow

```
Developer → git push
    ↓
GitHub Webhook
    ↓
Dokploy recebe notificação
    ↓
Pull do código
    ↓
Docker build de cada serviço
    ↓
Health check
    ↓
Rolling update (zero downtime)
    ↓
Deploy completo! ✅
```

---

## 📈 Monitoramento (Dokploy Dashboard)

- **CPU Usage** por container
- **Memory Usage** por container
- **Network Traffic**
- **Logs em tempo real**
- **Restart automático** se crashar
- **Alertas** (email/webhook)

---

## 🎯 Pontos de Decisão

### Backend Database:
- **Opção A:** PostgreSQL no mesmo VPS (container)
- **Opção B:** PostgreSQL gerenciado Hostinger (mais seguro)
- **Opção C:** PostgreSQL externo (AWS RDS, etc)

### Modelo Whisper:
- `tiny` - Rápido, menos preciso, 1GB RAM
- `base` - Balanceado, 1-2GB RAM
- `small` - **Atual/Recomendado**, 2-4GB RAM
- `medium` - Melhor qualidade, 6-8GB RAM
- `large` - Máxima qualidade, 10GB+ RAM

### Storage de Arquivos:
- **Opção A:** Volume Docker persistente
- **Opção B:** Object Storage (S3, etc)
- **Opção C:** NFS/Network Storage

---

## ✅ Health Checks

```yaml
Backend:
  endpoint: /
  interval: 30s
  timeout: 10s

OCR:
  endpoint: /
  interval: 30s
  timeout: 10s

Transcrição:
  endpoint: /
  interval: 30s
  timeout: 10s
```

---

## 🚀 Performance

### Otimizações Implementadas:
- ✅ Docker multi-stage builds
- ✅ Alpine Linux (imagens menores)
- ✅ Health checks
- ✅ Resource limits
- ✅ Restart policies
- ✅ Logging estruturado

### Cache:
- ✅ Docker layer caching
- ✅ npm/pip cache
- ✅ Static assets cache (Nginx)

---

**Esta arquitetura garante:**
- ✅ Alta disponibilidade
- ✅ Fácil manutenção
- ✅ Escalabilidade
- ✅ Monitoramento completo
- ✅ Deploy automatizado

🎉 **Pronto para produção!**
