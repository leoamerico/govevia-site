# Índice de Conhecimento (Normas, Evidências, Runbooks)

Este índice organiza o **payload de conhecimento** do repositório por função (**normativo**, **evidência auditável** e **runbook operacional**) e por domínio (**Brand**, **IP**, **Claims**).

> Regra de leitura: **Norma** define o que é obrigatório; **Runbook** define como verificar/executar; **Evidência** sustenta claims públicos e auditoria.

---

## Brand

### Normativo (Brand)

- `docs/brand/BRAND-ARCH-ENVNEO-GOVEVIA.md` — arquitetura de marca endossada (Env Neo holding / Govevia produto)
- `docs/brand/LOCKUPS-SPEC.md` — versões permitidas/proibidas do lockup (SSOT)
- `docs/brand/ENVNEO-IDENTITY-SPEC.md` — identidade Env Neo v1 (mark/wordmark, regras hard)

### Evidência pública (auditável) (Brand)

- `docs/public/evidence/brand/EVIDENCE-BRAND-ENDORSED-ARCH.md` — evidência da regra de endosso
- `docs/public/evidence/brand/EVIDENCE-BRAND-FOOTER-LOCKUP.md` — evidência do lockup no footer
- `docs/public/evidence/brand/EVIDENCE-BRAND-OG-IMAGE.md` — evidência de OG/Twitter images geradas
- `docs/public/evidence/brand/REPORT-ENVNEO-IDENTITY-V1.md` — evidência de entrega (assets + spec)

### Diretórios relacionados (Brand)

- `public/brand/` — assets públicos (runtime) servidos pelo site
- `docs/public/brand/` — guias públicos (quando existirem)

---

## IP / INPI

### Normativo (IP / INPI)

- `docs/legal/ip/LICENSE-CHAIN-OF-TITLE.md` — cadeia de titularidade (PF → PJ)
- `docs/legal/ip/INPI-SOFTWARE-DEPOSIT.md` — checklist de depósito de software (programa de computador)

### Evidência pública (auditável) (IP / INPI)

- `docs/public/evidence/ip/EVIDENCE-IP-TITLE-CHAIN.md` — evidência do claim de cadeia de titularidade
- `docs/public/evidence/ip/EVIDENCE-INPI-SOFTWARE-DEPOSIT.md` — evidência do claim de depósito/planejamento de depósito

---

## Runbooks (Operação e verificação)

- `docs/runbooks/RUN-DESIGN-TOKENS.md` — execução e validação de tokens (build/check/gates)
- `docs/runbooks/RUN-REPO-HYGIENE-LAB.md` — higienização arquitetural (lab-safe) + expurgo de scruta
- `docs/runbooks/RUN-EDGE-RUNTIME-WARNINGS.md` — interpretação do warning de Edge Runtime (OG/Twitter images)

---

## Governança (EnvNeo / Govevia / Env Live)

### Operating Model (SSOT)

- `docs/PROMPT-00.md` — Modelo de Excelência (regras hard, fronteiras, enforcement, DoD)
- `docs/GOVERNANCE-MANIFEST.yaml` — manifesto canônico do payload de governança

### Normas (Governança)

- `docs/governance/POL-LEGAL-CONTRACTING-ENTITY.md` — entidade contratante (ENV NEO LTDA) + CNPJ
- `docs/governance/SEAL-OMNICHANNEL-ENTITY-BRANDS.md` — regras de naming (Env Neo / Govevia / Env Live)
- `docs/governance/POL-GOVEVIA-AUDIT-MULTITENANT.md` — auditabilidade multi-tenant (RLS + trilha)
- `docs/governance/POL-IDENTITY-TENANT-NO-HARDCODE.md` — proibição de hardcode de identidade
- `docs/governance/POL-SUBCONTRACTORS-PJ-EVIDENCE.md` — evidência de PJ/subcontratados
- `docs/governance/POL-SEC-CYBERSECURE-NO-PII.md` — cibersegurança (sem PII em claims/spec)
- `docs/governance/REGISTRY-GOVERNANCE-EVENTS.md` — registry de eventos de governança (schema)

### Decisões (ADRs)

- `docs/architecture/decisions/ADR-003-REGIME-PROCURACAO-ATOS.md`
- `docs/architecture/decisions/ADR-004-SECRETS-REGIME-CEO-CONSOLE.md`
- `docs/architecture/decisions/ADR-005-ENVLIVE-TENANCY-ELEVATION.md`
- `docs/architecture/decisions/ADR-VIEW-SELECTION-PERSONAS.md`

### Apresentação / Demo

- `docs/present/PRESENT-CEO-CONSOLE.md` — roteiro de apresentação executável (gates/smokes)
- `docs/demo/RUN-DEMO-CEO-CONSOLE.md` — runbook de demo (comandos PASS/FAIL)

---

## Repo Hygiene (Lab)

### Evidência pública (auditável) (Repo)

- `docs/public/evidence/REPORT-CLEANUP-LAB.md` — relatório do expurgo de scruta (lab)

---

## Claims (Patches / Ajustes controlados)

> Estes arquivos são **patches** para aplicar no registry de claims existente, sem alterar schema fechado.

- `docs/public/claims/PATCH-NEW-CLAIMS.yaml`
- `docs/public/claims/PATCH-FORBIDDEN-LANGUAGE-IP.yaml`
- `docs/public/claims/PATCH-EVIDENCE-EXCLUSION.md`

---

## Sales Funnel + CLM (SSOT)

### Normas (Sales Funnel)

- `docs/sales-funnel/SSOT-SALES-FUNNEL.md`
- `docs/sales-funnel/GUARDRAILS-OVERCLAIM.md`
- `docs/sales-funnel/LGPD-MIN-DATA.md`

### Runbooks (Sales Funnel)

- `docs/runbooks/RUN-FUNNEL-GAP-REPORT.md`
- `docs/runbooks/RUN-CLM-PACKAGE.md`

### Evidência pública (auditável) (Sales Funnel)

- `docs/public/evidence/sales-funnel/EVID-SAMPLE-GAP-REPORT.md`
- `docs/public/evidence/sales-funnel/EVID-CLM-PACKAGE-HASH.md`

---

## Convenções do repositório para o payload de conhecimento

- **Normas (MUST/SHOULD)** ficam em `docs/brand/`, `docs/legal/ip/`, `docs/policy/`.
- **Evidências publicáveis/auditáveis** ficam em `docs/public/evidence/<dominio>/`.
- **Runbooks** ficam em `docs/runbooks/` e sempre incluem comandos PASS/FAIL.
