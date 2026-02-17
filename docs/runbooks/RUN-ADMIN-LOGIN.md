# RUN-ADMIN-LOGIN — Operação do Login Admin (MVP)

## Objetivo

Explicar como validar o fluxo de autenticação do Admin Console (MVP) e como diagnosticar falhas comuns.

## Pré-requisitos

- Variáveis definidas conforme `RUN-ADMIN-ENV-SETUP`.

## Teste local

1) Execute:

```bash
npm run dev
```

2) Acesse:

- `/admin` → deve redirecionar para `/admin/login` sem sessão.
- `/admin/login` → formulário de login.

3) Login válido:

- Deve criar cookie `govevia_admin_session` (HttpOnly).
- Deve permitir acesso a `/admin`.

4) Logout:

- Clique em “Sair”.
- Deve remover o cookie e bloquear `/admin` novamente.

## Falhas comuns

- Redirecionamento infinito para `/admin/login`
  - Verifique `ADMIN_SESSION_SECRET` (mínimo 32 chars).
  - Verifique se `ADMIN_USERNAME` e `ADMIN_PASSWORD_HASH` existem.

- Login sempre falha
  - Re-gerar o bcrypt hash e garantir que o usuário (`ADMIN_USERNAME`) esteja exato.
