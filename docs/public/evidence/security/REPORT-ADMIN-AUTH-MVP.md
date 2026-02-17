# REPORT-ADMIN-AUTH-MVP — Evidência (Auth Admin MVP)

## Objetivo

Evidenciar a implementação do acesso administrativo mínimo (`/admin/**`) com sessão segura e enforcement em middleware, com postura fail-closed.

## Implementação

- Credenciais: `ADMIN_USERNAME` + `ADMIN_PASSWORD_HASH` (bcrypt)
- Sessão: cookie `govevia_admin_session` (HttpOnly) com JWT HS256
- Middleware Edge valida JWT e redireciona para `/admin/login` quando ausente/inválido
- Fail-closed quando `ADMIN_SESSION_SECRET` está ausente/curto (mínimo 32 chars)

## Artefatos

- `lib/auth/admin.ts`
- `middleware.ts`
- `app/admin/login/page.tsx` e server action
- `app/admin/page.tsx` e server action de logout

## Gates

- `npm -s run -s lint`: PASS
- `npm -s run -s build`: PASS
- `npm -s run -s tokens:check`: PASS
- `npm -s run -s security:csp`: PASS
