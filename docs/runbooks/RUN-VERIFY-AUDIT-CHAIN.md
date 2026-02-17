# RUN-VERIFY-AUDIT-CHAIN — Verificação de integridade (hash-chain)

## Objetivo
Executar o verificador operacional de integridade da trilha de auditoria.

## Pré-requisitos
- Acesso ao Postgres do ambiente (credenciais de leitura/execução de função).
- Migrations aplicadas (hash-chain + imutabilidade).

## Execução
```bash
psql -h <host> -U <user> -d <db> -f tools/db/verify_audit_chain.sql
```

### Filtrar por tenant (opcional)
```bash
psql -h <host> -U <user> -d <db> -c "SET app.verify_tenant_id = '<uuid>'" -f tools/db/verify_audit_chain.sql
```

## Interpretação
- ✅ `CHAIN INTACT`: cadeia íntegra no intervalo analisado.
- ❌ `CHAIN BROKEN`: tratar como incidente (ver política POL-AUDIT-INTEGRITY).
