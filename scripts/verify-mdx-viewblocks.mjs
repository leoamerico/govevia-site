#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import yaml from 'js-yaml'

const ROOT = process.cwd()
const BLOG_DIR = path.join(ROOT, 'content/blog')

function walk(dirAbs, out = []) {
  if (!fs.existsSync(dirAbs)) return out
  const ents = fs.readdirSync(dirAbs, { withFileTypes: true })
  for (const e of ents) {
    const p = path.join(dirAbs, e.name)
    if (e.isDirectory()) walk(p, out)
    else out.push(p)
  }
  return out
}

function rel(p) {
  return path.relative(ROOT, p).replace(/\\/g, '/')
}

function readYaml(relativePath) {
  const full = path.join(ROOT, relativePath)
  const raw = fs.readFileSync(full, 'utf8')
  return yaml.load(raw)
}

function loadTaxonomy() {
  const personas = readYaml('content/taxonomy/personas.yaml')
  const contexts = readYaml('content/taxonomy/contexts.yaml')
  const personaIds = new Set((personas?.personas || []).map((p) => p.id))
  const contextIds = new Set((contexts?.contexts || []).map((c) => c.id))
  return { personaIds, contextIds }
}

function findViewBlocks(mdx) {
  const blocks = []
  const re = /<ViewBlock\b[^>]*>([\s\S]*?)<\/ViewBlock>/g
  let m
  while ((m = re.exec(mdx)) !== null) {
    blocks.push({ body: m[1], index: m.index })
  }
  return blocks
}

function hasHeading(body, labelRe) {
  const re = new RegExp(`(^|\\n)#{2,6}\\s*${labelRe.source}\\s*($|\\n)`, 'i')
  return re.test(body)
}

function hasEvidenceLink(body) {
  // Hard rule: evidence must link to docs/public/evidence
  return /docs\/public\/evidence\//i.test(body)
}

function extractViewBlockOpenTags(mdx) {
  const lines = mdx.split(/\r?\n/)
  const tags = []
  const re = /<ViewBlock\b([^>]*)>/

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const m = line.match(re)
    if (!m) continue

    const attrs = m[1] || ''
    const view = (attrs.match(/\bview\s*=\s*"([^"]+)"/) || [])[1]
    const ctx = (attrs.match(/\bctx\s*=\s*"([^"]+)"/) || [])[1]
    tags.push({ line: i + 1, view, ctx })
  }

  return tags
}

function main() {
  const { personaIds, contextIds } = loadTaxonomy()

  const files = walk(BLOG_DIR).filter((f) => f.endsWith('.mdx'))
  const failures = []

  const reLimites = /Limites\s+e\s+Condi(c|ç)(o|õ)es/ // Condições / Condicoes
  const reEvidencias = /Evid(ê|e)ncias/

  for (const f of files) {
    const base = path.basename(f)
    if (base.startsWith('_')) continue

    const mdx = fs.readFileSync(f, 'utf8')
    const blocks = findViewBlocks(mdx)
    if (blocks.length === 0) continue

    const openTags = extractViewBlockOpenTags(mdx)

    blocks.forEach((b, i) => {
      const tag = openTags[i] || { line: 1, view: undefined, ctx: undefined }

      // Canonical block is not a "view" and is exempt.
      if (!tag.view && !tag.ctx) return

      const missing = []

      if (tag.view && !personaIds.has(tag.view)) missing.push(`persona inválida: ${tag.view}`)
      if (tag.ctx && !contextIds.has(tag.ctx)) missing.push(`contexto inválido: ${tag.ctx}`)

      const okLimites = hasHeading(b.body, reLimites)
      const okEvid = hasHeading(b.body, reEvidencias)
      const okLinks = hasEvidenceLink(b.body)

      if (!okLimites) missing.push('Limites e Condições')
      if (!okEvid) missing.push('Evidências')
      if (!okLinks) missing.push('links para docs/public/evidence/')

      if (missing.length > 0) {
        failures.push({
          file: rel(f),
          line: tag.line,
          block: i + 1,
          view: tag.view || 'canonical',
          ctx: tag.ctx || '(all)',
          missing,
        })
      }
    })
  }

  if (failures.length > 0) {
    console.error('CONTENT GUARDRAIL FAIL: ViewBlock incompleto (Limites + Evidências + links).')
    for (const f of failures) {
      console.error(`- ${f.file}:${f.line} (view=${f.view}, ctx=${f.ctx}, block #${f.block}): faltando ${f.missing.join(', ')}`)
    }
    process.exit(2)
  }

  console.log('OK: MDX ViewBlocks guardrails passed')
}

main()
