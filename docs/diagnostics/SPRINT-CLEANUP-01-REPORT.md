# SPRINT-CLEANUP-01 — Relatório de Diagnóstico

**Data:** 2026-02-19  
**Baseline (entrada):** 12/12 policy gates PASS · TSC 0 erros · HEAD post-SPRINT-DEMO-01

---

## Metodologia

Inventário por Node.js script (sem grep com tty, sem suposições).  
Regra: dead-code somente se **0 imports** fora do próprio arquivo (JSDoc não conta).  
Regra: stale pointer somente se control-plane referencia artefato ausente de runtime.

---

## TABELA DE ITENS SUSPEITOS

### 1. `components/platform/ModulesDetail.tsx`

| Campo | Valor |
|---|---|
| Tipo | dead-code |
| Refs no codebase | 2 |
| Refs externas | 0 (runtime) |
| Detalhe | `lib/plataforma/modules.ts` L6+L30: menciona em **JSDoc somente** (`* - components/platform/...`). Nenhum `import` real. A página usa `components/plataforma/` (com "a"), não `platform/`. |
| Risco | Nenhum — arquivo nunca executado |
| Decisão | **REMOVER** |

```
# Evidência
lib/plataforma/modules.ts L6:  *   - components/platform/ModulesDetail.tsx   ← JSDoc
lib/plataforma/modules.ts L30: /** SVG path `d` strings — renderizados por ModulesDetail ... */  ← JSDoc
```

---

### 2. `components/platform/PlatformHero.tsx`

| Campo | Valor |
|---|---|
| Tipo | dead-code |
| Refs no codebase | 1 (self) |
| Refs externas | 0 |
| Detalhe | Arquivo exporta `PlatformHero`, nunca importado. `app/plataforma/page.tsx` importa de `@/components/plataforma/` (com "a"). |
| Risco | Nenhum |
| Decisão | **REMOVER** |

---

### 3. `app/portal/login/PortalLoginForm.tsx`

| Campo | Valor |
|---|---|
| Tipo | dead-code (stub) |
| Refs no codebase | 1 (self) |
| Refs externas | 0 |
| Detalhe | Corpo: `return null`. Nunca importado por nenhuma outra rota ou page. |
| Risco | Nenhum |
| Decisão | **REMOVER** |

---

### 4. `service-registry.json` → `brand_assets.logo_component`

| Campo | Valor |
|---|---|
| Tipo | stale pointer |
| Valor atual | `"apps/ceo-console/components/brand/EnvNeoLogo.tsx"` |
| Runtime | `EnvNeoLogo.tsx` é referenciado **apenas** no smoke test; não há import em runtime (login page usa `org-identity.json` diretamente) |
| Fonte canônica | `logo_svg: "apps/ceo-console/public/brand/envneo/logo.svg"` (este sim existe e é a fonte) |
| Decisão | **CORRIGIR** → `"logo_component": null` |

---

### 5. `apps/ceo-console/components/brand/EnvNeoLogo.tsx`

| Campo | Valor |
|---|---|
| Tipo | smoke-only (não é dead-code técnico) |
| Refs runtime | 0 |
| Refs smoke test | 1 (`smoke-brand-envneo.mjs` verifica existência do arquivo) |
| Decisão | **MANTER** — smoke test intencional verifica que o componente existe como artefato de brand |

---

### 6. `lib/plataforma/modules.ts` — JSDoc stale

| Campo | Valor |
|---|---|
| Tipo | comentário stale (aponta para arquivo que será removido) |
| Decisão | **ATUALIZAR** JSDoc para remover referência a `components/platform/ModulesDetail.tsx` após remoção |

---

## Falsos Positivos Descartados

| Suspeito | Motivo para MANTER |
|---|---|
| `AdminAccessButton.tsx` | Importado em `app/layout.tsx` |
| `ImpersonationAutoSelect.tsx` | Importado em `app/blog/[slug]/page.tsx` |
| `lib/core/portalBrand.ts` | Importado por `Footer.tsx`, `Header.tsx`, `lib/brand/envneo.ts` |
| `app/portal/**` (login, callback, API) | Portal público legítimo de usuários; não viola fronteira admin |

---

## Plano de Execução

**FASE 2:** `git rm` dos 3 arquivos dead-code confirmados  
**FASE 3:** `service-registry.json` `logo_component → null` + JSDoc modules.ts + REGISTRY append  
**FASE 4:** Gates de saída (obrigatórios)
