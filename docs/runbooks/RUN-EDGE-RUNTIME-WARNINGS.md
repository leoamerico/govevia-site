# RUN-EDGE-RUNTIME-WARNINGS — Avisos de Edge Runtime (Next.js)

## Objetivo

Documentar o aviso do Next.js:

> "Using edge runtime on a page currently disables static generation for that page"

…para evitar que seja tratado como regressão.

## Contexto

No Govevia, as rotas de imagens sociais são geradas via App Router e usam Edge Runtime por design:

- `app/opengraph-image.tsx`
- `app/twitter-image.tsx`

Essas rotas são endpoints dinâmicos de imagem e não são páginas HTML estáticas.

## Interpretação correta do warning

- O aviso significa: **aquela rota específica** (Edge Runtime) não será pré-renderizada como estática.
- Isso **não** impede que o restante do site use SSG/ISR normalmente.
- Para OG/Twitter images, isso é **normal** e esperado.

## PASS/FAIL

### PASS

- `npm run build` completa com sucesso.
- O warning aparece apenas para as rotas de imagem (`/opengraph-image`, `/twitter-image`).

### FAIL

- O warning aparece para páginas HTML principais que deveriam ser estáticas (ex.: `/`, `/blog`, `/plataforma`) sem justificativa.

## Ação recomendada

- **Não alterar** `runtime = 'edge'` em `app/opengraph-image.tsx` e `app/twitter-image.tsx` apenas para remover o aviso.
- Se o warning começar a aparecer em outras rotas, investigar por `export const runtime = 'edge'` em `app/**`.
