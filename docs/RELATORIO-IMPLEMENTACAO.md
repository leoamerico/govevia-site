# Relatório de Implementação — Govevia Platform

**Data de emissão:** 19 de fevereiro de 2026  
**Branch:** `main`  
**Commit HEAD:** `80baf40` (atualizado em 19/02/2026)
**Total de commits:** 182

---

## 1. Visão Geral

Este relatório consolida o estado de implementação do sistema Govevia, cobrindo o `ceo-console` (frontend/BFF) e os componentes de backend. O objetivo é oferecer rastreabilidade entre entregas de sprints, artefatos gerados e integrações em produção.

---

## 2. Frontend — `apps/ceo-console` (Next.js 14, TypeScript, Bun, porta 3001)

### 2.1 Sprints entregues

| Sprint | Commit | Data | Descrição |
|--------|--------|------|-----------|
| A | `c187b5e` | 2026-02 | `KernelStatus` widget + rota `/api/admin/kernel/ping` |
| B | `ed85b50` | 2026-02 | Federação de autenticação (service account JWT, cache 55 min) + proxy normas-legais |
| C | `8aaca7a` `01b31b1` `626ee68` | 2026-02 | Task Queue full-cycle (dispatch/poll), ingestão de documentos (multipart), hooks `usePollTask` + `usePollDocJob` |
| C-e2e | `b832c62` | 2026-02 | Smoke test E2E — auth, task dispatch/poll, doc upload/poll, normas — ALL GREEN |
| D | `487b508` | 2026-02-19 | Rota proxy de busca semântica, `SearchTab` migrada para fetch autenticado, `actions.ts` reduzido a tipos |

### 2.2 Módulos de página (`app/admin/`)

| Rota | Arquivo | Estado |
|------|---------|--------|
| `/admin` | `page.tsx` | ✅ Dashboard CEO |
| `/admin/login` | `login/page.tsx` + `LoginForm.tsx` | ✅ Autenticação com session cookie |
| `/admin/rag` | `rag/page.tsx` + `RagDemoClient.tsx` | ✅ Upload · Busca · Tasks — todos via proxy |
| `/admin/legislacao` | `legislacao/page.tsx` | ✅ Normas legais federadas do backend |
| `/admin/bpmn` | `bpmn/page.tsx` | ✅ Editor de processos administrativos BPMN |
| `/admin/pi` | `pi/page.tsx` | ✅ Módulo de Propriedade Intelectual |
| `/admin/rules` | `rules/page.tsx` + `PlaygroundClient.tsx` | ✅ Playground de regras |
| `/admin/ops` | `ops/page.tsx` + `FilterableEventList.tsx` | ✅ Log de eventos filtráveis |
| `/admin/control-plane` | `control-plane/page.tsx` | ✅ Painel de controle operacional |
| `/admin/site` | `site/page.tsx` | ✅ Customização de conteúdo do site público |

### 2.3 Rotas proxy BFF (`app/api/admin/`)

| Método | Rota BFF | Destino no backend | Autenticada |
|--------|----------|--------------------|-------------|
| `GET` | `/api/admin/kernel/ping` | `GET /api/v1/ping` | ✅ JWT service account |
| `GET` | `/api/admin/kernel/task/[taskId]` | `GET /api/v1/tasks/{id}` | ✅ |
| `POST` | `/api/admin/kernel/task/dispatch` | `POST /api/v1/tasks/dispatch` | ✅ |
| `GET` | `/api/admin/kernel/task/handlers` | `GET /api/v1/tasks/handlers` | ✅ |
| `POST` | `/api/admin/documents/ingest` | `POST /api/v1/documentos/upload` | ✅ multipart |
| `GET` | `/api/admin/documents/ingest/status/[jobId]` | `GET /api/v1/documentos/status/{id}` | ✅ |
| `POST` | `/api/admin/documents/search` | `POST /api/v1/search` | ✅ stub automático |
| `GET` | `/api/admin/legislacao` | `GET /api/v1/normas` | ✅ |
| `POST` | `/api/admin/login` | autenticação interna | N/A |
| `POST` | `/api/admin/logout` | limpeza de cookie | N/A |
| `GET/PATCH` | `/api/admin/site/content` | override de conteúdo | ✅ |
| `GET` | `/api/admin/bpmn` | processos BPMN | ✅ |
| `GET` | `/api/admin/pi` | propriedade intelectual | ✅ |
| `GET` | `/api/healthz` | health check interno | — |

