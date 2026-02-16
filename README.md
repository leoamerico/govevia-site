# Govevia — Site Institucional

Site institucional da plataforma Govevia. Next.js 14, Tailwind CSS, deploy via Vercel.

## Setup local

```bash
npm install
cp .env.example .env.local
# Editar .env.local com credenciais SMTP reais
npm run dev
```

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
