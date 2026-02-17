# REPORT-HISTORY-CHECK-GATE — Evidência (Gate `/historico` SSOT)

## Objetivo

Evidenciar o enforcement de que o `/historico` é fonte de verdade operacional: **qualquer mudança no repositório MUST atualizar o `CHANGELOG.md`**, pois ele alimenta o endpoint público `/historico`.

## Regra

- Se houver qualquer arquivo alterado no repo (tracked ou untracked), e o `CHANGELOG.md` não estiver no conjunto de mudanças, o gate falha.

## Implementação

- Script: `scripts/verify-changelog-updated.mjs`
- Comando oficial: `npm -s run -s history:check`
- Integração: `prebuild` roda `content:check && history:check` antes de `next build`.

## Heurística de base (CI/PR)

Quando o working tree está limpo, o gate calcula mudanças por diff entre commits:

- Preferência: `git merge-base origin/main HEAD` (fallbacks: `main`, `origin/master`, `master`).
- Fallback: `VERCEL_GIT_PREVIOUS_SHA` (Vercel) quando válido.
- Último fallback: `HEAD~1`.

Motivo: reduzir risco de falso PASS em branches longas.

## Heurística local (repo “dirty”)

Se houver mudanças não commitadas:

- Usa `git diff --name-only HEAD` para arquivos tracked modificados.
- Soma `git ls-files --others --exclude-standard` para untracked.

## Exemplo de FAIL (esperado)

- Alterar `components/**` sem modificar `CHANGELOG.md` → `history:check: FAIL` e a build para.

## Resultado esperado

- Deploy só passa quando “tudo está escrito” no `CHANGELOG.md` (SSOT do `/historico`).