### 2.4 Hooks React

| Hook | Arquivo | Comportamento |
|------|---------|---------------|
| `usePollTask` | `hooks/usePollTask.ts` | Poll `GET /api/admin/kernel/task/{id}` a cada 1,5 s; para em `success\|failed`; timeout 3 min |
| `usePollDocJob` | `hooks/usePollDocJob.ts` | Poll `GET /api/admin/documents/ingest/status/{id}` a cada 1,5 s; detecta 404 (restart de container) com mensagem amigável |

### 2.5 Biblioteca `lib/`

| Módulo | Responsabilidade |
|--------|-----------------|
| `lib/kernel/client.ts` | `kernelGet`, `kernelFetch`, `kernelFetchForm` — HTTP autenticado para o backend; cache JWT 55 min |
| `lib/auth/admin.ts` | Validação de sessão, federação de identidade service account |
| `lib/auth/constants.ts` | Constantes de autenticação (`CEO_SERVICE_EMAIL`, TTL, cookie name) |

### 2.6 Tipos compartilhados

| Interface | Arquivo | Campos |
|-----------|---------|--------|
| `ChunkResult` | `app/admin/rag/actions.ts` | `chunk_id`, `document_id`, `score`, `excerpt` |
| `DocJobState` / `DocJobStatus` | `lib/kernel/client.ts` | estado de job de ingestão |
| `TaskState` / `TaskStatus` | `lib/kernel/client.ts` | estado de task queue |
| `DispatchRequest` / `DispatchResponse` | `lib/kernel/client.ts` | payload de dispatch |
| `NormaLegalBackend` | `lib/kernel/client.ts` | norma legal federada |

### 2.7 Comportamento de stub / degradação

Todas as rotas proxy implementam degradação graciosa: quando o backend está indisponível (`KernelUnavailableError` ou resposta não-ok), a rota retorna dados stub com `kernelAvailable: false`. O frontend exibe banner informativo ao usuário sem quebrar a navegação.

---

## 3. Backend — `govevia_backend` (FastAPI, porta 8000)

> **Seção reservada para preenchimento pela equipe de backend.**

### 3.1 Informações gerais

| Item | Valor |
|------|-------|
| Framework | FastAPI (Python) |
| Versão Python | 3.11+ |
| Porta | 8000 |
| Container | `govevia_backend` (imagem `govevia-core:latest`) |
| Banco de dados | `govevia_db` — PostgreSQL + pgvector |
| Cache | `govevia_redis` — Redis 7-alpine (`redis://redis:6379/0`) |
| Autenticação | JWT — access token (sub=email) + refresh token (DB); hash HMAC-SHA256 |
| Embeddings | Ollama `nomic-embed-text` 768d via `http://host.docker.internal:11434` |
| LLM | Llama 3.1 (Ollama) — usado em `POST /api/v1/chat/` |
| Docs interativas | `http://localhost:8000/docs` |

### 3.2 Endpoints implementados

**Auth**

| Método | Endpoint | Auth | Descrição |
|--------|----------|------|-----------|
| `POST` | `/api/v1/auth/login` | open | JWT access + refresh token |
| `POST` | `/api/v1/auth/refresh` | open | Renova access token via refresh token |
| `GET` | `/api/v1/auth/me` | Bearer | Dados do usuário autenticado |
| `POST` | `/api/v1/auth/logout` | Bearer | Revoga refresh token |

**Documentos (Ingestão RAG)**

| Método | Endpoint | Auth | Descrição |
|--------|----------|------|-----------|
| `POST` | `/api/v1/documents/upload` | Bearer | Upload PDF → job assíncrono (202) |
| `GET` | `/api/v1/documents/upload/status/{job_id}` | Bearer | Poll do job de ingestão |
| `GET` | `/api/v1/documents/` | Bearer | Lista documentos do usuário |
| `GET` | `/api/v1/documents/{id}` | Bearer | Documento por ID |
| `DELETE` | `/api/v1/documents/{id}` | Bearer | Remove documento |

