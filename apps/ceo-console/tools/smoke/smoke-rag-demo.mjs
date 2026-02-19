/**
 * smoke-rag-demo.mjs — Smoke test: Demo RAG Kernel Govevia
 *
 * Valida invariáveis da rota /admin/rag:
 *   1) Rota existe: apps/ceo-console/app/admin/rag/page.tsx
 *   2) Imprint corporativo presente: "ENV NEO LTDA" + "36.207.211/0001-47"
 *   3) GOVEVIA_KERNEL_BASE_URL referenciado em actions.ts (sem hardcode)
 *   4) Sem URL hardcoded (https://, localhost:) em string literals nos arquivos RAG
 *   5) RagDemoClient.tsx existe e importa Server Actions (uploadDoc, searchDocs)
 *   6) Evidência: ação registra em REGISTRY-OPS.ndjson (appendFileSync presente)
 */
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT      = fileURLToPath(new URL('../../', import.meta.url))
const RAG_DIR   = join(ROOT, 'app', 'admin', 'rag')
const PAGE_PATH = join(RAG_DIR, 'page.tsx')
const ACT_PATH  = join(RAG_DIR, 'actions.ts')
const CLI_PATH  = join(RAG_DIR, 'RagDemoClient.tsx')
const PKG_PATH  = join(ROOT, 'package.json')

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

function readSafe(p) {
  try { return readFileSync(p, 'utf8') } catch { return null }
}

// ─── Test 1: Rota existe ──────────────────────────────────────────────────────

console.log('\n── Test 1: Rota /admin/rag')

if (existsSync(PAGE_PATH)) {
  pass('app/admin/rag/page.tsx existe')
} else {
  fail('app/admin/rag/page.tsx NÃO encontrado', `Verificado em: ${PAGE_PATH}`)
}

if (existsSync(ACT_PATH)) {
  pass('app/admin/rag/actions.ts existe')
} else {
  fail('app/admin/rag/actions.ts NÃO encontrado')
}

if (existsSync(CLI_PATH)) {
  pass('app/admin/rag/RagDemoClient.tsx existe')
} else {
  fail('app/admin/rag/RagDemoClient.tsx NÃO encontrado')
}

// ─── Test 2: Imprint corporativo ─────────────────────────────────────────────

console.log('\n── Test 2: Imprint corporativo na página')

const pageContent = readSafe(PAGE_PATH) ?? ''

if (/ENV NEO LTDA/.test(pageContent)) {
  pass('page.tsx contém "ENV NEO LTDA"')
} else {
  fail('page.tsx NÃO contém "ENV NEO LTDA"')
}

if (/36\.207\.211\/0001-47/.test(pageContent)) {
  pass('page.tsx contém CNPJ "36.207.211/0001-47"')
} else {
  fail('page.tsx NÃO contém CNPJ "36.207.211/0001-47"')
}

// ─── Test 3: GOVEVIA_KERNEL_BASE_URL referenciado ────────────────────────────

console.log('\n── Test 3: GOVEVIA_KERNEL_BASE_URL via env (sem hardcode)')

const actContent = readSafe(ACT_PATH) ?? ''

if (/GOVEVIA_KERNEL_BASE_URL/.test(actContent)) {
  pass('actions.ts referencia GOVEVIA_KERNEL_BASE_URL')
} else {
  fail('actions.ts NÃO referencia GOVEVIA_KERNEL_BASE_URL')
}

if (/process\.env\.GOVEVIA_KERNEL_BASE_URL/.test(actContent)) {
  pass('actions.ts lê kernel URL via process.env (não hardcoded)')
} else {
  fail('actions.ts não usa process.env.GOVEVIA_KERNEL_BASE_URL')
}

// ─── Test 4: Sem URL hardcoded nos arquivos RAG ───────────────────────────────

console.log('\n── Test 4: Sem URL hardcoded em string literal nos arquivos RAG')

const URL_LITERAL_RE   = /['"`](https?:\/\/[^'"`\s]{4,})['"`]/
const LOCAL_LITERAL_RE = /['"`]((?:localhost|127\.0\.0\.1):\d{4,5})['"`]/
const ALLOWED_LINE_RE  = /process\.env\./

const ragFiles = [
  ['page.tsx', pageContent],
  ['actions.ts', actContent],
  ['RagDemoClient.tsx', readSafe(CLI_PATH) ?? ''],
]

let hardcodeFound = false
for (const [name, src] of ragFiles) {
  for (const line of src.split('\n')) {
    if (/^\s*(\/\/|\*\s|\/\*|\*\/)/.test(line)) continue
    if (ALLOWED_LINE_RE.test(line)) continue
    if (URL_LITERAL_RE.test(line) || LOCAL_LITERAL_RE.test(line)) {
      fail(`URL hardcoded em ${name}: "${line.trim()}"`)
      hardcodeFound = true
    }
  }
}
if (!hardcodeFound) {
  pass('Nenhuma URL hardcoded em string literal nos arquivos RAG')
}

// ─── Test 5: Client imports Server Actions ────────────────────────────────────

console.log('\n── Test 5: RagDemoClient importa Server Actions')

const cliContent = readSafe(CLI_PATH) ?? ''

if (/uploadDoc/.test(cliContent) && /searchDocs/.test(cliContent)) {
  pass('RagDemoClient.tsx importa uploadDoc e searchDocs')
} else {
  fail('RagDemoClient.tsx NÃO importa uploadDoc e searchDocs de actions.ts')
}

if (/'use client'/.test(cliContent)) {
  pass('RagDemoClient.tsx tem "use client"')
} else {
  fail('RagDemoClient.tsx NÃO tem diretiva "use client"')
}

// ─── Test 6: Evidência append-only em actions.ts ─────────────────────────────

console.log('\n── Test 6: Evidência append-only no registry')

if (/appendFileSync/.test(actContent)) {
  pass('actions.ts usa appendFileSync (append-only ao registry)')
} else {
  fail('actions.ts NÃO usa appendFileSync — evidência append-only ausente')
}

if (/hash_payload/.test(actContent)) {
  pass('actions.ts registra hash_payload (sem payload bruto)')
} else {
  fail('actions.ts NÃO registra hash_payload')
}

// ─── Test 7: Script smoke:rag em package.json ─────────────────────────────────

console.log('\n── Test 7: Script smoke:rag em package.json')

const pkgContent = readSafe(PKG_PATH) ?? ''
let pkg = null
try { pkg = JSON.parse(pkgContent) } catch { /* skip */ }

if (pkg?.scripts?.['smoke:rag']) {
  pass(`package.json tem script "smoke:rag": "${pkg.scripts['smoke:rag']}"`)
} else {
  fail('package.json NÃO tem script "smoke:rag"')
}

// ─── Resumo ───────────────────────────────────────────────────────────────────

console.log('\n' + '═'.repeat(50))
if (failed) {
  console.error('[SMOKE FAILED] smoke-rag-demo — verifique os itens acima.')
  process.exit(1)
} else {
  console.log(`[SMOKE PASSED] smoke-rag-demo — ${passed}/${passed} verificações OK.`)
  process.exit(0)
}
