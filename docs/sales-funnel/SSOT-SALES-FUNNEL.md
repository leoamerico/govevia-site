# SSOT-SALES-FUNNEL — Funil Self‑Service + CLM (SSOT)

## Objetivo

Definir, de forma **canônica** e **auditável**, o que é o funil Self‑Service (S0–S5) e como ele gera diagnósticos, evidências e um pacote de proposta/minuta (CLM) **sem overclaim**.

## Escopo (o que o funil faz)

- Coleta mínima de contexto institucional (conta pública) e intenção (tema/escopo).
- Gera um **Gap Report** (diagnóstico lab-safe) baseado em fontes públicas e/ou inputs explícitos.
- Consolida um **CLM Package** (proposta/minuta + anexos) com **manifest + hashes** para integridade e reprodutibilidade.
- Produz **Funnel Events** (trilha) — no lab: arquivos versionados.

## Não‑escopo (o que o funil NÃO faz)

- Não “pula” rito de contratação; não substitui processos formais do órgão.
- Não garante conformidade; no máximo **reduz risco** e **aumenta rastreabilidade**, condicionado a configuração/uso.
- Não infere dados internos não publicados; não “adivinha” fatos.

## Estágios (S0–S5)

- **S0 — Discovery:** intenção/tema, contexto institucional e contato.
- **S1 — Evidence Intake:** fontes públicas e evidências referenciadas.
- **S2 — Gap Report:** diagnóstico versionado (JSON) + limitações explícitas.
- **S3 — CLM Draft:** geração determinística de pacote de proposta/minuta.
- **S4 — Review & Limits:** revisão humana, ajustes, reforço de limites/condições.
- **S5 — Handoff:** entrega do pacote com integridade (manifest/hashes) e trilha.

## Entidades SSOT

- **Account (Conta Pública):** unidade institucional (ex.: prefeitura, câmara, autarquia).
- **Persona (view):** perspectiva (prefeito, procurador, controlador, secretário).
- **Contexto institucional (ctx):** categoria organizacional (prefeitura, câmara, etc.).
- **Gap Report:** diagnóstico estruturado (JSON) com achados, evidências e limitações.
- **CLM Package:** artefatos textuais (proposta/minuta/anexos) + manifest + hashes.
- **Funnel Events:** trilha de eventos (no lab: arquivos versionados no repo).

## Referências

- Guardrails de linguagem: `docs/sales-funnel/GUARDRAILS-OVERCLAIM.md`
- Minimização LGPD: `docs/sales-funnel/LGPD-MIN-DATA.md`
- Exemplo (evidência): `docs/public/evidence/sales-funnel/EVID-SAMPLE-GAP-REPORT.md`
