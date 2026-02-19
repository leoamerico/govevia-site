'use client'
/**
 * ExigenciasChecker — Checklist de exigências normativas por caso de uso.
 *
 * O fiscal marca cada exigência como confirmada, clica em "Confirmar Análise",
 * chama a Server Action verificarExigencias (motor determinístico, sem fetch)
 * e armazena o token de aprovação em sessionStorage para liberar o gate do BPMN.
 */
import { useState, useTransition } from 'react'
import { verificarExigencias } from '@/app/admin/rules/actions'

// ─── Dados estáticos derivados de institutional-rules.yaml ───────────────────

interface RuleCatalogEntry {
  id: string
  name: string
  legal_reference: string
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  applies_to: string[]
}

const RULE_CATALOGUE: RuleCatalogEntry[] = [
  {
    id: 'RN01',
    name: 'Legalidade Estrita',
    legal_reference: 'CF/88, Art. 37',
    severity: 'CRITICAL',
    applies_to: ['UC01', 'UC02', 'UC03', 'UC04', 'UC05'],
  },
  {
    id: 'RN02',
    name: 'Responsabilidade Solidária (Controle Externo)',
    legal_reference: 'CF/88, Art. 74 §1º',
    severity: 'HIGH',
    applies_to: ['UC04'],
  },
  {
    id: 'RN03',
    name: 'Segregação de Funções',
    legal_reference: 'Princípios de controle interno',
    severity: 'HIGH',
    applies_to: ['UC03', 'UC04'],
  },
  {
    id: 'RN04',
    name: 'Classificação de Sigilo (LAI) + Proteção de Dados (LGPD)',
    legal_reference: 'Lei 12.527/2011 + LGPD (Lei 13.709/2018)',
    severity: 'CRITICAL',
    applies_to: ['UC05'],
  },
  {
    id: 'RN05',
    name: 'Limite de Gasto com Pessoal (LRF)',
    legal_reference: 'LC 101/2000 (LRF)',
    severity: 'MEDIUM',
    applies_to: ['UC03'],
  },
]

