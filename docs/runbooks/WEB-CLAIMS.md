# Runbook — WEB Claims Enforcement

## Objetivo
Executar localmente o verificador de claims do site (anti-overclaim) e gerar o relatório público de evidências.

## Comandos

```bash
python tools/claims/verify_web_claims.py
```

## Saídas

- Relatório gerado em: `docs/public/evidence/WEB-CLAIMS-REPORT.md`

## Interpretação

- `PASS`: o statement não está mais presente na fonte **ou** há prova reprodutível declarada/implementada.
- `FAIL`: claim permanece no site, mas não há prova técnica reprodutível suficiente; aplicar `copy_fix` e reexecutar.
