#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'

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

function main() {
  const files = walk(BLOG_DIR).filter((f) => f.endsWith('.mdx'))
  const failures = []

  const reLimites = /Limites\s+e\s+Condi(c|ç)(o|õ)es/ // Condições / Condicoes
  const reEvidencias = /Evid(ê|e)ncias/

  for (const f of files) {
    const mdx = fs.readFileSync(f, 'utf8')
    const blocks = findViewBlocks(mdx)
    if (blocks.length === 0) continue

    blocks.forEach((b, i) => {
      const okLimites = hasHeading(b.body, reLimites)
      const okEvid = hasHeading(b.body, reEvidencias)
      const okLinks = hasEvidenceLink(b.body)

      if (!okLimites || !okEvid || !okLinks) {
        failures.push({
          file: rel(f),
          block: i + 1,
          missing: [
            !okLimites ? 'Limites e Condições' : null,
            !okEvid ? 'Evidências' : null,
            !okLinks ? 'links para docs/public/evidence/' : null,
          ].filter(Boolean),
        })
      }
    })
  }

  if (failures.length > 0) {
    console.error('CONTENT GUARDRAIL FAIL: ViewBlock incompleto (Limites + Evidências + links).')
    for (const f of failures) {
      console.error(`- ${f.file} (ViewBlock #${f.block}): faltando ${f.missing.join(', ')}`)
    }
    process.exit(2)
  }

  console.log('OK: MDX ViewBlocks guardrails passed')
}

main()
