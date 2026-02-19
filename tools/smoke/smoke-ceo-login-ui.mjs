/**
 * smoke-ceo-login-ui.mjs — Verifica contrato da UI de login do CEO Console
 *
 * Sem Playwright: lê o arquivo da UI e verifica os contratos de behavior via
 * análise estática do código-fonte.
 *
 * Uso: node tools/smoke/smoke-ceo-login-ui.mjs
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'

const ROOT = fileURLToPath(new URL('../../', import.meta.url))
const LOGIN_PAGE = join(ROOT, 'apps/ceo-console/app/admin/login/page.tsx')
const MIDDLEWARE = join(ROOT, 'apps/ceo-console/middleware.ts')

let failed = false
function assert(label, condition, detail = '') {
  if (condition) {
    console.log(`  ✓ ${label}`)
  } else {
    console.error(`  ✗ FAIL: ${label}${detail ? '\n        ' + detail : ''}`)
    failed = true
  }
}

const loginPage = readFileSync(LOGIN_PAGE, 'utf8')
const middleware = readFileSync(MIDDLEWARE, 'utf8')

console.log('\n── Test: Login UI aponta para o endpoint correto')
assert(
  "fetch para '/api/admin/login' está presente",
  loginPage.includes('/api/admin/login'),
  "Não encontrado '/api/admin/login' em login/page.tsx"
)
assert(
  "método POST está presente",
  loginPage.includes("method: 'POST'"),
  "Não encontrado method: 'POST' em login/page.tsx"
)
assert(
  "Content-Type application/json presente",
  loginPage.includes('application/json'),
  "Não encontrado 'application/json' em login/page.tsx"
)

console.log('\n── Test: Login UI redireciona para /admin após 200')
assert(
  "redirect para '/admin' após res.ok",
  loginPage.includes("'/admin'") || loginPage.includes('"/admin"'),
  "Não encontrado redirect para '/admin' em login/page.tsx"
)

console.log('\n── Test: Login UI não expõe detalhes sensíveis no erro')
// A UI só mostra mensagem genérica — não deve incluir body.error do servidor
assert(
  "exibe mensagem genérica (sem body.error exposto diretamente)",
  !loginPage.includes('body.error') && (loginPage.includes('Credenciais') || loginPage.includes('inválid')),
  "UI expõe body.error ou não tem mensagem genérica"
)

console.log('\n── Test: Middleware allowlist cobre login e logout')
assert(
  "middleware permite /admin/login",
  middleware.includes('/admin/login'),
  "não encontrado '/admin/login' na allowlist do middleware"
)
assert(
  "middleware permite /api/admin/login",
  middleware.includes('/api/admin/login'),
  "não encontrado '/api/admin/login' na allowlist do middleware"
)
assert(
  "middleware permite /api/admin/logout",
  middleware.includes('/api/admin/logout'),
  "não encontrado '/api/admin/logout' na allowlist do middleware"
)

console.log('\n── Test: Endpoint não muda (contrato de URL estável)')
// Proibe endpoints alternativos que poderiam criar split-brain
const FORBIDDEN_ENDPOINTS = ['/api/login', '/api/auth/login', '/api/admin/signin']
for (const ep of FORBIDDEN_ENDPOINTS) {
  assert(
    `sem endpoint alternativo "${ep}" na UI`,
    !loginPage.includes(ep),
    `UI usa endpoint alternativo "${ep}" — deve usar apenas /api/admin/login`
  )
}

console.log('\n' + '═'.repeat(50))
if (failed) {
  console.error('[SMOKE FAILED] Login UI não satisfaz os contratos esperados.')
  process.exit(1)
} else {
  console.log('[SMOKE PASSED] Login UI contrato verificado.')
  process.exit(0)
}
