# PORTAL-PROD-READINESS — evidência (produção)

Data: 2026-02-18

## Resumo

Alterações para deixar o Portal e o site prontos para produção:

- CSP: `unsafe-eval` removido em produção (permitido apenas em desenvolvimento)
- Portal: UX mínima com erro controlado quando API estiver indisponível (sem quebrar e sem vazar detalhes)
- Assets básicos: `/favicon.ico` não retorna 404
- Diagnóstico: `/api/version` expõe `portalApiBaseHost` (host-only) para validação objetiva do `NEXT_PUBLIC_API_BASE_URL` em produção

## Evidência objetiva

- Runbook: `docs/runbooks/RUN-PORTAL-PROD-VALIDATION.md`
- PASS/FAIL deve ser executado no ambiente publicado antes de declarar “pronto para produção”.

## Outputs esperados (produção)

- `GET https://www.govevia.com.br/api/version`
	- `portalApiBaseHost`: `api.govevia.com.br` (ou host real de produção)
- `HEAD https://www.govevia.com.br/`
	- `content-security-policy` **sem** `unsafe-eval`
	- `content-security-policy` **sem** `vercel.live`
	- `content-security-policy` **sem** `perplexity` / `r2cdn.perplexity.ai`
- `HEAD https://www.govevia.com.br/favicon.ico`
	- status != 404
- `HEAD https://www.govevia.com.br/manifest.webmanifest`
	- status != 404
