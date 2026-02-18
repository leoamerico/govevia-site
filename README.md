# Govevia — Site Institucional

Site institucional da plataforma Govevia. Next.js 14, Tailwind CSS, deploy via Vercel.

## Setup local

```bash
npm install
cp .env.example .env.local
# Editar .env.local com credenciais SMTP reais
npm run dev
```

## Portal (Magic Link + JWT)

O Portal usa uma API externa (Core) para:
- solicitar link mágico por e-mail
- trocar o token de link por um JWT

Variável obrigatória:
- `NEXT_PUBLIC_API_BASE_URL` = base URL da API (ex.: `https://api.exemplo.com`)

Endpoints esperados na API:
- `POST /api/v1/portal/auth/request-link` (anti-enumeração)
- `GET /api/v1/portal/auth/exchange?token=...` (retorna `jwt`/`token`/`access_token`)
- `GET /api/v1/portal/auth/me` (protegido; usado para checar estado em `/portal`)

## Verificações de segurança (CSP)

```bash
npm run security:verify
```

## Deploy (Vercel)

1. Conectar este repo ao Vercel (auto-detecta Next.js)
2. Region: **São Paulo (GRU1)**
3. Environment Variables:
   - `NEXT_PUBLIC_SITE_URL` = `https://govevia.com.br`
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`
4. Deploy

## Publicar artigo no blog

1. Criar `.md` em `content/blog/`
2. Frontmatter: `title`, `date`, `description`, `author`, `tags`
3. Push → página gerada estaticamente

## Arquitetura de domínios

| Domínio | Destino | Propósito |
|---------|---------|-----------|
| `govevia.com.br` | Vercel | Site institucional |
| `www.govevia.com.br` | Vercel (redirect → apex) | Alias |
| `governance.govevia.com.br` | GitHub Pages | Governance Dashboard |
