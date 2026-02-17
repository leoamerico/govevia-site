import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const repoRoot = path.resolve(__dirname, '..')
const requireCjs = createRequire(import.meta.url)

function getNextConfigCsp() {
  // next.config.js is CommonJS
  const nextConfig = requireCjs(path.join(repoRoot, 'next.config.js'))

  if (typeof nextConfig?.headers !== 'function') {
    throw new Error('next.config.js: headers() not found')
  }

  return nextConfig
    .headers()
    .then((rules) => {
      const allHeaders = rules?.flatMap((r) => r.headers || []) || []
      const cspHeader = allHeaders.find((h) => h.key?.toLowerCase() === 'content-security-policy')
      if (!cspHeader?.value) throw new Error('Content-Security-Policy header not found in next.config.js')
      return String(cspHeader.value)
    })
}

function parseAllowedHostsFromCsp(cspValue) {
  const allowedHosts = new Set()

  const directives = cspValue
    .split(';')
    .map((d) => d.trim())
    .filter(Boolean)

  for (const dir of directives) {
    const parts = dir.split(/\s+/).filter(Boolean)
    const directiveName = parts[0]
    const sources = parts.slice(1)

    // Only directives that accept host sources
    if (!directiveName.endsWith('-src') && directiveName !== 'frame-ancestors') continue

    for (const s of sources) {
      if (s === "'self'" || s === "'unsafe-inline'" || s === "'unsafe-eval'" || s === 'data:' || s === 'blob:') continue
      if (s.startsWith('https://') || s.startsWith('http://')) {
        try {
          allowedHosts.add(new URL(s).host)
        } catch {
          // ignore
        }
      } else if (/^[a-zA-Z0-9.-]+$/.test(s)) {
        // host-only source (rare). keep as-is.
        allowedHosts.add(s)
      }
    }
  }

  return allowedHosts
}

function* walkFiles(dir, options) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      if (options.ignoreDirs.has(entry.name)) continue
      yield* walkFiles(fullPath, options)
      continue
    }

    if (!entry.isFile()) continue
    if (!options.extensions.has(path.extname(entry.name))) continue

    yield fullPath
  }
}

