import type { Metadata } from 'next'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

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
  type: 'DECISION' | 'GATE' | 'RUNBOOK' | 'CHANGE' | 'VIOLATION' | 'NOTE'
  ref: string
  summary: string
  actor: string
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

  const events: RegistryEvent[] = existsSync(registryPath)
    ? parseNdjson(readFileSync(registryPath, 'utf8'))
    : []

  const queue: Queue = existsSync(queuePath)
    ? parseQueueYaml(readFileSync(queuePath, 'utf8'))
    : { backlog: [], wip: [], done: [] }

  const treePath = join(opsDir, '../strategy/TREE-REVENUE.yaml')
  const tree: TreeNode[] = existsSync(treePath)
    ? parseTreeYaml(readFileSync(treePath, 'utf8'))
    : []

  return { events, queue, tree }
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

function EventRow({ event }: { event: RegistryEvent }) {
  const d = new Date(event.ts)
  const dateStr = d.toISOString().slice(0, 10)
  return (
    <div style={S.eventRow}>
      <span style={{ ...S.mono, whiteSpace: 'nowrap' as const, minWidth: 80 }}>{dateStr}</span>
      <span style={S.tag(ORG_COLORS[event.org_unit] ?? '#94a3b8')}>{event.org_unit}</span>
      <span style={S.tag(TYPE_COLORS[event.type] ?? '#6B7280')}>{event.type}</span>
      <span style={{ fontSize: '0.78rem', color: '#cbd5e1', flex: 1 }}>{event.summary}</span>
      <span style={{ ...S.mono, whiteSpace: 'nowrap' as const }}>{event.actor}</span>
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
  const { events, queue, tree } = loadOpsData()
  const recentEvents = [...events].reverse().slice(0, 20)
  const wipCount = queue.wip.length

  return (
    <div style={S.page}>
      <h1 style={S.h1}>Gabinete Ops — EnvNeo</h1>
      <p style={S.subtitle}>envneo/ops · {events.length} eventos · {new Date().toISOString().slice(0, 10)}</p>

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

      <div style={S.sectionTitle}>Registry — eventos recentes</div>
      <div style={S.card}>
        {recentEvents.length === 0
          ? <div style={{ color: '#334155', fontSize: '0.75rem' }}>Nenhum evento registrado.</div>
          : recentEvents.map((e, i) => <EventRow key={i} event={e} />)}
      </div>
    </div>
  )
}
