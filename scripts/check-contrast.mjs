#!/usr/bin/env node

import fs from 'node:fs'

function hexToRgb(hex) {
  const h = hex.replace('#', '').trim()
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h
  const n = parseInt(full, 16)
  return {
    r: (n >> 16) & 255,
    g: (n >> 8) & 255,
    b: n & 255
  }
}

function srgbToLinear(v) {
  const s = v / 255
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
}

function luminance({ r, g, b }) {
  const R = srgbToLinear(r)
  const G = srgbToLinear(g)
  const B = srgbToLinear(b)
  return 0.2126 * R + 0.7152 * G + 0.0722 * B
}

function contrastRatio(a, b) {
  const L1 = luminance(a)
  const L2 = luminance(b)
  const light = Math.max(L1, L2)
  const dark = Math.min(L1, L2)
  return (light + 0.05) / (dark + 0.05)
}

function getAt(obj, dottedPath) {
  const parts = dottedPath.split('.')
  let cur = obj
  for (const p of parts) cur = cur?.[p]
  return cur
}

const tokensPath = 'packages/design-tokens/tokens.json'
if (!fs.existsSync(tokensPath)) {
  console.error(`ERRO: ${tokensPath} não encontrado`)
  process.exit(1)
}

const data = JSON.parse(fs.readFileSync(tokensPath, 'utf8'))
const pairs = data.contrast_pairs
if (!Array.isArray(pairs) || pairs.length === 0) {
  console.error('ERRO: tokens.json precisa conter contrast_pairs (array não-vazio)')
  process.exit(1)
}

let failures = 0
for (const pair of pairs) {
  const fgNode = getAt(data.tokens, pair.fg)
  const bgNode = getAt(data.tokens, pair.bg)

  if (!fgNode?.hex || !bgNode?.hex) {
    console.error(`ERRO: contraste refere token sem hex: fg=${pair.fg}, bg=${pair.bg}`)
    failures++
    continue
  }

  const fg = hexToRgb(fgNode.hex)
  const bg = hexToRgb(bgNode.hex)
  const ratio = contrastRatio(fg, bg)

  if (ratio + 1e-6 < pair.ratio_min) {
    failures++
    console.error(
      `FALHA: ${pair.level} ${pair.fg} on ${pair.bg} → ${ratio.toFixed(2)} (min ${pair.ratio_min})`
    )
  }
}

if (failures > 0) {
  process.exit(1)
}

console.log('OK: contrast checks passed')
