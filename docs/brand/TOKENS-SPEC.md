# TOKENS-SPEC

## Finalidade

Normatizar tokens (cores, tipografia, radius e regras geométricas) para uso determinístico no frontend, com enforcement em CI.

> Regra: nenhum valor de marca (cor/radius/tipografia) deve existir apenas “solto” no Tailwind/CSS. A fonte única é `packages/design-tokens/tokens.json`.

## 1. Tipografia (superfamília)

- UI (Govevia): **IBM Plex Sans**
- Holding/endosso (Env Neo): **IBM Plex Mono**

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

- Env Neo (neutro) MUST ser consumido via token: `color.brand.envneo.neutral.900`.
- Preto absoluto MUST ser consumido via token: `color.brand.envneo.neutral.1000` e seu uso é restrito a impressão/alto contraste (não default de UI).
- Azul institucional profundo MUST ser consumido via token: `color.brand.govevia.primary.900`.
- Cores de produto e institucionais MUST existir em `packages/design-tokens/tokens.json` e serem consumidas via aliases do preset Tailwind.

Acessibilidade:

- Rodar `npm run a11y:contrast` (WCAG AA) em CI.

## 5. Geometria (grid paramétrico — especificação mínima)

Para símbolos/ícones geométricos (quando aplicável), usar grid inteiro para reprodutibilidade:

- `viewBox`: 64×64
- “head/chip”: altura **20u**
- “ombro/base”: altura **32u**
- raio base (curva): **8u**
- stroke (se houver): tokenizado e escalável (ver seção 3)

Tolerâncias (verificáveis):

- Medidas MUST usar unidades inteiras (u) no grid.
- Proporção `base:chip` MUST ser **32u:20u**.
- Tolerância permitida: chip ∈ [19u, 21u] e base ∈ [31u, 33u], mantendo raio 8u.

> Nota: não usar “proporção áurea” como argumento; o requisito auditável é a grade + tolerância.
