# RUN-ADMIN-ENV-SETUP — Variáveis do Admin (MVP)

## Objetivo

Definir o contrato de variáveis de ambiente para habilitar o acesso administrativo em `/admin/**` com sessão via cookie HttpOnly (JWT HS256).

## Variáveis

- `ADMIN_USERNAME`
  - Usuário único (CEO) para o MVP.
- `ADMIN_PASSWORD_HASH`
  - Hash **bcrypt** da senha (não armazene a senha em texto).
- `ADMIN_SESSION_SECRET`
  - Segredo para assinar/verificar JWT (HS256).
  - Requisito mínimo: **32 caracteres**.
- `ADMIN_SESSION_TTL_SECONDS`
  - TTL da sessão em segundos.
  - Default: `86400` (24h).

## Como gerar `ADMIN_PASSWORD_HASH`

1) Instale as dependências (`npm install`).
2) Gere o hash bcrypt:

```bash
node -e "const bcrypt=require('bcryptjs'); console.log(bcrypt.hashSync(process.argv[1], 12))" "SENHA_AQUI"
```

Copie a saída para `ADMIN_PASSWORD_HASH`.

## Observações

- `ADMIN_SESSION_SECRET` deve ser tratado como segredo (Vercel/CI/CD secrets).
- Se o segredo estiver ausente/curto, o acesso a `/admin/**` fica bloqueado (fail-closed).
