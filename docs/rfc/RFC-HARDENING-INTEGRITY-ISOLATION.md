# RFC-HARDENING-INTEGRITY-ISOLATION

## Contexto
Para reduzir risco institucional em auditoria e controle interno, dois pilares técnicos são tratados como requisitos de arquitetura:

- **Integridade de trilha de auditoria**: registros append-only e verificáveis.
- **Isolamento por município (tenant)**: enforcement no banco (RLS) com semântica fail-closed.

## Decisões
1. `audit_events` é protegido no banco com trigger de imutabilidade (append-only).
2. A integridade é detectável via hash-chain (SHA-256) e função `verify_audit_chain()`.
3. RLS é habilitado e forçado em tabelas com `tenant_id`, com policy baseada em `app.current_tenant_id`.
4. **Fail-closed**: ausência de tenant context implica zero rows.

## Limites (boundaries)
- Superusuário Postgres pode desabilitar triggers/policies. Mitigação: governança, auditoria de DDL, restrição de roles e monitoramento.
- Integridade detectável não equivale a “prova absoluta” contra todos os cenários de ameaça.

## Evidências no repo
- Migrations em `infra/migrations/20260216_122_*.sql` e `infra/migrations/20260216_123_*.sql`.
- Smoke test: `tests/hardening/test_hardening_smoke.py`.
- Script operacional: `tools/db/verify_audit_chain.sql`.
