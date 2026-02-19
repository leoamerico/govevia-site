# RUN-DEMO-CEO-CONSOLE — Roteiro de Apresentação

**Entidade:** ENV NEO LTDA · CNPJ: 36.207.211/0001-47  
**Sistema:** CEO Console (`apps/ceo-console`) — porta 3001  
**Gerado por:** SPRINT-DEMO-01 · 2026-02-19

---

## Checklist "antes da reunião"

Execute estes passos **antes** de abrir o browser para a demo.

### 1. Variáveis de ambiente obrigatórias

Crie (ou confirme) `apps/ceo-console/.env.local` com:

```env
# Autenticação admin — bcrypt hash da senha
ADMIN_USERNAME=leo
ADMIN_PASSWORD_HASH=$2b$10$<hash-gerado-com-bcrypt>
ADMIN_JWT_SECRET=<string-aleatória-mínimo-32-chars>
ADMIN_JWT_TTL_SECONDS=28800
```

Gerar hash de senha (rodando uma vez localmente):

```bash
node -e "require('bcryptjs').hash('SUA_SENHA', 10).then(console.log)"
```

### 2. Gates verdes (obrigatório antes de apresentar)

```bash
# Na raiz do monorepo
node tools/policy-gates/run-all.mjs
# Esperado: [GATES PASSED] Todos os policy gates passaram.
```

**PASS esperado:** 12/12 gates.  
**FAIL:** qualquer saída diferente de `GATES_EXIT:0` — corrigir antes de continuar.

### 3. TypeScript — 0 erros

```bash
npx tsc --noEmit                                      # site-public
cd apps/ceo-console && npx tsc --noEmit && cd ../..   # ceo-console
```

### 4. Iniciar servidor de desenvolvimento

```bash
cd apps/ceo-console && npm run dev
# Servidor: http://localhost:3001
```

### 5. Confirmar conteúdo dos dados operacionais

```bash
# REGISTRY deve ter ao menos 11 linhas (eventos históricos)
wc -l envneo/ops/REGISTRY-OPS.ndjson

# CEO Queue deve ter ao menos 1 item em backlog, max 1 em wip
cat envneo/ops/CEO-QUEUE.yaml | grep -E "^(backlog|wip|done):"
```

---

## Roteiro em 10 passos

### PASSO 1 — Abrir login como ponto de partida

**URL:** `http://localhost:3001/admin/login`

**O que mostrar:**
- Identidade corporativa **ENV NEO LTDA** e **CNPJ: 36.207.211/0001-47** em Open Sans 12, sem logo, sem slogan.
- Campo usuário + senha. Sem "Env Neo" isolado em nenhum lugar.

**Prova PASS:**
```bash
# Confirmar que identidade vem do SSOT jurídico (não hardcoded)
cat envneo/control-plane/ltda/org-identity.json | grep -E '"razao_social"|"cnpj"'
# Esperado: "ENV NEO LTDA" e "36.207.211/0001-47"
```

**Prova FAIL:**
```bash
# Zero ocorrências de "Env Neo" como nome de marca no codebase
node tools/policy-gates/gate-no-envneo-shortname.mjs
# Esperado: [PASS]
```

---

### PASSO 2 — Fazer login

**Ação:** Preencher usuário e senha (conforme `.env.local`) → clicar "Entrar".

**O que acontece internamente:**
- POST `/api/admin/login` → bcrypt compare → JWT emitido como cookie.
- Middleware valida cookie em todas as rotas `/admin/**`.
- Redirect para `/admin`.

**Prova PASS:**
```bash
# Simular login via curl (substitua SENHA e URL real)
curl -s -o /dev/null -w "%{http_code}" \
  -X POST http://localhost:3001/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"leo","password":"SUA_SENHA"}'
# Esperado: 200
```

**Prova FAIL:**
```bash
curl -s -o /dev/null -w "%{http_code}" \
  -X POST http://localhost:3001/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"leo","password":"senha_errada"}'
# Esperado: 401
```

---

### PASSO 3 — Navegar via header para /admin/ops

**O que mostrar no header:**
- Barra de navegação com links **Ops** e **Regras**.
- Canto direito: **ENV NEO LTDA** + **CNPJ: 36.207.211/0001-47** (Open Sans 12).
- Ambos lidos dinamicamente do Control Plane — sem hardcode.

**URL:** `http://localhost:3001/admin/ops`

---

### PASSO 4 — Cockpit Ops: OrgUnits

**O que mostrar:**
- Cards de **ENVNEO**, **GOVEVIA**, **ENVLIVE** com contagem de itens.
- ENVNEO = entidade mãe; GOVEVIA e ENVLIVE = marcas.

**Ponto de narrativa:** "Cada 'subprefeitura' tem autonomia operacional mas responde à ENV NEO LTDA contratualmente."

---

### PASSO 5 — Cockpit Ops: Árvore de Receita

**O que mostrar:**
- Mapa visual de `TREE-REVENUE.yaml`: raízes → tronco → galhos → folhas.
- Cada nó tem org_unit, label e objective.

