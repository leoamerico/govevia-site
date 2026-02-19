/**
 * /admin/rag — Demo RAG Kernel Govevia
 *
 * Server Component (wrapper estático + imprint).
 * Renderiza RagDemoClient para a parte interativa (upload + busca).
 *
 * Invariáveis:
 *  - Imprint corporativo no topo: ENV NEO LTDA + CNPJ: 36.207.211/0001-47
 *  - Endpoint do kernel via GOVEVIA_KERNEL_BASE_URL (sem hardcode)
 *  - Evidência append-only em REGISTRY-OPS.ndjson
 */
import type { Metadata } from 'next'
import { RagDemoClient } from './RagDemoClient'

export const metadata: Metadata = {
  title: 'RAG Demo — CEO Console',
}

// ─── Mapeamento UC → RN (marcadores estáticos para o demo) ───────────────────

const UC_MAP = [
  {
    ucId: 'UC01',
    ucName: 'Ingerir Evidência',
    tab: 'Upload',
    color: '#38bdf8',
    ruleIds: ['RN01', 'RN04'],
    ruleNames: ['Legalidade Estrita', 'Classificação de Sigilo (LAI) + LGPD'],
  },
  {
    ucId: 'UC03',
    ucName: 'Executar Análise',
    tab: 'Busca Semântica',
    color: '#a78bfa',
    ruleIds: ['RN01', 'RN02', 'RN05'],
    ruleNames: ['Legalidade Estrita', 'Responsabilidade Solidária', 'Limite de Gasto (LRF)'],
  },
] as const

export default function RagDemoPage() {
  const kernelConfigured = !!process.env.GOVEVIA_KERNEL_BASE_URL

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', background: '#0f172a', minHeight: '100vh', padding: '32px', color: '#e2e8f0' }}>

      {/* ── Imprint corporativo obrigatório ── */}
      <div style={{ marginBottom: '24px', borderBottom: '1px solid #1e293b', paddingBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontFamily: "'Open Sans', Arial, sans-serif", fontSize: '12px', fontWeight: 'normal', color: '#f8fafc', letterSpacing: '0.06em' }}>
            ENV NEO LTDA
          </div>
          <div style={{ fontFamily: "'Open Sans', Arial, sans-serif", fontSize: '12px', fontWeight: 'normal', color: '#94a3b8' }}>
            CNPJ: 36.207.211/0001-47
          </div>
        </div>
        <div style={{ fontSize: '11px', color: '#334155' }}>
          Kernel:{' '}
          <span style={{ color: kernelConfigured ? '#4ade80' : '#f87171', fontWeight: 700 }}>
            {kernelConfigured ? 'CONFIGURADO' : 'STUB (demo)'}
          </span>
        </div>
      </div>

      {/* ── Título ── */}
      <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#f1f5f9', marginBottom: '6px' }}>
        RAG Demo — Kernel Govevia
      </h1>
      <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '28px' }}>
        Fluxo completo: UPLOAD → ingestão → SEARCH → chunks + trilha de auditoria append-only.
      </p>

      {/* ── Nav ── */}
      <div style={{ marginBottom: '24px', fontSize: '13px', color: '#64748b' }}>
        <a href="/admin"                   style={{ color: '#64748b', marginRight: '16px', textDecoration: 'none' }}>← Dashboard</a>
        <a href="/admin/rules"             style={{ color: '#64748b', marginRight: '16px', textDecoration: 'none' }}>Regras</a>
        <a href="/admin/control-plane"     style={{ color: '#64748b', marginRight: '16px', textDecoration: 'none' }}>Control Plane</a>
        <a href="/admin/ops"               style={{ color: '#64748b',                       textDecoration: 'none' }}>Ops Cockpit</a>
      </div>

      {/* ── Mapeamento UC → Regras Institucionais ── */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px', fontWeight: 600 }}>
          Casos de Uso Exercidos Neste Demo
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {UC_MAP.map(uc => (
            <div key={uc.ucId} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <span style={{ fontWeight: 700, color: uc.color, fontSize: '14px' }}>{uc.ucId}</span>
                <span style={{ color: '#e2e8f0', fontSize: '13px' }}>{uc.ucName}</span>
                <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#475569' }}>Tab: {uc.tab}</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {uc.ruleIds.map((rid, i) => (
                  <span key={rid} title={uc.ruleNames[i]} style={{ fontSize: '11px', fontFamily: 'monospace', background: '#0f172a', border: '1px solid #334155', padding: '2px 8px', borderRadius: '4px', color: '#94a3b8', cursor: 'help' }}>
                    {rid}
                  </span>
                ))}
              </div>
              <div style={{ marginTop: '8px', fontSize: '11px', color: '#475569', fontStyle: 'italic' }}>
                Evidência: hash_payload + evento SIMULATION → REGISTRY-OPS.ndjson
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Interface interativa (Client Component) ── */}
      <RagDemoClient />
    </div>
  )
}
