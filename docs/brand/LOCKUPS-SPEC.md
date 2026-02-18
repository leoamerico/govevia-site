# LOCKUPS-SPEC — Govevia (Produto) endossado por Env Neo (Holding)

Status: Normativo (MUST/SHOULD)

## Objetivo

Formalizar as versões permitidas/proibidas do lockup endossado e as regras operacionais de aplicação.

## SSOT de assets

- Runtime assets: `public/brand/**`
- Fonte SSOT de cromia/tipografia: `packages/design-tokens/tokens.json`

## Lockup padrão (texto) — obrigatório

- Forma canônica: **Govevia — por Env Neo**

Regras:

- “Govevia” MUST ser dominante.
- “por Env Neo” MUST ser secundário (tamanho menor, peso menor, contraste suficiente).
- “Env Neo” MUST usar `font-mono` quando disponível.

## Versões permitidas (runtime)

- Wordmark (Govevia): `public/brand/govevia-wordmark-on-white.png`
- Lockup (Govevia + byline textual): `public/brand/govevia-lockup-on-white.png`
- Mark (Govevia):
  - `public/brand/govevia-mark-on-white.png`
  - `public/brand/govevia-mark-on-black.png`
- Endosso da holding: texto apenas (sem asset de logo dedicado em runtime)

## Proibições (hard)

- PROIBIDO co-branding com Env Neo competindo visualmente com Govevia (mesmo peso/tamanho em herói).
- PROIBIDO usar símbolos de registro (®) ou texto “marca registrada/registrado no INPI” sem evidência formal.
- PROIBIDO definir cromia por HEX em runtime (`app/**`, `components/**`). Usar tokens.

## Aplicação recomendada

- Footer: MUST conter lockup textual (hierarquia: produto → endosso).
- Header: MAY conter apenas wordmark do produto (quando lockup comprometer hierarquia/legibilidade).
