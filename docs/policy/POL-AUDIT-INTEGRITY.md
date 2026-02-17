# POL-AUDIT-INTEGRITY — Integridade de trilha de auditoria (hash-chain)

## Objetivo
Definir obrigações operacionais mínimas para sustentar claims de integridade e auditabilidade (hash-chain + append-only) com evidência reprodutível.

## Regras
- O ambiente deve manter `audit_events` como append-only (bloqueio de UPDATE/DELETE).
- A verificação de integridade da cadeia (`verify_audit_chain`) deve ser executada:
  - diariamente; e
  - a cada deploy que altera schema/DB.

## Resposta a incidente
- Se `verify_audit_chain` retornar `FALSE`:
  - tratar como evento de risco (possível adulteração ou corrupção);
  - coletar logs, identificar janela temporal afetada;
  - preservar evidências e acionar responsáveis.

## Evidência operacional
- O script [tools/db/verify_audit_chain.sql](tools/db/verify_audit_chain.sql) é a referência executável.
