# ENVNEO-IDENTITY-SPEC — EnvNeo Identity v1 (SSOT)

Status: Normativo (MUST/SHOULD)

## Objetivo

Definir, de forma auditável e implementável em código, os artefatos oficiais da identidade EnvNeo v1.

## Metodologia baseada em métricas (racional)

As decisões desta identidade foram tomadas para maximizar desempenho em critérios objetivos.

- Escalabilidade: a geometria MUST permanecer legível de 16px a aplicações de grande formato.
- Pregnância (recall): a forma SHOULD ser composta por massas simples e contrastes fortes.
- Versatilidade: a marca MUST funcionar em fundos claros/escuros (via `currentColor`).
- Gestalt (equilíbrio): o símbolo SHOULD evitar detalhes finos e manter alinhamentos e pesos consistentes.

## Interpretação do nome (semântica)

- Env: ambiente/ecossistema/estrutura/abrangência.
- Neo: novo/futuro/inovação/movimento.

## Decisão oficial v1 (sem ambiguidade)

- Marca oficial (símbolo) MUST ser **Opção 1 — Monograma Arquitetônico (E+N)**.
- Opções 2 e 3 abaixo são registradas como alternativas avaliadas; MUST NOT ser implementadas em v1.

### Opções avaliadas (registro)

1) Opção 1 — Monograma arquitetônico (estrutura e solidez)
- Intenção: monograma abstrato E+N, massas geométricas, alta robustez em tamanhos mínimos.

2) Opção 2 — Órbita ascendente (inovação e movimento)
- Intenção: ambiente (orbital) + vetor ascendente por espaço negativo; maior dinamismo.

3) Opção 3 — Wordmark modernista (clareza e autoridade)
- Intenção: tipografia como marca; leitura máxima, baixa ambiguidade; pode evoluir com ligaduras proprietárias em versões futuras.

## Propósito de uso (arquitetura de marca)

- EnvNeo representa **infraestrutura/holding** (fundação, engenharia, confiabilidade).
- Em interfaces de produto, EnvNeo aparece como **endosso institucional** (byline), não como marca concorrente.

## SSOT de arquivos

- Fonte canônica (versionável): `assets/brand/envneo/`
- Distribuição runtime: `public/brand/envneo/`

Arquivos MUST existir em ambos:

- `envneo-mark.svg`
- `envneo-mark-inverted.svg`
- `envneo-wordmark.svg`

Para mitigação de cache/CDN, versões cache-busted também MUST existir em ambos e SHOULD ser preferidas por consumidores runtime:

- `envneo-mark.v2.svg`
- `envneo-mark-inverted.v2.svg`
- `envneo-wordmark.v2.svg`

## Regras de cor e tokens (hard)

- SVG MUST ser token-friendly: `fill="currentColor"` e/ou `stroke="currentColor"`.
- SVG MUST NOT conter valores de cor hardcoded (HEX, rgb(), etc.).
- Runtime (`app/**`, `components/**`) MUST NOT conter HEX/%23 (Gate FE-01).
- Quando cores forem necessárias, MUST referenciar tokens (ex.: `color.brand.envneo.neutral.*`).

## Regras de dependências externas em assets (hard)

- Assets em `public/**` MUST NOT conter `@font-face`, `@import`, `url(https?://...)`, `href="https?://..."` ou `xlink:href="https?://..."`.
- Wordmarks em SVG SHOULD evitar `<text>`; preferir formas (`path/rect/...`) para não depender de fontes.

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
