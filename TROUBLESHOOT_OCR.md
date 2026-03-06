# Troubleshoot OCR — 405/502 Tests

## 🔧 1️⃣ Verificar se OCR está respondendo

```bash
# De dentro da VM/servidor
curl -v http://localhost:8000/health
```

**Esperado:** `200 OK` com `{"status": "healthy"}`

---

## 🔧 2️⃣ Testar endpoint OCR direto (interno)

```bash
# Enviar imagem para OCR (teste local primeiro)
curl -X POST -F "image=@/caminho/para/imagem.jpg" \
  http://localhost:8000/api/ocr
```

**Esperado:** `200 OK` com resposta JSON

---

## 🔧 3️⃣ Testar via Traefik (externo)

```bash
# Se conseguir acessar

curl -X POST -F "image=@/caminho/para/imagem.jpg" \
  https://www.iamedbr.com/api/ocr
```

**Se houver erro 405:** Traefik pode estar strippando o prefix. Ver **Item 4**.

---

## 🔧 4️⃣ Verificar StripPrefix no Traefik (comum causa 405)

No `docker-compose.dokploy.yml`, confirme que **NÃO** tem isso:

```yaml
# ❌ ERRADO - causa 405
traefik.http.middlewares.iamed-ocr-strip.stripprefix.prefixes=/api/ocr
traefik.http.routers.iamed-ocr.middlewares=iamed-ocr-strip@docker
```

Se tiver, Traefik vai mandar `GET /` (sem `/api/ocr`) para o OCR, e Express vai retornar **404/405**.

---

## 🔧 5️⃣ Logs do Traefik

```bash
# Ver logs do Traefik em tempo real
docker logs -f dokploy-proxy

# Procurar por "iamed-ocr" ou "/api/ocr"
```

---

## 🔧 6️⃣ Verificar Frontend

Abrir DevTools (F12) → Network → upload OCR

- **URL da requisição:** deve ser `https://www.iamedbr.com/api/ocr`
- **Method:** `POST`
- **Headers:** `Content-Type: multipart/form-data`
- **Body:** arquivo no campo `image`
- **Status resposta:** deve ser `200` ou `50x` (não `4xx`)

---

## ✅ Resumo

| Item | Status | Ação |
|------|--------|------|
| OCR `/health` | ✅ | Confirmar que responde `200` |
| OCR `/api/ocr` local | ✅ | Confirmar que recebe `POST` com arquivo |
| Traefik routing | ? | **Verificar logs** e se há `StripPrefix` ativo |
| Frontend URL | ✅ | DevTools Network (já correto) |

**Se tudo passar:** erro deve ser **resolvido**. Se tiver erro, colar o **status code** + **response body** do Traefik/OCR.
