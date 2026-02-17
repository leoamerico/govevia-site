# RUN-FUNNEL-GAP-REPORT — Gap Reports (criar/validar/publicar)

## Objetivo

Criar e validar **Gap Reports** versionados e lab-safe.

## Onde ficam

- Schema: `data/gap-reports/_schema.gap-report.v1.json`
- Reports: `data/gap-reports/**.json`
- Evidência (amostra): `docs/public/evidence/sales-funnel/EVID-SAMPLE-GAP-REPORT.md`

## PASS/FAIL

### PASS

- `npm run gap:check` retorna 0.

### FAIL

- Qualquer arquivo JSON inválido contra o schema.

## Comandos

```bash
npm run gap:check
```
