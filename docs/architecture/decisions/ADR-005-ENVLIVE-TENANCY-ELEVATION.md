# ADR-005 — EnvLive: Single-Tenant Elevável sem Migração Destrutiva

**Tipo:** Architecture Decision Record  
**ID:** ADR-005  
**Versão:** 1.0.0  
**Data:** 2026-02-19  
**Status:** ACEITO  
**Autor:** CTO  
**Aprovadores:** CEO, CTO  

---

## Contexto

A Govevia opera em modelo multi-tenant compartilhado (shared schema + RLS).
Para clientes com requisitos elevados de isolamento — governos estaduais,
grandes municípios, órgãos federais ("EnvLive") — existe a necessidade de
oferecer garantias de single-tenant **sem exigir uma migração de dados
destrutiva ou um contrato completamente novo**.

**EnvLive** é o nome comercial do tier dedicado: ambiente isolado com banco
de dados exclusivo, compute dedicado, e SLA diferenciado.

O problema a resolver: como elevar um tenant do tier compartilhado para
single-tenant de forma reversível, auditável e sem janela de indisponibilidade?

---

## Decisão

Adotar o modelo de **elevação progressiva com cutover controlado**:

```
[multi-tenant shared]  →  [shadow single-tenant]  →  [cutover]  →  [single-tenant ativo]
```

Nenhuma etapa é irreversível antes do cutover. O rollback é possível até o
momento do corte de tráfego.

---

## Arquitetura da Elevação

### Fase 1 — Shadow provisioning (sem impacto no tenant)

1. Provisionar banco de dados dedicado para o tenant (mesmo schema)
2. Iniciar replicação lógica dos dados do tenant via `pg_logical` ou dump+restore incremental
3. Provisionar compute dedicado (novo namespace K8s ou nova instância)
4. Configurar DNS de shadow (`tenant-id.envlive.govevia.com.br`) apontando para ambiente dedicado
5. Validar paridade de dados (hash check)

### Fase 2 — Validação (tenant participa)

1. Tenant acessa ambiente shadow em modo read-only de validação
2. Govevia executa smoke tests funcionais contra ambiente shadow
3. Tenant confirma paridade visual e funcional
4. SLA do ambiente dedicado documentado e aceito

### Fase 3 — Cutover (janela mínima)

1. Agendar janela de manutenção com tenant (sugestão: 15min)
2. Pôr multi-tenant em modo read-only para o tenant
3. Sincronização final dos deltas
4. Redirecionar tráfego para ambiente dedicado (DNS flip ou load balancer)
5. Desativar replicação do multi-tenant
6. Emitir evento `tenant.elevated` em `governance_events`

### Fase 4 — Pós-cutover

1. Monitorar ambiente dedicado por 48h
2. Manter dados no multi-tenant por 30 dias (período de rollback contratual)
3. Após 30 dias: `DELETE` dos dados do tenant no multi-tenant + evento de confirmação

---

## Invariantes (não negociáveis)

| # | Invariante |
|---|---|
| INV-01 | Zero perda de dados durante a elevação |
| INV-02 | Rollback possível (tenant volta para multi-tenant) até o cutover |
| INV-03 | Evento `tenant.elevated` DEVE ser emitido antes de qualquer comunicação externa |
| INV-04 | Dados do tenant não podem existir em dois bancos ativos simultaneamente após o cutover |
| INV-05 | O tenant deve ser notificado por escrito (e-mail + registro contratual) antes do início da Fase 1 |

---

## Dados de configuração do tenant elevado

Após elevação, o tenant recebe:

```yaml
tier: "envlive"
database_url: "[URL exclusiva]"
compute_namespace: "[namespace K8s dedicado]"
domain: "[tenant-id].envlive.govevia.com.br"
sla_uptime: "99.95%"
support_tier: "enterprise"
backup_retention_days: 30
elevated_at: "[ISO8601]"
elevated_by: "[admin_id]"
```

Estas configurações são armazenadas no plano de controle (não no banco do
tenant), acessíveis apenas via ceo-console.

---

## Reversibilidade

A reversão (downgrade de EnvLive para multi-tenant) segue o processo inverso
e DEVE ser solicitada formalmente pelo tenant com antecedência mínima de 30 dias.
Reversão não está disponível se houver dados criados no ambiente dedicado após
o período de 30 dias do cutover (pois o multi-tenant terá sido limpo).

---

## Consequências

**Positivas:**
- Cliente pode contratar EnvLive após validação do produto no tier compartilhado
- Sem migração manual de dados pelo cliente
- Rollback contratualmente seguro até o cutover
- Auditabilidade completa via `governance_events`

**Negativas / Riscos:**
- Operação complexa: requer orquestração precisa entre banco de dados, DNS e compute
- Custo de shadow provisioning (banco e compute dedicados durante validação)
- Requer janela de manutenção (mínima, mas necessária)

**Mitigações:**
- Runbook detalhado obrigatório antes de qualquer elevação
- Dry-run em ambiente de staging antes do cutover de produção
- Checklist de aprovação CTO antes de iniciar Fase 1

---

## Alternativas Rejeitadas

| Alternativa | Motivo da rejeição |
|---|---|
| Migração manual (dump/restore + novo contrato) | Destrutiva, exige downtime longo, risco de perda de dados |
| Elevação instantânea (apenas config flag) | Não garante isolamento real; viola INV-04 |
| Infraestrutura separada desde o início | Inviável comercialmente para clientes no tier de validação |

---

## Referências

- POL-GOVEVIA-AUDIT-MULTITENANT
- REGISTRY-GOVERNANCE-EVENTS — evento `tenant.elevated`
- `infra/migrations/20260216_122_compliance_shield_rls.sql`
- SEAL-OMNICHANNEL-ENTITY-BRANDS — separação entidade × marca no contexto dedicado
