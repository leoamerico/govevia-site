# PRESENT-CEO-CONSOLE — Apresentação Executável (CEO Console)

**Objetivo (2 minutos):** demonstrar que **documentos** (regras institucionais + invariáveis) viram **código executável**, com **identidade corporativa inviolável** e **evidência** (gates/smokes/registry).

---

## Comandos (prova executável)

```bash
cd /d/govevia-site
node tools/policy-gates/run-all.mjs
npx tsc --noEmit
cd apps/ceo-console && npx tsc --noEmit && npm run smoke:identity && cd ../..
```

---

## URLs de demo

- `/admin/login`
- `/admin/ops`
- `/admin/rules`

---

## Script de fala (bullet points curtos)

- Login mostra **ENV NEO LTDA** + **CNPJ** (Open Sans 12) — sem logo/slogan.
- Ops mostra **Fonte Única de Verdade (SOT)** do control-plane + Registry append-only.
- Rules executa simulação (UC/RN) → resultado PASS/FAIL → **evidence_hash** → evento `SIMULATION` no Registry.
- Gates provam enforcement: sem `/admin` no site-public, registry append-only, proibição de "Env Neo" isolado.

---

## Evidência (outputs reais)

Saída dos comandos (executados em 2026-02-19):

```text
## node tools/policy-gates/run-all.mjs

━━ Running: gate-tenant-auth-policy-no-hardcode.mjs
[PASS] tenant-auth-policy-no-hardcode — nenhum parâmetro de autenticação hardcoded encontrado.
	↳ [OK] gate-tenant-auth-policy-no-hardcode.mjs

━━ Running: gate-cybersecure-no-pii.mjs
[PASS] cybersecure-no-pii: docs/spec/SPEC-CYBERSECURE-EVALUATE-V1.yaml — sem campos PII.
	↳ [OK] gate-cybersecure-no-pii.mjs

━━ Running: gate-no-auto-language.mjs
[SKIP] no-auto-language: docs\governance\POL-NO-AUTO-01.md (arquivo de definição da regra, excluído)
[PASS] no-auto-language — nenhum "automátic*" sem qualificador encontrado.
	↳ [OK] gate-no-auto-language.mjs

━━ Running: gate-procuracao-require-evidence.mjs
[PASS] gate-procuracao-require-evidence: todos os handlers têm evidência de log.
	↳ [OK] gate-procuracao-require-evidence.mjs

━━ Running: gate-wip-one.mjs
[PASS] gate-wip-one: wip=1 (≤ 1). OK.
	↳ [OK] gate-wip-one.mjs

━━ Running: gate-registry-append-only.mjs
[PASS] gate-registry-append-only: 12 linhas preservadas + 0 nova(s). OK.
	↳ [OK] gate-registry-append-only.mjs

━━ Running: gate-no-admin-in-site-public.mjs
[OK] gate-no-admin-in-site-public: app/admin/ não existe. Fronteira respeitada.
	↳ [OK] gate-no-admin-in-site-public.mjs

━━ Running: gate-rules-have-impl.mjs
[PASS] gate-rules-have-impl: 5 engine_ref(s) implementados, 5 rule_id(s) verificados. Nenhuma lacuna.
	↳ [OK] gate-rules-have-impl.mjs

━━ Running: gate-impl-registered.mjs
[PASS] gate-impl-registered: 5 função(ões) exportada(s), todas registradas em institutional-rules.yaml.
	↳ [OK] gate-impl-registered.mjs

━━ Running: gate-no-envneo-shortname.mjs
[PASS] gate-no-envneo-shortname: 47 arquivo(s) verificado(s). Nenhum "Env Neo" isolado detectado. brand-registry.json íntegro.
	↳ [OK] gate-no-envneo-shortname.mjs

━━ Running: gate-no-env-neo-literal.mjs
[PASS] gate-no-env-neo-literal: 14 arquivo(s) verificado(s). Nenhum "Env Neo"/"ENV NEO" isolado detectado (apenas "ENV NEO LTDA").
	↳ [OK] gate-no-env-neo-literal.mjs

━━ Running: gate-control-plane-no-secrets.mjs
[PASS] gate-control-plane-no-secrets: connection-catalog.yaml íntegro (4 bloco(s) verificado(s)). Nenhum segredo em texto.
	↳ [OK] gate-control-plane-no-secrets.mjs

━━ Running: gate-no-hardcoded-endpoints.mjs
[PASS] gate-no-hardcoded-endpoints: 46 arquivo(s) verificado(s). Nenhum endpoint hardcoded detectado.
	↳ [OK] gate-no-hardcoded-endpoints.mjs

══════════════════════════════════════════════════
[GATES PASSED] Todos os policy gates passaram.
RUN_ALL_EXIT:0

## npx tsc --noEmit
ROOT_TSC_EXIT:0

## ceo-console: npx tsc --noEmit && npm run smoke:identity
CONSOLE_TSC_EXIT:0

> @govevia/ceo-console@1.0.0 smoke:identity
> node tools/smoke/smoke-corporate-identity.mjs

── Smoke: corporate identity (HTML)
  ✓ /admin/login contém ENV NEO LTDA
  ✓ /admin/login contém CNPJ completo
  ✓ /admin/login não contém shortname proibido isolado
  ✓ POST /api/admin/login → 200
  ✓ set-cookie presente (sessão admin)
  ✓ /admin/ops (auth) → 200
  ✓ /admin/ops contém ENV NEO LTDA
  ✓ /admin/ops contém CNPJ completo
  ✓ /admin/ops não contém shortname proibido isolado

══════════════════════════════════════════════════
[SMOKE PASSED] smoke-corporate-identity — 9/9 verificações OK.
SMOKE_ID_EXIT:0
```
