# 🚀 Guia de Deploy para Produção - iamedbr.com

## ⚠️ IMPORTANTE: Problema Atual

O erro "Failed to fetch" está acontecendo porque você está usando um **build antigo** que ainda tem as URLs de `localhost`. É necessário fazer um novo build com as configurações atualizadas.

---

## 📋 Checklist de Deploy

### 1️⃣ Fazer Novo Build do Frontend

```powershell
# Na pasta raiz do projeto
npm run build
```

Isso vai gerar uma nova pasta `build/` ou `dist/` com os arquivos atualizados contendo as URLs de `https://iamedbr.com`.

### 2️⃣ Subir o Build para o Hostinger

Você tem duas opções:

**Opção A: Upload Manual via FTP/File Manager**
- Acesse o File Manager do Hostinger
- Vá até a pasta `public_html` (ou pasta do seu domínio)
- Faça upload de **todos os arquivos** da pasta `build/` ou `dist/`

**Opção B: Via Git (se configurado)**
```bash
git add .
git commit -m "Update production URLs"
git push origin main
```

### 3️⃣ Verificar Configurações no Hostinger

#### A) SSL/HTTPS
- ✅ Certifique-se que o SSL está ativo no painel do Hostinger
- ✅ Force HTTPS (redirect automático de HTTP para HTTPS)

#### B) Configurar PHP/Node (se necessário)
- Backend Python FastAPI precisa estar rodando
- OCR (Node.js) precisa estar rodando
- Transcrição (Python) precisa estar rodando

#### C) Portas e Endpoints
No Hostinger, você provavelmente precisará usar **proxy reverso** ou **subdomínios**:

- `https://iamedbr.com/` → Frontend
- `https://iamedbr.com/api/` → Backend (porta 8100)
- `https://iamedbr.com/api/ocr` → OCR (porta 8000)
- `https://iamedbr.com/transcrever-e-gerar-laudo` → Transcrição (porta 8300)

### 4️⃣ Configurar .htaccess (se usar Apache)

Crie ou edite o arquivo `.htaccess` na pasta `public_html`:

```apache
# Force HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST%}%{REQUEST_URI} [L,R=301]

# Proxy para Backend
RewriteRule ^api/(.*)$ http://localhost:8100/$1 [P,L]

# Proxy para OCR
RewriteRule ^api/ocr(.*)$ http://localhost:8000/api/ocr$1 [P,L]

# Proxy para Transcrição
RewriteRule ^transcrever-e-gerar-laudo(.*)$ http://localhost:8300/transcrever-e-gerar-laudo$1 [P,L]

# SPA - Redirect all to index.html
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

### 5️⃣ Verificar CORS no Backend

✅ **Já configurado!** Os arquivos já estão aceitando requisições de:
- `https://iamedbr.com`
- `https://www.iamedbr.com`
- `http://iamedbr.com` (será redirecionado para HTTPS)

### 6️⃣ Testar os Endpoints

Após o deploy, teste cada serviço:

```bash
# Testar Backend
curl https://iamedbr.com/pacientes

# Testar OCR
curl -X POST https://iamedbr.com/api/ocr -F "image=@test.jpg"

# Testar Transcrição
curl -X POST https://iamedbr.com/transcrever-e-gerar-laudo -F "file=@test.mp3"
```

---

## 🔧 Troubleshooting

### Erro: "Failed to fetch"
- ✅ Refaça o build: `npm run build`
- ✅ Limpe o cache do browser (Ctrl+Shift+Del)
- ✅ Verifique se SSL está ativo
- ✅ Verifique CORS no console do browser

### Erro: "Mixed Content"
- Certifique-se que TODAS as URLs usam `https://`
- Não misture `http://` com `https://`

### Erro: "CORS policy"
- ✅ Já configurado nos arquivos Python e Node.js
- Verifique se os serviços estão rodando
- Reinicie os serviços backend

### Frontend carrega mas API não funciona
- Verifique se o backend está rodando no Hostinger
- Verifique logs do servidor
- Teste as URLs da API diretamente no browser

---

## 🎯 Comandos Rápidos

```powershell
# 1. Fazer novo build
npm run build

# 2. Testar localmente o build
npm run preview

# 3. Ver o que mudou
git status

# 4. Commitar mudanças
git add .
git commit -m "Configure production URLs for iamedbr.com"
git push
```

---

## 📞 URLs Finais

Após o deploy, sua aplicação estará em:

- **Frontend**: https://iamedbr.com
- **Backend API**: https://iamedbr.com/pacientes, /laudos, etc.
- **OCR**: https://iamedbr.com/api/ocr
- **Transcrição**: https://iamedbr.com/transcrever-e-gerar-laudo

---

## ⚡ Próximo Passo AGORA

**Execute este comando:**

```powershell
npm run build
```

Depois faça upload dos arquivos da pasta `build/` ou `dist/` para o Hostinger.

✅ **Todas as URLs já foram atualizadas nos arquivos TypeScript/React!**
