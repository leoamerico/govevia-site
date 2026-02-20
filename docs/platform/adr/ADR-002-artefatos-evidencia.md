# ADR-002: Estratégia de Geração e Versionamento de Artefatos de Evidência

**Status:** Aceito  
**Data:** 2026-02-20  
**Autor:** Leo Américo — CEO & Founder, ENV-NEO LTDA (Govevia) | Arquiteto de Software (senioridade máxima)  
**Revisores:** —  
**Relacionado a:** Gate G3 (Biblioteca de Evidências), PLANO-OPERACIONAL.md, Lote 3

---

## Contexto

O Govevia publica artefatos técnicos como evidência verificável de suas decisões arquiteturais. Os artefatos primários são:

1. **Apêndice Técnico de Arquitetura** (`docs/platform/appendix-architecture.mdx`) — documento de nível sênior, destinado a revisores externos, investidores e parceiros institucionais. Gerado iterativamente com formatação profissional (tabelas estruturadas, callouts, seções numeradas).
2. **ADR-001 — Canonicalização de Payload** (`docs/platform/adr/ADR-001-canonicalizacao-payload.md`) — registro de decisão interna, destinado ao time de desenvolvimento e auditoria técnica.

O Gate G3 do Plano Operacional exige que PDFs e DOCX desses artefatos estejam listados e baixáveis na Biblioteca de Evidências (`/evidencias`).

### Problema

Ferramentas de geração automática MDX/Markdown → PDF (Puppeteer, md-to-pdf, WeasyPrint) produzem output funcionalmente correto para documentação interna, mas com limitações visuais: ausência de callouts formatados, tabelas com renderização inconsistente, tipografia sem hierarquia visual clara.

O Apêndice Técnico é entregue a revisores externos de alto nível (arquitetos seniores, investidores, órgãos públicos). Qualidade de formatação é parte do sinal de credibilidade do produto — um documento mal formatado contradiz a tese de "governança executável com excelência técnica".

---

## Decisão

**Esta decisão foi tomada por Leo Américo na qualidade de CEO & Founder da ENV-NEO LTDA e Arquiteto de Software de senioridade máxima, com plena ciência dos trade-offs.**

### Artefato 1 — Apêndice Técnico de Arquitetura

**DOCX depositado manualmente** como artefato versionado em `public/assets/`.

- O DOCX é gerado com pipeline de alta qualidade (docx.js com estilos, tabelas, callouts, tipografia profissional) fora do build automatizado do site.
- O arquivo é commitado explicitamente a cada nova versão do documento, com mensagem de commit rastreável (`docs(assets): apêndice técnico vX.Y — <resumo da mudança>`).
- O MDX em `docs/platform/appendix-architecture.mdx` permanece como master de conteúdo. O DOCX é derivado desse master, mas não automaticamente — a derivação é um ato deliberado do arquiteto responsável.
- Nenhum script de build toca este arquivo. Gate G3 verifica apenas sua existência em `public/assets/`.

**Justificativa:** qualidade de formatação é requisito para o público-alvo deste artefato. Geração automática não atinge o padrão exigido no estado atual das ferramentas disponíveis. Honestidade sobre o que a automação entrega é preferível a automatizar e degradar qualidade.

### Artefato 2 — ADR-001 (e ADRs futuros)

**PDF gerado automaticamente no build** a partir do Markdown fonte.

- Script de geração usa md-to-pdf ou equivalente, executado em `npm run build`.
- Output depositado em `public/assets/adr/` com nome versionado pelo número do ADR.
- Gate G3 verifica existência do PDF gerado.

**Justificativa:** ADRs são documentos internos com audiência técnica. Qualidade de formatação básica é suficiente. Geração automática garante que o PDF nunca fique desatualizado em relação ao Markdown fonte — risco mais importante para documentos de referência interna.

---

## Consequências

### Positivas

- O Apêndice Técnico mantém qualidade de apresentação compatível com seu público-alvo.
- ADRs nunca ficam desatualizados — geração automática elimina esse risco para documentos internos.
- A distinção explícita entre os dois modelos é honesta e auditável: qualquer membro do time sabe por que cada artefato é tratado de forma diferente.

### Negativas / Trade-offs

- O Apêndice Técnico requer ação manual para atualizar o DOCX após mudanças no MDX. **Mitigação:** Gate G3 pode ser estendido no futuro para verificar se o hash do DOCX está atualizado em relação ao MDX (comparando timestamps de commit).
- Dois modelos de geração aumentam a superfície de manutenção do pipeline. **Mitigação:** estão explicitamente documentados aqui e no PLANO-OPERACIONAL.md.

---

## Critério de revisão

Esta decisão deve ser reavaliada se:

- Uma ferramenta de geração automática MDX → DOCX/PDF atingir qualidade equivalente ao pipeline atual (docx.js + estilos profissionais).
- O volume de versões do Apêndice Técnico tornar o depósito manual operacionalmente custoso.
- Um requisito regulatório exigir que todos os artefatos públicos sejam gerados de forma totalmente automatizada e auditável no CI.
