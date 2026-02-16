# ADR-001 — Governança de claims públicos (site)

## Contexto
O site institucional comunica capacidades e diferenciais. Em ambientes governados (setor público), frases absolutas ou adiantadas em relação ao código aumentam risco reputacional e comercial.

## Decisão
Toda claim pública usada no site deve existir no `docs/public/claims/CLAIMS-MANIFEST.yaml` e seguir as regras do `POL-001-claims.md`.

## Consequências
- Claims marcadas como `GA` exigem evidência verificável no repositório (código + teste/gate + documento governado).
- Claims em evolução devem ser marcadas como `ROADMAP_GOVERNED` e ter ADR/política de gate.
