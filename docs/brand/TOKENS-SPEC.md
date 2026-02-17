# TOKENS-SPEC

## Finalidade

Normatizar tokens (cores, tipografia, radius e regras geométricas) para uso determinístico no frontend, com enforcement em CI.

> Regra: nenhum valor de marca (cor/radius/tipografia) deve existir apenas “solto” no Tailwind/CSS. A fonte única é `packages/design-tokens/tokens.json`.

## 1. Tipografia (superfamília)

- UI (Govevia): **IBM Plex Sans**
- Holding/endosso (EnvNeo): **IBM Plex Mono**

Implementação:

- Next Fonts define `--font-plex-sans` e `--font-plex-mono`.
- Tailwind consome via preset gerado (`packages/design-tokens/dist/tailwind.preset.cjs`).

## 2. Radius

- Token canônico: `--radius-2 = 8px`.
- Uso padrão em UI: botões, cards, inputs e containers com cantos arredondados.

## 3. Stroke de ícones (escala linear)

- Token canônico: `--icon-stroke = 2px @ 24px`.
- Regra: ao escalar ícone proporcionalmente, stroke escala linearmente com o tamanho (não “fixo”).

## 4. Cromia (tokens semânticos)

- EnvNeo (neutro): `brand.envneo.neutral.900 = #1A1A1A`.
- Preto absoluto (#000000) apenas para impressão/alto contraste (não default de UI).
- Cores de produto e institucionais existem em `packages/design-tokens/tokens.json`.

Acessibilidade:

- Rodar `npm run a11y:contrast` (WCAG AA) em CI.

## 5. Geometria (grid paramétrico — especificação mínima)

Para símbolos/ícones geométricos (quando aplicável), usar grid inteiro para reprodutibilidade:

- `viewBox`: 64×64
- “head/chip”: altura **20u**
- “ombro/base”: altura **32u**
- raio base (curva): **8u**
- stroke (se houver): tokenizado e escalável (ver seção 3)

> A relação 1:1.618 deve ser aproximada por razões inteiras (ex.: 32:20 = 1.6) para consistência em múltiplos tamanhos.
