# GUARDRAILS-OVERCLAIM — Linguagem permitida/proibida (Funil + Conteúdo)

## Objetivo

Impor regras duras para evitar **overclaim** em funil, conteúdo e materiais gerados.

## Proibido (hard)

- “garante”, “100%”, “à prova”, “conformidade garantida”
- “contratação automática”, “dispensa rito”, “substitui jurídico”
- qualquer promessa de resultado sem condicionantes verificáveis

## Permitido (com cuidado)

- “reduz risco”, “gera evidência”, “suporta auditoria”
- “condicional ao rito aplicável”, “conforme implementação e configuração”

## Obrigatório

- Cada view/persona/contexto deve conter:
  - **Limites e Condições**
  - **Evidências** (com links para `docs/public/evidence/...`)

## Fonte de verdade

- Conteúdo SSOT: `content/blog/<slug>.mdx`
- Evidências auditáveis: `docs/public/evidence/**`
- Runbooks: `docs/runbooks/**`
