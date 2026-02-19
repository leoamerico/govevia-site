# RUN-MONOREPO-SPLIT — Fronteira de Monorepo: site-public vs ceo-console

## Topologia

```
govevia-site/                  ← raiz = site-public (Vercel deploys aqui)
  app/                         ← rotas públicas + /admin/* (redirecionamento)
  components/                  ← componentes visuais públicos
  lib/                         ← lógica compartilhada do site
  apps/
    ceo-console/               ← console interno (Next.js isolado, porta 3001)
      app/
        admin/                 ← todas as rotas admin vivem aqui
      middleware.ts             ← JWT guard para todas as rotas
```

## Regras de Fronteira

| Regra | Descrição |
|-------|-----------|
| **BOUNDARY-01** | `apps/ceo-console/` NÃO pode importar de `../../app/`, `../../components/` ou `../../lib/` |
| **BOUNDARY-02** | `app/` (site-public) NÃO deve expor páginas admin — apenas `/admin/login` que redireciona ao ceo-console |
| **BOUNDARY-03** | Pacotes compartilhados vivem em `packages/` (design-tokens, clm, etc.) |
| **BOUNDARY-04** | `apps/shared/` é código Python — não é workspace npm |

## Como Rodar

### site-public (market + blog)
```bash
# na raiz
npm run dev        # porta 3000
npm run build
npm run start
```

### ceo-console (admin)
```bash
cd apps/ceo-console
npm install
npm run dev        # porta 3001
```

## Variáveis de Ambiente

| Variável | Usado em | Finalidade |
|----------|---------|-----------|
| `ADMIN_JWT_SECRET` | ceo-console | Chave HMAC-HS256 ≥ 32 chars |
| `ADMIN_USERNAME` | ceo-console api | Usuário admin (texto) |
| `ADMIN_PASSWORD_HASH` | ceo-console api | bcrypt hash da senha |
| `ADMIN_JWT_TTL_SECONDS` | ceo-console | TTL do JWT (segundos) |
| `CEO_CONSOLE_BASE_URL` | site-public | URL base do CEO Console para redirect de `/admin/login` |

## Deploy

- **site-public**: Vercel project apontado para raiz do repo. Não mover arquivos de raiz.
- **ceo-console**: Vercel project separado apontado para `apps/ceo-console/`, ou container dedicado.

## Verificação de Fronteira

```bash
# Checar se ceo-console tenta importar do site-public
grep -rn "from '../../app\|from '../../components\|from '../../lib" apps/ceo-console/
# → deve retornar ZERO resultados
```

## Referências

- `apps/ceo-console/next.config.js` — headers de segurança e comentário de fronteira
- `apps/ceo-console/tsconfig.json` — path aliases `@console/*`, `@shared/*`
- `apps/ceo-console/middleware.ts` — JWT guard HS256
