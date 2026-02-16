# POL-001 — Regras para claims no site

## Princípio
Só vira frase de site aquilo que pode ser apontado rapidamente em:
1) código, 2) validação automatizada (teste/gate), e 3) documento governado (ADR/política).

## Estados
- `GA`: claim disponível e sustentada por evidência no repositório.
- `PILOT`: existe, mas com restrição de escopo.
- `ROADMAP_GOVERNED`: planejada, com ADR e critérios de qualidade definidos.

## Regras objetivas
- `GA` MUST ter `adr + policy + code + tests` e ao menos 1 `copy_assertion`.
- `ROADMAP_GOVERNED` MUST ter `adr` e (quando aplicável) backlog/gate definido.

## Execução
O script `scripts/validate-claims.mjs` valida a estrutura e falha o CI se as regras não forem cumpridas.
