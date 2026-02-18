# Implementação Concluída — ETAPA 5.2 (Portal Magic-Link)

## 1) Resumo da POLICY aplicada (gates + estratégia)
- **Anti-enumeração:** a API de login sempre responde 202 (não revela existência/estado do contato).
- **Hash-only:** token de login e token de sessão são persistidos apenas como SHA-256 hex.
- **Uso único:** `login_token` é consumido uma vez (`token_used_at`).
- **Sessão HttpOnly:** cookie `govevia_portal_session` com `HttpOnly`, `SameSite=Lax`, `Secure` em produção.
- **Rate-limit (básico, fail-closed):** por `ip_hash` (sem armazenar IP bruto), contando eventos recentes.
- **LGPD-min-data:** sem geolocalização; sem IP bruto; user-agent truncado.

## 2) Rotas implementadas
- `POST /api/portal/login`
- `GET /portal/login`
- `GET /portal/callback?token=...`
- `GET /portal` (protegida)

## 3) Artefatos criados/modificados (com paths)
- lib/db/schema.sql (ajuste do CHECK para kind=session)
- infra/migrations/20260218_110_portal_sessions_allow_session_kind.sql
- lib/portal/auth.ts (issueSession + validateSession + helpers)
- app/api/portal/login/route.ts
- app/portal/login/page.tsx
- app/portal/login/PortalLoginForm.tsx
- app/portal/callback/route.ts
- app/portal/page.tsx
- docs/public/evidence/security/REPORT-PORTAL-MAGICLINK-SESSION.md
- docs/GOVERNANCE-MANIFEST.yaml
- CHANGELOG.md

## 4) Checklist de segurança (o que NÃO coletamos)
- Não persistimos token puro.
- Não persistimos IP bruto.
- Não coletamos geolocalização.
- Não expomos motivo de falha no callback (mensagem genérica).

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
✓ Generating static pages (24/24)
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
- ETAPA 5.3: consent UX + opt-out + templates aprovados (sem texto livre por IA em produção).