**Prova que é data-driven:**
```bash
wc -l envneo/strategy/TREE-REVENUE.yaml
# Qualquer número > 0 — arquivo é a fonte canônica
```

---

### PASSO 6 — Cockpit Ops: CEO Queue (Kanban)

**O que mostrar:**
- Colunas **Backlog / WIP (máx 1) / Done**.
- Item em WIP em destaque (border azul).
- Se WIP > 1: banner vermelho de violação aparece automaticamente.

**Prova do gate WIP:**
```bash
node tools/policy-gates/gate-wip-one.mjs
# Esperado: [PASS] gate-wip-one: wip=1 (≤ 1). OK.
```

---

### PASSO 7 — Cockpit Ops: Registry com filtro por tipo

**O que mostrar:**
- Lista de eventos com dropdown de filtro: TODOS / DECISION / GATE / CHANGE / RUNBOOK / VIOLATION / NOTE / **SIMULATION**.
- Filtrar por **SIMULATION** para mostrar evidências de simulações anteriores.
- Cada linha SIMULATION exibe `evidence_hash` e resultado (PASS/FAIL).

---

### PASSO 8 — Navegar para /admin/rules

**URL:** `http://localhost:3001/admin/rules`

**O que mostrar:**
- Dropdown com 5 casos de uso (UC01–UC05) carregados do Control Plane.
- Selecionar um UC → campos do payload são inferidos automaticamente.

---

### PASSO 9 — Executar simulação de regra (evidence ao vivo)

**Ação:** Preencher payload → clicar **Executar**.

**O que mostrar:**
- Badge **PASS** (verde) ou **FAIL** (vermelho) em destaque.
- Bloco **EVIDENCE HASH (SHA-256)** — hash completo do payload, sem exposição de dados.
- Confirmação: "Evento SIMULATION registrado em envneo/ops/REGISTRY-OPS.ndjson".

**Prova imediata (sem recarregar):** Voltar para `/admin/ops` → filtrar por SIMULATION → o novo evento **aparece instantaneamente**.

---

### PASSO 10 — Provar rastreabilidade fim-a-fim

**Ação:** Mostrar o arquivo físico atualizado.

```bash
# Ver o último evento SIMULATION registrado
tail -5 envneo/ops/REGISTRY-OPS.ndjson | node -e "
const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\n');
lines.forEach(l => { try { const o=JSON.parse(l); if(o.type==='SIMULATION') console.log(JSON.stringify(o,null,2)); } catch{} });
"
```

**O que o evento mostra:** `ts`, `org_unit`, `type: SIMULATION`, `use_case_id`, `result`, `hash_payload` — **nunca o payload bruto**.

**Ponto de narrativa:** "O hash é o recibo imutável. Qualquer replay do mesmo payload gerará o mesmo hash. Isso é evidência verificável."

---

## Comandos PASS/FAIL — referência rápida

| Verificação | Comando | Exit esperado |
|---|---|---|
| Todos os gates | `node tools/policy-gates/run-all.mjs` | `0` |
| Gate WIP=1 | `node tools/policy-gates/gate-wip-one.mjs` | `0` |
| Gate sem "Env Neo" | `node tools/policy-gates/gate-no-envneo-shortname.mjs` | `0` |
| Gate registry append-only | `node tools/policy-gates/gate-registry-append-only.mjs` | `0` |
| TSC root | `npx tsc --noEmit` | `0` |
| TSC ceo-console | `cd apps/ceo-console && npx tsc --noEmit` | `0` |
| Login válido | `curl -s -w "%{http_code}" -X POST localhost:3001/api/admin/login -H "Content-Type: application/json" -d '{"username":"leo","password":"SENHA"}'` | `200` |
| Login inválido | `curl ...senha_errada...` | `401` |
| Middleware protege rota | `curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/admin` | `307` (redirect para login) |
| REGISTRY gravado | `tail -1 envneo/ops/REGISTRY-OPS.ndjson` | Linha JSON com `type: SIMULATION` |

---

## Saída dos gates na baseline (SPRINT-DEMO-01)

```
node tools/policy-gates/run-all.mjs → GATES_EXIT:0
npx tsc --noEmit (root)             → ROOT_TSC_EXIT:0
npx tsc --noEmit (ceo-console)      → CONSOLE_TSC_EXIT:0
```

Todos os 12 policy gates: **PASS**.

---

## Arquivos alterados neste sprint (SPRINT-DEMO-01)

| Arquivo | Mudança |
|---|---|
| `apps/ceo-console/app/admin/layout.tsx` | Identidade corporativa ENV NEO LTDA + CNPJ no header de navegação (Open Sans 12, canto direito) |
| `apps/ceo-console/app/admin/ops/FilterableEventList.tsx` | **Novo** — client component com filtro de eventos por type (inclui SIMULATION) |
| `apps/ceo-console/app/admin/ops/page.tsx` | Integra FilterableEventList; adiciona SIMULATION ao type union; mostra evidence_hash por linha |
| `apps/ceo-console/app/admin/rules/PlaygroundClient.tsx` | Evidence hash exibido em bloco verde proeminente após simulação |
