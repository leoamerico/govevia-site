# Brand Assets — Govevia

## Inventário

| Arquivo | Tipo | Tamanho | Status | Consumidores |
|---|---|---|---|---|
| `govevia-mark-on-white.svg` | SVG — G estilizado (fundo claro) | 1.5 KB | **Canônico** | Convertido em `components/brand/GoveviaMarkSvg.tsx` (componente React) |
| `govevia-mark-on-white.png` | PNG raster (fundo claro) | 3 KB | **Ativo** | `app/layout.tsx` (schema.org `logo`), `app/icon.png` (favicon) |
| `govevia-lockup-on-white.png` | PNG lockup (marca + wordmark, fundo branco) | 11 KB | **Reservado** | Nenhum consumidor ativo. Mantido para uso em documentos impressos |
| `govevia-mark-on-black.svg` | SVG — G estilizado (fundo escuro) | 15 KB | **Reservado** | Nenhum consumidor ativo. Asset de versão anterior ou tool diferente |
| `govevia-mark-on-black.png` | PNG raster (fundo escuro) | 3 KB | **Reservado** | Nenhum consumidor ativo |
| `govevia-wordmark-on-white.png` | PNG só texto (fundo branco) | 5.7 KB | **Reservado** | Nenhum consumidor ativo. Mantido para uso em documentos/apresentações |

## Fonte de verdade

O componente canônico da marca visual é:

```
components/brand/GoveviaMarkSvg.tsx
```

Este componente exporta o SVG como React puro. Header e Footer importam dele.
Qualquer alteração visual na marca deve ser feita neste componente.

## Regras

1. **Nunca ler SVG do filesystem** em runtime ou build time — usar o componente React.
2. **Nunca duplicar o SVG inline** em componentes — importar `GoveviaMarkSvg`.
3. Assets marcados como **Reservado** não devem ser deletados sem decisão explícita do CEO.
4. O PNG em `app/icon.png` é servido diretamente pelo Next.js como favicon — sem redirects.
5. O `govevia-mark-on-white.png` é referenciado no schema.org (`app/layout.tsx`) para SEO.
