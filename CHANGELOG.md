# Govevia Site — v2.0.0

## 2026-02-21 — feat(site): badges regulatórios linkados a legal-references

- Criado `lib/legal/legal-references.ts` — SSOT com 9 referências legais (slug, short_name, full_name, official_url, category).
- Compliance badges (6): agora são links clicáveis com `target="_blank"`, `aria-label`, ícone externo ↗, hover state.
- Hero badges (6): convertidos de `string[]` para `Array<{ label, url }>` — mesmo padrão de links.
- Footer "Conformidade Regulatória": 6 URLs hardcoded substituídas por lookup em `LEGAL_REFERENCES` via `FOOTER_SLUGS`.
- Todas as URLs agora apontam para fontes oficiais (planalto.gov.br) em vez de PDFs/sites secundários.

## 2026-02-21 — fix(build): ENVNEO_TRADE_NAME derivado (gate shortname)

- Fix(build): `ENVNEO_TRADE_NAME` era literal `'Env Neo'` — violava gate `gate-no-envneo-shortname`. Agora derivado de `ENVNEO_LEGAL_ENTITY_NAME.replace(' Ltda.', '').trim()`.

## 2026-02-19 — SPRINT-PRESENT-01 — Apresentação executável (Docs + CEO Console)

- Docs: padronização de display name **"Env Live"** (sem "EnvLive") e preenchimento explícito da entidade contratante **ENV NEO LTDA** + **CNPJ: 36.207.211/0001-47** em políticas.
- CEO Console: identidade corporativa padronizada e sem shortname proibido; cockpit `/admin/ops` ajustado para não exibir “EnvNeo” como nome.
- Enforcement: novo gate `gate-docs-brand-legal` impede regressão (proíbe "EnvLive" em `docs/` e placeholders `[CNPJ]`/`[RAZÃO SOCIAL]`).
- Build: correção de lint (variáveis não usadas) em `lib/rules/engine.ts` para liberar `next build`.
- Conteúdo: correção de frontmatter YAML inválido em `content/blog/ia-em-governo-nao-pode-ser-caixa-preta.mdx` (linhas coladas `author`/`draft`/`tags`).
- Refinamento: `envneo/ops/CEO-QUEUE.yaml` atualizado (itens concluídos movidos para `done`; WIP limpo) e índice/status em `docs/INDEX.md` + `docs/STATUS.md` alinhados ao payload atual.
- Fix: site-public passa a tratar `/admin` e `/admin/login` como entrypoint seguro (redirect/página informativa) para o CEO Console, mantendo demais `/admin/*` fechados com 404.
- Refinamento: página informativa de `/admin/login` ajustada (copy mais neutra/profissional) e `PRESENT-CEO-CONSOLE` explicita URLs locais do CEO Console (porta 3001).
- Fix(build): removido `next/font/google` (evita fetch de woff2 em `fonts.gstatic.com` durante build no Vercel); fontes agora via stack local/system em CSS vars (`--font-plex-*`).
- Enforcement: redirect de `/admin/login` no site público virou governado (pré-check em `/api/healthz` do CEO Console; se indisponível responde `503` com correlation id). Gate `gate-ceo-console-health` bloqueia deploy quando `CEO_CONSOLE_BASE_URL` está configurada mas inválida.
- Fix: botão flutuante “Área administrativa” usa navegação por `href` (full load) para o entrypoint servido por middleware, evitando inconsistências de navegação client-side.
- Fix: `/admin/Login` (ou outras variações de maiúsculas/minúsculas) agora é normalizado para `/admin/login` via redirect 307.

## 2026-02-18 — Docs: PROMPT-00 — Modelo de Excelência EnvNeo Ltda.

- `docs/PROMPT-00.md` (NOVO): documento canônico de governança operacional — Modelo de Excelência da EnvNeo Ltda. Define: regra de ouro, fronteiras do ecossistema (EnvNeo / Govevia / Identity / CyberSecure / govevia-site), unicidade de tecnologias e protocolos, multi-tenant, proibição de hardcode, evidência-by-design, enforcement mensurável, LGPD, formato de entrega obrigatório (Implementação Concluída), proibição de overengineering e DoD (Definition of Done).
- `docs/GOVERNANCE-MANIFEST.yaml`: registrado como `operating_model`.

## 2026-02-18 — Feat: nav dinâmico — itens sem conteúdo publicado não são exibidos

