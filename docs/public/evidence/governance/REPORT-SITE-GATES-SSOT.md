# REPORT-SITE-GATES-SSOT

## Objetivo
- Reduzir ambiguidade e drift: SSOT compacto + registries + gates (`scope:check`/`stage:check`/`content-keys:check`).

## Escopo (arquivos tocados)
- `PROJECT-SSOT.md`, `RUN-SITE-STEPS.md`
- `docs/registry/REG-NAMING.md`, `docs/registry/REG-SITE-CONTENT-KEYS.md`, `docs/registry/REG-SITE-DESIGN-TOKENS.md`
- `docs/policy/POL-PORTAL-BFF-CORE.md`
- `docs/public/evidence/_TEMPLATE-REPORT.md`
- `scripts/stage-check.mjs`, `scripts/scope-check.mjs`, `scripts/content-keys-check.mjs`
- `package.json`

## Comandos executados (resumo)
- `node scripts/content-keys-check.mjs` (sanity)
- `node scripts/stage-check.mjs --help` (sanity)

## Resultado
- PASS/FAIL: PASS (gates adicionados; execução validada localmente)

## Risco residual
- `content-keys:check` valida apenas chamadas via `getContent(...)` em `app/components/lib`.
