# Implementação Concluída — ETAPA 4.2

## 1) Resumo da POLICY aplicada (gates + estratégia)
- **Local-first + fail-closed:** se `GV_CORE_BASE_URL` estiver ausente, ou se o Core falhar/retornar payload inválido, o Portal não quebra; cai para fallback local mínimo.
- **Least exposure:** o Portal consome e processa **apenas** os campos públicos do read-model v1 (nome/logo/INPI), sem secrets/headers/tokens.
- **Server-only:** fetch do Core e leitura de overrides via `getContent()` ocorrem somente no server.
- **Precedência obrigatória:** (1) override Admin (published), (2) Core read-model, (3) fallback local.
- **SVG é não confiável:** render via `dangerouslySetInnerHTML` somente após sanitização determinística (allowlist + rejeições), retornando `null` em caso de suspeita.

## 2) Artefatos criados/modificados (com paths)
- lib/core/portalBrand.ts
- components/Header.tsx
- components/Header.client.tsx
- components/Footer.tsx
- docs/content/CONTENT-CATALOG.yaml
- docs/registry/REG-SITE-CONTENT-KEYS.md
- docs/public/evidence/frontend/REPORT-CORE-BRAND-CONSUME.md
- docs/GOVERNANCE-MANIFEST.yaml
- CHANGELOG.md

## 3) Documentação/evidências atualizadas
- Evidência: este documento
- Manifesto: `docs/GOVERNANCE-MANIFEST.yaml`
- Changelog: `CHANGELOG.md`

## 4) Quality gates/resultados (PASS/FAIL + comandos)
Rodar na sequência:
- `npm run lint`
- `npm run build` (inclui `history:check` via prebuild)
- `npm run tokens:check`
- `npm run security:csp`
- `npm run content-keys:check`
- `npm run -s stage:check -- --allow ...` (allowlist estrita)

Outputs (captura textual):

`npm run lint`
```
✔ No ESLint warnings or errors
```

`npm run build`
```
OK: MDX ViewBlocks guardrails passed
history:check: OK
✓ Compiled successfully
✓ Generating static pages
```

`npm run tokens:check`
```
OK: design tokens up-to-date
FE-01 PASS: preset ok, dist sem drift, e no-HEX em app/components.
OK: contrast checks passed
```

`npm run security:csp`
```
CSP allowlist check: OK
```

`npm run content-keys:check`
```
content-keys:check: OK
```

## 5) Próximos passos (apenas o próximo incremento)
- ETAPA 4.3 — snapshots persistidos + Admin view (timeline/refresh)
