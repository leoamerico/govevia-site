# REPORT-ENVNEO-IDENTITY-V1 — Evidência de entrega (assets + spec)

## Objetivo

Evidenciar, de forma auditável, os artefatos de identidade EnvNeo v1 entregues no repositório.

## Inventário (SSOT)

Fonte canônica:

- `assets/brand/envneo/envneo-mark.svg`
- `assets/brand/envneo/envneo-mark-inverted.svg`
- `assets/brand/envneo/envneo-wordmark.svg`
- `assets/brand/envneo/README.md`

Distribuição runtime:

- `public/brand/envneo/envneo-mark.svg`
- `public/brand/envneo/envneo-mark-inverted.svg`
- `public/brand/envneo/envneo-wordmark.svg`

Norma:

- `docs/brand/ENVNEO-IDENTITY-SPEC.md`

## Critérios de validação (objetivos)

- `envneo-mark*.svg` possuem `viewBox="0 0 64 64"`.
- SVGs usam `currentColor` (token-friendly).
- Gate FE-01 continua PASS (sem HEX/%23 em `app/**` e `components/**`).

Comandos:

```bash
npm run tokens:build
npm run tokens:check
npm run build
```

## Limites e Condições

- Esta entrega define v1 (Opção 1) e não inclui variações futuras.
- Evidência não contém claims de registro; apenas requisitos verificáveis.
