# STATUS (SSOT) — govevia-site (Portal)

Atualize este arquivo + `CHANGELOG.md` ao fechar uma etapa.

## Gates obrigatórios (Site)
- `npm run lint`
- `npm run build`
- `npm run tokens:check`
- `npm run security:csp`
- `npm run history:check`
- `npm run content-keys:check`
- (anti-drift) `npm run stage:check -- --allow ...`
- (anti-drift) `npm run scope:check -- --commit ... --allow ...`

## Estado atual
- Admin Auth (CEO-only) + middleware fail-closed: FECHADO
- DB + CMS de conteúdo + revisions: FECHADO
- `/plataforma` persona-aware tokens-only + keys canônicas `site.*`: FECHADO
- Integração com Core (BFF `/api/core/*`): PENDENTE
- Timeline Admin (`/admin/activity` + ingest CI): PENDENTE

## Próxima etapa (ordem inequívoca)
- Aguardar Core estabilizar `test:unit` e expor READ APIs (para então implementar BFF no site sem abrir CSP).

## Último commit relevante
- `chore(site-governance): add SSOT + registries + content/scope gates`
