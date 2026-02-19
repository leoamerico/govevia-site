# RUN-SECRETS-CEO-CONSOLE — Operação de Secrets do CEO Console

## Pré-requisitos

- Node.js >= 18 instalado
- Acesso ao painel de deploy (Vercel ou equivalente)
- `apps/ceo-console/.env.local` NÃO versionado (ver `.gitignore`)

---

## 1. Gerar Secrets

```bash
node tools/secrets/gen-ceo-console-secrets.mjs
```

Saída esperada (valores variam a cada execução):

```
=== CEO Console — Gerador de Secrets ===

Informe a senha desejada (ou pressione Enter para gerar aleatória):
Senha: [input oculto]

ADMIN_USERNAME=<escolher um nome de usuário>
ADMIN_PASSWORD_HASH=$2b$12$<hash-bcrypt>
ADMIN_JWT_SECRET=<64-chars-hex>
ADMIN_JWT_TTL_SECONDS=28800

Copie os valores acima para o painel de deploy.
NENHUM ARQUIVO foi gravado.
```

---

## 2. Configurar no Deploy (Vercel)

1. Abrir Vercel → projeto `ceo-console` → Settings → Environment Variables
2. Adicionar cada variável:
   - `ADMIN_USERNAME` → nome escolhido (sem espaços)
   - `ADMIN_PASSWORD_HASH` → hash da saída do gerador
   - `ADMIN_JWT_SECRET` → valor de 64 chars da saída do gerador
   - `ADMIN_JWT_TTL_SECONDS` → 28800 (ou ajustar)
3. Marcar todas como **Production** (e Previews apenas se necessário)
4. Fazer novo deploy para ativar as variáveis

---

## 3. Configurar Localmente (dev)

Criar `apps/ceo-console/.env.local` (não commitado):

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2b$12$<hash-gerado>
ADMIN_JWT_SECRET=<secret-gerado>
ADMIN_JWT_TTL_SECONDS=28800
NODE_ENV=development
```

---

## 4. Verificar Funcionamento

```bash
# Sem cookie: deve retornar 401/redirect (não 200)
curl -I http://localhost:3001/admin
# Esperado: HTTP/1.1 302 ou 404

# Login com credenciais corretas: deve retornar 200 + Set-Cookie
curl -s -X POST http://localhost:3001/api/admin/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"<ADMIN_USERNAME>","password":"<senha>"}' \
  -v 2>&1 | grep -E 'HTTP|Set-Cookie|ok'
# Esperado: HTTP/1.1 200, Set-Cookie: gv_admin_dev=...

# Senha errada: deve retornar 401
curl -s -X POST http://localhost:3001/api/admin/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"<ADMIN_USERNAME>","password":"errada"}' \
  -w '\nHTTP %{http_code}\n'
# Esperado: HTTP 401

# Logout: deve expirar cookie
curl -s -X POST http://localhost:3001/api/admin/logout -v 2>&1 | grep Set-Cookie
# Esperado: Set-Cookie: gv_admin_dev=; Max-Age=0
```

---

## 5. Rotação de Secrets

Ver: `docs/architecture/decisions/ADR-004-SECRETS-REGIME-CEO-CONSOLE.md` → seção "Rotação"

**Sequência obrigatória para `ADMIN_JWT_SECRET`:**
1. Notificar usuário ativo
2. Gerar novo secret: `node tools/secrets/gen-ceo-console-secrets.mjs`
3. Atualizar valor da variável no painel de deploy
4. Redeploy/restart
5. Verificar com `curl` (passo 4 acima)

---

## Referências

- `apps/ceo-console/lib/auth/constants.ts` — nomes de cookie por ambiente
- `ADR-004-SECRETS-REGIME-CEO-CONSOLE.md` — decisão arquitetural
