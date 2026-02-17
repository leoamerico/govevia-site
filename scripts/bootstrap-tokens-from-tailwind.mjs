#!/usr/bin/env node

/**
 * bootstrap-tokens-from-tailwind.mjs
 *
 * Preenche/sincroniza `packages/design-tokens/tokens.json` com o estado atual do
 * `tailwind.config.js` (paleta de migração em `module.exports.__sourceColors`).
 *
 * Uso:
 *   node scripts/bootstrap-tokens-from-tailwind.mjs
 *   node scripts/bootstrap-tokens-from-tailwind.mjs --check
 */

import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'

const CHECK_MODE = process.argv.includes('--check')

function hexToRgbTriplet(hex) {
  const h = hex.replace('#', '').trim()
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  const n = parseInt(full, 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  return `${r} ${g} ${b}`
}

function rgbTripletToHex(triplet, key) {
  if (typeof triplet !== 'string') {
    throw new Error(`Color '${key}' must be HEX or RGB triplet string (got: ${JSON.stringify(triplet)})`)
  }
  const parts = triplet.trim().split(/\s+/)
  if (parts.length !== 3) {
    throw new Error(`Color '${key}' must be RGB triplet ("R G B") when not HEX (got: ${JSON.stringify(triplet)})`)
  }
  const nums = parts.map((p) => Number(p))
  if (nums.some((n) => !Number.isFinite(n) || n < 0 || n > 255)) {
    throw new Error(`Color '${key}' RGB values must be 0..255 (got: ${JSON.stringify(triplet)})`)
  }
  const toHex = (n) => n.toString(16).padStart(2, '0').toUpperCase()
  return `#${toHex(nums[0])}${toHex(nums[1])}${toHex(nums[2])}`
}

function mustHex(v, key) {
  if (typeof v !== 'string' || !/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v.trim())) {
    throw new Error(`Color '${key}' must be HEX (got: ${JSON.stringify(v)})`)
  }
  return v.trim()
}

function resolveHexAndRgb(colors, key) {
  const raw = resolveColor(colors, key)

  if (typeof raw === 'string' && raw.trim().startsWith('#')) {
    const hex = mustHex(raw, key)
    return { hex, rgb: hexToRgbTriplet(hex) }
  }

  const rgb = String(raw).trim()
  const hex = rgbTripletToHex(rgb, key)
  return { hex, rgb }
}

function resolveColor(colors, key) {
  const parts = key.split('.')
  let current = colors
  for (const part of parts) {
    if (current === undefined || current === null) {
      throw new Error(`Color path '${key}' not found in tailwind.config.js __sourceColors`) 
    }
    current = current[part]
  }
  if (typeof current === 'string') return current
  if (typeof current === 'object' && current && current.DEFAULT) return current.DEFAULT
  throw new Error(`Color '${key}' resolved to non-string: ${JSON.stringify(current)}`)
}

function setAt(obj, pathArr, value) {
  let cur = obj
  for (let i = 0; i < pathArr.length - 1; i++) {
    const p = pathArr[i]
    if (!(p in cur)) cur[p] = {}
    cur = cur[p]
  }
  cur[pathArr[pathArr.length - 1]] = value
}

function loadTailwindSourceColors(twPath) {
  const src = fs.readFileSync(twPath, 'utf8')

  const sandbox = {
    module: { exports: {} },
    exports: {},
    require: () => () => {},
  }
  sandbox.exports = sandbox.module.exports

  vm.runInNewContext(src, sandbox, { filename: twPath })

  const config = sandbox.module.exports
  const colors = config?.__sourceColors
  if (!colors || typeof colors !== 'object') {
    throw new Error('tailwind.config.js must export __sourceColors for bootstrap')
  }
  return colors
}

const repoRoot = process.cwd()
const twPath = path.join(repoRoot, 'tailwind.config.js')
const tokenPath = path.join(repoRoot, 'packages', 'design-tokens', 'tokens.json')

if (!fs.existsSync(twPath)) {
  console.error(`ERRO: ${twPath} não encontrado`)
  process.exit(1)
}
if (!fs.existsSync(tokenPath)) {
  console.error(`ERRO: ${tokenPath} não encontrado`)
  process.exit(1)
}

const sourceColors = loadTailwindSourceColors(twPath)
const tokens = JSON.parse(fs.readFileSync(tokenPath, 'utf8'))

// Tailwind dot-path -> tokens.json path
const COLOR_MAP = {
  'primary.DEFAULT': ['tokens', 'color', 'brand', 'govevia', 'primary', '700'],
  'primary.light': ['tokens', 'color', 'brand', 'govevia', 'primary', '500'],
  'primary.dark': ['tokens', 'color', 'brand', 'govevia', 'primary', '800'],
  'primary.accent': ['tokens', 'color', 'brand', 'govevia', 'primary', '600'],

  'accent.gold': ['tokens', 'color', 'brand', 'govevia', 'accent', 'gold'],
  'accent.copper': ['tokens', 'color', 'brand', 'govevia', 'accent', 'copper'],

  'institutional.navy': ['tokens', 'color', 'brand', 'institutional', 'navy'],
  'institutional.graphite': ['tokens', 'color', 'brand', 'institutional', 'graphite'],
  'institutional.slate': ['tokens', 'color', 'brand', 'institutional', 'slate'],
  'institutional.silver': ['tokens', 'color', 'brand', 'institutional', 'silver'],
  'institutional.lightgray': ['tokens', 'color', 'brand', 'institutional', 'lightgray'],
  'institutional.offwhite': ['tokens', 'color', 'brand', 'institutional', 'offwhite'],
}

let changes = 0

for (const [twKey, tokenPathArr] of Object.entries(COLOR_MAP)) {
  const { hex, rgb } = resolveHexAndRgb(sourceColors, twKey)

  let currentNode = tokens
  for (const p of tokenPathArr) currentNode = currentNode?.[p]

  if (currentNode?.hex !== hex || currentNode?.rgb !== rgb) {
    setAt(tokens, [...tokenPathArr, 'hex'], hex)
    setAt(tokens, [...tokenPathArr, 'rgb'], rgb)
    changes++
    console.log(`UPDATED: ${twKey} -> ${hex} (${rgb})`)
  }
}

if (changes === 0) {
  console.log('OK: tokens.json já está sincronizado com tailwind.config.js (__sourceColors)')
  process.exit(0)
}

if (CHECK_MODE) {
  console.error(`FALHA: ${changes} token(s) desatualizados. Rode sem --check para sincronizar.`)
  process.exit(1)
}

fs.writeFileSync(tokenPath, JSON.stringify(tokens, null, 2) + '\n', 'utf8')
console.log(`OK: ${changes} token(s) atualizados em tokens.json`)
