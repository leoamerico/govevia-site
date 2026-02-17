#!/usr/bin/env node

import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const REGISTRY_PATH = join(process.cwd(), 'docs', 'registry', 'REG-SITE-CONTENT-KEYS.md')

function git(args) {
  return execFileSync('git', args, { encoding: 'utf8' }).trim()
}

function normalize(p) {
  return p.replaceAll('\\', '/').replace(/^\./, '')
}

function readRegistryKeys() {
  const raw = readFileSync(REGISTRY_PATH, 'utf8')
  const keys = new Set()

  // Keys are listed as `key.name.here`
  const re = /`([a-z0-9]+\.[a-z0-9_.-]+)`/gi
  let m
  while ((m = re.exec(raw)) !== null) {
    keys.add(m[1])
  }

  return keys
}

function listTrackedSourceFiles() {
  // limit to tracked files for determinism
  const out = git(['ls-files', 'app', 'components', 'lib'])
  return out
    .split(/\r?\n/)
    .filter(Boolean)
    .map(normalize)
    .filter((p) => /\.(ts|tsx)$/.test(p))
}

function extractGetContentCalls(source) {
  // Very small brace-matching extractor for getContent({ ... }) blocks.
  const results = []
  let idx = 0

  while (idx < source.length) {
    const start = source.indexOf('getContent(', idx)
    if (start === -1) break

    const openBrace = source.indexOf('{', start)
    if (openBrace === -1) {
      idx = start + 9
      continue
    }

    let depth = 0
    let end = -1
    for (let i = openBrace; i < source.length; i += 1) {
      const ch = source[i]
      if (ch === '{') depth += 1
      if (ch === '}') {
        depth -= 1
        if (depth === 0) {
          end = i
          break
        }
      }
    }

    if (end === -1) break

    const obj = source.slice(openBrace, end + 1)
    results.push(obj)
    idx = end + 1
  }

  return results
}

function parseKeyAndFallback(objLiteral) {
  const keyMatch = objLiteral.match(/\bkey\s*:\s*(['"`])([^'"`]+)\1/)
  const fallbackMatch = objLiteral.match(/\bfallback\s*:\s*(['"`])([\s\S]*?)\1/)

  const key = keyMatch?.[2] ?? null
  const fallback = fallbackMatch?.[2] ?? null
  const fallbackIsLiteral = Boolean(fallbackMatch)

  return { key, fallback, fallbackIsLiteral }
}

function main() {
  let registryKeys
  try {
    registryKeys = readRegistryKeys()
  } catch {
    process.stderr.write(`content-keys:check: FAIL (missing registry file: ${REGISTRY_PATH})\n`)
    process.exit(1)
  }

  const files = listTrackedSourceFiles()
  const offenders = []

  for (const file of files) {
    const src = readFileSync(file, 'utf8')
    const blocks = extractGetContentCalls(src)

    for (const block of blocks) {
      const { key, fallbackIsLiteral } = parseKeyAndFallback(block)
      if (!key) continue

      if (!fallbackIsLiteral) {
        offenders.push(`${file}: key '${key}' missing literal fallback`)
        continue
      }

      if (!registryKeys.has(key)) {
        offenders.push(`${file}: key '${key}' not registered in docs/registry/REG-SITE-CONTENT-KEYS.md`)
      }
    }
  }

  if (offenders.length > 0) {
    process.stderr.write('content-keys:check: FAIL\n')
    for (const line of offenders.slice(0, 20)) process.stderr.write(`${line}\n`)
    if (offenders.length > 20) process.stderr.write(`... (${offenders.length - 20} more)\n`)
    process.exit(1)
  }

  process.stdout.write('content-keys:check: OK\n')
}

main()