**Normas Legais**

| Método | Endpoint | Auth | Descrição |
|--------|----------|------|-----------|
| `GET` | `/api/v1/normas-legais/` | open | Lista normas (paginado, `total`+`items`) |
| `GET` | `/api/v1/normas-legais/{id}` | open | Norma por ID |
| `POST` | `/api/v1/normas-legais/` | Bearer admin | Cria norma |
| `PUT` | `/api/v1/normas-legais/{id}` | Bearer admin | Atualiza norma |
| `DELETE` | `/api/v1/normas-legais/{id}` | Bearer admin | Remove norma |

**Task Queue**

| Método | Endpoint | Auth | Descrição |
|--------|----------|------|-----------|
| `POST` | `/api/v1/tasks/dispatch` | Bearer | Despacha task (202, retorna `task_id`) |
| `GET` | `/api/v1/tasks/{task_id}` | Bearer | Poll do estado da task |
| `GET` | `/api/v1/tasks/handlers` | Bearer | Lista handlers — `['ping', 'normas_sync']` |

**Chat / RAG**

| Método | Endpoint | Auth | Descrição |
|--------|----------|------|-----------|
| `POST` | `/api/v1/chat/` | Bearer | Conversa com RAG (Llama 3.1 + pgvector) |

**Sistema / Portal**

| Método | Endpoint | Auth | Descrição |
|--------|----------|------|-----------|
| `GET` | `/api/v1/health` | open | Health check básico |
| `GET` | `/api/v1/system/metrics` | Bearer superuser | Telemetria (CPU, mem, docs, usuários) |
| `POST` | `/api/v1/portal/magic-link/request` | open | Solicita magic link por email |
| `POST` | `/api/v1/portal/magic-link/verify` | open | Troca token → JWT |
| `GET` | `/api/v1/sovereign/status` | Bearer | Estado do kernel atômico |

### 3.3 Modelos de dados (Bounded Contexts — ADR-050)

| Modelo | Bounded Context | Tabela | Campos principais |
|--------|----------------|--------|-------------------|
| `User` | identity | `users` | `id`, `email`, `role`, `is_active` |
| `RefreshToken` | identity | `refresh_tokens` | `user_id`, `token`, `revoked_at` |
| `PortalMagicLink` | identity | `portal_magic_link_tokens` | `email`, `token`, `expires_at` |
| `NormaLegal` | core | `normas_legais` | `id`, `titulo`, `numero`, `vigencia`, `texto` |
| `Document` | intelligence | `ai_documents` | `id`, `owner_id`, `filename`, `embedding` (pgvector 768d), `encrypted_content` |

**Pipeline de ingestão:** SHA-256 → pypdf/pdfplumber → chunk (~1000 chars, overlap 200) → Ollama embed → Fernet encrypt → pgvector

**Migrations Alembic:** `cc3030bcf566` — aplicada. Tabelas Liquibase (Java, 44) excluídas do `include_object`.

### 3.4 Migrações de banco de dados

| Arquivo | Data | Descrição |
|---------|------|-----------|
| `20260216_120_initial_schema.sql` | 2026-02-16 | Schema inicial |
| `20260216_122_compliance_shield_rls.sql` | 2026-02-16 | RLS Compliance Shield |
| `20260216_123_audit_events_hashchain.sql` | 2026-02-16 | Hash-chain de eventos de auditoria |

### 3.5 Cobertura de testes (backend)

| Tipo | Ferramenta | Resultado | Observações |
|------|-----------|-----------|-------------|
| Smoke test E2E (Sprint C) | Python `scripts/sprint_c_e2e.py` | ✅ ALL GREEN | Auth, task dispatch/poll, doc upload/poll, normas |
| Hardening | `tests/hardening/test_hardening_smoke.py` | *(a executar)* | — |

