/**
 * GATE: no-auto-language
 * POL-NO-AUTO-01 — Proíbe o uso da palavra "automátic*" sem qualificador
 * epistêmico em documentos de governança e arquitetura.
 *
 * Qualificadores aceitos (devem estar no mesmo parágrafo):
 *   determinístico | verificável | auditável | mensurável | com evidência | com evidências
 *
 * Escaneia: docs/governance/**, docs/architecture/**, docs/PROMPT-00.md
 * Captura: automático, automática, automáticos, automáticas, automaticamente (e variantes)
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('../../', import.meta.url))

const SCAN_DIRS = [
  'docs/governance',
  'docs/architecture',
]
const SCAN_FILES = [
  'docs/PROMPT-00.md',
]

const AUTO_PATTERN = /autom[aá]tic/i
const QUALIFIER_PATTERN = /determinístic[ao]|verificável|auditável|mensurável|com evidência/i

function walk(dir) {
  const hits = []
  try {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry)
      const st = statSync(full)
      if (st.isDirectory()) hits.push(...walk(full))
      else if (entry.endsWith('.md') || entry.endsWith('.mdx') || entry.endsWith('.yaml') || entry.endsWith('.yml')) {
        hits.push(full)
      }
    }
  } catch { /* dir may not exist */ }
  return hits
}

let failed = false

const allFiles = [
  ...SCAN_DIRS.flatMap(d => walk(join(ROOT, d))),
  ...SCAN_FILES.map(f => join(ROOT, f)).filter(f => {
    try { readFileSync(f); return true } catch { return false }
  }),
]

// Arquivos que definem a própria regra são excluídos do scan (meta-docs)
const SELF_EXCLUDED = new Set([
  'POL-NO-AUTO-01.md',
])

for (const file of allFiles) {
  const basename = file.split(/[\\/]/).at(-1) ?? ''
  if (SELF_EXCLUDED.has(basename)) {
    console.log(`[SKIP] no-auto-language: ${relative(ROOT, file)} (arquivo de definição da regra, excluído)`)
    continue
  }
  const content = readFileSync(file, 'utf8')
  const paragraphs = content.replace(/\r\n/g, '\n').split(/\n{2,}/)
  for (const para of paragraphs) {
    if (AUTO_PATTERN.test(para) && !QUALIFIER_PATTERN.test(para)) {
      const rel = relative(ROOT, file)
      // Mostra linha aproximada
      const lines = content.split('\n')
      const paraStart = para.split('\n')[0].trim().slice(0, 80)
      console.error(`[FAIL] no-auto-language: "automátic*" sem qualificador em ${rel}`)
      console.error(`       Parágrafo: "${paraStart}..."`)
      console.error(`       Qualificadores aceitos: determinístico, verificável, auditável, mensurável, com evidência`)
      failed = true
    }
  }
}

if (!failed) {
  console.log('[PASS] no-auto-language — nenhum "automátic*" sem qualificador encontrado.')
}

process.exit(failed ? 1 : 0)
