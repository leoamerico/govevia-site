# REPORT-ASSETS-NO-EXTERNAL-URLS — Evidência (CSP / assets self-contained)

## Objetivo

Garantir que assets estáticos (especialmente em `public/**`) não dependam de URLs externas que possam ser bloqueadas por CSP allowlist.

## Regra (HARD)

- Assets em `public/**` MUST NOT conter:
  - `@font-face`
  - `@import`
  - `url(https?://...)`
  - `href="https?://..."` / `xlink:href="https?://..."`

## Gate determinístico

- Script: `scripts/verify-csp-allowlist.mjs`
- Comando: `npm run security:csp`

O gate falha se encontrar host externo não allowlisted em runtime (`app/**`, `components/**`, `lib/**`) ou URLs externas embutidas em `public/**/*.svg|css` em contextos que disparam fetch real.

## Limites e Condições

- Este gate não impede URLs externas em documentação (`docs/**`) nem em dependências (`node_modules/**`).
- A política não “abre” CSP por conveniência; a correção preferida é remover a dependência externa.
