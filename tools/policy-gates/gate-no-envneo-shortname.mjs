/**
 * gate-no-envneo-shortname.mjs
 *
 * Dois controles:
 *
 * 1) SHORTNAME DETECTOR
 *    FAIL se encontrar "Env Neo" como token isolado (\bEnv\s+Neo\b) não seguido
 *    de " Ltda" em arquivos de código fonte.
 *    Formas permitidas:
 *      - "ENV NEO LTDA"  (uppercase — não casa com o regex)
 *      - "Env Neo Ltda." (seguido de " Ltda" — lookahead negativo não dispara)
 *    Formas proibidas:
 *      - "Env Neo"  (isolado, sem sufixo Ltda)
 *      - "a plataforma Env Neo possui..."
 *
 * 2) CORPORATE SCREEN INTEGRITY
 *    FAIL se brand-registry.json não existir ou não contiver
 *    os campos obrigatórios: "ENV NEO LTDA" e "36.207.211/0001-47"
 *    (impede regressão silenciosa durante refactors).
 *
 * Escopo de varredura: apps/**, lib/**
 * Excluídos: node_modules, .next, dist, public, docs (design/histórico), arquivos do próprio gate.
 *
 * Env:
 *   GATE_FIXTURE_ROOT — sobrescreve rootDir para testes com fixtures.
 *
 * Exit 0 → PASS
 * Exit 1 → FAIL (shortname detectado OU integridade comprometida)
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = process.env.GATE_FIXTURE_ROOT ?? fileURLToPath(new URL('../../', import.meta.url))

// ─── Configuração ─────────────────────────────────────────────────────────────

const SCAN_DIRS = ['apps', 'lib']
const SCAN_EXTS = ['.ts', '.tsx', '.mjs', '.js', '.md', '.yaml', '.json']

// Arquivos a excluir da varredura (meta-docs e o próprio gate)
const SKIP_FILES_RELATIVE = [
  'tools/policy-gates/gate-no-envneo-shortname.mjs',
  'apps/ceo-console/tools/smoke/smoke-brand-envneo.mjs',
  'envneo/control-plane/bridge/brand-registry.json',
  'envneo/control-plane/bridge/imprint-rules.json',
  'envneo/control-plane/ltda/org-identity.json',
]

// Diretórios a ignorar
const SKIP_DIRS = ['node_modules', '.next', 'dist', 'public', '.turbo']

// Regex: "Env Neo" NÃO seguido de " Ltda" (lookahead negativo)
// Só casa com title-case — "ENV NEO" não casa pois regex é case-sensitive
const SHORTNAME_REGEX = /\bEnv\s+Neo\b(?!\s+Ltda)/g

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
    if (st.isDirectory()) {
      hits.push(...walk(full))
    } else if (SCAN_EXTS.some(ext => entry.endsWith(ext))) {
      hits.push(full)
    }
  }
  return hits
}

// ─── Coleta arquivos ──────────────────────────────────────────────────────────

let allFiles = []
for (const dir of SCAN_DIRS) {
  const dirPath = join(ROOT, dir)
  if (existsSync(dirPath)) allFiles.push(...walk(dirPath))
}

// Filtra arquivos excluídos
allFiles = allFiles.filter(f => {
  const rel = relative(ROOT, f).replace(/\\/g, '/')
  return !SKIP_FILES_RELATIVE.includes(rel)
})

// ─── Controle 1: Shortname detector ──────────────────────────────────────────

let failures = 0

for (const f of allFiles) {
  const rel = relative(ROOT, f).replace(/\\/g, '/')
  let content
  try { content = readFileSync(f, 'utf8') } catch { continue }

  const matches = [...content.matchAll(SHORTNAME_REGEX)]
  if (matches.length > 0) {
    for (const m of matches) {
      const lineNum = content.slice(0, m.index).split('\n').length
      console.error(`[FAIL] gate-no-envneo-shortname: "${m[0]}" isolado em ${rel}:${lineNum}`)
    }
    failures++
  }
}

// ─── Controle 2: Corporate screen integrity ───────────────────────────────────

const brandRegistryPath = join(ROOT, 'envneo', 'control-plane', 'bridge', 'brand-registry.json')

if (!existsSync(brandRegistryPath)) {
  console.error('[FAIL] gate-no-envneo-shortname: brand-registry.json não encontrado.')
  console.error(`       Esperado em: ${brandRegistryPath}`)
  failures++
} else {
  const registryContent = readFileSync(brandRegistryPath, 'utf8')
  if (!registryContent.includes('ENV NEO LTDA')) {
    console.error('[FAIL] gate-no-envneo-shortname: brand-registry.json não contém "ENV NEO LTDA" — integridade comprometida.')
    failures++
  }
  if (!registryContent.includes('36.207.211/0001-47')) {
    console.error('[FAIL] gate-no-envneo-shortname: brand-registry.json não contém CNPJ "36.207.211/0001-47" — integridade comprometida.')
    failures++
  }
}

// ─── Resultado ────────────────────────────────────────────────────────────────

if (failures > 0) {
  process.exit(1)
}

const fileCount = allFiles.length
console.log(`[PASS] gate-no-envneo-shortname: ${fileCount} arquivo(s) verificado(s). Nenhum "Env Neo" isolado detectado. brand-registry.json íntegro.`)
process.exit(0)
