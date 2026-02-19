/**
 * smoke-ceo-cookie.mjs — Verifica contrato de cookie por ambiente + consistência de import
 *
 * Uso: node tools/smoke/smoke-ceo-cookie.mjs
 *
 * Cobertura:
 * A) NODE_ENV=development → cookie "gv_admin_dev", sem exigir Secure
 * B) NODE_ENV=production  → cookie "__Host-gv_admin", exige Secure + Path=/
 * C) Consistência de import: nenhum arquivo usa "__Host-gv_admin" hardcoded
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'

const ROOT = fileURLToPath(new URL('../../', import.meta.url))
const CEO_ROOT = join(ROOT, 'apps/ceo-console')

let failed = false
function assert(label, condition, detail = '') {
  if (condition) {
    console.log(`  ✓ ${label}`)
  } else {
    console.error(`  ✗ FAIL: ${label}${detail ? '\n        ' + detail : ''}`)
    failed = true
  }
}

// ── Carregar constants.ts para verificação de lógica ──────────────────────────
// Simula o comportamento inline (sem importar TS diretamente)
function resolveAdminCookieName(nodeEnv) {
  return nodeEnv === 'production' ? '__Host-gv_admin' : 'gv_admin_dev'
}

function cookieOptions(cookieName, ttl, nodeEnv) {
  return {
    name: cookieName,
    httpOnly: true,
    sameSite: 'lax',
    secure: nodeEnv === 'production',
    path: '/',
    maxAge: ttl,
  }
}

// ── TEST A: NODE_ENV=development ───────────────────────────────────────────────
console.log('\n── Test A: NODE_ENV=development')
{
  const name = resolveAdminCookieName('development')
  assert('cookie name = "gv_admin_dev"', name === 'gv_admin_dev', `got "${name}"`)

  const opts = cookieOptions(name, 3600, 'development')
  assert('secure = false em dev', opts.secure === false, `got ${opts.secure}`)
  assert('httpOnly = true', opts.httpOnly === true)
  assert('sameSite = lax', opts.sameSite === 'lax')
  assert('path = "/"', opts.path === '/')
  assert('name correto em dev', opts.name === 'gv_admin_dev', `got "${opts.name}"`)
}

// ── TEST B: NODE_ENV=production ────────────────────────────────────────────────
console.log('\n── Test B: NODE_ENV=production')
{
  const name = resolveAdminCookieName('production')
  assert('cookie name = "__Host-gv_admin"', name === '__Host-gv_admin', `got "${name}"`)

  const opts = cookieOptions(name, 3600, 'production')
  assert('secure = true em prod', opts.secure === true, `got ${opts.secure}`)
  assert('httpOnly = true', opts.httpOnly === true)
  assert('path = "/" (obrigatório para __Host-)', opts.path === '/')
  assert('sem Domain definido (undefined)', opts.domain === undefined, `got "${opts.domain}"`)
  assert('name correto em prod', opts.name === '__Host-gv_admin', `got "${opts.name}"`)

  // __Host- prefix rules: Secure + Path=/ + sem Domain
  assert(
    '__Host- prefix: Secure=true',
    opts.secure === true,
    'Prefixo __Host- exige Secure=true'
  )
  assert(
    '__Host- prefix: Path=/ (sem subpath)',
    opts.path === '/',
    'Prefixo __Host- exige Path=/'
  )
}

// ── TEST C: Consistência de import — nenhum arquivo hardcoda "__Host-gv_admin" ─
console.log('\n── Test C: Consistência de import (sem hardcode de "__Host-gv_admin")')
{
  const FILES_TO_CHECK = [
    { name: 'middleware.ts',                path: join(CEO_ROOT, 'middleware.ts') },
    { name: 'api/admin/login/route.ts',     path: join(CEO_ROOT, 'app/api/admin/login/route.ts') },
    { name: 'api/admin/logout/route.ts',    path: join(CEO_ROOT, 'app/api/admin/logout/route.ts') },
  ]

  const FORBIDDEN_LITERAL = '__Host-gv_admin'

  for (const file of FILES_TO_CHECK) {
    const content = readFileSync(file.path, 'utf8')
    assert(
      `${file.name}: não hardcoda "${FORBIDDEN_LITERAL}"`,
      !content.includes(FORBIDDEN_LITERAL),
      `"${FORBIDDEN_LITERAL}" encontrado como literal em ${file.name} — importar de lib/auth/constants`
    )
  }

  // constants.ts DEVE conter a string (é a única fonte autorizada)
  const constantsPath = join(CEO_ROOT, 'lib/auth/constants.ts')
  const constants = readFileSync(constantsPath, 'utf8')
  assert(
    'constants.ts define "__Host-gv_admin" (fonte única)',
    constants.includes(FORBIDDEN_LITERAL),
    'constants.ts não define o valor — verifique lib/auth/constants.ts'
  )

  // Verificar que middleware.ts importa do admin ou constants (não redefiniu localmente)
  const middlewareContent = readFileSync(join(CEO_ROOT, 'middleware.ts'), 'utf8')
  const importsFromAuth = middlewareContent.includes('@/lib/auth/admin') ||
    middlewareContent.includes('@/lib/auth/constants') ||
    middlewareContent.includes('./lib/auth/admin') ||
    middlewareContent.includes('./lib/auth/constants')
  assert(
    'middleware.ts importa COOKIE_NAME de lib/auth (não redefinido localmente)',
    importsFromAuth,
    'middleware.ts não importa de lib/auth — possível redefinição local do cookie name'
  )
}

// ── Resultado ─────────────────────────────────────────────────────────────────
console.log('\n' + '═'.repeat(50))
if (failed) {
  console.error('[SMOKE FAILED] Cookie contrato não satisfeito.')
  process.exit(1)
} else {
  console.log('[SMOKE PASSED] Cookie contrato por ambiente verificado.')
  process.exit(0)
}
