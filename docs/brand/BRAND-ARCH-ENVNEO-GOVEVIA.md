# BRAND-ARCH — Env Neo (Holding) + Govevia (Produto)
Versão: 1.0  
Status: Normativo (MUST/SHOULD)  
Escopo: Site institucional, materiais públicos, dashboard (quando aplicável), documentação técnica.

## 1. Finalidade
Este documento define a **Arquitetura de Marca Endossada** (Endorsed Branding) entre:
- **Env Neo**: holding tecnológica (autoridade institucional).
- **Govevia**: produto (ponta, interface pública, governança executável).

Objetivo: garantir consistência semiótica e jurídica **auditável**, evitando colisão de posicionamento e **evitando overclaim** (ex.: “marca registrada”, “registrado no INPI”) sem evidência.

## 2. Definições (termos e papéis)
### 2.1 Env Neo (Holding)
- Papel: **infraestrutura, plataforma, operação e comercialização**.
- Semiótica: “kernel / fundação / engenharia / confiabilidade”.
- Uso: aparece como **endosso** do produto (byline), não como marca concorrente do produto.

### 2.2 Govevia (Produto)
- Papel: **marca de produto** (site, dashboard, módulos, proposta institucional).
- Semiótica: “governança aplicada / interface / execução / evidência”.
- Uso: marca **primária** nas interfaces e materiais do produto.

## 3. Regra de endosso (obrigatória)
### 3.1 Lockup textual padrão (obrigatório)
**Govevia — por Env Neo**

Regras:
- “Govevia” MUST ser a parte dominante do lockup.
- “por Env Neo” MUST ser secundário (tamanho menor, peso menor).
- “Env Neo” MUST usar família tipográfica monoespaçada (mono) quando disponível.

Implementação mínima obrigatória:
- Metadados/OG: MUST refletir a entidade legal (PJ) sem carregar/servir assets de logo legados.

> Nota: o Header pode permanecer neutro (sem endosso) quando a hierarquia visual estiver comprometida.

## 4. Tipografia (P0)
A tipografia segue a superfamília **IBM Plex** para coerência multi-produto.

- Produto (Govevia): **IBM Plex Sans** (UI/legibilidade).
- Holding (Env Neo): **IBM Plex Mono** (code-first / infra).
- Quando houver uso editorial (títulos institucionais): **IBM Plex Serif** MAY ser usada de forma controlada.

Implementação:
- `app/layout.tsx` MUST carregar Plex via `next/font` e aplicar variáveis no `<body>`.
- `tailwind.preset.cjs` MUST mapear `font-sans`, `font-mono` e `font-serif` para Plex.

## 5. Cromia (P0)
As cores MUST ser consumidas via tokens (SSOT) e NÃO via HEX em `app/**` e `components/**`.

Fonte única:
- `packages/design-tokens/tokens.json`

Regras:
- UI MUST usar classes Tailwind tokenizadas (via preset) ou variáveis CSS do `tokens.css`.
- Inline styles (ex.: OG, e-mail HTML) MUST usar `packages/design-tokens/dist/tokens.runtime.ts`.
- HEX hardcoded (`#...` ou `%23...`) em `app/**` e `components/**` é PROIBIDO (Gate FE-01).

## 6. Aplicação digital (site, OG e evidência)
### 6.1 Footer
- Footer MAY exibir byline textual com a entidade legal (PJ), sem uso de logo/ícone de endosso.

### 6.2 OpenGraph/Twitter (obrigatório)
- `app/opengraph-image.tsx` e `app/twitter-image.tsx` MUST existir.
- MUST consumir cores/tipografia via `tokens.runtime.ts` (sem HEX hardcoded).

### 6.3 Evidência pública (auditável)
Para rastreabilidade, manter evidências públicas em:
- `docs/public/evidence/brand/`

Arquivos recomendados:
- `EVIDENCE-BRAND-ENDORSED-ARCH.md`
- `EVIDENCE-BRAND-FOOTER-LOCKUP.md`
- `EVIDENCE-BRAND-OG-IMAGE.md`

## 6.4 Identidade Env Neo (v1)

- Especificação pode existir como histórico/audit trail em `docs/brand/ENVNEO-IDENTITY-SPEC.md`.
- Assets de logo de endosso NÃO devem ser distribuídos em runtime (`public/brand/**`).

## 7. Regras de uso de marca (Do / Don’t)
### 7.1 Do (permitido)
- Usar “Govevia” como marca primária em páginas do produto.
- Usar “Env Neo” como endosso discreto (texto), quando aplicável.
- Referenciar a holding como “Env Neo (holding tecnológica)” em contexto corporativo.

### 7.2 Don’t (proibido)
- PROIBIDO afirmar “marca registrada”, “registrado no INPI”, ou usar “®” sem evidência formal.
- PROIBIDO sugerir que toda licença de software é “averbada no INPI” (isso depende de regime/ato específico).
- PROIBIDO co-branding com “Env Neo” competindo visualmente com “Govevia” (mesmo peso/tamanho no herói).

## 8. Nota jurídica mínima (anti-overclaim)
Este repositório separa:
- **Direito de marca** (identidade, sinal distintivo) — pode ter registro/andamento próprio.
- **Direito autoral de software** (programa de computador) — depósito e evidências operacionais próprias.

Documentos internos correlatos:
- `docs/legal/ip/LICENSE-CHAIN-OF-TITLE.md`
- `docs/legal/ip/INPI-SOFTWARE-DEPOSIT.md`
- `docs/legal/ip/INPI-TRADEMARK-CLASSES.md`

## 9. Enforcement (regras hard do repo)
- Gate FE-01 MUST falhar se houver HEX (`#...` ou `%23...`) em `app/**` e `components/**`.
- `packages/design-tokens/dist/**` MUST estar sincronizado com `tokens.json` (drift proibido).
- Evidências em `docs/public/evidence/**` NÃO devem ser bloqueadas por “forbidden_language” (para permitir explicações técnicas/jurídicas).

## 10. Controle de mudanças
Qualquer alteração nesta arquitetura MUST:
1) Atualizar `docs/public/evidence/brand/` (se afetar comunicação pública),
2) Passar `npm run tokens:build`, `npm run tokens:check`, `npm run build`,
3) Manter a hierarquia: **Govevia primário, Env Neo endosso**.