function findExternalHostsInRuntime(repoRootDir) {
  const ignoreDirs = new Set(['.git', '.next', 'node_modules', 'docs', 'scripts', 'public', 'content'])
  const extensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.css'])

  const hosts = {
    connect: new Map(),
    resource: new Map(),
    stylesheet: new Map(),
  }

  function record(map, host, relFile) {
    if (!map.has(host)) map.set(host, new Set())
    map.get(host).add(relFile)
  }

  const scanDirs = ['app', 'components', 'lib']
  const scanFiles = ['middleware.ts']

  const filePaths = []
  for (const d of scanDirs) {
    const abs = path.join(repoRootDir, d)
    if (fs.existsSync(abs)) {
      for (const f of walkFiles(abs, { ignoreDirs, extensions })) filePaths.push(f)
    }
  }
  for (const f of scanFiles) {
    const abs = path.join(repoRootDir, f)
    if (fs.existsSync(abs)) filePaths.push(abs)
  }

  for (const filePath of filePaths) {
    const content = fs.readFileSync(filePath, 'utf8')
    const rel = path.relative(repoRootDir, filePath)

    // 1) Network connections (connect-src)
    for (const m of content.matchAll(/\b(fetch|axios\.[a-z]+|new\s+WebSocket|new\s+EventSource)\s*\(\s*['"]https?:\/\/([a-zA-Z0-9.-]+)/g)) {
      const host = m[2]
      if (!host) continue
      if (host === 'localhost' || host.endsWith('.local')) continue
      if (host === 'govevia.com.br' || host === 'www.govevia.com.br') continue
      record(hosts.connect, host, rel)
    }

    // 2) External resources loaded by src= (script/img/video/etc). This is a coarse check.
    for (const m of content.matchAll(/\bsrc\s*=\s*{?\s*['"]https?:\/\/([a-zA-Z0-9.-]+)/g)) {
      const host = m[1]
      if (!host) continue
      if (host === 'localhost' || host.endsWith('.local')) continue
      if (host === 'govevia.com.br' || host === 'www.govevia.com.br') continue
      record(hosts.resource, host, rel)
    }

    // 3) External stylesheets via <link ... href="https://..."> or CSS @import
    for (const m of content.matchAll(/<link[^>]+href\s*=\s*{?\s*['"]https?:\/\/([a-zA-Z0-9.-]+)/gi)) {
      const host = m[1]
      if (!host) continue
      if (host === 'localhost' || host.endsWith('.local')) continue
      if (host === 'govevia.com.br' || host === 'www.govevia.com.br') continue
      record(hosts.stylesheet, host, rel)
    }
    for (const m of content.matchAll(/@import\s+url\(\s*['"]https?:\/\/([a-zA-Z0-9.-]+)/gi)) {
      const host = m[1]
      if (!host) continue
      if (host === 'localhost' || host.endsWith('.local')) continue
      if (host === 'govevia.com.br' || host === 'www.govevia.com.br') continue
      record(hosts.stylesheet, host, rel)
    }
    for (const m of content.matchAll(/url\(\s*['"]https?:\/\/([a-zA-Z0-9.-]+)/gi)) {
      const host = m[1]
      if (!host) continue
      if (host === 'localhost' || host.endsWith('.local')) continue
      if (host === 'govevia.com.br' || host === 'www.govevia.com.br') continue
      record(hosts.resource, host, rel)
    }
  }

  return hosts
}

function findExternalHostsInPublicAssets(repoRootDir) {
  const ignoreDirs = new Set(['.git', '.next', 'node_modules'])
  const extensions = new Set(['.svg', '.css'])

  const publicDir = path.join(repoRootDir, 'public')
  const hosts = new Map()

  function record(host, relFile) {
    if (!hosts.has(host)) hosts.set(host, new Set())
    hosts.get(host).add(relFile)
  }

  if (!fs.existsSync(publicDir)) return hosts

  for (const filePath of walkFiles(publicDir, { ignoreDirs, extensions })) {
    const content = fs.readFileSync(filePath, 'utf8')
    const rel = path.relative(repoRootDir, filePath)

    const ext = path.extname(filePath).toLowerCase()

    // Public assets (notably SVG/CSS) can embed external URL references.
    // IMPORTANT: do not treat XML namespace URIs (e.g., xmlns="http://www.w3.org/2000/svg") as network fetches.
    const patterns =
      ext === '.css'
        ? [
            /@import\s+(?:url\(\s*)?['"]https?:\/\/([a-zA-Z0-9.-]+)/gi,
            /url\(\s*['"]?https?:\/\/([a-zA-Z0-9.-]+)/gi,
          ]
        : [
            /\b(?:xlink:)?href\s*=\s*['"]https?:\/\/([a-zA-Z0-9.-]+)/gi,
            /url\(\s*['"]?https?:\/\/([a-zA-Z0-9.-]+)/gi,
          ]

    for (const re of patterns) {
      for (const m of content.matchAll(re)) {
        const host = m[1]
        if (!host) continue
        if (host === 'localhost' || host.endsWith('.local')) continue
        if (host === 'govevia.com.br' || host === 'www.govevia.com.br') continue
        record(host, rel)
      }
    }
  }

  return hosts
}

async function main() {
  const csp = await getNextConfigCsp()
  const allowedHosts = parseAllowedHostsFromCsp(csp)
  const used = findExternalHostsInRuntime(repoRoot)
  const usedPublicAssets = findExternalHostsInPublicAssets(repoRoot)

  const missing = {
    connect: [],
    resource: [],
    stylesheet: [],
    publicAsset: [],
  }

  for (const [host, files] of used.connect.entries()) {
    if (!allowedHosts.has(host)) missing.connect.push({ host, files: [...files] })
  }
  for (const [host, files] of used.resource.entries()) {
    if (!allowedHosts.has(host)) missing.resource.push({ host, files: [...files] })
  }
  for (const [host, files] of used.stylesheet.entries()) {
    if (!allowedHosts.has(host)) missing.stylesheet.push({ host, files: [...files] })
  }

  for (const [host, files] of usedPublicAssets.entries()) {
    if (!allowedHosts.has(host)) missing.publicAsset.push({ host, files: [...files] })
  }

  const totalMissing =
    missing.connect.length + missing.resource.length + missing.stylesheet.length + missing.publicAsset.length
  if (totalMissing === 0) {
    console.log('CSP allowlist check: OK')
    return
  }

  console.error('CSP allowlist check: FAIL')
  if (missing.connect.length) {
    console.error('Missing hosts for connect-like usage (fetch/websocket):')
    for (const m of missing.connect) console.error(`- ${m.host} (in: ${m.files.join(', ')})`)
  }
  if (missing.stylesheet.length) {
    console.error('Missing hosts for stylesheet-like usage (<link>, @import):')
    for (const m of missing.stylesheet) console.error(`- ${m.host} (in: ${m.files.join(', ')})`)
  }
  if (missing.resource.length) {
    console.error('Missing hosts for resource-like usage (src/url()):')
    for (const m of missing.resource) console.error(`- ${m.host} (in: ${m.files.join(', ')})`)
  }
  if (missing.publicAsset.length) {
    console.error('Missing hosts referenced inside public assets (public/**/*.svg|css):')
    for (const m of missing.publicAsset) console.error(`- ${m.host} (in: ${m.files.join(', ')})`)
  }

  process.exitCode = 1
}

main().catch((err) => {
  console.error('CSP allowlist check: ERROR')
  console.error(err)
  process.exitCode = 1
})
