# design-tokens (Govevia)

Fonte única de verdade para tokens de marca/UI (cores, radius, tipografia e regras de stroke), com geração determinística de:

- `dist/tokens.css` (CSS variables)
- `dist/tailwind.preset.cjs` (preset Tailwind consumido por `tailwind.config.js`)

## Comandos

- `npm run tokens:build` gera `dist/` a partir de `packages/design-tokens/tokens.json`
- `npm run tokens:check` falha se `dist/` estiver divergente (gate de CI)
- `npm run a11y:contrast` valida pares de contraste definidos em `tokens.json`
