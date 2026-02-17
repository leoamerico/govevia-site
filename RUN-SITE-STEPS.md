# RUN-SITE-STEPS (comandos exatos)

## Etapa D — Site: BFF interno para Core (sem abrir CSP)

### Comandos
```bash
cd /d/govevia-site

git status --porcelain

# gate de stage/escopo (ajuste allowlist conforme etapa)
npm run stage:check -- --allow app/api/core/ --allow lib/core-client.ts --allow docs/public/evidence/ --allow docs/GOVERNANCE-MANIFEST.yaml --allow CHANGELOG.md

npm run lint
npm run build
npm run tokens:check
npm run security:csp
npm run history:check
npm run content-keys:check

git diff --stat
git diff --name-only
```
