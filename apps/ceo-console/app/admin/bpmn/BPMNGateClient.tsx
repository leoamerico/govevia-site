'use client'
/**
 * BPMNGateClient — wrapper client-side que cheque o token de pré-aprovação
 * de exigências (sessionStorage) antes de renderizar o BPMNManager.
 *
 * Gate é INFORMATIVO (não bloqueia), mas deixa explícito o passo pendente.
 * Aprovação tem TTL de 2 horas.
 */
import { useEffect, useState } from 'react'
import BPMNManager from '@/components/bpmn/BPMNManager'
import { GateBanner } from '@/components/rules/GateBanner'

interface BPMNGateClientProps {
  initialProcessos: unknown[]
  normas: unknown[]
}

const TTL_MS = 2 * 60 * 60 * 1000 // 2 horas

function checkApprovalToken(): boolean {
  try {
    const raw = sessionStorage.getItem('exigencias_aprovadas')
    if (!raw) return false
    const decoded = atob(raw)
    const parts = decoded.split(':')
    const ts = parseInt(parts[parts.length - 1], 10)
    return !isNaN(ts) && Date.now() - ts < TTL_MS
  } catch {
    return false
  }
}

const S = {
  badgeWrap: { marginBottom: '0.75rem' },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    background: '#052e16',
    border: '1px solid #166534',
    borderRadius: 6,
    padding: '0.3rem 0.75rem',
    fontSize: '0.78rem',
    color: '#4ade80',
    fontWeight: 700,
  },
}

export default function BPMNGateClient({ initialProcessos, normas }: BPMNGateClientProps) {
  const [approved, setApproved] = useState<boolean | null>(null) // null = loading
  const [ignored, setIgnored] = useState(false)

  useEffect(() => {
    setApproved(checkApprovalToken())
  }, [])

  // SSR / hydration guard
  if (approved === null) return null

  const showGate = !approved && !ignored

  return (
    <>
      {approved && (
        <div style={S.badgeWrap}>
          <span style={S.badge} data-testid="exigencias-badge">
            ⚖️ Exigências verificadas
          </span>
        </div>
      )}

      {showGate && (
        <GateBanner onIgnore={() => setIgnored(true)} />
      )}

      <BPMNManager
        initialProcessos={initialProcessos as Parameters<typeof BPMNManager>[0]['initialProcessos']}
        normas={normas as Parameters<typeof BPMNManager>[0]['normas']}
      />
    </>
  )
}
