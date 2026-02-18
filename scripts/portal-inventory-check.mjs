import fs from 'node:fs'
import path from 'node:path'
import { execFileSync, spawnSync } from 'node:child_process'

const INVENTORY = 'docs/inventory/INVENTORY-PORTAL-DATA.md'
const CONTENT_CATALOG = 'docs/content/CONTENT-CATALOG.yaml'

function fail(message) {
  process.stderr.write(`${message}\n`)
  process.exit(1)
}

function git(args) {
  try {
    return execFileSync('git', args, { encoding: 'utf8' }).trim()
  } catch (err) {
    const msg = err && typeof err === 'object' && 'message' in err ? String(err.message) : String(err)
    fail(`portal-inventory:check: git ${args.join(' ')} failed: ${msg}`)
  }
}

function isWorkingTreeDirty() {
  return git(['status', '--porcelain']).trim() !== ''
}

function tryMergeBase(ref) {
  const res = spawnSync('git', ['merge-base', ref, 'HEAD'], { encoding: 'utf8' })
  if (res.status !== 0) return null
  const out = (res.stdout || '').trim()
  return out || null
}

function listChangedFiles() {
  if (isWorkingTreeDirty()) {
    const tracked = git(['diff', '--name-only', 'HEAD']).split(/\r?\n/).filter(Boolean)
    const untracked = git(['ls-files', '--others', '--exclude-standard']).split(/\r?\n/).filter(Boolean)
    return Array.from(new Set([...tracked, ...untracked])).sort()
  }

  const refs = ['origin/main', 'main', 'origin/master', 'master']
  let base = null
  for (const ref of refs) {
    base = tryMergeBase(ref)
    if (base) break
  }
  if (!base) base = 'HEAD~1'

  const res = spawnSync('git', ['diff', '--name-only', `${base}...HEAD`], { encoding: 'utf8' })
  if (res.status !== 0) {
    // Fail-closed base fallback
    const res2 = spawnSync('git', ['diff', '--name-only', 'HEAD~1...HEAD'], { encoding: 'utf8' })
    if (res2.status !== 0) return []
    return (res2.stdout || '').trim().split(/\r?\n/).filter(Boolean).sort()
  }

  return (res.stdout || '').trim().split(/\r?\n/).filter(Boolean).sort()
}

function readRequired(relPath) {
  const abs = path.resolve(process.cwd(), relPath)
  if (!fs.existsSync(abs)) fail(`portal-inventory:check: missing required file: ${relPath}`)
  return fs.readFileSync(abs, 'utf8')
}

function normalizeKey(value) {
  let k = value.trim()
  if ((k.startsWith('"') && k.endsWith('"')) || (k.startsWith("'") && k.endsWith("'"))) {
    k = k.slice(1, -1)
  }
  return k.trim()
}

function generateContentKeysBlock() {
  const text = readRequired(CONTENT_CATALOG)
  const lines = text.split(/\r?\n/)
  const keys = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    // Suporta tanto `key: ...` quanto `- key: ...`
    const candidate = trimmed.startsWith('-') ? trimmed.slice(1).trimStart() : trimmed
    if (!candidate.startsWith('key:')) continue

    const raw = candidate.slice('key:'.length)
    const key = normalizeKey(raw)
    if (key) keys.push(key)
  }

  const uniq = Array.from(new Set(keys)).sort((a, b) => a.localeCompare(b))
  return uniq.map((k) => `- ${k}`)
}

function generateCoreReadModelsBlock() {
  return [
    '- Core Portal Brand v1 — GET /public/v1/portal/brand — lib/core/portalBrand.ts — consumo server-only (Header/Footer)',
  ]
}

function extractGeneratedBlock(fileContent, marker) {
  const begin = `<!-- GENERATED:BEGIN ${marker} -->`
  const end = `<!-- GENERATED:END ${marker} -->`

  const bi = fileContent.indexOf(begin)
  const ei = fileContent.indexOf(end)

  if (bi < 0 || ei < 0 || ei < bi) {
    fail(`portal-inventory:check: missing or invalid markers for '${marker}' in ${INVENTORY}`)
  }

  const inner = fileContent.slice(bi + begin.length, ei)

  return inner
    .replace(/^\r?\n/, '')
    .replace(/\r?\n\s*$/, '')
    .split(/\r?\n/)
}

function firstDiffLine(expected, actual) {
  const max = Math.max(expected.length, actual.length)
  for (let i = 0; i < max; i += 1) {
    const e = expected[i]
    const a = actual[i]
    if (e !== a) return { index: i, expected: e, actual: a }
  }
  return null
}

function assertBlockEquals(marker, expectedLines) {
  const content = readRequired(INVENTORY)
  const actualLines = extractGeneratedBlock(content, marker)

  const exp = expectedLines.join('\n')
  const act = actualLines.join('\n')

  if (exp !== act) {
    const diff = firstDiffLine(expectedLines, actualLines)
    const where = diff ? `first diff at line ${diff.index + 1}` : 'diff'
    fail(
      [
        `portal-inventory:check: GENERATED block mismatch (${marker}) in ${INVENTORY}`,
        `expected ${expectedLines.length} lines, got ${actualLines.length} lines`,
        where,
        diff ? `expected: ${diff.expected ?? '<missing>'}` : '',
        diff ? `actual:   ${diff.actual ?? '<missing>'}` : '',
      ]
        .filter(Boolean)
        .join('\n')
    )
  }
}

function assertDriftRule(changedFiles) {
  const needsInventory = changedFiles.some(
    (p) => p.startsWith('app/') || p.startsWith('components/') || p.startsWith('lib/')
  )

  if (!needsInventory) return

  if (!changedFiles.includes(INVENTORY)) {
    fail(
      'portal-inventory:check: DRIFT rule violated: Mudanças em app/components/lib exigem atualização do INVENTORY-PORTAL-DATA.md'
    )
  }
}

function main() {
  const changedFiles = listChangedFiles()
  assertDriftRule(changedFiles)

  assertBlockEquals('content_keys', generateContentKeysBlock())
  assertBlockEquals('core_read_models', generateCoreReadModelsBlock())

  process.stdout.write('portal-inventory:check: OK\n')
}

main()
