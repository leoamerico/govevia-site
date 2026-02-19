'use client'
/**
 * PlaygroundClient.tsx — Interface interativa para teste de regras institucionais.
 * Recebe a lista de casos de uso do RSC pai e expõe:
 *  - Seletor de UC
 *  - Editor JSON do payload
 *  - Botão Executar (chama Server Action)
 *  - Painel de resultado PASS/FAIL + violações + evidência
 */
import { useState, useTransition } from 'react'
import { executarSimulacao } from './actions'
import type { SimulationResponse } from './actions'
import { ExigenciasChecker } from '@/components/rules/ExigenciasChecker'

export interface UseCaseInfo {
  id: string
  name: string
  primary_actor: string
  payload_fields: string[]
  flow_summary: string
  rule_ids: string[]
}

function buildTemplatePayload(fields: string[]): string {
  const obj: Record<string, string> = {}
  for (const f of fields) obj[f] = ''
  return JSON.stringify(obj, null, 2)
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const S = {
  page: { padding: '2rem', maxWidth: 900, fontFamily: 'system-ui, sans-serif', color: '#e2e8f0' },
  h1: { fontSize: '1.35rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.25rem' },
  subtitle: { fontSize: '0.78rem', color: '#64748b', marginBottom: '2rem', fontFamily: 'monospace' },
  section: { marginBottom: '1.5rem' },
  label: { display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.4rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' as const },
  card: { background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: '1rem 1.25rem' },
  select: { background: '#0f172a', border: '1px solid #334155', color: '#e2e8f0', borderRadius: 6, padding: '0.5rem 0.75rem', fontSize: '0.875rem', width: '100%', marginBottom: '0.75rem' },
  textarea: { background: '#0f172a', border: '1px solid #334155', color: '#e2e8f0', borderRadius: 6, padding: '0.75rem', fontSize: '0.8rem', width: '100%', minHeight: 160, fontFamily: 'monospace', resize: 'vertical' as const, boxSizing: 'border-box' as const },
  btn: (loading: boolean) => ({ background: loading ? '#1d4ed8' : '#0059B3', color: '#fff', border: 'none', borderRadius: 6, padding: '0.6rem 1.5rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, fontSize: '0.875rem' }),
  tag: (c: string) => ({ background: c + '22', color: c, border: `1px solid ${c}55`, borderRadius: 4, padding: '0.1rem 0.4rem', fontSize: '0.65rem', fontWeight: 700, fontFamily: 'monospace', marginRight: 4 }),
  mono: { fontFamily: 'monospace', fontSize: '0.75rem', color: '#94a3b8' },
  divider: { borderTop: '1px solid #1e293b', margin: '0.75rem 0' },
  ucMeta: { fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.6 },
  pill: (pass: boolean) => ({
    display: 'inline-block',
    background: pass ? '#052e16' : '#450a0a',
    color: pass ? '#4ade80' : '#f87171',
    border: `1px solid ${pass ? '#166534' : '#991b1b'}`,
    borderRadius: 6,
    padding: '0.25rem 0.9rem',
    fontWeight: 800,
    fontSize: '1rem',
    letterSpacing: '0.08em',
  }),
  // ─── Tab styles ───────────────────────────────────────────────────────────
  tabBar: { display: 'flex', gap: 4, marginBottom: '1.5rem', borderBottom: '1px solid #1e293b', paddingBottom: 0 },
  tabBtn: (active: boolean) => ({
    background: 'transparent',
    color: active ? '#f8fafc' : '#64748b',
    border: 'none',
    borderBottom: `2px solid ${active ? '#0059B3' : 'transparent'}`,
    padding: '0.5rem 1rem',
    fontWeight: active ? 700 : 500,
    cursor: 'pointer',
    fontSize: '0.875rem',
    marginBottom: -1,
  }),
  // ─── Catálogo tab ─────────────────────────────────────────────────────────
  catRow: (i: number) => ({ background: i % 2 === 0 ? '#1e293b' : '#0f172a', borderBottom: '1px solid #1e293b' }),
  catCell: { padding: '0.6rem 0.75rem', fontSize: '0.78rem', color: '#cbd5e1', verticalAlign: 'top' as const },
  catHead: { padding: '0.5rem 0.75rem', fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em', background: '#0f172a', borderBottom: '1px solid #334155' },
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function UCDetails({ uc }: { uc: UseCaseInfo }) {
  return (
    <div style={{ ...S.card, marginBottom: '1rem' }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: '0.5rem', flexWrap: 'wrap' as const }}>
        <span style={S.tag('#0059B3')}>{uc.id}</span>
        <span style={S.tag('#10B981')}>{uc.primary_actor}</span>
        {uc.rule_ids.map((r) => <span key={r} style={S.tag('#F59E0B')}>{r}</span>)}
      </div>
      <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '0.4rem' }}>{uc.flow_summary}</div>
      <div style={S.mono}>Campos esperados: {uc.payload_fields.join(', ')}</div>
    </div>
  )
}

function RuleResultRow({ r }: { r: NonNullable<SimulationResponse['ruleResults']>[number] }) {
  const sev_colors: Record<string, string> = { CRITICAL: '#EF4444', HIGH: '#F97316', MEDIUM: '#F59E0B', LOW: '#94a3b8' }
  const c = sev_colors[r.severity] ?? '#94a3b8'
  return (
    <div style={{ borderLeft: `3px solid ${r.result === 'PASS' ? '#16a34a' : '#dc2626'}`, paddingLeft: '0.75rem', marginBottom: '0.75rem' }}>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: '0.25rem', flexWrap: 'wrap' as const }}>
        <span style={S.tag(r.result === 'PASS' ? '#4ade80' : '#f87171')}>{r.result}</span>
        <span style={S.tag('#6B7280')}>{r.ruleId}</span>
        <span style={S.tag(c)}>{r.severity}</span>
        <span style={{ fontSize: '0.8rem', color: '#e2e8f0', fontWeight: 600 }}>{r.ruleName}</span>
      </div>
      <div style={{ ...S.mono, marginBottom: '0.2rem' }}>engine_ref: {r.engineRef}</div>
      {r.violations.map((v, i) => (
        <div key={i} style={{ fontSize: '0.78rem', color: '#fca5a5', marginTop: '0.2rem' }}>⚠ {v}</div>
      ))}
      <div style={{ ...S.mono, marginTop: '0.25rem', color: '#475569', wordBreak: 'break-all' as const }}>
        evidência: {JSON.stringify(r.evidence)}
      </div>
    </div>
  )
}

const SEV_COLORS: Record<string, string> = { CRITICAL: '#EF4444', HIGH: '#F97316', MEDIUM: '#F59E0B', LOW: '#94a3b8' }

const RULE_CATALOGUE_STATIC = [
  { id: 'RN01', name: 'Legalidade Estrita', legal_reference: 'CF/88, Art. 37', severity: 'CRITICAL', applies_to: 'UC01–05' },
  { id: 'RN02', name: 'Responsabilidade Solidária', legal_reference: 'CF/88, Art. 74 §1º', severity: 'HIGH', applies_to: 'UC04' },
  { id: 'RN03', name: 'Segregação de Funções', legal_reference: 'Controle interno', severity: 'HIGH', applies_to: 'UC03, UC04' },
  { id: 'RN04', name: 'Sigilo (LAI) + LGPD', legal_reference: 'Lei 12.527/2011 + Lei 13.709/2018', severity: 'CRITICAL', applies_to: 'UC05' },
  { id: 'RN05', name: 'Limite de Gasto (LRF)', legal_reference: 'LC 101/2000', severity: 'MEDIUM', applies_to: 'UC03' },
]

// ─── Main component ──────────────────────────────────────────────────────────

export function PlaygroundClient({ useCases }: { useCases: UseCaseInfo[] }) {
  const [activeTab, setActiveTab] = useState<'simulacao' | 'catalogo' | 'exigencias'>('simulacao')
  const [approvedToken, setApprovedToken] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState(useCases[0]?.id ?? '')
  const [payloadText, setPayloadText] = useState(() => {
    const uc = useCases[0]
    return uc ? buildTemplatePayload(uc.payload_fields) : '{}'
  })
  const [result, setResult] = useState<SimulationResponse | null>(null)
  const [isPending, startTransition] = useTransition()

  const selectedUc = useCases.find((u) => u.id === selectedId) ?? null

  function handleUcChange(id: string) {
    setSelectedId(id)
    const uc = useCases.find((u) => u.id === id)
    if (uc) setPayloadText(buildTemplatePayload(uc.payload_fields))
    setResult(null)
  }

  function handleExecute() {
    if (!selectedId || !payloadText.trim()) return
    startTransition(async () => {
      const res = await executarSimulacao(selectedId, payloadText)
      setResult(res)
    })
  }

  return (
    <div style={S.page}>
      <h1 style={S.h1}>Regras Institucionais</h1>
      <p style={S.subtitle}>
        envneo/control-plane/core · motor determinístico · {useCases.length} casos de uso carregados
      </p>

      {/* Tab bar */}
      <div style={S.tabBar}>
        {(['simulacao', 'catalogo', 'exigencias'] as const).map((t) => (
          <button key={t} style={S.tabBtn(activeTab === t)} onClick={() => setActiveTab(t)}>
            {t === 'simulacao' ? '🧪 Simulação' : t === 'catalogo' ? '📋 Catálogo' : '⚖️ Exigências'}
          </button>
        ))}
      </div>

      {/* UC Selector — shared across Simulação and Exigências */}
      {activeTab !== 'catalogo' && (
        <div style={S.section}>
          <label style={S.label}>Caso de Uso</label>
          <select
            style={S.select}
            value={selectedId}
            onChange={(e) => handleUcChange(e.target.value)}
          >
            {useCases.map((u) => (
              <option key={u.id} value={u.id}>
                {u.id} — {u.name}
              </option>
            ))}
          </select>
          {selectedUc && activeTab === 'simulacao' && <UCDetails uc={selectedUc} />}
        </div>
      )}

      {/* ─── Tab: Simulação ─────────────────────────────────────────────── */}
      {activeTab === 'simulacao' && (
        <>
          {/* Payload editor */}
          <div style={S.section}>
            <label style={S.label}>Payload (JSON)</label>
            <textarea
              style={S.textarea}
              value={payloadText}
              onChange={(e) => setPayloadText(e.target.value)}
              spellCheck={false}
            />
            <button
              style={S.btn(isPending)}
              disabled={isPending}
              onClick={handleExecute}
            >
              {isPending ? 'Executando...' : 'Executar'}
            </button>
          </div>

          {/* Result */}
          {result && (
            <div style={S.section}>
              <label style={S.label}>Resultado</label>
              <div style={S.card}>
                {result.error ? (
                  <div style={{ color: '#f87171', fontSize: '0.875rem' }}>⚠ {result.error}</div>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1rem', flexWrap: 'wrap' as const }}>
                      <span style={S.pill(result.result === 'PASS')}>{result.result}</span>
                      <span style={S.tag('#6B7280')}>{result.useCaseId}</span>
                    </div>

                    {/* Evidence hash */}
                    <div style={{ background: '#052e16', border: '1px solid #166534', borderRadius: 6, padding: '0.6rem 0.875rem', marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#4ade80', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>EVIDENCE HASH (SHA-256)</div>
                      <div style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#86efac', wordBreak: 'break-all' as const }}>{result.hash_payload}</div>
                      <div style={{ fontSize: '0.65rem', color: '#166534', marginTop: '0.3rem' }}>✓ Evento SIMULATION registrado em envneo/ops/REGISTRY-OPS.ndjson — sem payload bruto</div>
                    </div>

                    <div style={S.divider} />
                    {result.ruleResults.map((r) => (
                      <RuleResultRow key={r.ruleId} r={r} />
                    ))}
                  </>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* ─── Tab: Catálogo ──────────────────────────────────────────────── */}
      {activeTab === 'catalogo' && (
        <div style={S.section}>
          <label style={S.label}>Regras Institucionais — RN01 a RN05</label>
          <div style={{ ...S.card, padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['ID', 'Nome', 'Referência Legal', 'Severidade', 'Aplica-se a'].map((h) => (
                    <th key={h} style={S.catHead}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {RULE_CATALOGUE_STATIC.map((r, i) => (
                  <tr key={r.id} style={S.catRow(i)}>
                    <td style={{ ...S.catCell, fontFamily: 'monospace', color: '#f8fafc', fontWeight: 700 }}>{r.id}</td>
                    <td style={S.catCell}>{r.name}</td>
                    <td style={{ ...S.catCell, fontFamily: 'monospace', fontSize: '0.72rem', color: '#94a3b8' }}>{r.legal_reference}</td>
                    <td style={S.catCell}>
                      <span style={{ background: (SEV_COLORS[r.severity] ?? '#94a3b8') + '22', color: SEV_COLORS[r.severity] ?? '#94a3b8', border: `1px solid ${(SEV_COLORS[r.severity] ?? '#94a3b8')}55`, borderRadius: 4, padding: '0.1rem 0.4rem', fontSize: '0.65rem', fontWeight: 700, fontFamily: 'monospace' }}>{r.severity}</span>
                    </td>
                    <td style={{ ...S.catCell, fontFamily: 'monospace', color: '#64748b' }}>{r.applies_to}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── Tab: Exigências ────────────────────────────────────────────── */}
      {activeTab === 'exigencias' && (
        <div style={S.section}>
          {selectedUc && (
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
                <span style={S.tag('#0059B3')}>{selectedUc.id}</span>
                <span style={{ fontSize: '0.875rem', color: '#cbd5e1', fontWeight: 600 }}>{selectedUc.name}</span>
              </div>
            </div>
          )}
          <ExigenciasChecker
            useCaseId={selectedId}
            onApproved={(token) => setApprovedToken(token)}
          />
          {approvedToken && (
            <div style={{ marginTop: '1rem', fontSize: '0.78rem', color: '#4ade80' }}>
              🔗 <a href="/admin/bpmn" style={{ color: '#4ade80' }}>Ir para BPMN →</a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
