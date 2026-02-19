/**
 * setup-local-dev.mjs — Configura .env.local para desenvolvimento local
 *
 * Uso:
 *   node scripts/setup-local-dev.mjs --password=MINHA_SENHA
 *   node scripts/setup-local-dev.mjs --random   (gera senha aleatória e exibe)
 *
 * O que faz:
 *   - Gera ADMIN_PASSWORD_HASH (bcrypt) a partir da senha
 *   - Gera ADMIN_SESSION_SECRET se não existir
 *   - Atualiza .env.local automaticamente
 *   - Nunca commita — .env.local está no .gitignore
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { randomBytes } from 'node:crypto'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import bcrypt from 'bcryptjs'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const ENV_LOCAL = resolve(ROOT, '.env.local')
const CEO_ENV_LOCAL = resolve(ROOT, 'apps/ceo-console/.env.local')

// ── Parse args ────────────────────────────────────────────────
const args = process.argv.slice(2)
const randomFlag = args.includes('--random')
const passwordArg = args.find(a => a.startsWith('--password='))?.split('=').slice(1).join('=')

let password = passwordArg ?? null

if (!password && randomFlag) {
  password = randomBytes(20).toString('base64url')
  console.log(`\n🔑 Senha gerada (salve agora):\n   ${password}\n`)
} else if (!password) {
  console.error('Uso: node scripts/setup-local-dev.mjs --password=MINHA_SENHA')
  console.error('      node scripts/setup-local-dev.mjs --random')
  process.exit(1)
}

if (password.length < 12) {
  console.error('Senha muito curta (mínimo 12 caracteres).')
  process.exit(1)
}

// ── Gerar hash ────────────────────────────────────────────────
process.stdout.write('Gerando hash bcrypt (cost 12)...')
const hash = await bcrypt.hash(password, 12)
console.log(' OK')

// ── Ler .env.local atual ──────────────────────────────────────
let content = existsSync(ENV_LOCAL) ? readFileSync(ENV_LOCAL, 'utf-8') : ''

// ── Helpers para upsert de variáveis ─────────────────────────
function upsert(src, key, value, quote = false) {
  // quote=true: escapa $ com \$ (para hashes bcrypt que contêm $)
  const val = quote ? value.replace(/\$/g, '\\$') : value
  const re = new RegExp(`^${key}=.*$`, 'm')
  if (re.test(src)) {
    return src.replace(re, `${key}=${val}`)
  }
  return src.trimEnd() + `\n${key}=${val}\n`
}

// ── ADMIN_USERNAME (padrão "admin" se não existir) ───────────
if (!content.includes('ADMIN_USERNAME=')) {
  content = upsert(content, 'ADMIN_USERNAME', 'admin')
}

// ── ADMIN_PASSWORD_HASH ───────────────────────────────────────
content = upsert(content, 'ADMIN_PASSWORD_HASH', hash, true)

// ── ADMIN_SESSION_SECRET (só gera se não existir) ────────────
if (!content.includes('ADMIN_SESSION_SECRET=')) {
  const secret = randomBytes(32).toString('hex')
  content = upsert(content, 'ADMIN_SESSION_SECRET', secret)
  console.log('ADMIN_SESSION_SECRET gerado automaticamente.')
}

// ── ADMIN_SESSION_TTL_SECONDS (padrão 86400) ─────────────────
if (!content.includes('ADMIN_SESSION_TTL_SECONDS=')) {
  content = upsert(content, 'ADMIN_SESSION_TTL_SECONDS', '86400')
}

// ── CEO_CONSOLE_BASE_URL (garante localhost:3001 no .env.local) ─
if (!content.includes('CEO_CONSOLE_BASE_URL=')) {
  content = upsert(content, 'CEO_CONSOLE_BASE_URL', 'http://localhost:3001')
}

// ── NEXT_PUBLIC_SITE_URL ──────────────────────────────────────
if (!content.includes('NEXT_PUBLIC_SITE_URL=')) {
  content = upsert(content, 'NEXT_PUBLIC_SITE_URL', 'http://localhost:3000')
}

// ── Gravar .env.local (raiz) ──────────────────────────────────
writeFileSync(ENV_LOCAL, content, 'utf-8')

// ── Gravar apps/ceo-console/.env.local ───────────────────────
let ceoContent = existsSync(CEO_ENV_LOCAL) ? readFileSync(CEO_ENV_LOCAL, 'utf-8') : ''

ceoContent = upsert(ceoContent, 'ADMIN_USERNAME', 'admin')
ceoContent = upsert(ceoContent, 'ADMIN_PASSWORD_HASH', hash, true)
if (!ceoContent.includes('ADMIN_JWT_SECRET=')) {
  const jwtSecret = randomBytes(32).toString('hex')
  ceoContent = upsert(ceoContent, 'ADMIN_JWT_SECRET', jwtSecret)
  console.log('ADMIN_JWT_SECRET gerado automaticamente para CEO Console.')
}
if (!ceoContent.includes('ADMIN_JWT_TTL_SECONDS=')) {
  ceoContent = upsert(ceoContent, 'ADMIN_JWT_TTL_SECONDS', '28800')
}
writeFileSync(CEO_ENV_LOCAL, ceoContent, 'utf-8')

console.log('\n✅ .env.local atualizado com sucesso (raiz + apps/ceo-console).')
console.log(`   Usuário : admin`)
console.log(`   Senha   : ${password}`)
console.log('\nRestart o CEO Console para aplicar:')
console.log('   taskkill /F /IM node.exe  (Windows)')
console.log('   cd apps/ceo-console && npm run dev')