/** Exigência operacional em linguagem de campo — tradução do constraint_summary */
const OPERATIONAL_LABEL: Record<string, string> = {
  RN01: 'Confirme que a base normativa está identificada e vinculada ao ato',
  RN02: 'Se houver irregularidade, confirme que o Controle Externo foi notificado',
  RN03: 'Confirme que o responsável pelo registro é diferente do auditor',
  RN04: 'Se houver dados pessoais, confirme que os campos sensíveis estão mascarados',
  RN05: 'Se o tipo de gasto for PESSOAL, confirme que o valor está abaixo de 60% da RCL',
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const SEV_COLOR: Record<string, string> = {
  CRITICAL: '#EF4444',
  HIGH: '#F97316',
  MEDIUM: '#F59E0B',
  LOW: '#94a3b8',
}

const S = {
  empty: { fontSize: '0.875rem', color: '#64748b', padding: '1rem 0' },
  ruleCard: (checked: boolean) => ({
    background: checked ? '#0d1f0f' : '#1e293b',
    border: `1px solid ${checked ? '#166534' : '#334155'}`,
    borderRadius: 8,
    padding: '0.875rem 1rem',
    marginBottom: '0.75rem',
    transition: 'background 0.2s, border-color 0.2s',
    cursor: 'pointer',
  }),
  ruleHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: '0.35rem',
  },
  checkbox: { marginTop: 2, width: 16, height: 16, cursor: 'pointer', accentColor: '#4ade80' },
  ruleTitle: { fontSize: '0.875rem', fontWeight: 700, color: '#f8fafc', flex: 1 },
  sevBadge: (sev: string) => ({
    background: SEV_COLOR[sev] + '22',
    color: SEV_COLOR[sev],
    border: `1px solid ${SEV_COLOR[sev]}55`,
    borderRadius: 4,
    padding: '0.1rem 0.45rem',
    fontSize: '0.65rem',
    fontWeight: 700,
    fontFamily: 'monospace',
    whiteSpace: 'nowrap' as const,
  }),
  operationalLabel: {
    fontSize: '0.8rem',
    color: '#cbd5e1',
    lineHeight: 1.55,
    paddingLeft: 26,
    marginBottom: '0.2rem',
  },
  legalRef: {
    fontSize: '0.7rem',
    color: '#475569',
    fontFamily: 'monospace',
    paddingLeft: 26,
  },
  actions: { marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' as const },
  btnConfirm: (disabled: boolean) => ({
    background: disabled ? '#1d4ed822' : '#0059B3',
    color: disabled ? '#475569' : '#fff',
    border: disabled ? '1px solid #334155' : 'none',
    borderRadius: 6,
    padding: '0.6rem 1.5rem',
    fontWeight: 700,
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: '0.875rem',
  }),
  approvedBanner: {
    background: '#052e16',
    border: '1px solid #166534',
    borderRadius: 8,
    padding: '1rem 1.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  approvedText: { fontSize: '0.875rem', color: '#4ade80', fontWeight: 700 },
  approvedSub: { fontSize: '0.78rem', color: '#166534', marginTop: '0.25rem' },
  errorText: { fontSize: '0.8rem', color: '#f87171', marginTop: '0.5rem' },
  progress: { fontSize: '0.75rem', color: '#64748b', marginLeft: 'auto' },
}

// ─── Props ───────────────────────────────────────────────────────────────────

export interface ExigenciasCheckerProps {
  useCaseId: string
  normaId?: string
  /** Regras ao vivo carregadas do YAML pelo RSC; usa catálogo estático como fallback */
  rules?: Array<{ id: string; name: string; legal_reference: string; severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'; applies_to_use_cases: string[] }>
  onApproved: (token: string) => void
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ExigenciasChecker({ useCaseId, normaId, rules: rulesProp, onApproved }: ExigenciasCheckerProps) {
  const catalogue: RuleCatalogEntry[] = rulesProp
    ? rulesProp.map((r) => ({ id: r.id, name: r.name, legal_reference: r.legal_reference, severity: r.severity, applies_to: r.applies_to_use_cases }))
    : RULE_CATALOGUE
  const applicableRules = catalogue.filter((r) => r.applies_to.includes(useCaseId))
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [approved, setApproved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  if (applicableRules.length === 0) {
    return (
      <div style={S.empty}>
        Nenhuma regra mapeada para o caso de uso <strong>{useCaseId}</strong>.
      </div>
    )
  }

  const allChecked = applicableRules.every((r) => checked[r.id])
  const checkedCount = applicableRules.filter((r) => checked[r.id]).length

  function toggle(ruleId: string) {
    if (approved) return
    setChecked((prev) => ({ ...prev, [ruleId]: !prev[ruleId] }))
  }

  function handleConfirm() {
    if (!allChecked || isPending) return
    setError(null)
    startTransition(async () => {
      try {
        const result = await verificarExigencias(useCaseId, {
          base_normativa_id: normaId ?? 'PRE_VERIFICACAO',
          actor_user_id: 'FISCAL_USER',
        })
        if (result.result === 'FAIL') {
          setError('Avaliação não passou. Verifique as exigências e tente novamente.')
          return
        }
        const token = btoa(`${useCaseId}:${Date.now()}`)
        try {
          sessionStorage.setItem('exigencias_aprovadas', token)
        } catch {
          // partitioned storage — ignore
        }
        setApproved(true)
        onApproved(token)
      } catch (err) {
        setError(`Erro ao verificar: ${err instanceof Error ? err.message : String(err)}`)
      }
    })
  }

  if (approved) {
    return (
      <div style={S.approvedBanner} data-testid="exigencias-approved">
        <span style={{ fontSize: '1.5rem' }}>✅</span>
        <div>
          <div style={S.approvedText}>Análise concluída — pode prosseguir para o cadastro de processo</div>
          <div style={S.approvedSub}>
            Token registrado em sessionStorage · validade 2h ·{' '}
            <a href="/admin/bpmn" style={{ color: '#4ade80' }}>Ir para BPMN →</a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div data-testid="exigencias-checker">
      {applicableRules.map((rule) => (
        <div
          key={rule.id}
          style={S.ruleCard(!!checked[rule.id])}
          onClick={() => toggle(rule.id)}
        >
          <div style={S.ruleHeader}>
            <input
              type="checkbox"
              style={S.checkbox}
              checked={!!checked[rule.id]}
              onChange={() => toggle(rule.id)}
              onClick={(e) => e.stopPropagation()}
              aria-label={`Confirmar exigência ${rule.id}`}
            />
            <span style={S.ruleTitle}>{rule.id} — {rule.name}</span>
            <span style={S.sevBadge(rule.severity)}>{rule.severity}</span>
          </div>
          <div style={S.operationalLabel}>{OPERATIONAL_LABEL[rule.id]}</div>
          <div style={S.legalRef}>{rule.legal_reference}</div>
        </div>
      ))}

      <div style={S.actions}>
        <button
          style={S.btnConfirm(!allChecked || isPending)}
          disabled={!allChecked || isPending}
          onClick={handleConfirm}
          data-testid="confirmar-analise"
        >
          {isPending ? 'Avaliando...' : 'Confirmar Análise'}
        </button>
        <span style={S.progress}>
          {checkedCount}/{applicableRules.length} confirmadas
        </span>
      </div>

      {error && <div style={S.errorText}>⚠ {error}</div>}
    </div>
  )
}
