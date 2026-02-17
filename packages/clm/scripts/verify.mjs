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

function main() {
  const dir = arg('--dir')
  if (!dir) {
    console.error('Usage: node packages/clm/scripts/verify.mjs --dir <output_dir>')
    process.exit(2)
  }

  const outDir = path.isAbsolute(dir) ? dir : path.join(ROOT, dir)
  const manifestPath = path.join(outDir, 'manifest.json')
  if (!fs.existsSync(manifestPath)) {
    console.error(`CLM FAIL: missing manifest.json in ${path.relative(ROOT, outDir)}`)
    process.exit(2)
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  const hashes = manifest.hashes || {}

  const mismatches = []
  for (const [relPath, expected] of Object.entries(hashes)) {
    const fileAbs = path.join(outDir, relPath)
    if (!fs.existsSync(fileAbs)) {
      mismatches.push(`${relPath}: missing`) 
      continue
    }
    const got = sha256File(fileAbs)
    if (got !== expected) mismatches.push(`${relPath}: expected ${expected} got ${got}`)
  }

  if (mismatches.length > 0) {
    console.error('CLM FAIL: hash mismatches')
    mismatches.forEach((m) => console.error(`- ${m}`))
    process.exit(2)
  }

  console.log('OK: CLM package hashes verified')
}

main()
