#!/usr/bin/env node

import { execFileSync } from 'node:child_process'

function usage() {
  return `stage-check: fail if staged/untracked files are outside allowlist

Usage:
  node scripts/stage-check.mjs --allow <path-or-prefix> [--allow ...]

Rules:
  - allow entries ending with '/' or '/**' act as prefixes
  - other entries are exact file paths
  - compares against:
      staged:   git diff --name-only --cached
      untracked: git ls-files --others --exclude-standard
`
}

function git(args) {
  return execFileSync('git', args, { encoding: 'utf8' }).trim()
}

function normalize(p) {
  return p.replaceAll('\\', '/').replace(/^\./, '')
}

function parseArgs(argv) {
  const allow = []
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i]
    if (a === '--allow') {
      const v = argv[i + 1]
      if (!v) throw new Error('missing value for --allow')
      allow.push(normalize(v))
      i += 1
      continue
    }
    if (a === '--help' || a === '-h') return { help: true, allow: [] }
    throw new Error(`unknown arg: ${a}`)
  }
  return { help: false, allow }
}

function isAllowed(path, allow) {
  const p = normalize(path)
  return allow.some((rule) => {
    const r = normalize(rule)
    if (r.endsWith('/**')) return p.startsWith(r.slice(0, -3))
    if (r.endsWith('/')) return p.startsWith(r)
    return p === r
  })
}

function collectFiles() {
  const staged = git(['diff', '--name-only', '--cached']).split(/\r?\n/).filter(Boolean)
  const untracked = git(['ls-files', '--others', '--exclude-standard']).split(/\r?\n/).filter(Boolean)
  return { staged, untracked }
}

function main() {
  const { help, allow } = parseArgs(process.argv.slice(2))
  if (help) {
    process.stdout.write(usage())
    process.exit(0)
  }
  if (allow.length === 0) {
    process.stderr.write('stage-check: at least one --allow is required\n')
    process.exit(2)
  }

  const { staged, untracked } = collectFiles()
  const offenders = []

  for (const f of staged) {
    if (!isAllowed(f, allow)) offenders.push(`[staged] ${f}`)
  }
  for (const f of untracked) {
    if (!isAllowed(f, allow)) offenders.push(`[untracked] ${f}`)
  }

  if (offenders.length > 0) {
    process.stderr.write('stage-check: FAIL (files outside allowlist)\n')
    for (const line of offenders.slice(0, 20)) process.stderr.write(`${line}\n`)
    if (offenders.length > 20) process.stderr.write(`... (${offenders.length - 20} more)\n`)
    process.exit(1)
  }

  process.stdout.write('stage-check: OK\n')
}

main()
