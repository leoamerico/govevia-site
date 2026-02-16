# Runbook — WEB Claims Enforcement

## Objetivo
Executar localmente o verificador de claims do site (anti-overclaim) e gerar o relatório público de evidências.

O verificador também aplica salvaguardas para claims de IA (AI-first):

- Permite inventariar claims com `domain`, `risk_level` e `ai_pattern`.
- Falha automaticamente se detectar frases de overclaim típicas de IA em qualquer copy pública (ex.: "decide automaticamente", "sem viés", "sem erro").

## Comandos

```bash
python tools/claims/verify_web_claims.py
```

## Saídas

- Relatório gerado em: `docs/public/evidence/WEB-CLAIMS-REPORT.md`

## Interpretação

- `PASS`: o statement não está mais presente na fonte **ou** há prova reprodutível declarada/implementada.
- `FAIL`: claim permanece no site, mas não há prova técnica reprodutível suficiente; aplicar `copy_fix` e reexecutar.
