import type { Metadata } from 'next'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { FilterableEventList } from './FilterableEventList'
import type { RegistryEventClient } from './FilterableEventList'

export const metadata: Metadata = {
  title: 'Ops — CEO Console',
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface TreeNode {
  id: string
  parent: string | null
  layer: 'root' | 'trunk' | 'branch' | 'leaf'
  owner_org_unit: string
  label: string
  objective?: string
}

interface RegistryEvent {
  ts: string
  org_unit: 'ENVNEO' | 'GOVEVIA' | 'ENVLIVE'
  type: 'DECISION' | 'GATE' | 'RUNBOOK' | 'CHANGE' | 'VIOLATION' | 'NOTE' | 'SIMULATION'
  ref: string
  summary?: string
  actor?: string
  use_case_id?: string
  result?: string
  hash_payload?: string
}

interface SourceOfTruth {
  _version?: string
  _updated?: string
  contracting_entity?: { legal_name: string; cnpj: string }
  brands?: Array<{ id: string; display_name: string; context: string }>
  domains?: {
    current?: { domain: string; status: string }
    planned?: Array<{ domain: string; status: string }>
  }
  boundaries?: Record<string, { rule: string; enforced_by_gate?: string }>
}

interface QueueItem {
  id: string
  org_unit: string
  title: string
  priority: string
  actor: string
  created_at: string
  completed_at?: string
  notes?: string
}

interface Queue {
  backlog: QueueItem[]
  wip: QueueItem[]
  done: QueueItem[]
}

// ─── Parsers (no external deps) ───────────────────────────────────────────────

function parseNdjson(text: string): RegistryEvent[] {
  return text
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.startsWith('{'))
    .map(l => {
      try { return JSON.parse(l) as RegistryEvent } catch { return null }
    })
    .filter(Boolean) as RegistryEvent[]
}

