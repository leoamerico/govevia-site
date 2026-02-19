'use client'
/**
 * GateBanner — aviso informativo (não-bloqueante) antes do cadastro
 * de processos no BPMN quando a análise de exigências está pendente.
 */
import { useRouter } from 'next/navigation'

interface GateBannerProps {
  onIgnore: () => void
}

const S = {
  wrap: {
    background: '#0f172a',
    border: '1px solid #0059B3',
    borderRadius: 8,
    padding: '1.5rem 1.75rem',
    marginBottom: '1.5rem',
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontSize: '1rem',
    fontWeight: 700,
    color: '#f8fafc',
    marginBottom: '0.6rem',
  },
  body: {
    fontSize: '0.875rem',
    color: '#94a3b8',
    lineHeight: 1.65,
    marginBottom: '1.25rem',
  },
  actions: { display: 'flex', gap: 12, flexWrap: 'wrap' as const },
  btnPrimary: {
    background: '#0059B3',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    padding: '0.5rem 1.25rem',
    fontWeight: 700,
    cursor: 'pointer',
    fontSize: '0.875rem',
  },
  btnSecondary: {
    background: 'transparent',
    color: '#64748b',
    border: '1px solid #334155',
    borderRadius: 6,
    padding: '0.5rem 1.25rem',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '0.875rem',
  },
}

export function GateBanner({ onIgnore }: GateBannerProps) {
  const router = useRouter()

  return (
    <div style={S.wrap} data-testid="gate-banner">
      <div style={S.title}>
        <span>⚖️</span>
        <span>Análise de exigências pendente</span>
      </div>
      <div style={S.body}>
        Antes de cadastrar um processo, o fiscal deve revisar e confirmar as
        exigências normativas aplicáveis. A análise garante que o processo atende
        às regras institucionais (RN01–RN05) antes de ser registrado.
        <br />
        <span style={{ color: '#475569', fontSize: '0.78rem' }}>
          A aprovação tem validade de 2 horas após confirmação na aba Exigências.
        </span>
      </div>
      <div style={S.actions}>
        <button
          style={S.btnPrimary}
          onClick={() => router.push('/admin/rules')}
        >
          Ir para Análise de Exigências →
        </button>
        <button style={S.btnSecondary} onClick={onIgnore}>
          Ignorar e continuar
        </button>
      </div>
    </div>
  )
}
