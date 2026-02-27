# ✅ CONFIGURAÇÃO COMPLETA PARA PRODUÇÃO

## 🎯 O QUE FOI FEITO

### 1. URLs Atualizadas
Todos os arquivos foram atualizados de `localhost` para `https://iamedbr.com`:

✅ **Frontend (React/TypeScript):**
- `frontend/api/pacienteservices.ts`
- `frontend/src/components/PatientList.tsx`
- `frontend/src/components/PatientRegistration.tsx`
- `frontend/src/components/ReportEditor.tsx` (15 endpoints)
- `frontend/src/components/ReportTemplates.tsx`

✅ **Backend (Python FastAPI):**
- `backend/models/Database/app/main.py` - CORS configurado
- `backend/models/Database/app/routes/audios.py` - URLs atualizadas
- `backend/models/Database/.env` - DB_HOST atualizado

✅ **Serviços:**
- `OCR/server.js` - CORS configurado
- `Transcricao/main.py` - CORS configurado

✅ **Configurações:**
- `nginx.conf` - server_name atualizado
- `nginx-services.conf` - upstream e server_name configurados
- `.htaccess` - proxy reverso e SSL configurados

### 2. CORS Configurado
Todos os serviços agora aceitam requisições de:
- `https://iamedbr.com` ✅
- `https://www.iamedbr.com` ✅
- `http://localhost:3000` (desenvolvimento) ✅
- `http://localhost:5173` (Vite dev) ✅

### 3. Arquivos de Ambiente Criados
- `.env.production` - Variáveis para produção
- `.env.development` - Variáveis para desenvolvimento
- `.env.local.example` - Exemplo de configuração

---

## 🚀 PRÓXIMOS PASSOS (FAÇA AGORA)

### Passo 1: Fazer Novo Build

```powershell
npm run build
```

**Isso vai:**
- Compilar todo o código TypeScript/React
- Gerar arquivos otimizados na pasta `build/` ou `dist/`
- Aplicar as novas URLs de produção

### Passo 2: Testar o Build Localmente (opcional)

```powershell
npm run preview
```

Abra `http://localhost:4173` e verifique se está funcionando.

### Passo 3: Upload para Hostinger

#### Opção A: Via File Manager (Mais Simples)
1. Acesse o painel do Hostinger
2. Vá em **File Manager**
3. Navegue até `public_html` (ou pasta do seu domínio)
4. **Delete todos os arquivos antigos** da pasta
5. Faça upload de **TODOS os arquivos** da pasta `build/` ou `dist/`
6. Faça upload do arquivo `.htaccess` também

#### Opção B: Via FTP
1. Use FileZilla ou outro cliente FTP
2. Conecte no servidor (credenciais no painel Hostinger)
3. Delete arquivos antigos
4. Upload da pasta `build/` ou `dist/`
5. Upload do `.htaccess`

### Passo 4: Configurar SSL no Hostinger

1. Painel do Hostinger → **SSL**
2. Ative o SSL gratuito (Let's Encrypt)
3. Force HTTPS (redirecionar HTTP para HTTPS)

### Passo 5: Iniciar Serviços Backend

No servidor, você precisa ter rodando:

```bash
# Backend (FastAPI) na porta 8100
cd backend/models/Database
uvicorn app.main:app --host 0.0.0.0 --port 8100

# OCR (Node.js) na porta 8000
cd OCR
node server.js

# Transcrição (Python) na porta 8300
cd Transcricao
python3 main.py
```

**OU use Docker:**

```bash
docker-compose -f docker-compose.services.yml up -d
```

### Passo 6: Verificar

1. Acesse `https://iamedbr.com`
2. Abra o Console (F12)
3. Verifique se não há erros de CORS
4. Teste cadastrar um paciente
5. Teste o OCR
6. Teste a transcrição

---

## 🔍 VERIFICAÇÃO RÁPIDA

### No Browser (Console F12):
```javascript
// Deve retornar lista de pacientes
fetch('https://iamedbr.com/pacientes')
  .then(r => r.json())
  .then(console.log)
```

### Via Terminal:
```powershell
curl https://iamedbr.com/pacientes
```

---

## ⚠️ PROBLEMAS COMUNS

### 1. "Failed to fetch"
**Causa:** Build antigo ou backend não está rodando  
**Solução:** Faça novo build (`npm run build`) e verifique se os serviços backend estão rodando

### 2. "CORS policy error"
**Causa:** Backend não está aceitando requisições  
**Solução:** Já configurado! Apenas reinicie os serviços Python/Node

### 3. "Mixed Content"
**Causa:** Misturando HTTP com HTTPS  
**Solução:** Já corrigido! Todas URLs usam HTTPS

### 4. 404 ao recarregar página
**Causa:** SPA não configurado no servidor  
**Solução:** Arquivo `.htaccess` já resolve isso!

---

## 📁 ESTRUTURA FINAL NO HOSTINGER

```
public_html/
├── index.html
├── assets/
│   ├── index-[hash].js
│   └── index-[hash].css
├── .htaccess (IMPORTANTE!)
└── outros arquivos do build
```

---

## ✅ CHECKLIST FINAL

- [ ] `npm run build` executado
- [ ] Arquivos da pasta `build/` ou `dist/` no servidor
- [ ] Arquivo `.htaccess` no servidor
- [ ] SSL ativo no Hostinger
- [ ] Backend rodando (porta 8100)
- [ ] OCR rodando (porta 8000)
- [ ] Transcrição rodando (porta 8300)
- [ ] Site acessível via `https://iamedbr.com`
- [ ] Console sem erros de CORS
- [ ] Todas as funcionalidades testadas

---

## 🎉 ESTÁ PRONTO!

Depois de seguir estes passos, sua aplicação estará 100% funcional em produção em `https://iamedbr.com`!

**Comando principal agora:**
```powershell
npm run build
```
