#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# Govevia Site — Setup do repositório local e push inicial
# Caminho local: d:/govevia-site/ (WSL: /mnt/d/govevia-site/)
#
# Uso:
#   bash setup-repo.sh /caminho/para/govevia-site-v2-corrected.tar.gz
# ============================================================

REPO_NAME="govevia-site"
REPO_ORG="leoamerico"
KEY_ID="239AAF92BE8D040B"
LOCAL_PATH="/mnt/d/govevia-site"  # d:/govevia-site/ no Windows

echo "[1/7] Criando repositório no GitHub..."
gh repo create "${REPO_ORG}/${REPO_NAME}" --private \
  --description "Site institucional Govevia — governança executável para administração pública" \
  || echo "Repo já existe, continuando..."

echo "[2/7] Preparando diretório local em ${LOCAL_PATH}..."
if [ -d "${LOCAL_PATH}/.git" ]; then
  echo "ERRO: ${LOCAL_PATH} já é um repo git. Remova ou escolha outro path."
  exit 1
fi
mkdir -p "${LOCAL_PATH}"

echo "[3/7] Extraindo site corrigido..."
TAR_PATH="${1:-govevia-site-v2-corrected.tar.gz}"
if [ ! -f "${TAR_PATH}" ]; then
  echo "ERRO: Arquivo ${TAR_PATH} não encontrado."
  echo "Uso: bash setup-repo.sh /caminho/para/govevia-site-v2-corrected.tar.gz"
  exit 1
fi
tar xzf "${TAR_PATH}" --strip-components=1 -C "${LOCAL_PATH}"

echo "[4/7] Inicializando git..."
cd "${LOCAL_PATH}"
git init
git config user.name "Leonardo Americo Jose Ribeiro"
git config user.email "leonardo@govevia.com.br"
git config user.signingkey "${KEY_ID}"
git config commit.gpgsign true

echo "[5/7] Commit inicial assinado..."
git add -A
git commit -S -m "feat: site institucional Govevia v2.0.0

- Next.js 14 + Tailwind CSS + framer-motion
- Segurança: CSP, HSTS, CSRF duplo, sanitização XSS, rate limiting
- LGPD: fontes self-hosted, cookie consent, política de privacidade
- SEO: Schema.org, sitemap, robots, Open Graph, blog com geração estática
- URLs parametrizadas via NEXT_PUBLIC_SITE_URL
- Vercel config: region GRU1 (São Paulo)"

echo "[6/7] Verificando assinatura..."
git verify-commit HEAD
git show --show-signature HEAD --no-patch

echo "[7/7] Push para origin..."
git remote add origin "git@github.com:${REPO_ORG}/${REPO_NAME}.git"
git branch -M main
git push -u origin main

echo ""
echo "====================================="
echo "  PRONTO"
echo "  Repo local: d:/govevia-site/"
echo "  Repo remoto: github.com/${REPO_ORG}/${REPO_NAME}"
echo "====================================="
echo ""
echo "Próximos passos (nesta ordem):"
echo ""
echo "  1. VERCEL — https://vercel.com"
echo "     → Add New Project → Import ${REPO_ORG}/${REPO_NAME}"
echo "     → Region: São Paulo (GRU1)"
echo "     → Environment Variables:"
echo "        NEXT_PUBLIC_SITE_URL = https://govevia.com.br"
echo "        SMTP_HOST            = email.envneo.com.br"
echo "        SMTP_PORT            = 587"
echo "        SMTP_SECURE          = false"
echo "        SMTP_USER            = notifications@envneo.com.br"
echo "        SMTP_PASS            = <senha real>"
echo "     → Deploy"
echo ""
echo "  2. VALIDAR — acessar a URL temporária *.vercel.app"
echo "     → Conferir que o site carrega e o formulário funciona"
echo ""
echo "  3. DOMÍNIO (Vercel) — Settings → Domains"
echo "     → Adicionar: govevia.com.br"
echo "     → Adicionar: www.govevia.com.br (redirect → apex)"
echo ""
echo "  4. DNS (GoDaddy) — só depois do passo 3"
echo "     → Remover 4 A records: 185.199.108/109/110/111.153"
echo "     → Adicionar: @ A 76.76.21.21"
echo "     → Alterar: www CNAME cname.vercel-dns.com"
