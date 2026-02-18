# SECURITY-PROD-SNAPSHOT — evidência (pós-deploy)

Data: 2026-02-18
Validado em: 2026-02-18T10:13 UTC
Commit: a2b3745160a4682cd4c50d9ebac5604078ce0b6f (main)
Ambiente: production — gru1 (Vercel)

Status: **PASS**

## Objetivo

Registrar evidência reproduzível (HTTP real) dos controles mínimos de segurança/robustez.

## Checklist (outputs reais)

### A) `/api/version`

```json
{
  "commitSha": "a2b3745160a4682cd4c50d9ebac5604078ce0b6f",
  "commitRef": "main",
  "vercelEnv": "production",
  "vercelRegion": null,
  "portalApiBaseHost": null
}
```

Resultado: **PASS** — commit correto em produção.

### B) CSP

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'
  https://www.googletagmanager.com https://www.google-analytics.com;
  style-src 'self' 'unsafe-inline'; font-src 'self';
  img-src 'self' data: https://www.googletagmanager.com https://www.google-analytics.com;
  connect-src 'self' https://www.google-analytics.com;
  object-src 'none'; frame-ancestors 'self'; base-uri 'self'; form-action 'self'
```

- `unsafe-eval` ausente: **PASS**
- `vercel.live` ausente: **PASS**
- `perplexity` / `r2cdn.perplexity.ai` ausente: **PASS**
- `object-src 'none'` presente: **PASS**

### C) Admin bloqueado (middleware — 404 real)

```
GET /admin
HTTP/1.1 404 Not Found
Cache-Control: no-store
X-Robots-Tag: noindex, nofollow

GET /admin/content
HTTP/1.1 404 Not Found
Cache-Control: no-store
```

- Status 404: **PASS** (ambas as rotas)
- `Cache-Control: no-store`: **PASS**
- `X-Robots-Tag: noindex, nofollow`: **PASS**

### D) robots.txt

```
User-Agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /portal/callback
```

- `Disallow: /admin/` presente: **PASS**
- `Disallow: /portal/callback` presente: **PASS**

## Conclusão

- Resultado: **PASS** (todos os controles validados)
- Observações: Nenhuma discrepância. Superfície de `/admin/**` reduzida via middleware com 404 real;
  sem dependência de página `/404`. CSP sem `unsafe-eval`, `object-src 'none'` ativo.
