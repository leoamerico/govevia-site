#!/usr/bin/env node

import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const DIST_DIR = 'packages/design-tokens/dist'
const TAILWIND_CONFIG = 'tailwind.config.js'

function sh(cmd) {
  return execSync(cmd, { stdio: ['ignore', 'pipe', 'pipe'] }).toString('utf8').trim()
}

function fail(msg) {
  console.error(`\nFE-01 FAIL: ${msg}\n`)
  process.exit(1)
}

// 0) dist must be up-to-date (deterministic build)
try {
  execSync('node packages/design-tokens/scripts/build.mjs --check', { stdio: 'inherit' })
} catch {
  fail('dist drift: build.mjs --check falhou (rode npm run tokens:build e commite o dist/)')
}

// 1) Preset obrigatório
const tw = fs.readFileSync(path.join(ROOT, TAILWIND_CONFIG), 'utf8')
if (!tw.includes('packages/design-tokens/dist/tailwind.preset.cjs')) {
  fail('tailwind.config.js deve consumir apenas o preset gerado (dist/tailwind.preset.cjs).')
}

// 2) Proibir HEX em tailwind.config.js (comentário também conta)
const HEX = /(?<!&)#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/
if (HEX.test(tw)) {
  fail('Encontrado HEX (#RGB/#RRGGBB) em tailwind.config.js. Remova de theme.extend.colors.')
}

// 3) No-HEX em app/components (código runtime)
const CODE_EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.css'])
const HEX_URL = /%23([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name)
    if (ent.isDirectory()) walk(p, out)
    else out.push(p)
  }
  return out
}

function scanDir(dir) {
  const abs = path.join(ROOT, dir)
  const files = walk(abs)
    .filter((f) => CODE_EXT.has(path.extname(f)))
    .filter((f) => !f.includes(`${path.sep}packages${path.sep}design-tokens${path.sep}dist${path.sep}`))
    .filter((f) => !f.includes(`${path.sep}node_modules${path.sep}`))

  const hits = []
  for (const f of files) {
    const rel = path.relative(ROOT, f)
    const txt = fs.readFileSync(f, 'utf8')
    const lines = txt.split(/\r?\n/)
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      if (HEX.test(line) || HEX_URL.test(line)) {
        hits.push(`${rel}:${i + 1}: ${line.trim()}`)
      }
    }
  }
  return hits
}

const hits = [...scanDir('app'), ...scanDir('components')]
if (hits.length > 0) {
  console.error('\nOcorrências de HEX/%23HEX em app/components:\n')
  for (const h of hits) console.error(`- ${h}`)
  fail('Remova todas as ocorrências acima. Use tokens (Tailwind vars) ou tokens.runtime.ts para contexts inline.')
}

// 4) Drift determinístico do dist (inclui untracked)
try {
  sh(`git diff --exit-code -- ${DIST_DIR}`)
} catch {
  fail(`dist drift: há diferenças em ${DIST_DIR}. Rode npm run tokens:build e commite o dist.`)
}

try {
  const status = sh(`git status --porcelain -- ${DIST_DIR}`)
  if (status.length > 0) {
    fail(`dist drift: há arquivos não rastreados/modificados em ${DIST_DIR}. Rode tokens:build e commite o dist.`)
  }
} catch {
  fail("Não foi possível executar 'git status' para validar drift do dist (necessário para FE-01).")
}

console.log('FE-01 PASS: preset ok, dist sem drift, e no-HEX em app/components.')
