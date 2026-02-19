# POL-ADMIN-ACCESS — Acesso Admin (MVP)

## Escopo

Esta policy define os controles mínimos para o acesso administrativo do **CEO Console** (`apps/ceo-console`, rotas `/admin/**`).

No **site público** (raiz do repo), `/admin/login` existe apenas como **entrypoint** (redirect/página informativa) e não hospeda UI admin.

## Regras

1) Modelo de conta

- MVP: **1 usuário** (CEO) configurado via env (`ADMIN_USERNAME` + `ADMIN_PASSWORD_HASH`).
- Sem RBAC, sem múltiplos perfis, sem auto-cadastro.

2) Sessão

- Sessão em cookie **HttpOnly** com JWT **HS256**.
- Cookie com `SameSite=Lax` e `Secure` em produção.
- TTL configurável por `ADMIN_JWT_TTL_SECONDS`.

3) Enforcement na borda (Edge Middleware)

- Rotas `/admin/**` devem ser bloqueadas sem sessão válida.
- Fail-closed: se `ADMIN_JWT_SECRET` faltar ou for curto, `/admin/**` permanece bloqueado.

4) Não vazamento

- Código de autenticação deve permanecer em módulo server-only (`lib/auth/**`).
- Mensagens de erro de login devem ser genéricas (sem indicar se o usuário existe).
