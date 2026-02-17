#!/usr/bin/env node

import { execFileSync } from 'node:child_process'

function usage() {
  return `scope-check: fail if a commit touches files outside allowlist

Usage:
  node scripts/scope-check.mjs --allow <path-or-prefix> [--allow ...] [--commit <sha>]

Default:
  --commit HEAD

Rules:
  - allow entries ending with '/' or '/**' act as prefixes
  - other entries are exact file paths
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
  let commit = 'HEAD'

  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i]
    if (a === '--allow') {
      const v = argv[i + 1]
      if (!v) throw new Error('missing value for --allow')
      allow.push(normalize(v))
      i += 1
      continue
    }
    if (a === '--commit') {
      const v = argv[i + 1]
      if (!v) throw new Error('missing value for --commit')
      commit = v
      i += 1
      continue
    }
    if (a === '--help' || a === '-h') return { help: true, allow: [], commit }
    throw new Error(`unknown arg: ${a}`)
  }

  return { help: false, allow, commit }
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

function listCommitFiles(commit) {
  const out = git(['diff-tree', '--no-commit-id', '--name-only', '-r', commit])
  return out.split(/\r?\n/).filter(Boolean)
}

function main() {
  const { help, allow, commit } = parseArgs(process.argv.slice(2))
  if (help) {
    process.stdout.write(usage())
    process.exit(0)
  }
  if (allow.length === 0) {
    process.stderr.write('scope-check: at least one --allow is required\n')
    process.exit(2)
  }

  const files = listCommitFiles(commit)
  const offenders = files.filter((f) => !isAllowed(f, allow))

  if (offenders.length > 0) {
    process.stderr.write(`scope-check: FAIL (commit ${commit} touches files outside allowlist)\n`)
    for (const f of offenders.slice(0, 20)) process.stderr.write(`${f}\n`)
    if (offenders.length > 20) process.stderr.write(`... (${offenders.length - 20} more)\n`)
    process.exit(1)
  }

  process.stdout.write('scope-check: OK\n')
}

main()
