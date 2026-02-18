# Evidência — Remoção de logo legado (ENV-NEO)

## Objetivo

Eliminar qualquer renderização/serving de assets do logo legado (ENV-NEO) no site, mantendo apenas os assets vigentes de marca (Govevia) em `public/brand/`.

## Escopo

- UI: Header/Footer
- Metadados: schema.org (Organization.logo)
- OG/Twitter: imagens geradas em `app/opengraph-image.tsx` e `app/twitter-image.tsx`
- Assets públicos: `public/brand/**`

## Referências legadas removidas

**URLs legadas (não devem existir):**

- `/brand/envneo-on-white.png`
- `/brand/envneo-on-black.png`
- `/brand/envneo.svg`
- `/brand/envneo/*`

**Onde existiam referências:**

- Header: imagem de endosso via `/brand/envneo-on-white.png`
- Metadados: `schemaOrg.@graph[0].logo` apontava para `/brand/envneo-on-white.png`

## Resultado esperado (PASS/FAIL)

PASS quando:

1) O Header/Footer não renderizam nenhuma imagem/SVG do logo legado.
2) `GET /brand/envneo-on-white.png` retorna 404 (ou equivalente) e não há fallback silencioso servindo o arquivo.
3) `schemaOrg` aponta `logo` para asset vigente (`/brand/govevia-mark-on-white.png`).
4) Network (DevTools) não mostra requests contendo `envneo` em paths de `/brand/`.

FAIL se:

- Qualquer request para `/brand/envneo*` retornar 200.
- Qualquer componente/metadata voltar a apontar para `/brand/envneo*`.

## Procedimento de verificação (reprodutível)

1) Subir local:

- `npm run dev`

2) Abrir:

- `http://localhost:3000/`

3) DevTools → Network:

- Filtrar por `envneo`
- Recarregar a página
- Resultado esperado: **0 requests**

4) Verificar diretamente a URL legada:

- `http://localhost:3000/brand/envneo-on-white.png`
- Resultado esperado: **404**

## Evidência visual

Screenshot (asset vigente usado como referência visual):

- `docs/evidence/assets/logo-fixed.png`

## Gates (comandos)

- `npm run lint`
- `npm run tokens:check`
- `npm run content-keys:check`
- `npm run security:csp`
- `npm run build`
