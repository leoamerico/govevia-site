/**
 * lib/rules/engine.ts
 *
 * Motor determinístico de execução de Regras Institucionais EnvNeo.
 * Sem IA, sem DSL externo — lógica auditável via call stack simples.
 *
 * Uso:
 *   const uc = loadUseCases(rootDir)
 *   const rules = loadRules(rootDir)
 *   const result = evaluateUseCase('UC03', payload, rootDir)
 *
 * rootDir: caminho absoluto para a raiz do monorepo (onde envneo/ está).
 *   - site-public: process.cwd()
 *   - ceo-console:  join(process.cwd(), '../..')
 */
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import type { RuleResult } from './impl/index'
import * as impl from './impl/index'

// ─── Public types ─────────────────────────────────────────────────────────────

export interface UseCase {
  id: string
  name: string
  primary_actor: string
  payload_fields: string[]
  flow_summary: string
  rule_ids: string[]
}

export interface InstitutionalRule {
  id: string
  name: string
  legal_reference: string
  constraint_summary: string
  objective: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  engine_ref: string
  applies_to_use_cases: string[]
}

export interface RuleEvalResult {
  ruleId: string
  ruleName: string
  engineRef: string
  severity: string
  result: 'PASS' | 'FAIL'
  violations: string[]
  evidence: Record<string, unknown>
}

export interface UseCaseEvalResult {
  useCaseId: string
  result: 'PASS' | 'FAIL'
  ruleResults: RuleEvalResult[]
}

export type { RuleResult }

// ─── Minimal YAML parser (handles use-cases.yaml and institutional-rules.yaml) ─

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type YamlPrimitive = string | number | boolean | null
// Using interface for YamlRecord to allow recursive reference via interface (not type alias)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface YamlRecord { [key: string]: YamlNode }
type YamlNode = YamlPrimitive | YamlNode[] | YamlRecord

/** Remove YAML block scalar indicator (>) and collapse folded text */
function foldScalar(lines: string[], indent: number): string {
  return lines
    .map((l) => (l.trim() === '' ? '\n' : l.replace(new RegExp(`^\\s{${indent},}`), ' ')))
    .join('')
    .replace(/\n+/g, ' ')
    .trim()
}

