# Govevia Site — v2.0.0

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
- ~1.500 palavras, indexável para termos: "enforcement normativo", "evidência imutável", "versionamento temporal", "auditoria municipal"
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
