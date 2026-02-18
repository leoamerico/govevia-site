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
