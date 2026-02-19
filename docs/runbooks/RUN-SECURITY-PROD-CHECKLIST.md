# RUN-SECURITY-PROD-CHECKLIST — checklist de produção (PASS/FAIL)

Status: Operacional

## Objetivo

Validar por **HTTP real** (ambiente publicado) os controles mínimos de segurança e robustez do site.

> Regra: não declarar “pronto para produção” sem outputs reais deste runbook.

## A) Headers (site)

### 1) HEAD `/` (headers + CSP)

PowerShell:

```powershell
(Invoke-WebRequest -Method Head -Uri "https://www.govevia.com.br").Headers["content-security-policy"]
(Invoke-WebRequest -Method Head -Uri "https://www.govevia.com.br").Headers["strict-transport-security"]
(Invoke-WebRequest -Method Head -Uri "https://www.govevia.com.br").Headers["x-content-type-options"]
(Invoke-WebRequest -Method Head -Uri "https://www.govevia.com.br").Headers["referrer-policy"]
(Invoke-WebRequest -Method Head -Uri "https://www.govevia.com.br").Headers["permissions-policy"]
```

PASS se:

- CSP **não** contém `unsafe-eval`
- CSP **não** contém `vercel.live`
- CSP **não** contém `perplexity` / `r2cdn.perplexity.ai`
- CSP contém `frame-ancestors`
- CSP contém `object-src 'none'`
- HSTS existe e contém `includeSubDomains`
- `X-Content-Type-Options` = `nosniff`

## B) Assets básicos

### 2) Favicon

```powershell
(Invoke-WebRequest -Method Head -Uri "https://www.govevia.com.br/favicon.ico").StatusCode
```

PASS se: status != 404

### 3) Manifest

```powershell
(Invoke-WebRequest -Method Head -Uri "https://www.govevia.com.br/manifest.webmanifest").StatusCode
```

PASS se: status != 404

## C) Diagnóstico de deploy

### 4) `/api/version`

```powershell
Invoke-RestMethod "https://www.govevia.com.br/api/version"
```

PASS se:

- `vercelEnv` = `production`
- `commitSha` corresponde ao deploy esperado
- `portalApiBaseHost` é o host do backend de produção

## D) Superfície exposta (admin)

### 5) Superfície `/admin/**` em produção (site-public)

```powershell
(Invoke-WebRequest -Method Head -Uri "https://www.govevia.com.br/admin").StatusCode
(Invoke-WebRequest -Method Head -Uri "https://www.govevia.com.br/admin/login").StatusCode
(Invoke-WebRequest -Method Head -Uri "https://www.govevia.com.br/admin/content").StatusCode
(Invoke-WebRequest -Method Head -Uri "https://www.govevia.com.br/admin/login").Headers["location"]
(Invoke-WebRequest -Method Head -Uri "https://www.govevia.com.br/admin/login").Headers["x-robots-tag"]
(Invoke-WebRequest -Method Head -Uri "https://www.govevia.com.br/admin/login").Headers["cache-control"]
```

PASS se:

- `/admin` → status `307` (redirect para `/admin/login`)
- `/admin/login` → status `307` (redirect para CEO Console, se `CEO_CONSOLE_BASE_URL` estiver configurado) **ou** `200` (página informativa)
- demais `/admin/*` → status `404`
- `X-Robots-Tag` = `noindex, nofollow`
- `Cache-Control` contém `no-store`

## Gates locais (pré-deploy)

- `npm run lint`
- `npm run tokens:check`
- `npm run content-keys:check`
- `npm run security:csp`
- `npm run portal-inventory:check`
- `npm run stage:check -- --allow ...`
- `npm run build`
