# REG-NAMING (cross-repo)

## Artefatos de governança (docs)
- Policy: `POL-<AREA>-<NOME>.md`
- Runbook: `RUN-<AREA>-<NOME>.md`
- Evidence: `REPORT-<AREA>-<NOME>.md`
- Registry: `REG-<AREA>-<NOME>.md`

## Chaves de conteúdo (Portal CMS)
Prefixos obrigatórios:
- `site.*` (institucional)
- `persona.*` (texto por perfil)
- `cap.*` (capacidades)
- `sla.*` (SLA)
- `brand.*` (marca — espelho no portal)
- `inpi.*` (INPI — espelho no portal)

Exemplos:
- `site.plataforma.hero.title`
- `persona.procurador.cta`
- `cap.versionamento.desc`

## Commits
- Site: `feat(site): ...` | `fix(site): ...` | `chore(site-governance): ...`
- Core: `feat(core): ...` | `fix(core-tests): ...` | `feat(contract): ...` | `chore(core-governance): ...`

## Contratos OpenAPI (SSOT)
- Service API: `docs/contracts/openapi/govevia-service-api.v1.yaml`
- Internal Admin API: `docs/contracts/openapi/govevia-internal-admin-api.v1.yaml`
