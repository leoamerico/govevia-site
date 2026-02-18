# SECURITY-PROD-SNAPSHOT — evidência (pós-deploy)

Data: 2026-02-18

Status: PENDENTE (preencher com outputs reais do ambiente publicado)

## Objetivo

Registrar evidência reproduzível (HTTP real) dos controles mínimos de segurança/robustez.

## Checklist (cole outputs)

### A) `/api/version`

- Comando:
  - `Invoke-RestMethod "https://www.govevia.com.br/api/version"`
- Output (cole JSON):

```json
{
  "commitSha": "",
  "vercelEnv": "production",
  "portalApiBaseHost": ""
}
```

### B) CSP

- Comando:
  - `(Invoke-WebRequest -Method Head -Uri "https://www.govevia.com.br").Headers["content-security-policy"]`
- PASS se:
  - não contém `unsafe-eval`
  - não contém `vercel.live`
  - não contém `perplexity` / `r2cdn.perplexity.ai`
  - contém `object-src 'none'`

### C) Favicon/Manifest

- Favicon:
  - `(Invoke-WebRequest -Method Head -Uri "https://www.govevia.com.br/favicon.ico").StatusCode`
- Manifest:
  - `(Invoke-WebRequest -Method Head -Uri "https://www.govevia.com.br/manifest.webmanifest").StatusCode`

### D) Admin bloqueado

- `(Invoke-WebRequest -Method Head -Uri "https://www.govevia.com.br/admin").StatusCode`
- `(Invoke-WebRequest -Method Head -Uri "https://www.govevia.com.br/admin/content").StatusCode`
- `(Invoke-WebRequest -Method Head -Uri "https://www.govevia.com.br/admin").Headers["x-robots-tag"]`
- `(Invoke-WebRequest -Method Head -Uri "https://www.govevia.com.br/admin").Headers["cache-control"]`

## Conclusão

- Resultado: PASS/FAIL
- Observações:
