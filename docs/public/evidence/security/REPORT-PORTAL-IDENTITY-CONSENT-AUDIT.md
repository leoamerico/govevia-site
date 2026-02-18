# Implementação Concluída — ETAPA 5.1 (Portal)

## 1) Resumo da POLICY aplicada (gates + estratégia)
- **Hash-only:** tokens de login são gerados no app e **somente o hash SHA-256 (hex)** é persistido.
- **Uso único + expiração:** sessão `login_token` é consumida uma vez (`token_used_at`) e rejeita expirados.
- **Fail-closed:** estados inválidos (contato disabled / token inexistente / expirado / já usado) resultam em `throw`.
- **LGPD-min-data:** sem persistir token puro, sem armazenar IP puro (apenas hash opcional) e metadados com limite.
- **Audit trail:** eventos canônicos registrados em `portal_audit_events`.

## 2) Artefatos criados/modificados (com paths)
- lib/db/schema.sql
- lib/portal/auth.ts
- docs/public/evidence/security/REPORT-PORTAL-IDENTITY-CONSENT-AUDIT.md
- docs/GOVERNANCE-MANIFEST.yaml
- CHANGELOG.md

## 3) DDL aplicado (trechos mínimos)
- `portal_contacts`: identidade mínima do contato (email + status).
- `portal_consents`: consentimento por tipo (granted/revoked) com coerência temporal.
- `portal_sessions`: `login_token` (hash-only) com expiração/uso único.
- `portal_audit_events`: trilha de auditoria com `metadata_json` limitado.

## 4) Superfície de dados (o que NÃO é coletado)
- Não persiste token puro.
- Não persiste IP bruto (apenas hash opcional).
- Não coleta geolocalização.
- Não coleta fingerprinting.

## 5) Quality gates/resultados (PASS/FAIL + comandos)
Executar e registrar na sequência:
- `npm run lint`
- `npm run build`
- `npm run tokens:check`
- `npm run security:csp`
- `npm run content-keys:check`
- `npm run -s stage:check -- --allow ...`

Resultados (captura textual):

`npm run lint`
```
✔ No ESLint warnings or errors
```

`npm run build`
```
OK: MDX ViewBlocks guardrails passed
history:check: OK
✓ Compiled successfully
✓ Generating static pages (19/19)
```

`npm run tokens:check`
```
OK: design tokens up-to-date
FE-01 PASS: preset ok, dist sem drift, e no-HEX em app/components.
OK: design tokens structure validated
OK: contrast checks passed
```

`npm run security:csp`
```
CSP allowlist check: OK
```

`npm run content-keys:check`
```
content-keys:check: OK
```

`npm run -s stage:check -- --allow ...`
```
stage-check: OK
```

## 6) Próximos passos (apenas o próximo incremento)
- ETAPA 5.2: rotas `/portal/login` + callback (anti-enumeração) + envio de e-mail com link mágico.
