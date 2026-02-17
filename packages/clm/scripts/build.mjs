#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const ROOT = process.cwd()

function arg(name) {
  const idx = process.argv.indexOf(name)
  if (idx === -1) return null
  return process.argv[idx + 1] || null
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true })
}

function listFilesRecursive(dirAbs, out = []) {
  const ents = fs.readdirSync(dirAbs, { withFileTypes: true })
  for (const e of ents) {
    const p = path.join(dirAbs, e.name)
    if (e.isDirectory()) listFilesRecursive(p, out)
    else out.push(p)
  }
  return out
}

function sha256File(fileAbs) {
  const h = crypto.createHash('sha256')
  h.update(fs.readFileSync(fileAbs))
  return h.digest('hex')
}

function formatTs(now = new Date()) {
  const pad = (n) => String(n).padStart(2, '0')
  const tz = -now.getTimezoneOffset()
  const sign = tz >= 0 ? '+' : '-'
  const hh = pad(Math.floor(Math.abs(tz) / 60))
  const mm = pad(Math.abs(tz) % 60)

  return (
    `${now.getFullYear()}` +
    `${pad(now.getMonth() + 1)}` +
    `${pad(now.getDate())}` +
    `T${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}` +
    `${sign}${hh}${mm}`
  )
}

function copyDir(srcAbs, dstAbs) {
  ensureDir(dstAbs)
  for (const srcFile of listFilesRecursive(srcAbs)) {
    const rel = path.relative(srcAbs, srcFile)
    const dstFile = path.join(dstAbs, rel)
    ensureDir(path.dirname(dstFile))
    fs.copyFileSync(srcFile, dstFile)
  }
}

function main() {
  const account = arg('--account')
  if (!account) {
    console.error('Usage: node packages/clm/scripts/build.mjs --account <account_id>')
    process.exit(2)
  }

  const src = path.join(ROOT, 'packages', 'clm', 'templates', account)
  if (!fs.existsSync(src)) {
    console.error(`CLM FAIL: templates not found: ${path.relative(ROOT, src)}`)
    process.exit(2)
  }

  const ts = formatTs(new Date())
  const outDir = path.join(ROOT, 'data', 'clm-packages', account, ts)
  copyDir(src, outDir)

  const files = listFilesRecursive(outDir)
    .filter((f) => path.basename(f) !== 'manifest.json')
    .map((f) => path.relative(outDir, f).replace(/\\/g, '/'))
    .sort()

  const hashes = {}
  for (const relPath of files) {
    hashes[relPath] = sha256File(path.join(outDir, relPath))
  }

  const manifest = {
    version: 'clm-manifest.v1',
    account_id: account,
    generated_at: new Date().toISOString(),
    artifacts: files,
    hashes,
    limitations: [
      'Este pacote é proposta/minuta: contratação final depende do rito aplicável e aceite formal do órgão.',
    ],
  }

  fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n', 'utf8')

  console.log(`OK: CLM package generated: ${path.relative(ROOT, outDir)}`)
}

main()
