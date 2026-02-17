# EnvNeo — Identity Assets (SSOT)

Status: Normativo (MUST/SHOULD)

## Arquivos

- `envneo-mark.svg` — símbolo oficial v1 (Opção 1: monograma arquitetônico E+N)
- `envneo-mark-inverted.svg` — mesma geometria; uso em fundos escuros via `currentColor`
- `envneo-wordmark.svg` — wordmark “ENV NEO” (preferir inline; pode depender de fonte)

## Regras HARD

- SVG MUST ser token-friendly: usar `currentColor` (sem cores hardcoded).
- `envneo-mark*.svg` MUST usar `viewBox="0 0 64 64"`.
- Geometria MUST ser simples e robusta (sem linhas finas).

## Distribuição (runtime)

Os SVGs são espelhados em `public/brand/envneo/` para uso direto no site.
