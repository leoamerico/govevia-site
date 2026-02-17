#!/usr/bin/env node

// Design Tokens structural validator (SSOT invariants)

import fs from 'node:fs'

function fail(msg) {
  console.error(`FALHA: ${msg}`)
  process.exit(1)
}

const tokensPath = 'packages/design-tokens/tokens.json'
if (!fs.existsSync(tokensPath)) fail(`${tokensPath} não encontrado`)

const data = JSON.parse(fs.readFileSync(tokensPath, 'utf8'))
const aliases = data?.aliases?.tailwind?.colors
if (!aliases || typeof aliases !== 'object') {
  fail('tokens.json deve conter aliases.tailwind.colors')
}

const REQUIRED_ALIAS_KEYS = [
  'primary',
  'primary-light',
  'primary-dark',
  'primary-accent',
  'accent-gold',
  'accent-copper',
  'institutional-graphite',
  'institutional-slate',
  'institutional-silver',
  'institutional-lightgray',
  'institutional-offwhite',
]

for (const k of REQUIRED_ALIAS_KEYS) {
  if (!(k in aliases)) {
    fail(`aliases.tailwind.colors deve expor a chave obrigatória: ${k}`)
  }
}

function getAt(obj, dottedPath) {
  const parts = dottedPath.split('.')
  let cur = obj
  for (const p of parts) cur = cur?.[p]
  return cur
}

for (const [aliasKey, tokenPath] of Object.entries(aliases)) {
  if (typeof tokenPath !== 'string') {
    fail(`Alias inválido ${aliasKey}: esperado string, recebido ${typeof tokenPath}`)
  }
  const node = getAt(data.tokens, tokenPath)
  if (!node || typeof node !== 'object') {
    fail(`Alias ${aliasKey} aponta para token inexistente: ${tokenPath}`)
  }
  if (typeof node.hex !== 'string' || typeof node.rgb !== 'string') {
    fail(`Token ${tokenPath} deve conter { hex, rgb }`)
  }
  if (!/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(node.hex.trim())) {
    fail(`Token ${tokenPath}.hex inválido: ${node.hex}`)
  }
  if (!/^\d{1,3}\s+\d{1,3}\s+\d{1,3}$/.test(node.rgb.trim())) {
    fail(`Token ${tokenPath}.rgb inválido (esperado "R G B"): ${node.rgb}`)
  }
}

console.log('OK: design tokens structure validated')
