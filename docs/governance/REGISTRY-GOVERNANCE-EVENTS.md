# REGISTRY-GOVERNANCE-EVENTS — Registro Append-Only de Eventos de Governança

**Tipo:** Governance Registry  
**ID:** REGISTRY-GOVERNANCE-EVENTS  
**Versão:** 1.0.0  
**Data:** 2026-02-19  
**Status:** ATIVO  

---

## Propósito

O `governance_events` é o log imutável e append-only de todos os eventos
relevantes para governança, conformidade e auditoria da Govevia e de seus
tenants. Nenhum evento pode ser deletado ou alterado após inserção.

A integridade é garantida por hash chain (SHA-256), idêntica ao mecanismo
da tabela `audit_events` (ver `infra/migrations/20260216_123_audit_events_hashchain.sql`).

---

## Princípios

1. **Append-only**: `DELETE` e `UPDATE` PROIBIDOS via RLS + trigger
2. **Hash chain**: cada linha contém `prev_hash` + `event_hash = SHA256(prev_hash || payload)`
3. **Sem dados pessoais no payload**: apenas IDs, tipos, referências — nunca PII
4. **Retenção mínima**: 7 anos (obrigação fiscal + LGPD art. 16)

---

## Esquema canônico

```sql
CREATE TABLE governance_events (
  id              BIGSERIAL PRIMARY KEY,
  event_type      TEXT        NOT NULL,
  entity_id       UUID        NOT NULL,
  actor_id        UUID,                        -- NULL = sistema
  actor_type      TEXT        NOT NULL DEFAULT 'system',
  payload         JSONB       NOT NULL DEFAULT '{}',
  prev_hash       TEXT        NOT NULL,
  event_hash      TEXT        NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT governance_events_hash_unique UNIQUE (event_hash)
);

-- Imutabilidade via RLS
ALTER TABLE governance_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY no_update ON governance_events FOR UPDATE USING (false);
CREATE POLICY no_delete ON governance_events FOR DELETE USING (false);
```

---

## Catálogo de event_types

| event_type | Gatilho | Payload obrigatório |
|---|---|---|
| `contract.signed` | Assinatura de contrato | `{ contract_id, sha256, signed_by }` |
| `brand.switched` | Mudança de marca ativa | `{ from_brand_id, to_brand_id }` |
| `tenant.created` | Criação de tenant | `{ tenant_id, plan }` |
| `tenant.elevated` | Elevação de tenancy (ADR-005) | `{ from_tier, to_tier, approved_by }` |
| `subcontractor.approved` | Subcontratado aprovado | `{ vendor_id, evidence_ref }` |
| `subcontractor.revoked` | Subcontratado revogado | `{ vendor_id, reason }` |
| `policy.acknowledged` | Política aceita por operador | `{ policy_id, version }` |
| `procuracao.granted` | Procuração concedida | `{ procurador_id, scope, expires_at }` |
| `procuracao.revoked` | Procuração revogada | `{ procurador_id, reason }` |
| `audit.chain.verified` | Verificação de hash chain | `{ table, rows_verified, ok }` |
| `admin.login` | Login no ceo-console | `{ ip_hash, user_agent_hash }` |
| `admin.logout` | Logout do ceo-console | `{}` |

> Novos event_types DEVEM ser adicionados a este catálogo antes do uso em produção.

---

## Inserção de eventos

```typescript
// lib/governance/emitEvent.ts
export async function emitGovernanceEvent(
  client: SupabaseClient,
  event: {
    event_type: string
    entity_id: string
    actor_id?: string
    actor_type?: string
    payload: Record<string, unknown>
  }
): Promise<void> {
  // Busca hash do último evento para encadeamento
  const { data: last } = await client
    .from('governance_events')
    .select('event_hash')
    .order('id', { ascending: false })
    .limit(1)
    .single()

  const prevHash = last?.event_hash ?? '0'.repeat(64)
  const payloadStr = JSON.stringify({ ...event, prevHash })
  const eventHash = await sha256hex(payloadStr)

  await client.from('governance_events').insert({
    ...event,
    actor_type: event.actor_type ?? 'system',
    prev_hash: prevHash,
    event_hash: eventHash,
  })
}
```

---

## Verificação de integridade

```bash
# Verifica hash chain via script SQL
psql $DATABASE_URL -f tools/db/verify_audit_chain.sql

# Ou via runbook:
# docs/runbooks/RUN-VERIFY-AUDIT-CHAIN.md
```

---

## Acesso e consulta

- **Leitura**: service role (backend) ou usuário com permissão `governance:read`
- **Escrita**: somente via `emitGovernanceEvent()` — nunca INSERT direto do cliente
- **Exportação**: endpoint `/api/audit/export` (autenticado, rate-limited)

---

## Referências

- `infra/migrations/20260216_123_audit_events_hashchain.sql`
- `tools/db/verify_audit_chain.sql`
- `docs/runbooks/RUN-VERIFY-AUDIT-CHAIN.md`
- POL-AUDIT-INTEGRITY (docs/policy/POL-AUDIT-INTEGRITY.md)
