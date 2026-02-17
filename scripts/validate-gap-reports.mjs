#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'

const ROOT = process.cwd()
const DATA_DIR = path.join(ROOT, 'data', 'gap-reports')
const SCHEMA_PATH = path.join(DATA_DIR, '_schema.gap-report.v1.json')

function walk(dirAbs, out = []) {
  if (!fs.existsSync(dirAbs)) return out
  const ents = fs.readdirSync(dirAbs, { withFileTypes: true })
  for (const e of ents) {
    const p = path.join(dirAbs, e.name)
    if (e.isDirectory()) walk(p, out)
    else out.push(p)
  }
  return out
}

function rel(p) {
  return path.relative(ROOT, p).replace(/\\/g, '/')
}

function main() {
  if (!fs.existsSync(SCHEMA_PATH)) {
    console.error(`GAP FAIL: missing schema: ${rel(SCHEMA_PATH)}`)
    process.exit(2)
  }

  const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8'))
  const ajv = new Ajv2020({ allErrors: true, strict: false })
  addFormats(ajv)

  const validate = ajv.compile(schema)

  const jsonFiles = walk(DATA_DIR)
    .filter((f) => f.endsWith('.json'))
    .filter((f) => path.basename(f) !== path.basename(SCHEMA_PATH))

  const failures = []

  for (const f of jsonFiles) {
    const raw = fs.readFileSync(f, 'utf8')
    let obj
    try {
      obj = JSON.parse(raw)
    } catch (e) {
      failures.push({ file: rel(f), errors: [`invalid JSON: ${String(e)}`] })
      continue
    }

    const ok = validate(obj)
    if (!ok) {
      const errs = (validate.errors || []).map((er) => `${er.instancePath || '/'} ${er.message}`)
      failures.push({ file: rel(f), errors: errs })
    }
  }

  if (failures.length > 0) {
    console.error('GAP FAIL: invalid gap reports')
    for (const f of failures) {
      console.error(`- ${f.file}`)
      f.errors.slice(0, 20).forEach((e) => console.error(`  - ${e}`))
      if (f.errors.length > 20) console.error(`  ... (${f.errors.length - 20} omitidos)`) 
    }
    process.exit(2)
  }

  console.log('OK: gap reports schema validation passed')
}

main()
