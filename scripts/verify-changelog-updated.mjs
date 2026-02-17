import { execFileSync } from 'node:child_process'

function runGit(args) {
  return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
}

function isGitRepo() {
  try {
    return runGit(['rev-parse', '--is-inside-work-tree']) === 'true'
  } catch {
    return false
  }
}

function isAllZerosSha(value) {
  return typeof value === 'string' && /^[0]{7,}$/.test(value)
}

function isValidCommit(ref) {
  if (!ref) return false
  try {
    runGit(['cat-file', '-e', `${ref}^{commit}`])
    return true
  } catch {
    return false
  }
}

function getHeadSha() {
  const envHead = process.env.VERCEL_GIT_COMMIT_SHA
  if (envHead && isValidCommit(envHead)) return envHead
  return runGit(['rev-parse', 'HEAD'])
}

function getBaseSha(headSha) {
  const vercelPrev = process.env.VERCEL_GIT_PREVIOUS_SHA
  if (vercelPrev && !isAllZerosSha(vercelPrev) && isValidCommit(vercelPrev)) return vercelPrev

  const explicit = process.env.GOVEVIA_CHANGELOG_BASE
  if (explicit && isValidCommit(explicit)) return explicit

  // Preferred for CI/PR: diff against merge-base with main
  // (prevents false PASS in long-lived branches where HEAD~1 doesn't represent the full change set).
  const baseCandidates = ['origin/main', 'main', 'origin/master', 'master']
  for (const baseRef of baseCandidates) {
    try {
      const mb = runGit(['merge-base', baseRef, headSha])
      if (mb && isValidCommit(mb)) return mb
    } catch {
      // try next candidate
    }
  }

  try {
    const prev = runGit(['rev-parse', `${headSha}~1`])
    if (prev && isValidCommit(prev)) return prev
  } catch {
    // ignore
  }

  return null
}

function listChangedFiles(baseSha, headSha) {
  const out = runGit(['diff', '--name-only', '--diff-filter=ACMR', `${baseSha}..${headSha}`])
  if (!out) return []
  return out.split(/\r?\n/).map((s) => s.trim()).filter(Boolean)
}

function listWorkingTreeFiles() {
  const tracked = runGit(['diff', '--name-only', '--diff-filter=ACMR', 'HEAD'])
  const trackedFiles = tracked
    ? tracked.split(/\r?\n/).map((s) => s.trim()).filter(Boolean)
    : []

  const untracked = runGit(['ls-files', '--others', '--exclude-standard'])
  const untrackedFiles = untracked
    ? untracked.split(/\r?\n/).map((s) => s.trim()).filter(Boolean)
    : []

  return Array.from(new Set([...trackedFiles, ...untrackedFiles]))
}

function isWorkingTreeDirty() {
  const status = runGit(['status', '--porcelain'])
  return Boolean(status)
}

function main() {
  if (!isGitRepo()) {
    console.log('history:check: SKIP (not a git repository)')
    process.exit(0)
  }

  const headSha = getHeadSha()
  const changed = isWorkingTreeDirty()
    ? listWorkingTreeFiles()
    : (() => {
        const baseSha = getBaseSha(headSha)
        if (!baseSha) {
          console.log('history:check: SKIP (no base commit to diff against)')
          process.exit(0)
        }
        return listChangedFiles(baseSha, headSha)
      })()
  if (changed.length === 0) {
    console.log('history:check: OK (no changes detected)')
    process.exit(0)
  }

  const changedOtherThanChangelog = changed.filter((p) => p !== 'CHANGELOG.md')
  const changelogTouched = changed.includes('CHANGELOG.md')

  if (changedOtherThanChangelog.length > 0 && !changelogTouched) {
    console.error('history:check: FAIL')
    console.error('Você alterou arquivos no repositório, mas não atualizou o CHANGELOG.md (SSOT do /historico).')
    console.error('Arquivos alterados (amostra):')
    for (const file of changedOtherThanChangelog.slice(0, 50)) {
      console.error(`- ${file}`)
    }
    if (changedOtherThanChangelog.length > 50) {
      console.error(`... e mais ${changedOtherThanChangelog.length - 50} arquivo(s).`)
    }
    console.error('')
    console.error('Ação requerida: registre a mudança em CHANGELOG.md (resumo objetivo) e re-execute o build.')
    process.exit(1)
  }

  console.log('history:check: OK')
}

main()
