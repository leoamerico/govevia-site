# Runbook — Diagnóstico objetivo do CSRF no formulário de contato

Este runbook valida, de forma objetiva, se o endpoint `POST /api/contact` está:

- **PASS (CSRF OK):** aceitando requisições same-origin; e
- **FAIL (CSRF bloqueando):** retornando `403` com `{"message":"Requisição não autorizada."}`.

> Nota: o objetivo aqui é separar rapidamente **CSRF** (403) de falhas operacionais de **SMTP** (500/503).

---

## 1) Teste “full” (corpo + status)

```bash
curl -sS -o - -w "\nHTTP=%{http_code}\n" \
  -X POST "https://www.govevia.com.br/api/contact" \
  -H "Content-Type: application/json" \
  -H "Origin: https://www.govevia.com.br" \
  -H "Referer: https://www.govevia.com.br/" \
  -d '{"name":"Teste","position":"Cargo","entity":"Org","email":"teste@example.com","message":"Ping"}'
```

## 2) Só status (rápido)

```bash
curl -sS -o /dev/null -w "HTTP=%{http_code}\n" \
  -X POST "https://www.govevia.com.br/api/contact" \
  -H "Content-Type: application/json" \
  -H "Origin: https://www.govevia.com.br" \
  -H "Referer: https://www.govevia.com.br/" \
  -d '{"name":"Teste","position":"Cargo","entity":"Org","email":"teste@example.com","message":"Ping"}'
```

## 3) Diagnóstico de camada (se voltar 403)

Imprime headers úteis (Vercel/middleware/route/proxy) para eliminar achismo.

```bash
curl -sS -i -X POST "https://www.govevia.com.br/api/contact" \
  -H "Content-Type: application/json" \
  -H "Origin: https://www.govevia.com.br" \
  -H "Referer: https://www.govevia.com.br/" \
  -d '{"name":"Teste","position":"Cargo","entity":"Org","email":"teste@example.com","message":"Ping"}' \
| tr -d '\r' | sed -n '1,60p'
```

---

## Critério (gate objetivo)

- **PASS (CSRF OK):** `HTTP=200` ou `HTTP=500/503`
- **FAIL (CSRF bloqueando):** `HTTP=403`

---

## Se voltar 403: ajuste correto na Vercel (mitigação operacional)

Vercel → Project → Settings → Environment Variables

Defina **em Production e Preview**:

- `NEXT_PUBLIC_SITE_URL = https://www.govevia.com.br`

Em seguida, faça **Redeploy** do último commit em `main`.

**Por quê:** se o allowlist ainda estiver derivando a origem permitida a partir de `NEXT_PUBLIC_SITE_URL`, qualquer valor preso em `*.vercel.app` pode rejeitar `Origin: https://www.govevia.com.br` e manter o `403`, mesmo com o código correto.

---

## Observação (correção estrutural)

A abordagem mais robusta é validar CSRF por **same-origin derivado do próprio request** (ex.: `x-forwarded-host/host` + `x-forwarded-proto`) e reduzir dependência de env pública para segurança.
