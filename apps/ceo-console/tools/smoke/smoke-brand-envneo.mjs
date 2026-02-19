/**
 * smoke-brand-envneo.mjs — Smoke test: Identidade Corporativa ENV NEO LTDA
 *
 * Valida invariáveis corporativas do login do ceo-console:
 *   1) brand-registry.json existe e contém "ENV NEO LTDA" + CNPJ correto + logo=null + slogan=null
 *   2) page.tsx referencia brand-registry.json (não org-identity.json)
 *   3) metadata.title = "ENV NEO LTDA — Login"
 *   4) page.tsx passa prop legalName ao LoginForm
 *   5) LoginForm não contém logo no contexto corporativo
 *   6) login NÃO contém "Env Neo" isolado (formato proibido)
 *   7) LoginForm usa Open Sans 12px na tipografia corporativa
 */

import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
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

function readSafe(filePath) {
  try { return readFileSync(filePath, 'utf8') } catch { return null }
}

// ─── Test 1: brand-registry.json — fonte de verdade corporativa ──────────────

console.log('\n── Test 1: brand-registry.json')

const BRAND_REGISTRY_PATH = join(ROOT, '../../envneo/control-plane/bridge/brand-registry.json')

if (!existsSync(BRAND_REGISTRY_PATH)) {
  fail('brand-registry.json não encontrado', `Verificado em: ${BRAND_REGISTRY_PATH}`)
} else {
  const content = readSafe(BRAND_REGISTRY_PATH) ?? ''
  let registry
  try { registry = JSON.parse(content) } catch { registry = null }

  if (!registry) {
    fail('brand-registry.json não é JSON válido')
  } else {
    const entity = registry['ENVNEO_LTDA']
    if (!entity) {
      fail('brand-registry.json não contém chave ENVNEO_LTDA')
    } else {
      if (entity.legal_name_upper === 'ENV NEO LTDA') {
        pass('ENVNEO_LTDA.legal_name_upper = "ENV NEO LTDA"')
      } else {
        fail(`ENVNEO_LTDA.legal_name_upper incorreto: "${entity.legal_name_upper}"`, 'Esperado: "ENV NEO LTDA"')
      }
      if (entity.cnpj === '36.207.211/0001-47') {
        pass('ENVNEO_LTDA.cnpj = "36.207.211/0001-47"')
      } else {
        fail(`ENVNEO_LTDA.cnpj incorreto: "${entity.cnpj}"`, 'Esperado: "36.207.211/0001-47"')
      }
      if (entity.logo === null) {
        pass('ENVNEO_LTDA.logo = null (sem logo corporativo)')
      } else {
        fail(`ENVNEO_LTDA.logo DEVE ser null — encontrado: "${entity.logo}"`)
      }
      if (entity.slogan === null) {
        pass('ENVNEO_LTDA.slogan = null (sem slogan corporativo)')
      } else {
        fail(`ENVNEO_LTDA.slogan DEVE ser null — encontrado: "${entity.slogan}"`)
      }
    }
  }
}

// ─── Test 2: login page — fonte e props corretas ─────────────────────────────

console.log('\n── Test 2: login page.tsx — fonte brand-registry.json')

const LOGIN_PAGE_PATH = join(ROOT, 'app/admin/login/page.tsx')
const LOGIN_FORM_PATH = join(ROOT, 'app/admin/login/LoginForm.tsx')

const pageContent = readSafe(LOGIN_PAGE_PATH) ?? ''
const formContent = readSafe(LOGIN_FORM_PATH) ?? ''

if (pageContent.includes('brand-registry.json')) {
  pass('page.tsx referencia brand-registry.json (fonte correta)')
} else {
  fail('page.tsx NÃO referencia brand-registry.json')
}

if (!pageContent.includes('org-identity.json')) {
  pass('page.tsx não usa org-identity.json (descontinuado neste contexto)')
} else {
  fail('page.tsx ainda referencia org-identity.json — deve usar brand-registry.json')
}

if (/ENV NEO LTDA/.test(pageContent) && /Login/.test(pageContent)) {
  pass('metadata.title contém "ENV NEO LTDA" e "Login"')
} else {
  fail('metadata.title não contém "ENV NEO LTDA — Login"')
}

if (/legalName/.test(pageContent)) {
  pass('page.tsx passa prop legalName ao LoginForm')
} else {
  fail('page.tsx NÃO passa prop legalName ao LoginForm')
}

// ─── Test 3: LoginForm — sem logo ────────────────────────────────────────────

console.log('\n── Test 3: LoginForm — sem logo no contexto corporativo')

const LOGO_PATTERNS = [
  /EnvNeoLogo/,
  /brand\/envneo\/logo\.svg/,
  /brand\/govevia\/logo\.svg/,
]

let hasLogo = false
for (const pattern of LOGO_PATTERNS) {
  if (pattern.test(formContent)) {
    fail(`LoginForm.tsx contém referência a logo proibida: ${pattern}`)
    hasLogo = true
  }
}
if (!hasLogo) {
  pass('LoginForm.tsx não contém logo no contexto corporativo')
}

// ─── Test 4: Sem "Env Neo" isolado ───────────────────────────────────────────

console.log('\n── Test 4: Sem "Env Neo" isolado em login')

const SHORTNAME_REGEX = /\bEnv\s+Neo\b(?!\s+Ltda)/g
;[
  ['page.tsx', pageContent],
  ['LoginForm.tsx', formContent],
].forEach(([label, src]) => {
  const matches = [...src.matchAll(SHORTNAME_REGEX)]
  if (matches.length === 0) {
    pass(`${label} não contém "Env Neo" isolado`)
  } else {
    fail(`${label} contém "Env Neo" isolado (${matches.length} ocorrência/s)`)
  }
})

// ─── Test 5: Tipografia Open Sans 12px ───────────────────────────────────────

console.log('\n── Test 5: LoginForm — tipografia Open Sans 12px')

if (/Open Sans/.test(formContent)) {
  pass('LoginForm.tsx usa Open Sans')
} else {
  fail('LoginForm.tsx NÃO menciona Open Sans')
}

if (/12px/.test(formContent) || /fontSize.*12[^0-9]/.test(formContent)) {
  pass('LoginForm.tsx especifica font-size 12px')
} else {
  fail('LoginForm.tsx NÃO especifica font-size 12px')
}

// ─── Resumo ───────────────────────────────────────────────────────────────────

console.log('\n' + '═'.repeat(50))
if (failed) {
  console.error('[SMOKE FAILED] smoke-brand-envneo — verifique os itens acima.')
  process.exit(1)
} else {
  console.log(`[SMOKE PASSED] smoke-brand-envneo — ${passed}/${passed} verificações OK.`)
  process.exit(0)
}
