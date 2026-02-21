/**
 * gate-no-hardcoded-endpoints.mjs
 *
 * FAIL se arquivos em apps/** ou lib/** contiverem string literals com:
 *   1) URLs http:// ou https:// hardcoded (não via process.env.* ou loadConnectionCatalog)
 *   2) Endpoints locais: localhost:NNNN ou 127.0.0.1:NNNN em string literals
 *
 * Formas PERMITIDAS:
 *   process.env.API_URL                — env ref (PASS)
 *   loadConnectionCatalog(...)         — catálogo tipado (PASS)
 *   lib/brand/envneo.ts               — constantes de marca pública (allowlist explícita)
 *
 * Exclusões:
 *   - docs/**, *.md (documentação humana)
 *   - node_modules, .next, dist, public
 *   - Linhas de comentário (// ... ou * ...)
 *   - SKIP_FILES_RELATIVE (allowlist explícita)
 *
 * Env:
 *   GATE_FIXTURE_ROOT — substitui rootDir para testes com fixtures.
 *
 * Exit 0 → PASS
 * Exit 1 → FAIL
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = process.env.GATE_FIXTURE_ROOT
  ?? fileURLToPath(new URL('../../', import.meta.url))

// ─── Configuração ─────────────────────────────────────────────────────────────

const SCAN_DIRS  = ['apps', 'lib']
const SCAN_EXTS  = ['.ts', '.tsx', '.mjs', '.js']
const SKIP_DIRS  = ['node_modules', '.next', 'dist', 'public', '.turbo']

// Arquivos allowlistados — endpoints legítimos não relacionados a conectividade
const SKIP_FILES_RELATIVE = [
  'lib/brand/envneo.ts',
  'lib/legal/legal-references.ts',
  'tools/policy-gates/gate-no-hardcoded-endpoints.mjs',
]

// ─── Padrões ──────────────────────────────────────────────────────────────────

// URL http(s):// em string literal (mínimo 4 chars após //)
const URL_LITERAL_RE   = /['"`](https?:\/\/[^'"`\s]{4,})['"`]/

// localhost ou 127.0.0.1 com porta em string literal
const LOCAL_LITERAL_RE = /['"`]((?:localhost|127\.0\.0\.1):\d{4,5})['"`]/

// Linha tem referência via env var ou catalog loader → PASS
const ALLOWED_LINE_RE  = /process\.env\.|loadConnectionCatalog/

// Linha de comentário → skip
const COMMENT_LINE_RE  = /^\s*(\/\/|\*\s|\/\*|\*\/)/

// ─── Walker ───────────────────────────────────────────────────────────────────

function walk(dir) {
  const hits = []
  let entries
  try { entries = readdirSync(dir) } catch { return hits }
  for (const entry of entries) {
    if (SKIP_DIRS.includes(entry)) continue
    const full = join(dir, entry)
    let st
    try { st = statSync(full) } catch { continue }
    if (st.isDirectory())                                    hits.push(...walk(full))
    else if (SCAN_EXTS.some(ext => entry.endsWith(ext)))     hits.push(full)
  }
  return hits
}

// ─── Run ──────────────────────────────────────────────────────────────────────

const allFiles = SCAN_DIRS.flatMap(d => walk(join(ROOT, d)))

let failed     = false
const failures = []

function fail(msg) {
  failures.push(msg)
  failed = true
}

for (const file of allFiles) {
  const rel = relative(ROOT, file).replace(/\\/g, '/')
  if (SKIP_FILES_RELATIVE.includes(rel)) continue

  let content
  try { content = readFileSync(file, 'utf8') } catch { continue }

  const lines = content.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const line    = lines[i]
    const lineNum = i + 1

    if (COMMENT_LINE_RE.test(line))  continue
    if (ALLOWED_LINE_RE.test(line))  continue

    const urlMatch = URL_LITERAL_RE.exec(line)
    if (urlMatch) {
      fail(`[FAIL] gate-no-hardcoded-endpoints: URL hardcoded em ${rel}:${lineNum} — "${urlMatch[1]}"`)
      continue
    }

    const localMatch = LOCAL_LITERAL_RE.exec(line)
    if (localMatch) {
      fail(`[FAIL] gate-no-hardcoded-endpoints: endpoint local hardcoded em ${rel}:${lineNum} — "${localMatch[1]}"`)
    }
  }
}

for (const f of failures) console.error(f)

if (failed) {
  console.error('[FAIL] gate-no-hardcoded-endpoints: endpoints hardcoded detectados. Use process.env.* ou loadConnectionCatalog().')
  process.exit(1)
} else {
  console.log(`[PASS] gate-no-hardcoded-endpoints: ${allFiles.length} arquivo(s) verificado(s). Nenhum endpoint hardcoded detectado.`)
  process.exit(0)
}