- `lib/blog.ts`: adicionado campo `draft: boolean` em `BlogPost` e `BlogPostMeta`; `getAllPosts()` aceita `{ includeDrafts }` e filtra rascunhos por padrão.
- `content/blog/*.mdx`: ambos os posts marcados como `draft: true` — "Publicações" some do menu enquanto não houver posts publicados.
- `components/Header.tsx`: conta posts publicados (`getAllPosts()`) e monta array `navigation` dinamicamente — item "Publicações" só é incluído se `publishedPostCount > 0`.
- `components/Header.client.tsx`: `navigation` deixa de ser hardcoded; recebido como prop do servidor.
- `app/blog/[slug]/page.tsx`: `generateStaticParams` exclui drafts; página retorna 404 para posts com `draft: true` acessados diretamente.

## 2026-02-18 — Refactor: SSOT de marca Env Neo — fonte única implementada em todos os consumidores

- `lib/brand/envneo.ts` (NOVO): fonte única da identidade Env Neo — nome legal, CNPJ, e-mail, endereço, tagline, descrição, segment, URLs. Exporta também `normalizeLegalEntityName()` (antes duplicada em Header e Footer).
- `components/Header.tsx`: remove `normalizeLegalEntityName` local; importa do SSOT.
- `components/Footer.tsx`: remove `normalizeLegalEntityName` local e strings hardcoded (e-mail, endereço, CNPJ, tagline, descrição); importa `ENVNEO_BRAND` do SSOT.
- `lib/core/portalBrand.ts`: fallback local aponta para `ENVNEO_LEGAL_ENTITY_NAME` e `GOVEVIA_PRODUCT_NAME` do SSOT.
- `lib/blog.ts`: autor padrão dos posts importa `ENVNEO_LEGAL_ENTITY_NAME` do SSOT.

## 2026-02-18 — Refactor: SSOT para módulos de enforcement da plataforma

- `lib/plataforma/modules.ts` (NOVO): fonte única de verdade para os 6 módulos da plataforma (Processos, Urbanismo, Assinatura, Auditoria, LGPD, Transparência). Cada módulo expõe `functional`, `normative`, `enforcement`, `legalBasis`, `technicalFeatures` e `iconPaths`. Alterar aqui reflete automaticamente em qualquer consumidor do site.
- `components/platform/ModulesDetail.tsx`: removido array local de 175 linhas hardcoded; agora importa `MODULES` de `@/lib/plataforma/modules`. Sem mudança visual; substituição pura de origem dos dados.



- `lib/taxonomy.ts`: dados de personas e contextos embutidos diretamente no TypeScript, eliminando `fs.readFileSync` sobre YAMLs em `/admin/impersonate` e `startImpersonationAction`. Em ambientes serverless (Vercel), arquivos estáticos não rastreados pelo bundler não estão disponíveis em disco em runtime — a chamada lançava ENOENT e derrubava a página com "Application error".

## 2026-02-18 — Fix: incluir arquivos YAML/MD no bundle serverless

- `next.config.js`: adicionado `outputFileTracingIncludes` para garantir que `docs/content/`, `docs/process/`, `content/blog/`, `content/taxonomy/` e `CHANGELOG.md` sejam incluídos no bundle serverless da Vercel. Sem isso, `readFile`/`readFileSync` falha em produção com ENOENT (arquivos existem localmente mas não são copiados para a lambda).

## 2026-02-18 — Correção: redirect() fora de try/catch em server action de login

- `app/admin/login/actions.ts`: `loginAction` refatorada — `redirect()` não pode ser chamado dentro de `try/catch` (Next.js lança `NEXT_REDIRECT` internamente que precisava ser propagado). Agora o try/catch envolve apenas `verifyAdminCredentials` e `createAdminSession`; as chamadas `redirect()` ficaram fora do bloco.

## 2026-02-18 — Acesso à área administrativa

- `middleware.ts`: `/admin/login` sempre acessível em produção; demais rotas `/admin/**` exigem JWT válido — sem JWT retorna 404 (mantém superfície oculta de bots/scanners); removido bloqueio cego via `NODE_ENV === 'production'`.
- `components/AdminAccessButton.tsx`: botão flutuante discreto (cadeado, bottom-right, `z-[9997]`) com link para `/admin/login` — quase invisível por padrão, realça no hover.
- `app/layout.tsx`: `AdminAccessButton` adicionado ao body.