/** Parse inline YAML array: [item1, item2] */
function parseInlineArray(s: string): string[] {
  const inner = s.replace(/^\s*\[\s*/, '').replace(/\s*\]\s*$/, '')
  if (inner.trim() === '') return []
  return inner
    .split(',')
    .map((p) => p.trim().replace(/^['"]|['"]$/g, ''))
    .filter(Boolean)
}

/** Parse a YAML document into a nested structure (subset: handles these files) */
function parseYaml(text: string): YamlRecord {
  const lines = text.replace(/\r\n/g, '\n').split('\n')
  const stack: Array<{ indent: number; obj: YamlRecord | YamlNode[] }> = [
    { indent: -1, obj: {} },
  ]

  let i = 0
  while (i < lines.length) {
    const raw = lines[i]
    const trimmed = raw.trimEnd()
    if (trimmed.trim() === '' || trimmed.trim().startsWith('#')) { i++; continue }

    const indent = trimmed.length - trimmed.trimStart().length
    const content = trimmed.trim()

    // Pop stack to find parent at correct indent level
    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
      stack.pop()
    }
    const parent = stack[stack.length - 1].obj

    if (content.startsWith('- ')) {
      // List item
      const itemContent = content.slice(2).trim()
      if (!Array.isArray(parent)) {
        i++; continue
      }
      if (itemContent.includes(': ')) {
        const newObj: YamlRecord = {}
        const newFrame = { indent, obj: newObj }
        stack.push(newFrame)
        const [k, ...rest] = itemContent.split(': ')
        const val = rest.join(': ').trim()
        if (val.startsWith('>')) {
          // Collect folded scalar lines
          const foldLines: string[] = []
          const foldIndent = indent + 2
          let j = i + 1
          while (j < lines.length) {
            const nextRaw = lines[j]
            const nextIndent = nextRaw.length - nextRaw.trimStart().length
            if (nextRaw.trim() === '' || nextIndent >= foldIndent) {
              foldLines.push(nextRaw)
              j++
            } else break
          }
          newObj[k.trim()] = foldScalar(foldLines, foldIndent)
          i = j
        } else if (val.startsWith('[')) {
          newObj[k.trim()] = parseInlineArray(val)
          i++
        } else {
          newObj[k.trim()] = parseScalar(val)
          i++
        }
        ;(parent as YamlNode[]).push(newObj as unknown as YamlNode)
        continue
      } else if (itemContent !== '') {
        ;(parent as YamlNode[]).push(parseScalar(itemContent))
        i++
        continue
      }
    } else if (content.startsWith('-')) {
      // Bare list item (start of a block map)
      const newObj: YamlRecord = {}
      const newFrame = { indent, obj: newObj }
      stack.push(newFrame)
      if (Array.isArray(parent)) {
        ;(parent as YamlNode[]).push(newObj as unknown as YamlNode)
      }
      i++
      continue
    }

    if (content.includes(': ') || content.endsWith(':')) {
      const colonIdx = content.indexOf(': ')
      let key: string
      let val: string
      if (colonIdx === -1) {
        key = content.slice(0, -1).trim()
        val = ''
      } else {
        key = content.slice(0, colonIdx).trim()
        val = content.slice(colonIdx + 2).trim()
      }

      if (val === '' || val === '|' || val === '>') {
        // Next lines are value (list or block scalar)
        const childIndent = indent + 2
        let j = i + 1
        if (j < lines.length) {
          const nextLineRaw = lines[j]
          const nextTrimmed = nextLineRaw.trim()
          if (nextTrimmed.startsWith('- ')) {
            // Sequence
            const arr: YamlNode[] = []
            if (!Array.isArray(parent)) {
              ;(parent as YamlRecord)[key] = arr
            }
            stack.push({ indent: indent + 1, obj: arr })
            const checkArr = arr
            if (Array.isArray(parent)) {
              // attached to a list container — merge into last obj
              const last = (parent as YamlNode[])[parent.length - 1]
              if (last && typeof last === 'object' && !Array.isArray(last)) {
                ;(last as YamlRecord)[key] = arr
              }
            } else {
              ;(parent as YamlRecord)[key] = arr
            }
            i++
            continue
          } else if (nextTrimmed === '' || (val === '>' && nextLineRaw.length - nextLineRaw.trimStart().length >= childIndent)) {
            // Folded / literal scalar
            const foldLines: string[] = []
            while (j < lines.length) {
              const nr = lines[j]
              const ni = nr.length - nr.trimStart().length
              if (nr.trim() === '' || ni >= childIndent) {
                foldLines.push(nr)
                j++
              } else break
            }
            const scalarVal = foldScalar(foldLines, childIndent)
            assignToParent(parent, stack, key, scalarVal, indent)
            i = j
            continue
          }
        }
        // Empty value
        const newObj: YamlRecord = {}
        assignToParent(parent, stack, key, newObj as unknown as YamlNode, indent)
        stack.push({ indent: indent + 1, obj: newObj })
        i++
        continue
      } else if (val.startsWith('[')) {
        assignToParent(parent, stack, key, parseInlineArray(val) as unknown as YamlNode, indent)
        i++
        continue
      } else {
        assignToParent(parent, stack, key, parseScalar(val), indent)
        i++
        continue
      }
    }
    i++
  }

  return stack[0].obj as YamlRecord
}

function assignToParent(
  parent: YamlRecord | YamlNode[],
  stack: Array<{ indent: number; obj: YamlRecord | YamlNode[] }>,
  key: string,
  value: YamlNode,
  indent: number
): void {
  if (Array.isArray(parent)) {
    // attach to last object in the array
    const last = parent[parent.length - 1]
    if (last && typeof last === 'object' && !Array.isArray(last)) {
      ;(last as YamlRecord)[key] = value
    }
  } else {
    ;(parent as YamlRecord)[key] = value
  }
}

function parseScalar(s: string): YamlNode {
  const t = s.trim().replace(/^['"]|['"]$/g, '')
  if (t === 'true') return true
  if (t === 'false') return false
  if (t === 'null' || t === '~') return null
  const n = Number(t)
  if (!isNaN(n) && t !== '') return n
  return t
}

// ─── Specific loaders ─────────────────────────────────────────────────────────

export function loadUseCases(rootDir: string): UseCase[] {
  const path = join(rootDir, 'envneo', 'control-plane', 'core', 'use-cases.yaml')
  if (!existsSync(path)) return []
  const doc = parseYaml(readFileSync(path, 'utf8'))
  const raw = doc['use_cases']
  if (!Array.isArray(raw)) return []
  return (raw as YamlRecord[]).map((u) => ({
    id: String(u['id'] ?? ''),
    name: String(u['name'] ?? ''),
    primary_actor: String(u['primary_actor'] ?? ''),
    payload_fields: Array.isArray(u['payload_fields'])
      ? (u['payload_fields'] as string[]).map(String)
      : [],
    flow_summary: String(u['flow_summary'] ?? ''),
    rule_ids: Array.isArray(u['rule_ids']) ? (u['rule_ids'] as string[]).map(String) : [],
  }))
}

export function loadRules(rootDir: string): InstitutionalRule[] {
  const path = join(rootDir, 'envneo', 'control-plane', 'core', 'institutional-rules.yaml')
  if (!existsSync(path)) return []
  const doc = parseYaml(readFileSync(path, 'utf8'))
  const raw = doc['rules']
  if (!Array.isArray(raw)) return []
  return (raw as YamlRecord[]).map((r) => ({
    id: String(r['id'] ?? ''),
    name: String(r['name'] ?? ''),
    legal_reference: String(r['legal_reference'] ?? ''),
    constraint_summary: String(r['constraint_summary'] ?? ''),
    objective: String(r['objective'] ?? ''),
    severity: String(r['severity'] ?? 'MEDIUM') as InstitutionalRule['severity'],
    engine_ref: String(r['engine_ref'] ?? ''),
    applies_to_use_cases: Array.isArray(r['applies_to_use_cases'])
      ? (r['applies_to_use_cases'] as string[]).map(String)
      : [],
  }))
}

// ─── Rule dispatch ────────────────────────────────────────────────────────────

type ImplFn = (payload: Record<string, unknown>) => RuleResult
const IMPL_MAP: Record<string, ImplFn> = {
  rn01_legalidade_estrita: impl.rn01_legalidade_estrita,
  rn02_responsabilidade_solidaria_trigger: impl.rn02_responsabilidade_solidaria_trigger,
  rn03_segregacao_de_funcoes: impl.rn03_segregacao_de_funcoes,
  rn04_classificacao_sigilo_mascaramento: impl.rn04_classificacao_sigilo_mascaramento,
  rn05_limite_gasto_lrf_prudencial: impl.rn05_limite_gasto_lrf_prudencial,
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function evaluateRule(
  ruleId: string,
  payload: Record<string, unknown>,
  rootDir: string
): RuleEvalResult {
  const rules = loadRules(rootDir)
  const rule = rules.find((r) => r.id === ruleId)
  if (!rule) {
    return {
      ruleId,
      ruleName: '(não encontrado)',
      engineRef: '',
      severity: 'CRITICAL',
      result: 'FAIL',
      violations: [`Regra ${ruleId} não encontrada em institutional-rules.yaml.`],
      evidence: {},
    }
  }
  const fn = IMPL_MAP[rule.engine_ref]
  if (!fn) {
    return {
      ruleId,
      ruleName: rule.name,
      engineRef: rule.engine_ref,
      severity: rule.severity,
      result: 'FAIL',
      violations: [`engine_ref "${rule.engine_ref}" não implementado em lib/rules/impl/index.ts.`],
      evidence: {},
    }
  }
  const res = fn(payload)
  return {
    ruleId,
    ruleName: rule.name,
    engineRef: rule.engine_ref,
    severity: rule.severity,
    ...res,
  }
}

export function evaluateUseCase(
  useCaseId: string,
  payload: Record<string, unknown>,
  rootDir: string
): UseCaseEvalResult {
  const useCases = loadUseCases(rootDir)
  const uc = useCases.find((u) => u.id === useCaseId)
  if (!uc) {
    return {
      useCaseId,
      result: 'FAIL',
      ruleResults: [
        {
          ruleId: '?',
          ruleName: '',
          engineRef: '',
          severity: 'CRITICAL',
          result: 'FAIL',
          violations: [`Caso de uso ${useCaseId} não encontrado em use-cases.yaml.`],
          evidence: {},
        },
      ],
    }
  }
  const ruleResults = uc.rule_ids.map((ruleId) => evaluateRule(ruleId, payload, rootDir))
  const anyFail = ruleResults.some((r) => r.result === 'FAIL')
  return {
    useCaseId,
    result: anyFail ? 'FAIL' : 'PASS',
    ruleResults,
  }
}
