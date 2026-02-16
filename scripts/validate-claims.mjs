import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import yaml from 'js-yaml'

const repoRoot = process.cwd()
const manifestPath = path.join(repoRoot, 'docs/public/claims/CLAIMS-MANIFEST.yaml')

function fail(message) {
  console.error(`claims: ${message}`)
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

if (!fs.existsSync(manifestPath)) {
  fail(`manifesto não encontrado em ${path.relative(repoRoot, manifestPath)}`)
  process.exit(1)
}

let doc
try {
  doc = yaml.load(fs.readFileSync(manifestPath, 'utf8'))
} catch (err) {
  fail(`YAML inválido: ${(err && err.message) || String(err)}`)
  process.exit(1)
}

const claims = doc && doc.claims
if (!Array.isArray(claims)) {
  fail('campo `claims` deve ser uma lista')
  process.exit(1)
}

const allowedStatuses = new Set(['GA', 'PILOT', 'ROADMAP_GOVERNED'])
const seenIds = new Set()

for (const claim of claims) {
  const id = claim?.id
  const title = claim?.title
  const status = claim?.status
  const evidence = claim?.evidence

  if (!id || typeof id !== 'string') fail('claim sem `id` string')
  if (id && seenIds.has(id)) fail(`id duplicado: ${id}`)
  if (id) seenIds.add(id)

  if (!title || typeof title !== 'string') fail(`${id || 'claim'}: ` + 'campo `title` obrigatório')

  if (!status || typeof status !== 'string' || !allowedStatuses.has(status)) {
    fail(`${id || 'claim'}: status inválido (use GA | PILOT | ROADMAP_GOVERNED)`) 
  }

  if (!evidence || typeof evidence !== 'object') {
    fail(`${id || 'claim'}: campo 
` + '`evidence` obrigatório')
    continue
  }

  const requiredForGA = ['adr', 'policy', 'code', 'tests', 'copy_assertions']
  if (status === 'GA') {
    for (const key of requiredForGA) {
      if (!Array.isArray(evidence[key]) || evidence[key].length === 0) {
        fail(`${id}: GA requer evidence.${key} não vazio`)
      }
    }
  }

  for (const key of ['adr', 'policy', 'code', 'tests']) {
    if (!Array.isArray(evidence[key])) continue
    for (const p of evidence[key]) {
      if (typeof p !== 'string') {
        fail(`${id}: evidence.${key} deve conter strings`) 
        continue
      }
      assertFileExists(p, `${id}: evidence.${key}`)
    }
  }

  if (Array.isArray(evidence.copy_assertions)) {
    for (const a of evidence.copy_assertions) {
      const file = a?.file
      const mustContain = a?.mustContain
      if (typeof file !== 'string' || typeof mustContain !== 'string') {
        fail(`${id}: copy_assertion deve ter {file, mustContain} strings`)
        continue
      }
      if (!assertFileExists(file, `${id}: copy_assertions`)) continue

      const content = readText(file)
      if (!content.includes(mustContain)) {
        fail(`${id}: ${file} não contém o trecho esperado: ${JSON.stringify(mustContain)}`)
      }
    }
  }
}

if (process.exitCode) {
  process.exit(process.exitCode)
}
