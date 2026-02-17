# ENVNEO-IDENTITY-SPEC — EnvNeo Identity v1 (SSOT)

Status: Normativo (MUST/SHOULD)

## Decisão oficial v1

- Marca oficial (símbolo) MUST ser **Opção 1 — Monograma Arquitetônico (E+N)**.
- Opções futuras (ex.: variações mais complexas) MUST NOT ser implementadas em v1.

## Propósito semiótico

- EnvNeo representa **infraestrutura/holding** (fundação, engenharia, confiabilidade).
- Em interfaces de produto, EnvNeo aparece como **endosso institucional** (byline), não como marca concorrente.

## SSOT de arquivos

- Fonte canônica (versionável): `assets/brand/envneo/`
- Distribuição runtime: `public/brand/envneo/`

Arquivos MUST existir em ambos:

- `envneo-mark.svg`
- `envneo-mark-inverted.svg`
- `envneo-wordmark.svg`

## Regras de cor e tokens (hard)

- SVG MUST ser token-friendly: `fill="currentColor"` e/ou `stroke="currentColor"`.
- Runtime (`app/**`, `components/**`) MUST NOT conter HEX/%23 (Gate FE-01).
- Quando cores forem necessárias, MUST referenciar tokens (ex.: `color.brand.envneo.neutral.*`).

## Geometria

- `envneo-mark*.svg` MUST usar `viewBox="0 0 64 64"`.
- O símbolo MUST ser centrado visualmente e não distorcido.

## Clear space e tamanhos mínimos

- Clear space SHOULD ser >= 4u do grid do símbolo (referência: 64u).
- Tamanhos mínimos recomendados:
  - 16px: favicon/uso mínimo
  - 24px: UI padrão
  - 48px: impressos/apresentações

## Tipografia (wordmark)

- Wordmark “ENV NEO” MUST usar `font-mono` (IBM Plex Mono via stack do site).
- Para uso em runtime, SHOULD preferir inline SVG (evita dependência de fonte quando usado como `<img>`).

## Proibições (hard)

- PROIBIDO distorcer proporção (scale X/Y diferente).
- PROIBIDO aplicar gradiente, sombra, bevel ou efeitos não determinísticos.
- PROIBIDO hardcode de cor no SVG.
