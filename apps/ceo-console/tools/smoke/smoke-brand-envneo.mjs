/**
 * smoke-brand-envneo.mjs — Smoke test: Contrato da logo Env Neo Ltda.
 *
 * Testes:
 *   1) Asset existe em public/brand/envneo/logo.svg
 *   2) /admin/login referencia o componente EnvNeoLogo OU o path /brand/envneo/logo.svg
 *   3) Anti-espalhamento: "/brand/envneo/logo.svg" só aparece em EnvNeoLogo.tsx
 *      (login page deve referenciar pelo componente, não pelo path diretamente)
 *
 * Saída: [SMOKE PASSED] ou [SMOKE FAILED] com detalhes.
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('../../', import.meta.url))

let failed = false
let passed = 0

function pass(msg) {
  console.log(`  ✓ ${msg}`)
  passed++
}

function fail(msg, detail = '') {
  console.error(`  ✗ FAIL: ${msg}`)
  if (detail) console.error(`        ${detail}`)
  failed = true
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function readSafe(filePath) {
  try { return readFileSync(filePath, 'utf8') } catch { return null }
}

function walkFiles(dir, exts) {
  const hits = []
  let entries
  try { entries = readdirSync(dir) } catch { return hits }
  for (const entry of entries) {
    if (entry === 'node_modules' || entry === '.next' || entry === 'dist') continue
    const full = join(dir, entry)
    let st
    try { st = statSync(full) } catch { continue }
    if (st.isDirectory()) hits.push(...walkFiles(full, exts))
    else if (!exts || exts.some(e => entry.endsWith(e))) hits.push(full)
  }
  return hits
}

// ─── Test 1: Asset existe ──────────────────────────────────────────────────────

console.log('\n── Test 1: Asset corporativo')
const ASSET_PATH = join(ROOT, 'public', 'brand', 'envneo', 'logo.svg')

if (existsSync(ASSET_PATH)) {
  pass('apps/ceo-console/public/brand/envneo/logo.svg existe')
  const content = readSafe(ASSET_PATH) ?? ''
  if (content.includes('<svg') || content.includes('<?xml')) {
    pass('logo.svg contém marcação SVG válida')
  } else {
    fail('logo.svg existe mas não parece um SVG válido', 'Esperado: tag <svg ou <?xml')
  }
} else {
  fail('apps/ceo-console/public/brand/envneo/logo.svg NÃO encontrado',
    `Caminho verificado: ${ASSET_PATH}`)
}

// ─── Test 2: login page referencia o componente ou o path ─────────────────────

console.log('\n── Test 2: /admin/login referencia EnvNeoLogo ou path da logo')
const LOGIN_PAGE = join(ROOT, 'app', 'admin', 'login', 'page.tsx')
const LOGIN_FORM = join(ROOT, 'app', 'admin', 'login', 'LoginForm.tsx')

const pageContent = readSafe(LOGIN_PAGE) ?? ''
const formContent = readSafe(LOGIN_FORM) ?? ''
const combinedLogin = pageContent + formContent

const hasComponentRef = /EnvNeoLogo/.test(combinedLogin)
const hasPathRef = /\/brand\/envneo\/logo\.svg/.test(combinedLogin)

if (hasComponentRef) {
  pass('login page importa/usa EnvNeoLogo')
} else if (hasPathRef) {
  pass('login page referencia /brand/envneo/logo.svg diretamente')
} else {
  fail('login page NÃO referencia EnvNeoLogo nem /brand/envneo/logo.svg',
    'Arquivos verificados: app/admin/login/page.tsx, LoginForm.tsx')
}

// metadata.title check
if (/Env Neo Ltda.*Login|Login.*Env Neo Ltda/.test(pageContent)) {
  pass('metadata.title contém "Env Neo Ltda." e "Login"')
} else {
  fail('metadata.title não encontrado em page.tsx com "Env Neo Ltda. — Login"')
}

// CNPJ check
if (/36\.207\.211\/0001-47/.test(combinedLogin)) {
  pass('CNPJ 36.207.211/0001-47 presente na tela de login')
} else {
  fail('CNPJ 36.207.211/0001-47 NÃO encontrado em login page / LoginForm')
}

// ─── Test 3: Anti-espalhamento — path hardcoded só em EnvNeoLogo.tsx ──────────

console.log('\n── Test 3: Anti-espalhamento do path /brand/envneo/logo.svg')

const LOGO_COMPONENT = join(ROOT, 'components', 'brand', 'EnvNeoLogo.tsx')
const SOURCE_DIRS = ['app', 'components', 'lib', 'middleware.ts']

const LOGO_PATH_PATTERN = /\/brand\/envneo\/logo\.svg/

// Collect all TS/TSX files under the app root (except node_modules/.next)
const allSourceFiles = [
  ...walkFiles(join(ROOT, 'app'), ['.ts', '.tsx']),
  ...walkFiles(join(ROOT, 'components'), ['.ts', '.tsx']),
  ...walkFiles(join(ROOT, 'lib'), ['.ts', '.tsx']),
]
// Also check middleware.ts at root
const middlewarePath = join(ROOT, 'middleware.ts')
if (existsSync(middlewarePath)) allSourceFiles.push(middlewarePath)

const filesWithHardcodedPath = allSourceFiles.filter(f => {
  const rel = relative(ROOT, f).replace(/\\/g, '/')
  const content = readSafe(f) ?? ''
  // It's allowed in EnvNeoLogo.tsx — that's the single source
  if (rel === 'components/brand/EnvNeoLogo.tsx') return false
  return LOGO_PATH_PATTERN.test(content)
})

if (filesWithHardcodedPath.length === 0) {
  pass('Nenhum arquivo hardcoda /brand/envneo/logo.svg fora de EnvNeoLogo.tsx')
} else {
  fail(
    `Path /brand/envneo/logo.svg hardcoded fora de EnvNeoLogo.tsx em ${filesWithHardcodedPath.length} arquivo(s):`,
    filesWithHardcodedPath.map(f => '  ' + relative(ROOT, f)).join('\n')
  )
}

// EnvNeoLogo.tsx deve existir e conter o path
if (existsSync(LOGO_COMPONENT)) {
  const logoComp = readSafe(LOGO_COMPONENT) ?? ''
  if (LOGO_PATH_PATTERN.test(logoComp)) {
    pass('EnvNeoLogo.tsx é a fonte única — contém /brand/envneo/logo.svg')
  } else {
    fail('EnvNeoLogo.tsx existe mas NÃO contém /brand/envneo/logo.svg')
  }
} else {
  fail('components/brand/EnvNeoLogo.tsx NÃO encontrado')
}

// ─── Resumo ────────────────────────────────────────────────────────────────────

console.log('\n' + '═'.repeat(50))
if (failed) {
  console.error(`[SMOKE FAILED] smoke-brand-envneo — verifique os itens acima.`)
  process.exit(1)
} else {
  console.log(`[SMOKE PASSED] smoke-brand-envneo — ${passed}/${passed} verificações OK.`)
  process.exit(0)
}
