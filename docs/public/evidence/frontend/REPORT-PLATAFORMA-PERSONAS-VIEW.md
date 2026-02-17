# REPORT-PLATAFORMA-PERSONAS-VIEW — Evidência (Personas + ?view)

## Objetivo

Evidenciar a implementação MVP da rota `/plataforma` com:

- SSOT de capacidades e personas
- reordenação derivada por `order[]`
- bloco “Evidências exigidas” por persona
- URL shareable via `?view=` (ex.: `/plataforma?view=procurador`)

## Guardrails atendidos

- CSP estrita: sem `@import`, sem `url(http...)`, sem hosts externos.
- Tokens-only: UI composta por classes Tailwind/tokenizadas existentes; sem HEX.
- Sem `<style>` inline e sem `style={{...}}` para layout/cores/tipografia.

## Artefatos

- `lib/plataforma/ssot.ts` (SSOT)
- `components/plataforma/PlataformaView.client.tsx` (UI client + router.replace)
- `app/plataforma/page.tsx` (SSR estável + validação do `searchParams.view`)

## Gates

- `npm -s run -s lint`: PASS
- `npm -s run -s build`: PASS (inclui `history:check`)
- `npm -s run -s tokens:check`: PASS
- `npm -s run -s security:csp`: PASS
