# POL-GOVEVIA-AUDIT-MULTITENANT — Govevia Multi-Tenant e Auditoria

**Tipo:** Política de Governança Técnica  
**ID:** POL-GOVEVIA-AUDIT-MULTITENANT  
**Versão:** 1.0.0  
**Data:** 2026-02-19  
**Status:** ATIVO  
**Autor:** CTO  

---

## Propósito

Esta política define as obrigações técnicas e de processo que a Govevia
DEVE cumprir ao operar um ambiente multi-tenant: isolamento de dados,
auditabilidade por tenant, e os policy gates obrigatórios que verificam
conformidade antes de qualquer deploy.

---

## 1. Modelo de Tenancy

A Govevia opera em modelo **multi-tenant com isolamento via RLS** (Row-Level
Security no PostgreSQL/Supabase). Cada tenant é identificado por `tenant_id`
(UUID), propagado via JWT claim e aplicado via RLS em todas as tabelas de dados.

```
tenant (id, entity_id, plan, tier)
  └── todos os dados do tenant isolados por RLS
        └── audit_events (append-only, por tenant)
        └── governance_events (append-only, global + por tenant)
```

Referência de implementação:
- `infra/migrations/20260216_122_compliance_shield_rls.sql`
- `apps/shared/middleware/tenant_rls.py`

---

## 2. Invariantes de Isolamento

| # | Invariante | Verificação |
|---|---|---|
| I-01 | Nenhuma query retorna dados de tenant diferente do claim JWT | RLS obrigatória em todas as tabelas de dados |
| I-02 | `tenant_id` não pode ser alterado por requisição do cliente | Imutável após criação; só alterável por migração administrativa com evento |
| I-03 | Backup de dados é segregado por tenant | Bucket separado ou prefixo `tenant_id/` com IAM por prefixo |
| I-04 | Logs de aplicação não contêm dados pessoais de outros tenants | Estruturado + filtrado antes de envio a observability tools |
| I-05 | Tenant não pode consultar `audit_events` de outro tenant | RLS + coluna `tenant_id` em `audit_events` |

---

## 3. Auditoria por Tenant

### 3.1 Obrigações do produto

- Todo ato relevante em dados de tenant DEVE gerar entrada em `audit_events`
- `audit_events` é append-only com hash chain (ver `20260216_123_audit_events_hashchain.sql`)
- Tenant pode exportar seus próprios `audit_events` via API autenticada
- Retenção mínima: 5 anos (recomendado 7 anos para tenants do setor público)

### 3.2 O que DEVE ser auditado

| Evento | Obrigatório |
|---|---|
| Login / logout de usuário do tenant | SIM |
| Criação, edição, exclusão de qualquer entidade de negócio | SIM |
| Mudança de configuração do tenant | SIM |
| Acesso a relatórios ou exportações | SIM |
| Chamadas a APIs externas em nome do tenant | SIM |
| Erros de autorização (tentativas negadas) | SIM |
| Mudança de plano ou tier (ADR-005) | SIM |

### 3.3 O que NUNCA deve estar em `audit_events.payload`

- Senhas, tokens, chaves de API
- Dados pessoais completos (CPF, RG, número de cartão)
- Conteúdo de documentos (apenas referência/ID)

---

## 4. Policy Gates Obrigatórios

Os seguintes gates DEVEM passar antes de qualquer deploy para produção:

```bash
node tools/policy-gates/run-all.mjs
```

| Gate | O que verifica | Falha bloqueia deploy? |
|---|---|---|
| `gate-tenant-auth-policy-no-hardcode` | Credenciais hardcoded em specs | SIM |
| `gate-cybersecure-no-pii` | PII em arquivos de spec/config | SIM |
| `gate-no-auto-language` | Linguagem proibida por POL-NO-AUTO-01 (sem qualificador de evidência) | SIM |
| `gate-procuracao-require-evidence` | Handlers de procurador sem log de evidência | SIM (WARN se sem handlers) |

Gates são executados como pré-requisito do build (`prebuild` no `package.json`).

### 4.1 Adição de novos gates

Qualquer novo invariante de segurança ou governança que seja verificável
estaticamente DEVE ter um gate correspondente. Procedimento:

1. Criar `tools/policy-gates/gate-<id>.mjs`
2. Adicionar a `GATES` em `run-all.mjs`
3. Adicionar fixtures de teste em `gates.test.mjs`
4. Documentar nesta tabela

---

## 5. Acesso da Govevia a Dados de Tenants

A Govevia (operadora) pode acessar dados de tenants **apenas** nas seguintes
condições:

| Situação | Autorização necessária |
|---|---|
| Suporte técnico solicitado pelo tenant | Ticket aberto pelo tenant + log de acesso |
| Investigação de incidente de segurança | Aprovação do CTO + evento em `governance_events` |
| Obrigação legal (ordem judicial) | Ordem judicial + notificação ao tenant (quando legalmente permitido) |
| Migração de infraestrutura | Aprovação do tenant + janela de manutenção comunicada |

**Nunca** para: análise de negócio, treinamento de IA, benchmarks comparativos.

---

## 6. Elevação de Tenancy (Single-Tenant)

Tenants com requisitos especiais de isolamento podem ser elevados para
single-tenant dedicado sem migração destrutiva. Ver ADR-005.

A elevação DEVE gerar evento `tenant.elevated` em `governance_events`.

---

## 7. Conformidade e Certificações

| Requisito | Status |
|---|---|
| LGPD — art. 46 (medidas de segurança) | Cobertura por RLS + hash chain + MFA |
| LGPD — art. 16 (retenção de dados) | Retenção configurável por tenant |
| ISO 27001 (aspiracional) | Controles mapeados, certificação pendente |
| SOC 2 Type II (aspiracional) | Roadmap 2026 |

---

## 8. Revisão desta Política

- Revisão obrigatória: a cada 12 meses ou após incidente de segurança
- Aprovadores: CTO + DPO
- Evento de atualização: `policy.acknowledged` em `governance_events`

---

## Referências

- `infra/migrations/20260216_122_compliance_shield_rls.sql`
- `infra/migrations/20260216_123_audit_events_hashchain.sql`
- `apps/shared/middleware/tenant_rls.py`
- ADR-005 — EnvLive Tenancy Elevation
- REGISTRY-GOVERNANCE-EVENTS
- POL-AUDIT-INTEGRITY
- `tools/policy-gates/run-all.mjs`