function parseTreeYaml(text: string): TreeNode[] {
  const nodes: TreeNode[] = []
  const lines = text.split('\n')
  let current: Partial<TreeNode> | null = null

  const flush = () => {
    if (current?.id && current?.label) nodes.push(current as TreeNode)
  }

  for (const raw of lines) {
    const line = raw.trim()
    if (line.startsWith('- id:')) {
      flush()
      current = { id: line.slice(5).trim(), parent: null }
      continue
    }
    if (!current) continue
    const kv = (key: string) => {
      const prefix = `${key}:`
      if (line.startsWith(prefix)) return line.slice(prefix.length).trim().replace(/^["']|["']$/g, '')
      return null
    }
    const parent = kv('parent'); if (parent !== null) { current.parent = parent === 'null' ? null : parent }
    const layer = kv('layer'); if (layer) current.layer = layer as TreeNode['layer']
    const org = kv('owner_org_unit'); if (org) current.owner_org_unit = org
    const label = kv('label'); if (label) current.label = label
    const obj = kv('objective'); if (obj) current.objective = obj
  }
  flush()
  return nodes
}

function parseQueueYaml(text: string): Queue {
  const sections: Queue = { backlog: [], wip: [], done: [] }
  type SectionKey = keyof Queue
  let currentSection: SectionKey | null = null
  let currentItem: Record<string, string> | null = null

  const flush = () => {
    if (currentItem && currentSection) {
      sections[currentSection].push(currentItem as unknown as QueueItem)
    }
  }

  for (const raw of text.split('\n')) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue
    if (line === 'backlog:') { flush(); currentSection = 'backlog'; currentItem = null; continue }
    if (line === 'wip:') { flush(); currentSection = 'wip'; currentItem = null; continue }
    if (line === 'done:') { flush(); currentSection = 'done'; currentItem = null; continue }
    if (!currentSection) continue
    if (line.startsWith('- id:')) {
      flush()
      currentItem = { id: line.slice(5).trim() }
      continue
    }
    if (currentItem && line.includes(':')) {
      const ci = line.indexOf(':')
      const key = line.slice(0, ci).trim()
      const val = line.slice(ci + 1).trim().replace(/^["']|["']$/g, '')
      currentItem[key] = val
    }
  }
  flush()
  return sections
}

// ─── Data loading (repo root = ../../  from apps/ceo-console) ─────────────────

function loadOpsData() {
  const opsDir = join(process.cwd(), '../../envneo/ops')
  const registryPath = join(opsDir, 'REGISTRY-OPS.ndjson')
  const queuePath = join(opsDir, 'CEO-QUEUE.yaml')

  const sotPath = join(process.cwd(), '../../envneo/control-plane/ltda/SOURCE-OF-TRUTH.json')

  const events: RegistryEvent[] = existsSync(registryPath)
    ? parseNdjson(readFileSync(registryPath, 'utf8'))
    : []

  const sot: SourceOfTruth | null = existsSync(sotPath)
    ? (() => {
        try { return JSON.parse(readFileSync(sotPath, 'utf8')) as SourceOfTruth } catch { return null }
      })()
    : null

  const queue: Queue = existsSync(queuePath)
    ? parseQueueYaml(readFileSync(queuePath, 'utf8'))
    : { backlog: [], wip: [], done: [] }

  const treePath = join(opsDir, '../strategy/TREE-REVENUE.yaml')
  const tree: TreeNode[] = existsSync(treePath)
    ? parseTreeYaml(readFileSync(treePath, 'utf8'))
    : []

  return { events, queue, tree, sot }
}

// ─── Styles (inline, dark theme consistent with ceo-console) ──────────────────

const S = {
  page: { padding: '2rem', maxWidth: 1100, margin: '0 auto' } as React.CSSProperties,
  h1: { fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.25rem' } as React.CSSProperties,
  subtitle: { fontSize: '0.75rem', color: '#64748b', marginBottom: '2rem', fontFamily: 'monospace' } as React.CSSProperties,
  sectionTitle: { fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: '0.75rem' },
  card: { background: '#1e293b', borderRadius: 8, padding: '1rem', border: '1px solid #334155' } as React.CSSProperties,
  grid3: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' } as React.CSSProperties,
  kanban: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' } as React.CSSProperties,
  itemCard: { background: '#0f172a', borderRadius: 6, padding: '0.75rem', marginBottom: '0.5rem', border: '1px solid #1e293b' } as React.CSSProperties,
  wipItem: { background: '#0f172a', borderRadius: 6, padding: '0.75rem', marginBottom: '0.5rem', border: '1px solid #0059B3' } as React.CSSProperties,
  tag: (color: string) => ({ fontSize: '0.65rem', fontWeight: 700, color, background: color + '22', borderRadius: 4, padding: '2px 6px', display: 'inline-block', marginRight: 4 } as React.CSSProperties),
  mono: { fontFamily: 'monospace', fontSize: '0.7rem', color: '#94a3b8' } as React.CSSProperties,
  eventRow: { borderBottom: '1px solid #1e293b', padding: '0.5rem 0', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' } as React.CSSProperties,
}

const ORG_COLORS: Record<string, string> = { ENVNEO: '#38BDF8', GOVEVIA: '#818CF8', ENVLIVE: '#34D399' }
const TYPE_COLORS: Record<string, string> = { DECISION: '#F59E0B', GATE: '#EF4444', RUNBOOK: '#8B5CF6', CHANGE: '#3B82F6', VIOLATION: '#EF4444', NOTE: '#6B7280' }
const PRIORITY_COLORS: Record<string, string> = { P1: '#EF4444', P2: '#F59E0B', P3: '#6B7280' }

// ─── Sub-components ───────────────────────────────────────────────────────────

function OrgCard({ unit, queue }: { unit: string; queue: Queue }) {
  const allItems = [...queue.backlog, ...queue.wip, ...queue.done]
  const unitItems = allItems.filter(i => i.org_unit === unit)
  const wip = queue.wip.filter(i => i.org_unit === unit).length
  const color = ORG_COLORS[unit] ?? '#94a3b8'
  return (
    <div style={{ ...S.card, borderColor: color + '44' }}>
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color, marginBottom: '0.25rem' }}>{unit}</div>
      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc' }}>{unitItems.length}</div>
      <div style={{ fontSize: '0.65rem', color: '#64748b' }}>items · {wip} wip</div>
    </div>
  )
}

function QueueCol({ title, items, isWip = false }: { title: string; items: QueueItem[]; isWip?: boolean }) {
  return (
    <div>
      <div style={S.sectionTitle}>{title} <span style={{ color: '#334155' }}>({items.length})</span></div>
      {items.length === 0
        ? <div style={{ ...S.card, color: '#334155', fontSize: '0.75rem', textAlign: 'center' }}>—</div>
        : items.map(item => (
            <div key={item.id} style={isWip ? S.wipItem : S.itemCard}>
              <div style={{ display: 'flex', gap: 4, marginBottom: '0.35rem', flexWrap: 'wrap' as const }}>
                <span style={S.tag(ORG_COLORS[item.org_unit] ?? '#94a3b8')}>{item.org_unit}</span>
                <span style={S.tag(PRIORITY_COLORS[item.priority] ?? '#6B7280')}>{item.priority}</span>
                <span style={{ ...S.mono, marginLeft: 'auto' }}>{item.id}</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#e2e8f0', fontWeight: 500, marginBottom: '0.25rem' }}>{item.title}</div>
              {item.notes && <div style={{ ...S.mono, marginTop: '0.25rem' }}>{item.notes}</div>}
            </div>
          ))}
    </div>
  )
}



// ─── Page ─────────────────────────────────────────────────────────────────────

const LAYER_ORDER = ['root', 'trunk', 'branch', 'leaf']
const LAYER_LABELS: Record<string, string> = { root: 'Raízes', trunk: 'Tronco', branch: 'Galhos', leaf: 'Folhas' }
const LAYER_COLORS: Record<string, string> = { root: '#6B7280', trunk: '#0059B3', branch: '#10B981', leaf: '#F59E0B' }

function TreeSection({ tree }: { tree: TreeNode[] }) {
  if (tree.length === 0) return (
    <div style={{ ...S.card, color: '#334155', fontSize: '0.75rem' }}>
      envneo/strategy/TREE-REVENUE.yaml não encontrado.
    </div>
  )
  return (
    <div>
      {LAYER_ORDER.map(layer => {
        const nodes = tree.filter(n => n.layer === layer)
        if (nodes.length === 0) return null
        return (
          <div key={layer} style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: LAYER_COLORS[layer], letterSpacing: '0.08em', marginBottom: '0.5rem', textTransform: 'uppercase' as const }}>
              {LAYER_LABELS[layer]}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '0.5rem' }}>
              {nodes.map(node => (
                <div key={node.id} style={{ background: '#0f172a', border: `1px solid ${LAYER_COLORS[layer]}44`, borderRadius: 6, padding: '0.5rem 0.75rem', minWidth: 180, maxWidth: 260 }}>
                  <div style={{ display: 'flex', gap: 4, marginBottom: '0.25rem', alignItems: 'center' }}>
                    <span style={S.tag(ORG_COLORS[node.owner_org_unit] ?? '#94a3b8')}>{node.owner_org_unit}</span>
                    <span style={{ ...S.mono, color: LAYER_COLORS[layer] }}>{node.id}</span>
                    {node.parent && <span style={{ ...S.mono, color: '#334155' }}>← {node.parent}</span>}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#e2e8f0', fontWeight: 500 }}>{node.label}</div>
                  {node.objective && <div style={{ ...S.mono, marginTop: '0.25rem', lineClamp: 2 }}>{node.objective}</div>}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function OpsPage() {
  const { events, queue, tree, sot } = loadOpsData()
  const recentEvents: RegistryEventClient[] = ([...events].reverse() as RegistryEventClient[])
  const wipCount = queue.wip.length

  return (
    <div style={S.page}>
      <h1 style={S.h1}>Gabinete Ops — ENV NEO LTDA</h1>
      <p style={S.subtitle}>envneo/ops · {events.length} eventos · {new Date().toISOString().slice(0, 10)}</p>

      <div style={S.sectionTitle}>Fonte Única de Verdade (SOT) — control-plane</div>
      <div style={{ ...S.card, marginBottom: '2rem' }}>
        {!sot ? (
          <div style={{ color: '#334155', fontSize: '0.75rem' }}>
            envneo/control-plane/ltda/SOURCE-OF-TRUTH.json não encontrado.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.35rem' }}>
                {sot.contracting_entity?.legal_name}
              </div>
              <div style={{ ...S.mono, marginBottom: '0.5rem' }}>{`CNPJ: ${sot.contracting_entity?.cnpj}`}</div>
              <div style={{ ...S.mono, color: '#475569' }}>SOT: ltda/SOURCE-OF-TRUTH.json · v{sot._version} · updated {sot._updated}</div>
            </div>

            <div>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
                Marcas (display name)
              </div>
              {(sot.brands ?? []).map((b) => (
                <div key={b.id} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' as const }}>
                  <span style={S.tag('#0059B3')}>{b.id}</span>
                  <span style={{ fontSize: '0.8rem', color: '#e2e8f0', fontWeight: 600 }}>{b.display_name}</span>
                  <span style={{ ...S.mono, color: '#334155' }}>{b.context}</span>
                </div>
              ))}
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
                <div>
                  <div style={S.sectionTitle}>Domínios</div>
                  <div style={{ ...S.mono, marginBottom: 6 }}>
                    atual: {sot.domains?.current?.domain} · {sot.domains?.current?.status}
                  </div>
                  {(sot.domains?.planned ?? []).map((d, idx) => (
                    <div key={idx} style={{ ...S.mono, marginBottom: 4 }}>
                      planejado: {d.domain} · {d.status}
                    </div>
                  ))}
                </div>
                <div>
                  <div style={S.sectionTitle}>Boundaries (enforcement)</div>
                  {Object.entries(sot.boundaries ?? {}).map(([k, v]) => (
                    <div key={k} style={{ ...S.mono, marginBottom: 6 }}>
                      {k}: {v.rule}{v.enforced_by_gate ? ` (gate: ${v.enforced_by_gate})` : ''}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {wipCount > 1 && (
        <div style={{ background: '#7f1d1d', border: '1px solid #EF4444', borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1.5rem', color: '#FCA5A5', fontSize: '0.8rem', fontWeight: 600 }}>
          ⛔ VIOLAÇÃO WIP: {wipCount} itens em wip. Máximo permitido: 1. Gate de build falhará.
        </div>
      )}

      <div style={S.sectionTitle}>OrgUnits</div>
      <div style={S.grid3}>
        <OrgCard unit="ENVNEO" queue={queue} />
        <OrgCard unit="GOVEVIA" queue={queue} />
        <OrgCard unit="ENVLIVE" queue={queue} />
      </div>

      <div style={S.sectionTitle}>Mapa do Ecossistema — Árvore de Receita</div>
      <div style={{ ...S.card, marginBottom: '2rem' }}>
        <TreeSection tree={tree} />
      </div>

      <div style={S.sectionTitle}>CEO Queue</div>
      <div style={S.kanban}>
        <QueueCol title="Backlog" items={queue.backlog} />
        <QueueCol title="WIP (máx 1)" items={queue.wip} isWip />
        <QueueCol title="Done" items={queue.done} />
      </div>

      <div style={S.sectionTitle}>Registry — eventos <span style={{ color: '#10B981', fontWeight: 700 }}>(filtro por tipo)</span></div>
      <div style={S.card}>
        {recentEvents.length === 0
          ? <div style={{ color: '#334155', fontSize: '0.75rem' }}>Nenhum evento registrado.</div>
          : <FilterableEventList events={recentEvents} />}
      </div>
    </div>
  )
}