### 3.6 Variáveis de ambiente (backend)

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `DATABASE_URL` | Sim | `postgresql://postgres:postgres@db:5432/govevia` |
| `REDIS_URL` | Sim | `redis://redis:6379/0` |
| `JWT_SECRET_KEY` | Sim | Mín. 64 chars em produção |
| `PASSWORD_HMAC_KEY` | Sim | Chave HMAC-SHA256 para hash de senhas |
| `FERNET_KEY` | Sim | 44-char URL-safe base64 — cipher de documentos |
| `GOVEVIA_MASTER_KEY` | Sim | Deriva Fernet se `FERNET_KEY` ausente |
| `DOCUMENT_ENCRYPTION_KEY` | Sim | Igual a `FERNET_KEY` |
| `OLLAMA_HOST` | Sim | `http://host.docker.internal:11434` (modelos: llama3.1, nomic-embed-text) |

---

## 4. Integrações end-to-end

### 4.1 Smoke test E2E — Sprint C (commit `b832c62`)

Script: `scripts/sprint_c_e2e.py`

| Cenário | Resultado |
|---------|-----------|
| Autenticação service account | ✅ GREEN |
| Dispatch de task + poll até `success` | ✅ GREEN |
| Upload de documento + poll até `done` | ✅ GREEN |
| Listagem de normas legais | ✅ GREEN |

### 4.2 Testes de hardening

Diretório: `tests/hardening/test_hardening_smoke.py`

| Cenário | Resultado |
|---------|-----------|
| *(a preencher após execução)* | *(a preencher)* |

---

## 5. Variáveis de ambiente — Frontend (`apps/ceo-console`)

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `GOVEVIA_KERNEL_BASE_URL` | Sim | URL base do backend FastAPI (ex.: `http://localhost:8000`) |
| `CEO_SERVICE_EMAIL` | Sim | E-mail do service account do ceo-console |
| `CEO_SERVICE_PASSWORD` | Sim | Senha do service account |
| `NEXTAUTH_SECRET` *(ou equivalente)* | *(a confirmar)* | Secret de sessão |

---

## 6. Pendências e próximos passos

### 6.1 Divergências de rota BFF × Backend

| # | Divergência | Correção aplicada | Status |
|---|-------------|-------------------|--------|
| D1 | BFF `ping` chamava `/api/v1/system/metrics` (requer Bearer superuser, sem auth na chamada) | `ping/route.ts` → `GET /api/v1/health` (endpoint open) | ✅ corrigido |
| D2 | BFF `search` chama `/api/v1/search` (não implementado no backend) | Stub automático mantido; comentário na rota atualizado | ⏳ backend Sprint E+ |
| D3 | `client.ts` usava `/api/v1/documentos/upload` | Já corrigido: `client.ts` usa `/api/v1/documents/upload` | ✅ OK |
| D4 | BFF legislação usava `/api/v1/normas` | Já corrigido: todas as rotas usam `/api/v1/normas-legais/` | ✅ OK |

### 6.2 Itens pendentes

| # | Área | Item | Prioridade |
|---|------|------|-----------|
| 1 | Backend | Implementar `POST /api/v1/search` — retornar `{ chunks: ChunkResult[] }` | Alta |
| 2 | QA | Executar `tests/hardening/test_hardening_smoke.py` e registrar resultados | Alta |
| 3 | Frontend | Sprint E — Chat RAG UI (`POST /api/v1/chat/`), painel de métricas (`GET /api/v1/system/metrics`) | Média |
| 4 | Infra | Validar pipeline CI/CD para deploy do `ceo-console` | Média |
| 5 | Docs | Atualizar `CHANGELOG.md` com entregas dos sprints A–D | Baixa |

---

## 7. Histórico de commits relevantes

```
487b508  feat(sprint-d): search proxy route, SearchTab migrated to proxy fetch, actions.ts types-only
b832c62  test(sprint-c): e2e smoke test — auth, task dispatch/poll, doc upload/poll, normas
626ee68  feat(sprint-c): document ingestion — kernelFetchForm, ingest proxy routes, usePollDocJob, UploadTab live polling
01b31b1  feat(sprint-c): dispatch + handlers proxy routes; TasksTab with live polling in RAG demo
8aaca7a  feat(sprint-c): async task polling — getTaskState, task proxy route, usePollTask hook
ed85b50  feat(sprint-b): federacao auth + proxy normas-legais para backend
c187b5e  feat(sprint-a): kernel status widget + ping route
```

---

*Relatório gerado em 19/02/2026. Seções marcadas com "(a preencher)" devem ser completadas pela equipe responsável pelo backend antes da próxima revisão.*
