# ADR-004 — Regime de Secrets do CEO Console

**Status:** Aceito  
**Data:** 2026-02-19  
**Responsável:** CEO / EnvNeo Ltda.  
**Tags:** secrets, autenticação, rotação, operações

---

## Contexto

O CEO Console requer três variáveis de ambiente sensíveis para operar. A ausência
de qualquer delas deve causar falha explícita no startup — não operação degradada
silenciosa. Os valores nunca devem estar no repositório.

---

## Variáveis Obrigatórias

| Variável | Formato | Geração |
|---|---|---|
| `ADMIN_USERNAME` | string, sem espaços | definido pelo operador |
| `ADMIN_PASSWORD_HASH` | bcrypt hash, cost ≥ 12 | `node tools/secrets/gen-ceo-console-secrets.mjs` |
| `ADMIN_JWT_SECRET` | string ≥ 32 chars, aleatória | `node tools/secrets/gen-ceo-console-secrets.mjs` |
| `ADMIN_JWT_TTL_SECONDS` | inteiro (default: 28800) | opcional, 8h por padrão |

---

## Onde Ficam os Secrets

Somente via variáveis de ambiente do deploy:
- **Vercel:** Settings → Environment Variables (projeto `ceo-console`)
- **CI:** GitHub Actions Secrets (se pipeline futura precisar)
- **Local dev:** arquivo `.env.local` em `apps/ceo-console/` — **não versionado** (listado no `.gitignore`)

Nenhum secret entra no repositório em nenhum formato.

---

## Como Gerar

```bash
node tools/secrets/gen-ceo-console-secrets.mjs
```

O script:
1. Solicita a senha desejada via stdin (ou gera uma aleatória com `--random`)
2. Imprime `ADMIN_PASSWORD_HASH` (bcrypt, cost 12)
3. Gera e imprime `ADMIN_JWT_SECRET` (32 bytes aleatórios em hex)
4. **Não grava arquivo** — o operador copia os valores para o deploy

---

## Fail-Closed

O handler de login lança `Error('Missing required env var: X')` explicitamente
se qualquer variável obrigatória estiver ausente. O app não opera em modo degradado.

Verificação local:
```bash
# Sem ADMIN_JWT_SECRET: deve retornar 500 com log de erro
ADMIN_USERNAME=x ADMIN_PASSWORD_HASH=x node -e "require('./apps/ceo-console/lib/auth/admin')"
```

---

## Rotação

### Gatilhos Determinísticos de Rotação

| Gatilho | Ação |
|---|---|
| Suspeita de comprometimento | Rotacionar `ADMIN_JWT_SECRET` + `ADMIN_PASSWORD_HASH` imediatamente |
| Saída de operador com acesso | Rotacionar ambos no mesmo dia |
| Revisão periódica (90 dias) | Rotacionar `ADMIN_JWT_SECRET`; avaliar `ADMIN_PASSWORD_HASH` |

### Estado Durante Rotação — OBRIGATÓRIO

**Rotação de `ADMIN_JWT_SECRET` invalida sessões ativas imediatamente.**
O operador DEVE notificar o usuário ativo antes de atualizar a variável no
ambiente de deploy. Sequência segura:

1. Notificar usuário ativo (se houver sessão em curso)
2. Atualizar `ADMIN_JWT_SECRET` no deploy
3. Fazer redeploy/restart da instância
4. Verificar que `/admin/login` está acessível
5. Fazer novo login para confirmar a nova sessão

**Rotação de `ADMIN_PASSWORD_HASH` não invalida sessão existente** (JWT
permanece válido até expirar), mas o acesso por nova senha só vale após redeploy.

---

## Referências

- `apps/ceo-console/lib/auth/admin.ts` — `requireEnv()` e `getSecret()`
- `apps/ceo-console/lib/auth/constants.ts` — nomes dos cookies por ambiente
- `tools/secrets/gen-ceo-console-secrets.mjs` — gerador local
- `docs/runbooks/RUN-SECRETS-CEO-CONSOLE.md` — operação passo-a-passo