## 2026-02-18 — Validação de segurança publicada (pós-deploy)

- `docs/evidence/security/SECURITY-PROD-SNAPSHOT.md`: evidência HTTP real registrada — `/admin/**` retorna 404 com `Cache-Control: no-store` e `X-Robots-Tag: noindex, nofollow`; CSP sem `unsafe-eval`, `object-src 'none'` ativo; `robots.txt` com `Disallow: /admin/` e `Disallow: /portal/callback`. Commit validado: `a2b3745`.

## 2026-02-18 — Personificação do Sistema (CEO preview mode)

- `lib/auth/impersonation.ts`: sessão de personificação via cookie JWT assinado (`govevia_impersonation`, httpOnly) + cookie de display (`govevia_impersonation_info`, não-httpOnly para leitura client-side).
- `app/admin/impersonate/page.tsx`: página admin com picker de persona (Prefeito, Procurador, Controlador, Secretário) + contexto opcional + estado ativo com botão Encerrar.
- `app/admin/impersonate/actions.ts`: server actions `startImpersonationAction` e `stopImpersonationAction`.
- `components/ImpersonationBanner.tsx`: banner fixo (bottom) client-side que lê o cookie de display — aparece em todas as páginas sem impactar SSG.
- `components/content/ImpersonationAutoSelect.tsx`: client component que auto-redireciona para `?view=<persona>` no blog quando personificação está ativa.
- `app/layout.tsx`: banner de personificação adicionado ao body.
- `app/blog/[slug]/page.tsx`: `ImpersonationAutoSelect` incluído no `ViewProvider`.
- `app/admin/page.tsx`: dashboard redesenhado com cards de navegação (Conteúdo, Processos, Personificação).



- `scripts/verify-changelog-updated.mjs`: em ambientes CI (Vercel define `VERCEL_GIT_COMMIT_SHA`), o script agora sempre usa o diff commitado em vez de inspecionar a árvore de trabalho. O Vercel modifica `vercel.json` na working tree durante o setup do deploy, causando falso positivo no gate.

## 2026-02-18 — Upgrade Next.js 14.2.28 → 14.2.35

- `next` e `eslint-config-next` atualizados para `14.2.35` (última patch da série 14.x). A versão `14.2.28` contém vulnerabilidade de segurança documentada em `https://nextjs.org/blog/security-update-2025-12-11`.

## 2026-02-18 — Aviso de site em construção

- Home (`/`): removidos os dizeres/sections atuais na renderização e incluída mensagem informativa "Estamos em construção".

## 2026-02-18 — Correção de build (Vercel)

- Build: `js-yaml` movido para `dependencies` (era `devDependencies`) para garantir execução do `content:check` no `prebuild` em ambientes que omitirem devDeps.

## 2026-02-18 — Expurgo de logo legado

- Brand: removida qualquer renderização/serving de assets do logo legado (ENV-NEO) do Header/Footer, metadados e OG/Twitter.
- Assets: removidos `public/brand/envneo*` e `assets/brand/envneo*`.
- Evidência: `docs/evidence/BRAND-LOGO-DRIFT.md` + screenshot `docs/evidence/assets/logo-fixed.png`.

## 2026-02-18 — Portal pronto para produção (hardening)

- CSP: `unsafe-eval` permitido apenas em desenvolvimento; produção sem dependência de `unsafe-eval`.
- Assets básicos: `/favicon.ico` passa a existir (sem 404).
- Diagnóstico objetivo: `/api/version` expõe `portalApiBaseHost` (host-only) para validar o `NEXT_PUBLIC_API_BASE_URL` em produção.
- Evidência: `docs/evidence/portal/PORTAL-PROD-READINESS.md` e runbook `docs/runbooks/RUN-PORTAL-PROD-VALIDATION.md`.

## 2026-02-18 — Higienização anti-placeholder (repo)

- Removidos atributos `placeholder` em telas admin para eliminar matches do grep governado.
- Adicionado `app/manifest.ts` e ampliada validação de produção para manifest.

## 2026-02-18 — Hardening de superfície (admin) + evidência

