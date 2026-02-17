# REPORT-CLEANUP-LAB — Expurgo de scruta e higiene do repositório (lab)

Data: 2026-02-17

## Contexto

Ambiente de laboratório: sem produção, sem legado, sem dados. A limpeza pode ser agressiva.

## O que foi removido

- `public/170220261400/` (snapshot do repo dentro de `public/`, contendo cópias de `docs/`, `packages/`, `scripts/` e arquivos TS/TSX).

## Por quê

- Regra hard: `public/**` é **somente** asset servido em runtime (imagens/brand/etc.). Snapshot/cópia de repo dentro de `public/` é “scruta” e aumenta superfície de manutenção, risco e confusão de SSOT.

## O que garante que não volta

- Auditor determinístico (repo hygiene): `node script/lab-hygiene-audit.mjs`
  - Falha (exit code != 0) se detectar “scruta” dentro de `public/`.
  - Falha se detectar `#HEX` ou `%23HEX` em runtime (`app/**`, `components/**`).
- Gate FE-01 (tokens/runtime): `npm run tokens:check`
  - Falha se houver `#HEX`/`%23HEX` em runtime.
  - Falha se `packages/design-tokens/dist/**` tiver drift (modificado/não rastreado).

## Comandos (PASS/FAIL)

```bash
node script/lab-hygiene-audit.mjs
npm run tokens:build
npm run tokens:check
npm run lint
npm run build
```
