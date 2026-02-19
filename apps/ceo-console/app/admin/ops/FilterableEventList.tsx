'use client'
/**
 * FilterableEventList.tsx — exibe eventos do REGISTRY-OPS com filtro por type.
 * Client component: recebe events como props serializadas do RSC pai.
 */
import { useState } from 'react'

export interface RegistryEventClient {
  ts: string
  org_unit: string
  type: string
  ref: string
  summary?: string
  actor?: string
  use_case_id?: string
  result?: string
  hash_payload?: string
}

const ALL_TYPES = ['TODOS', 'DECISION', 'GATE', 'CHANGE', 'RUNBOOK', 'VIOLATION', 'NOTE', 'SIMULATION']

const ORG_COLORS: Record<string, string> = { ENVNEO: '#38BDF8', GOVEVIA: '#818CF8', ENVLIVE: '#34D399' }
const TYPE_COLORS: Record<string, string> = {
  DECISION: '#F59E0B', GATE: '#EF4444', RUNBOOK: '#8B5CF6',
  CHANGE: '#3B82F6', VIOLATION: '#EF4444', NOTE: '#6B7280', SIMULATION: '#10B981',
}

const S = {
  mono: { fontFamily: 'monospace', fontSize: '0.7rem', color: '#94a3b8' } as React.CSSProperties,
  tag: (color: string) => ({ fontSize: '0.65rem', fontWeight: 700, color, background: color + '22', borderRadius: 4, padding: '2px 6px', display: 'inline-block', marginRight: 4 } as React.CSSProperties),
  row: { borderBottom: '1px solid #1e293b', padding: '0.5rem 0', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' } as React.CSSProperties,
  select: {
    background: '#0f172a', border: '1px solid #334155', color: '#e2e8f0',
    borderRadius: 6, padding: '0.3rem 0.6rem', fontSize: '0.75rem',
    cursor: 'pointer',
  } as React.CSSProperties,
  simBadge: {
    background: '#052e16', border: '1px solid #166534', borderRadius: 4,
    padding: '1px 6px', fontSize: '0.65rem', color: '#4ade80', fontFamily: 'monospace',
    marginLeft: 4,
  } as React.CSSProperties,
}

function EventRow({ event }: { event: RegistryEventClient }) {
  const dateStr = new Date(event.ts).toISOString().slice(0, 16).replace('T', ' ')
  const orgColor = ORG_COLORS[event.org_unit] ?? '#94a3b8'
  const typeColor = TYPE_COLORS[event.type] ?? '#6B7280'

  return (
    <div style={S.row}>
      <span style={{ ...S.mono, whiteSpace: 'nowrap', minWidth: 96 }}>{dateStr}</span>
      <span style={S.tag(orgColor)}>{event.org_unit}</span>
      <span style={S.tag(typeColor)}>{event.type}</span>
      <span style={{ fontSize: '0.78rem', color: '#cbd5e1', flex: 1 }}>
        {event.summary ?? event.use_case_id ?? event.ref}
        {event.type === 'SIMULATION' && event.hash_payload && (
          <span style={S.simBadge}>evidence_hash: {event.hash_payload.slice(0, 16)}…</span>
        )}
        {event.type === 'SIMULATION' && event.result && (
          <span style={{ ...S.simBadge, color: event.result === 'PASS' ? '#4ade80' : '#f87171', borderColor: event.result === 'PASS' ? '#166534' : '#991b1b' }}>
            {event.result}
          </span>
        )}
      </span>
      <span style={{ ...S.mono, whiteSpace: 'nowrap' }}>{event.actor}</span>
    </div>
  )
}

export function FilterableEventList({ events }: { events: RegistryEventClient[] }) {
  const [filter, setFilter] = useState<string>('TODOS')

  const displayed = filter === 'TODOS' ? events : events.filter((e) => e.type === filter)
  const simCount = events.filter((e) => e.type === 'SIMULATION').length

  return (
    <div>
      {/* Filter bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <select style={S.select} value={filter} onChange={(e) => setFilter(e.target.value)}>
          {ALL_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <span style={{ ...S.mono, color: '#94a3b8' }}>
          {displayed.length} evento(s)
          {simCount > 0 && filter === 'TODOS' && (
            <span style={{ ...S.simBadge, marginLeft: 6 }}>{simCount} SIMULATION</span>
          )}
        </span>
      </div>

      {/* Event rows */}
      {displayed.length === 0
        ? <div style={{ color: '#334155', fontSize: '0.75rem' }}>Nenhum evento para o filtro selecionado.</div>
        : displayed.map((e, i) => <EventRow key={i} event={e} />)}
    </div>
  )
}
