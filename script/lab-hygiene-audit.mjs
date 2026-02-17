#!/usr/bin/env node
/**
 * lab-hygiene-audit.mjs
 * Objetivo: ambiente lab, sem legado → detectar SCRUTA e código morto.
 * Saída: listas determinísticas (dead files / unused packages / unused scripts / public scruta).
 *
 * Regras:
 * - public/** somente assets servidos (brand, imagens, etc.)
 * - dead code = não alcançável a partir de entrypoints Next (app routes) + scripts referenciados
 * - packages não importados → candidato a deleção
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

// Diretórios ignorados globalmente
const IGNORE_DIRS = new Set([
  "node_modules",
  ".git",
  ".next",
  "out",
  "dist",
  "coverage",
  ".turbo",
  ".vercel",
]);

const CODE_EXT = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".css"]);
const IMPORT_RE = [
  /import\s+["']([^"']+)["']/g,
  /import\s+[^;]*?\s+from\s+["']([^"']+)["']/g,
  /export\s+[^;]*?\s+from\s+["']([^"']+)["']/g,
  /require\(\s*["']([^"']+)["']\s*\)/g,
  /import\(\s*["']([^"']+)["']\s*\)/g,
];

const HEX_RE = /#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/;
const HEX_URL_RE = /%23([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/;

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function exists(p) {
  try {
    fs.accessSync(p);
    return true;
  } catch {
    return false;
  }
}

function walk(dirAbs, out = []) {
  const ents = fs.readdirSync(dirAbs, { withFileTypes: true });
  for (const e of ents) {
    const p = path.join(dirAbs, e.name);
    if (e.isDirectory()) {
      if (IGNORE_DIRS.has(e.name)) continue;
      walk(p, out);
    } else {
      out.push(p);
    }
  }
  return out;
}

function rel(p) {
  return path.relative(ROOT, p).replace(/\\/g, "/");
}

function loadTsconfigPaths() {
  const p = path.join(ROOT, "tsconfig.json");
  if (!exists(p)) return { baseUrl: ".", paths: {} };
  const ts = readJson(p);
  const co = ts.compilerOptions || {};
  return {
    baseUrl: co.baseUrl || ".",
    paths: co.paths || {},
  };
}

function resolveAlias(spec, fromFile, tsconf) {
  // Suporta "@/..." e patterns simples do tsconfig paths ("@/*": ["./*"])
  const { baseUrl, paths } = tsconf;
  const baseAbs = path.join(ROOT, baseUrl);

  const candidates = [];

  // "@/x" → baseUrl/x
  if (spec.startsWith("@/")) {
    candidates.push(path.join(baseAbs, spec.slice(2)));
  }

  // tsconfig paths patterns
  for (const [k, arr] of Object.entries(paths)) {
    // ex.: "@/*"
    if (k.endsWith("/*") && spec.startsWith(k.slice(0, -1))) {
      const tail = spec.slice(k.length - 1);
      for (const target of arr) {
        if (target.endsWith("/*")) {
          candidates.push(path.join(ROOT, target.slice(0, -1) + tail));
        } else {
          candidates.push(path.join(ROOT, target));
        }
      }
    } else if (k === spec) {
      for (const target of arr) candidates.push(path.join(ROOT, target));
    }
  }

  // Se nada casou, sem resolução
  if (candidates.length === 0) return null;

  return resolveToFile(candidates[0], fromFile);
}

function resolveToFile(basePathAbs, fromFile) {
  // resolve arquivo direto ou com extensões/index
  const tries = [];

  // path literal
  tries.push(basePathAbs);

  // com extensões
  for (const ext of [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".css"]) {
    tries.push(basePathAbs + ext);
  }

  // index.*
  for (const ext of [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]) {
    tries.push(path.join(basePathAbs, "index" + ext));
  }

  for (const t of tries) {
    if (exists(t) && fs.statSync(t).isFile()) return t;
  }
  return null;
}

function resolveImport(spec, fromFile, tsconf) {
  // ignora dependências externas (react, next, etc.)
  if (!spec.startsWith(".") && !spec.startsWith("@/")) {
    // ainda pode ser path alias do tsconfig; tenta
    const ali = resolveAlias(spec, fromFile, tsconf);
    return ali;
  }

  if (spec.startsWith("@/")) {
    return resolveAlias(spec, fromFile, tsconf);
  }

  // relativo
  const fromDir = path.dirname(fromFile);
  const abs = path.resolve(fromDir, spec);
  return resolveToFile(abs, fromFile);
}

function extractImports(fileAbs) {
  const txt = fs.readFileSync(fileAbs, "utf8");
  const specs = new Set();
  for (const re of IMPORT_RE) {
    let m;
    while ((m = re.exec(txt)) !== null) {
      specs.add(m[1]);
    }
  }
  return [...specs];
}

function getNextEntrypoints() {
  // Next App Router: entrypoints por convenção
  const appAbs = path.join(ROOT, "app");
  if (!exists(appAbs)) return [];

  const files = walk(appAbs).filter((f) => CODE_EXT.has(path.extname(f)));
  const entryNames = new Set([
    "page",
    "layout",
    "route",
    "loading",
    "error",
    "not-found",
    "template",
    "default",
    "opengraph-image",
    "twitter-image",
  ]);

  return files.filter((f) => {
    const bn = path.basename(f).replace(/\.(ts|tsx|js|jsx|mjs|cjs)$/, "");
    // entrypoint por nome
    if (entryNames.has(bn)) return true;
    // middleware root
    if (rel(f) === "middleware.ts" || rel(f) === "middleware.js") return true;
    return false;
  });
}

function getScriptEntrypoints() {
  // scripts referenciados por package.json
  const pkgPath = path.join(ROOT, "package.json");
  if (!exists(pkgPath)) return [];
  const pkg = readJson(pkgPath);
  const scripts = pkg.scripts || {};
  const refs = new Set();

  const reNode = /\bnode\s+([^\s]+\.m?js)\b/g;

  for (const cmd of Object.values(scripts)) {
    let m;
    while ((m = reNode.exec(cmd)) !== null) {
      const p = m[1];
      const abs = path.join(ROOT, p);
      if (exists(abs)) refs.add(abs);
    }
  }
  return [...refs];
}

function scanHexRuntime() {
  const dirs = ["app", "components"];
  const hits = [];
  for (const d of dirs) {
    const abs = path.join(ROOT, d);
    if (!exists(abs)) continue;
    const files = walk(abs).filter((f) => CODE_EXT.has(path.extname(f)));
    for (const f of files) {
      const txt = fs.readFileSync(f, "utf8");
      const lines = txt.split(/\r?\n/);
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Ignore numeric HTML entities like "&#039;" which contain "#" but are not colors.
        // Flag only real HEX tokens (#rgb / #rrggbb) and url-encoded %23 variants.
        let hasHex = false;

        if (HEX_URL_RE.test(line)) hasHex = true;

        if (!hasHex) {
          const re = /#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g;
          let m;
          while ((m = re.exec(line)) !== null) {
            const idx = m.index;
            const prev = idx > 0 ? line[idx - 1] : "";
            if (prev === "&") continue; // e.g. "&#039;"
            hasHex = true;
            break;
          }
        }

        if (hasHex) hits.push(`${rel(f)}:${i + 1}: ${line.trim()}`);
      }
    }
  }
  return hits;
}

function scanPublicScruta() {
  const pubAbs = path.join(ROOT, "public");
  if (!exists(pubAbs)) return [];
  const all = walk(pubAbs).map(rel);

  const scruta = [];
  for (const p of all) {
    // arquivos/pastas proibidos por função
    if (
      p.startsWith("public/170") || // timestamps típicos
      p.includes("/packages/") ||
      p.includes("/scripts/") ||
      p.includes("/docs/") ||
      p.includes("/.github/") ||
      p.includes("/tools/") ||
      p.includes("/node_modules/")
    )
      scruta.push(p);

    // compactados dentro de public
    if (/\.(zip|7z|tar|gz)$/.test(p)) scruta.push(p);
  }

  // diretórios "timestamp" no nível 1 de public
  const level1 = fs
    .readdirSync(pubAbs, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);
  for (const d of level1) {
    if (/^\d{10,}$/.test(d)) scruta.push(`public/${d}/`);
  }

  return [...new Set(scruta)].sort();
}

function computeReachableGraph(entrypoints, tsconf) {
  const reachable = new Set();
  const q = [...entrypoints];

  while (q.length > 0) {
    const f = q.pop();
    if (!f || !exists(f)) continue;
    if (reachable.has(f)) continue;
    reachable.add(f);

    const ext = path.extname(f);
    if (!CODE_EXT.has(ext)) continue;

    const imps = extractImports(f);
    for (const spec of imps) {
      const resolved = resolveImport(spec, f, tsconf);
      if (resolved && !reachable.has(resolved)) q.push(resolved);
    }
  }
  return reachable;
}

function listCandidatesDead(reachable) {
  // candidatos: arquivos de código em components/ e packages/ e scripts/ não alcançados
  const candidates = [];

  for (const d of ["components", "app"]) {
    const abs = path.join(ROOT, d);
    if (!exists(abs)) continue;
    const files = walk(abs).filter((f) => CODE_EXT.has(path.extname(f)));
    for (const f of files) {
      // app/ tem entrypoints por convenção; arquivo auxiliar em app/ pode ser importado.
      // se não for alcançado do grafo → candidato.
      if (!reachable.has(f)) candidates.push(rel(f));
    }
  }

  // scripts não referenciados por package.json scripts
  const scriptsAbs = path.join(ROOT, "scripts");
  if (exists(scriptsAbs)) {
    const files = walk(scriptsAbs).filter((f) => [".js", ".mjs", ".cjs"].includes(path.extname(f)));
    // reachable aqui não cobre scripts externos; vamos marcar como morto se não for entrypoint
    const scriptEntrys = new Set(getScriptEntrypoints().map((x) => rel(x)));
    for (const f of files) {
      const r = rel(f);
      if (!scriptEntrys.has(r)) candidates.push(r);
    }
  }

  return candidates.sort();
}

function listUnusedPackages(reachable) {
  const pkAbs = path.join(ROOT, "packages");
  if (!exists(pkAbs)) return [];

  const packages = fs
    .readdirSync(pkAbs, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);

  const unused = [];
  for (const p of packages) {
    const pDir = path.join(pkAbs, p);
    const files = walk(pDir).filter((f) => CODE_EXT.has(path.extname(f)));
    // se nenhum arquivo do package for alcançado, package é candidato
    const any = files.some((f) => reachable.has(f));
    if (!any) unused.push(`packages/${p}/`);
  }

  return unused.sort();
}

function main() {
  const tsconf = loadTsconfigPaths();

  const nextEntrys = getNextEntrypoints();
  const scriptEntrys = getScriptEntrypoints();

  const entrypoints = [...nextEntrys, ...scriptEntrys];

  const reachable = computeReachableGraph(entrypoints, tsconf);

  const hexHits = scanHexRuntime();
  const publicScruta = scanPublicScruta();
  const deadCandidates = listCandidatesDead(reachable);
  const unusedPackages = listUnusedPackages(reachable);

  console.log("\n== LAB HYGIENE AUDIT ==");
  console.log(`Entrypoints Next: ${nextEntrys.length}`);
  console.log(`Entrypoints Scripts: ${scriptEntrys.length}`);
  console.log(`Reachable files: ${reachable.size}\n`);

  console.log("== SCRUTA: public/ proibido ==");
  if (publicScruta.length === 0) console.log("OK: nenhum scruta detectado em public/");
  else publicScruta.forEach((p) => console.log(`- ${p}`));

  console.log("\n== FE-01: HEX/%23HEX em runtime (app/components) ==");
  if (hexHits.length === 0) console.log("OK: zero ocorrências");
  else hexHits.forEach((h) => console.log(`- ${h}`));

  console.log("\n== Código morto (candidatos a deletar) ==");
  if (deadCandidates.length === 0) console.log("OK: nenhum candidato");
  else deadCandidates.slice(0, 200).forEach((p) => console.log(`- ${p}`));
  if (deadCandidates.length > 200) console.log(`... (${deadCandidates.length - 200} omitidos)`);

  console.log("\n== Packages não utilizados (candidatos a deletar) ==");
  if (unusedPackages.length === 0) console.log("OK: nenhum package morto");
  else unusedPackages.forEach((p) => console.log(`- ${p}`));

  console.log("\n== Recomendações determinísticas (comandos) ==");
  if (publicScruta.length > 0) {
    console.log(
      "git rm -r " +
        publicScruta
          .filter((p) => p.endsWith("/") || p.includes("/"))
          .map((p) => `\"${p.replace(/\/$/, "")}\"`)
          .join(" ")
    );
  }
  if (hexHits.length > 0) {
    console.log("Ação: substituir HEX por tokens (Tailwind vars) ou tokens.runtime.ts (inline/email/OG).");
  }
  if (unusedPackages.length > 0) {
    console.log("git rm -r " + unusedPackages.map((p) => `\"${p.replace(/\/$/, "")}\"`).join(" "));
  }
  console.log("\n(Obs) Revise candidatos de código morto antes de git rm — ambiente lab permite remoção agressiva.\n");

  // Exit code hard: se há scruta em public ou hex no runtime, falha
  if (publicScruta.length > 0 || hexHits.length > 0) process.exit(2);
}

main();