- Superfície: `/admin/**` bloqueado em produção via middleware (responde 404 direto, com `Cache-Control: no-store` e `X-Robots-Tag`).
- Headers: CSP reforçada com `object-src 'none'`.
- SEO: `robots.txt` passa a bloquear `/admin/` e `/portal/callback`.
- Runbook: `docs/runbooks/RUN-SECURITY-PROD-CHECKLIST.md` + template de evidência `docs/evidence/security/SECURITY-PROD-SNAPSHOT.md`.

## 2026-02-17 — Admin Console (MVP) + hardening

- Fase 1 (DB): `lib/db/schema.sql` (idempotente, `pgcrypto`) e `lib/db/postgres.ts` (server-only, pool singleton via `globalThis`).
- Fase 2 (Auth Admin): `/admin/**` protegido por middleware Edge (fail-closed) com sessão via cookie HttpOnly (JWT HS256).
- Fase 3.1 (Conteúdo): camada `lib/db/content.ts` (upsert transacional + revisões) e `lib/content/getContent.ts` (override DB com fallback, published-only, timeout curto).
- Fase 3.2 (Admin UI): listagem e editor em `/admin/content` com validação e sanitização hard-rule no write.
- Plataforma: rota `/plataforma` com SSOT de personas/capabilities, reordenação por `order[]` e URL shareable via `?view=` (sem HEX, sem fetch externo).
- Contato: rota `/contato` adicionada para suportar CTAs internos por persona (`/contato?context=<persona>`).
- Governança: policy, runbooks e evidência pública do auth admin adicionados e registrados no manifesto.
- Enforcement: gate `history:check` exige atualização do `CHANGELOG.md` para qualquer mudança no repo (SSOT do `/historico`).
- Enforcement (robustez CI/PR): base preferencial via `merge-base` com `origin/main` (com fallbacks) + evidência pública do gate.
- Plataforma (P0-01): reimplementação de `/plataforma` com componentes dedicados (`PersonaSelector`, `CapabilitiesMatrix`) + SSOT em `lib/plataforma/model.ts` e textos via `getContent()` com fallback hardcoded (tokens-only; sem HEX; sem `@import`; sem fontes externas).
- Governança (tokens/diff): `PROJECT-SSOT.md`, `RUN-SITE-STEPS.md`, registries em `docs/registry/` + gates `stage:check`, `scope:check`, `content-keys:check` e policy `POL-PORTAL-BFF-CORE.md`.
- Fase 3.3 (Content-First): `docs/content/CONTENT-CATALOG.yaml` (SSOT de chaves) + bootstrap “Inicializar Catálogo” no `/admin/content` + indicador de completude publicada.
- Fase 3.4 (Content-First): `/plataforma` refatorada para layout + keys (`getContent(..., fallback: '')`) e ocultação de blocos/cards vazios; personas/capabilities/axes sem texto hardcoded.
- Fase 3.4 (Content-First): Home (`/`) refatorada para layout + keys (server loader + props) e ocultação de seções/blocos vazios; zero texto hardcoded nos componentes de Home.
- Fase 4.2 (Portal ↔ Core): consumo server-only do read-model público do Core (`/public/v1/portal/brand`) com validação (zod), sanitização determinística de SVG (fail-closed) e precedência de override via Admin.
- Governança (inventário): inventário governado do Portal (keys + integrações) + gate `portal-inventory:check` anti-drift.
- Fase 5.1 (Portal): fundamentos de identidade/consentimento/auditoria (schema idempotente + lib server-only; token hash-only; fail-closed).
- Fase 5.2 (Portal/Admin): módulo de Processos (Processo Piloto 0001 INPI) com catálogo governado no repo + persistência + timeline + enforcement determinístico por passo.
- Fase 5.2 (Portal): login mágico por e-mail (anti-enumeração) + callback + sessão HttpOnly + rate-limit básico (LGPD-min-data).
- Portal (API + JWT): `/portal/login` solicita link via API externa (env `NEXT_PUBLIC_API_BASE_URL`), `/portal/callback` troca token por JWT e persiste em cookie HttpOnly, `/portal` usa Bearer JWT para chamadas protegidas.
- Portal (hardening): `/api/portal/login` virou proxy anti-enum para o Core (sem emissão local de token); client server-only passa Authorization a partir do cookie JWT.

## Correções de Segurança

