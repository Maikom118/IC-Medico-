# 🚀 Guia Rápido: Deploy com Dokploy

## 1️⃣ Instalar Dokploy na VPS (Uma vez só)

```bash
# Conectar na VPS via SSH
ssh root@seu-ip-hostinger

# Executar script de instalação
curl -sSL https://raw.githubusercontent.com/seu-usuario/IC-Medico--1/main/install-dokploy.sh | bash

# OU manualmente:
curl -sSL https://dokploy.com/install.sh | sh
```

**Acesse:** `http://seu-ip-vps:3000`

---

## 2️⃣ Configurar no Painel Dokploy

### A. Criar Projeto
1. Login no painel Dokploy
2. **New Project** → Nome: `ic-medico`

### B. Adicionar Serviço Backend
1. **New Application** → Nome: `backend-api`
2. **Source:**
   - Type: `Git + Dockerfile`
   - Repository: URL do seu GitHub
   - Branch: `main`
   - Dockerfile Path: `backend/models/Database/Dockerfile`
   - Build Context: `backend/models/Database`
3. **Environment Variables:**
   ```
   DB_HOST=seu-db-host
   DB_PORT=5432
   DB_NAME=ic_medico
   DB_USER=postgres
   DB_PASSWORD=sua-senha
   ```
4. **Networking:**
   - Container Port: `8100`
   - External Port: `8100`
5. **Domain:**
   - Domain: `iamedbr.com`
   - Paths: `/pacientes`, `/laudos`, `/exames`, `/audios`
6. **Deploy** ✅

### C. Adicionar Serviço OCR
1. **New Application** → Nome: `ocr-service`
2. **Source:**
   - Dockerfile Path: `OCR/Dockerfile`
   - Build Context: `OCR`
3. **Networking:**
   - Port: `8000`
4. **Domain:**
   - Paths: `/api/ocr`
5. **Deploy** ✅

### D. Adicionar Serviço Transcrição
1. **New Application** → Nome: `transcricao-service`
2. **Source:**
   - Dockerfile Path: `Transcricao/Dockerfile`
   - Build Context: `Transcricao`
3. **Networking:**
   - Port: `8300`
4. **Resources:**
   - Memory: `4GB` (importante para Whisper!)
5. **Domain:**
   - Paths: `/transcrever-e-gerar-laudo`
6. **Deploy** ✅

---

## 3️⃣ Configurar SSL

1. **Settings → SSL**
2. Habilitar **Let's Encrypt**
3. Force HTTPS redirect ✅

---

## 4️⃣ Configurar CI/CD (Opcional)

1. **Application → Webhooks**
2. Copiar URL do webhook
3. No GitHub: **Settings → Webhooks → Add webhook**
4. Cole a URL
5. Events: `push`

Agora todo `git push` faz deploy automático! 🎉

---

## 5️⃣ Testar

```bash
# Backend
curl https://iamedbr.com/pacientes

# OCR
curl -X POST https://iamedbr.com/api/ocr -F "image=@test.jpg"

# Transcrição
curl -X POST https://iamedbr.com/transcrever-e-gerar-laudo -F "file=@audio.mp3"
```

---

## ✅ Pronto!

Seus serviços estão rodando em:
- 🌐 **Backend:** `https://iamedbr.com/pacientes`
- 👁️ **OCR:** `https://iamedbr.com/api/ocr`
- 🎙️ **Transcrição:** `https://iamedbr.com/transcrever-e-gerar-laudo`

---

## 🔄 Atualizar código

```bash
git add .
git commit -m "Update services"
git push

# Dokploy faz deploy automático! 🚀
```

---

## 📊 Monitorar

No painel Dokploy:
- **Logs** → Ver logs em tempo real
- **Metrics** → CPU, RAM, Network
- **Health** → Status dos serviços

---

## 🚨 Troubleshooting

### Ver logs
```bash
# No painel Dokploy: Application → Logs

# Ou via SSH:
docker logs ic-medico-backend
docker logs ic-medico-ocr
docker logs ic-medico-transcricao
```

### Reiniciar serviço
No painel: **Application → Restart**

### Build falhou
1. Ver logs de build no Dokploy
2. Verificar se Dockerfile está correto
3. Verificar se há espaço em disco: `df -h`

---

## 💡 Dicas

- Use modelo Whisper `tiny` ou `base` para economizar RAM
- Configure backups automáticos no Dokploy
- Monitore uso de recursos
- Configure alertas de erro

**Deploy simplificado com Dokploy!** ✨
