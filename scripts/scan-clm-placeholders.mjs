#!/usr/bin/env node
/**
 * GOVEVIA — Deterministic CLM placeholder scanner (UNAÍ-MG)
 * - Reads exact template files
 * - Fails on: missing file, empty file, non-UTF8 decode
 * - Outputs JSON to stdout (audit-friendly)
 *
 * Usage:
 *   node scripts/scan-clm-placeholders.mjs
 */

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { TextDecoder } from "node:util";

const ROOT = process.cwd();

const FILES = [
  "packages/clm/templates/unai-mg/proposta.md",
  "packages/clm/templates/unai-mg/sow.md",
  "packages/clm/templates/unai-mg/minuta-base.md",
  "packages/clm/templates/unai-mg/anexos/sla.md",
  "packages/clm/templates/unai-mg/anexos/lgpd-dpa.md",
];

const decoder = new TextDecoder("utf-8", { fatal: true });

function splitLines(text) {
  // Normalize: keep deterministic line indexing (1-based later)
  return text.split(/\r\n|\n|\r/);
}

function pushToken(map, token, lineNo) {
  if (!map.has(token)) map.set(token, []);
  map.get(token).push(lineNo);
}

/**
 * Placeholder detection rules (deterministic):
 * - {{...}} mustache tokens
 * - [INSERIR ...] / [PREENCHER ...] style
 * - TODO/TBD/FIXME markers
 * - <<...>> angle placeholders
 * - N/A only when used as field value (heuristic):
 *   - after ":" e.g. "CNPJ: N/A"
 *   - after "-" label e.g. "- CNPJ: N/A"
 */
function detectPlaceholders(lines) {
  const tokens = new Map();

  const reMustache = /\{\{[^}]+\}\}/g;
  const reBrackets = /\[(?:INSERIR|PREENCHER)[^\]]+\]/gi;
  const reMarkers = /\b(?:TBD|TODO|FIXME)\b/g;
  const reAngles = /<<[^>]+>>/g;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNo = i + 1;

    for (const re of [reMustache, reBrackets, reMarkers, reAngles]) {
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(line)) !== null) {
        pushToken(tokens, m[0], lineNo);
      }
    }

    // N/A as placeholder: deterministic heuristic (field-like usage)
    // examples: "CNPJ: N/A" or "- CNPJ: N/A"
    const naFieldLike = /:\s*N\/A\b/i.test(line) || /^\s*[-*]\s*[^:]{2,}:\s*N\/A\b/i.test(line);

    if (naFieldLike) {
      pushToken(tokens, "N/A (field-value)", lineNo);
    }
  }

  // Build stable output
  const out = [];
  for (const [token, lineNos] of tokens.entries()) {
    out.push({
      token,
      occurrences: lineNos.length,
      lines: Array.from(new Set(lineNos)).sort((a, b) => a - b),
    });
  }
  out.sort((a, b) => a.token.localeCompare(b.token));
  return out;
}

async function readUtf8Strict(filePath) {
  const abs = path.join(ROOT, filePath);
  const buf = await fs.readFile(abs);
  if (buf.length === 0) {
    return { ok: false, reason: "EMPTY_FILE", text: "", bytes: 0 };
  }

  try {
    const text = decoder.decode(buf);
    return { ok: true, reason: "OK", text, bytes: buf.length };
  } catch {
    return { ok: false, reason: "NON_UTF8_ENCODING", text: "", bytes: buf.length };
  }
}

async function main() {
  const results = [];
  const failures = [];

  for (const rel of FILES) {
    const abs = path.join(ROOT, rel);

    let stat;
    try {
      stat = await fs.stat(abs);
      if (!stat.isFile()) {
        failures.push({ path: rel, reason: "NOT_A_FILE" });
        results.push({
          path: rel,
          readable: false,
          reason: "NOT_A_FILE",
          bytes: null,
          lines: null,
          placeholders: [],
        });
        continue;
      }
    } catch {
      failures.push({ path: rel, reason: "MISSING_FILE" });
      results.push({
        path: rel,
        readable: false,
        reason: "MISSING_FILE",
        bytes: null,
        lines: null,
        placeholders: [],
      });
      continue;
    }

    const r = await readUtf8Strict(rel);
    if (!r.ok) {
      failures.push({ path: rel, reason: r.reason });
      results.push({
        path: rel,
        readable: false,
        reason: r.reason,
        bytes: r.bytes,
        lines: r.reason === "EMPTY_FILE" ? 0 : null,
        placeholders: [],
      });
      continue;
    }

    const linesArr = splitLines(r.text);
    const placeholders = detectPlaceholders(linesArr);

    // "0 linhas úteis" (só whitespace) também é P0
    const hasNonEmptyLine = linesArr.some((l) => l.trim().length > 0);
    if (!hasNonEmptyLine) {
      failures.push({ path: rel, reason: "EMPTY_CONTENT" });
      results.push({
        path: rel,
        readable: false,
        reason: "EMPTY_CONTENT",
        bytes: r.bytes,
        lines: linesArr.length,
        placeholders: [],
      });
      continue;
    }

    results.push({
      path: rel,
      readable: true,
      reason: "OK",
      bytes: r.bytes,
      lines: linesArr.length,
      placeholders,
    });
  }

  const payload = {
    tool: "scan-clm-placeholders",
    version: "1.0.0",
    scope: "unai-mg",
    generated_at: new Date().toISOString(),
    files: results,
    summary: {
      total_files: FILES.length,
      readable_files: results.filter((f) => f.readable).length,
      failures: failures.length,
      failure_reasons: Array.from(
        failures.reduce((m, f) => m.set(f.reason, (m.get(f.reason) || 0) + 1), new Map())
      ).map(([reason, count]) => ({ reason, count })),
    },
  };

  // Print JSON to stdout (canonical)
  process.stdout.write(JSON.stringify(payload, null, 2) + "\n");

  // Exit non-zero on any failure (CI-friendly)
  if (failures.length > 0) process.exit(2);
}

main().catch((err) => {
  console.error("FATAL:", err?.message || err);
  process.exit(3);
});
