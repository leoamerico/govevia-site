import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import yaml from 'js-yaml'

const repoRoot = process.cwd()
const registryPath = path.join(repoRoot, 'docs/public/claims/WEB-CLAIMS-REGISTRY.yaml')

function fail(message) {
  console.error(`web-claims-registry: ${message}`)
  process.exitCode = 1
}

function assertFileExists(relativePath, context) {
  const filePath = path.join(repoRoot, relativePath)
  if (!fs.existsSync(filePath)) {
    fail(`${context}: arquivo não encontrado: ${relativePath}`)
    return false
  }
  return true
}

function readText(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8')
}

function listRuntimeCopyFiles() {
  const roots = ['app', 'components', 'content']
  const exts = new Set(['.ts', '.tsx', '.md', '.mdx'])

  /** @type {string[]} */
  const results = []

  for (const root of roots) {
    const absRoot = path.join(repoRoot, root)
    if (!fs.existsSync(absRoot)) continue

    /** @type {string[]} */
    const stack = [absRoot]

    while (stack.length) {
      const cur = stack.pop()
      if (!cur) break

      const entries = fs.readdirSync(cur, { withFileTypes: true })
      for (const e of entries) {
        const abs = path.join(cur, e.name)
        if (e.isDirectory()) {
          // ignore build artifacts / dependencies
          if (e.name === 'node_modules' || e.name === '.next') continue
          stack.push(abs)
          continue
        }
        const ext = path.extname(e.name)
        if (!exts.has(ext)) continue
        results.push(path.relative(repoRoot, abs))
      }
    }
  }

  return results
}

function isSafeNegatedContext(pattern, snippetLower) {
  // Allow the legal disclaimer "não substitui parecer jurídico".
  if (pattern.toLowerCase().includes('substitui parecer')) {
    return snippetLower.includes('não substitui parecer')
  }
  return false
}

if (!fs.existsSync(registryPath)) {
  fail(`registry não encontrado em ${path.relative(repoRoot, registryPath)}`)
  process.exit(1)
}

let doc
try {
  doc = yaml.load(fs.readFileSync(registryPath, 'utf8'))
} catch (err) {
  fail(`YAML inválido: ${(err && err.message) || String(err)}`)
  process.exit(1)
}

const meta = doc && doc.meta
if (!meta || typeof meta !== 'object') {
  fail('campo `meta` obrigatório')
}

const claims = doc && doc.claims
if (!Array.isArray(claims)) {
  fail('campo `claims` deve ser uma lista')
  process.exit(1)
}

const forbidden = doc && doc.forbidden_language
if (!Array.isArray(forbidden) || forbidden.length === 0) {
  fail('campo `forbidden_language` deve ser uma lista não-vazia')
}

const allowedDomains = new Set(['normas', 'prova', 'seguranca', 'privacidade', 'ai', 'arquitetura'])
const allowedRisk = new Set(['high', 'medium', 'low'])
const allowedStatus = new Set(['proven', 'partial', 'planned'])

const seenIds = new Set()

for (const c of claims) {
  const id = c?.id
  const domain = c?.domain
  const risk = c?.risk_level
  const status = c?.status
  const claimPt = c?.claim_pt
  const publishableCopy = c?.publishable_copy

  if (!id || typeof id !== 'string') fail('claim sem `id` string')
  if (id && seenIds.has(id)) fail(`id duplicado: ${id}`)
  if (id) seenIds.add(id)

  if (!domain || typeof domain !== 'string' || !allowedDomains.has(domain)) {
    fail(`${id || 'claim'}: domain inválido (use ${Array.from(allowedDomains).join(' | ')})`)
  }
  if (!risk || typeof risk !== 'string' || !allowedRisk.has(risk)) {
    fail(`${id || 'claim'}: risk_level inválido (use high | medium | low)`)
  }
  if (!status || typeof status !== 'string' || !allowedStatus.has(status)) {
    fail(`${id || 'claim'}: status inválido (use proven | partial | planned)`)
  }
  if (!claimPt || typeof claimPt !== 'string') {
    fail(`${id || 'claim'}: campo claim_pt obrigatório`) 
  }

  if (status === 'planned' && publishableCopy != null) {
    fail(`${id}: status planned exige publishable_copy: null`)
  }
  if (status === 'proven' && (!publishableCopy || typeof publishableCopy !== 'string')) {
    fail(`${id}: status proven exige publishable_copy string`) 
  }

  if (status === 'proven') {
    const boundaries = c?.boundaries
    if (!Array.isArray(boundaries) || boundaries.length === 0) {
      fail(`${id}: status proven exige boundaries não-vazio`)
    }

    const evidence = c?.evidence
    if (!Array.isArray(evidence) || evidence.length === 0) {
      fail(`${id}: status proven exige evidence não-vazio`)
    } else {
      const types = new Set()
      for (const e of evidence) {
        const type = e?.type
        const p = e?.path
        if (!type || typeof type !== 'string') fail(`${id}: evidence.type obrigatório`)
        if (!p || typeof p !== 'string') fail(`${id}: evidence.path obrigatório`)
        if (type && typeof type === 'string') types.add(type)
        if (p && typeof p === 'string') assertFileExists(p, `${id}: evidence`)
      }

      if (risk === 'high' && types.size < 2) {
        fail(`${id}: risk_level high exige pelo menos 2 tipos independentes de evidence`) 
      }
    }

    if (!c?.client_verification || typeof c.client_verification !== 'string') {
      fail(`${id}: status proven exige client_verification`) 
    }
  }

  if (status === 'planned') {
    const depends = c?.depends_on
    if (!Array.isArray(depends) || depends.length === 0) {
      fail(`${id}: status planned exige depends_on não-vazio`) 
    }
  }
}

// Forbidden language gate over public web copy.
const runtimeFiles = listRuntimeCopyFiles()

for (const entry of forbidden || []) {
  const pat = entry?.pattern
  const reason = entry?.reason
  if (!pat || typeof pat !== 'string') {
    fail('forbidden_language.pattern deve ser string')
    continue
  }

  const rx = new RegExp(pat, 'i')

  for (const relFile of runtimeFiles) {
    const txt = readText(relFile)
    const m = rx.exec(txt)
    if (!m) continue

    const start = Math.max(0, m.index - 60)
    const end = Math.min(txt.length, m.index + m[0].length + 60)
    const snippet = txt.slice(start, end)

    if (isSafeNegatedContext(pat, snippet.toLowerCase())) {
      continue
    }

    fail(
      `forbidden_language match: ${JSON.stringify(pat)} in ${relFile} (${reason || 'sem reason'})\n` +
        `  snippet: ${JSON.stringify(snippet.replace(/\s+/g, ' ').trim())}`
    )
  }
}

if (process.exitCode) {
  process.exit(process.exitCode)
}

console.log('web-claims-registry: PASS')