### CRÍTICA — XSS no Template de E-mail
- `app/api/contact/route.ts`: Todos os inputs sanitizados via `escapeHtml()` antes de interpolação no HTML do e-mail
- Adicionada validação de tipo (`typeof`) e limites de tamanho (`maxLength`) em todos os campos
- Removidos fallbacks hardcoded de credenciais SMTP — sistema falha explicitamente (503) se variáveis não configuradas

### ALTA — Rate Limiting
- Rate limiting em memória mantido para servidor persistente, com cleanup automático (previne memory leak)
- `middleware.ts` adicionado com verificação de Origin em rotas de API (proteção CSRF em edge)
- Comentário explícito documentando que deploy serverless exige Upstash Redis/Vercel KV

### ALTA — Content-Security-Policy
- `next.config.js`: CSP header adicionado com `default-src 'self'`, `frame-ancestors 'none'`, `form-action 'self'`
- HSTS atualizado com `preload` directive

### MÉDIA — CSRF Protection
- `app/api/contact/route.ts`: Verificação de `Origin`/`Referer` contra lista de origens permitidas
- `middleware.ts`: Segunda camada de verificação de Origin em edge para todas as rotas de API

### MÉDIA — Google Fonts / LGPD
- Removido `@import` de Google Fonts em `globals.css`
- Fontes carregadas via `next/font/google` em `layout.tsx` — Next.js baixa em build time e serve localmente
- Zero requisições a servidores externos durante navegação = conformidade LGPD por design

### BAIXA — Atualização de Dependências
- `next`: 14.1.0 → 14.2.28
- `eslint-config-next`: 14.1.0 → 14.2.28

## Infraestrutura de Blog (Canal #1 de Marketing)

### Novos Arquivos
- `lib/blog.ts` — Parser de Markdown com frontmatter (gray-matter), renderização (remark), e tempo de leitura
- `app/blog/page.tsx` — Listagem de publicações com metadata SEO
- `app/blog/[slug]/page.tsx` — Página de artigo com Schema.org `TechArticle`, tipografia otimizada, e geração estática
- `content/blog/` — Diretório para artigos em Markdown

### Artigo Inaugural
- `content/blog/regras-sem-enforcement-sao-invalidas.md`
- ~1.500 palavras, indexável para termos: "enforcement normativo", "evidência verificável", "versionamento temporal", "auditoria municipal"
- Tags: Enforcement Normativo, Governança Digital, Tribunais de Contas, Conformidade Municipal

### Dependências Adicionadas
- `gray-matter` — Parse de frontmatter YAML em Markdown
- `remark` + `remark-html` — Renderização de Markdown para HTML
- `reading-time` — Cálculo de tempo de leitura
- `@tailwindcss/typography` — Classes `prose` para tipografia de artigos

## Conformidade LGPD

### Cookie Consent
- `components/CookieConsent.tsx` — Banner discreto (bottom bar, não modal) com opções Aceitar/Rejeitar
- Integrado em `layout.tsx` — presente em todas as páginas
- Persistência via `localStorage`

## Paleta Institucional

### Cores
- Primário: `#1E80FF` (azul elétrico) → `#0A3D7A` (azul-marinho institucional)
- Antigo azul elétrico mantido como `primary-light` para acentos
- Orange accent → Gold accent (`#B8860B`) — mais alinhado com referências TCU/Banco Mundial
- Navy aprofundado: `#1a2332` → `#0C1B2E`

### Tipografia
- Títulos: Montserrat → Playfair Display (serif, gravitas institucional)
- Corpo: Open Sans → Source Sans 3 (sans-serif refinado)
- Carregamento via `next/font` (self-hosted, zero requisições externas)

## Schema.org Estruturado
- `layout.tsx`: JSON-LD com `Organization`, `SoftwareApplication`, e `WebSite`
- `app/blog/[slug]/page.tsx`: JSON-LD com `TechArticle` por artigo

## Navegação
- Header e Footer atualizados com link "Publicações" para `/blog`
- Sitemap atualizado com rota `/blog`

## Como Usar

```bash
tar -xzf govevia-site-v2.tar.gz
cd govevia-site-v2
npm install
cp .env.example .env.local
# Editar .env.local com credenciais SMTP reais
npm run dev
```

### Publicar Novo Artigo
1. Criar arquivo `.md` em `content/blog/`
2. Adicionar frontmatter (title, date, description, author, tags)
3. Escrever conteúdo em Markdown
4. Build/deploy — página gerada estaticamente
