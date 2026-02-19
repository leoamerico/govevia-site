'use client'

import { tokens as s } from '@/components/ui'
import {
  type No,
  TIPO_NO_CORES, TIPO_NO_ICONES, TIPO_NO_LABELS,
  FIM_LABELS, COMUNICACAO_LABELS,
} from './bpmn.types'

export function NoCard({ no, idx, total, onEdit, onDelete, onMoveUp, onMoveDown, onAddAfter }: {
  no: No
  idx: number
  total: number
  onEdit: () => void
  onDelete: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onAddAfter: () => void
}) {
  const cor = TIPO_NO_CORES[no.tipo]
  const icone = TIPO_NO_ICONES[no.tipo]
  const label = TIPO_NO_LABELS[no.tipo]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Seta de entrada */}
      {idx > 0 && (
        <div style={{ width: 2, height: 28, background: '#cbd5e1', position: 'relative' }}>
          <div style={{ position: 'absolute', bottom: -6, left: -4, width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '7px solid #94a3b8' }} />
        </div>
      )}

      {/* Nó */}
      <div style={{ width: '100%', maxWidth: 700, background: cor.bg, border: `2px solid ${cor.border}`, borderRadius: 10, padding: '0.85rem 1.1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
          <div style={{ flex: 1 }}>
            {/* Tipo + badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
              <span style={{ background: cor.badge, color: cor.badgeText, borderRadius: 4, padding: '0.1rem 0.55rem', fontSize: '0.7rem', fontWeight: 700 }}>
                {icone} {label}
              </span>
              {no.prazo_dias_uteis > 0 && (
                <span style={{ fontSize: '0.7rem', color: '#ea580c', background: '#fff7ed', border: '1px solid #fdba74', borderRadius: 4, padding: '0.1rem 0.45rem', fontWeight: 600 }}>
                  ⏱ {no.prazo_dias_uteis}d úteis
                </span>
              )}
              {no.tipo_fim && (
                <span style={{ fontSize: '0.7rem', color: '#166534', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 4, padding: '0.1rem 0.45rem', fontWeight: 600 }}>
                  {FIM_LABELS[no.tipo_fim]}
                </span>
              )}
            </div>

            {/* Nome */}
            <p style={{ margin: '0 0 0.2rem', fontWeight: 700, fontSize: '0.92rem', color: '#1e293b', fontFamily: 'Georgia, serif' }}>
              {no.nome || <em style={{ color: '#94a3b8', fontFamily: 'inherit', fontWeight: 400 }}>Etapa sem nome — clique em Editar</em>}
            </p>

            {/* Resumo */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.73rem', color: '#64748b', marginTop: '0.2rem' }}>
              {no.ator && <span>👤 {no.ator}</span>}
              {no.base_normativa_id && (
                <span style={{ fontFamily: 'monospace', fontSize: '0.68rem', color: '#0059B3', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 3, padding: '0 0.35rem' }}>
                  ⚖ {no.base_normativa_id}
                </span>
              )}
              {!no.base_normativa_id && no.base_legal && <span>⚖ {no.base_legal.length > 55 ? no.base_legal.slice(0, 55) + '…' : no.base_legal}</span>}
              {no.comunicacao && <span>✉ {COMUNICACAO_LABELS[no.comunicacao.tipo]}</span>}
              {no.documentos_entrada.length > 0 && <span>📥 {no.documentos_entrada.length} doc. entrada</span>}
              {no.documentos_saida.length > 0 && <span>📤 {no.documentos_saida.length} doc. saída</span>}
              {no.decisao && <span>🔀 {no.decisao.opcoes.length} saídas</span>}
            </div>
          </div>

          {/* Controles */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: '0.3rem' }}>
              <button style={{ ...s.btnGhost, padding: '0.2rem 0.5rem', fontSize: '0.75rem' }} onClick={onMoveUp} disabled={idx === 0} type="button" title="Mover para cima">↑</button>
              <button style={{ ...s.btnGhost, padding: '0.2rem 0.5rem', fontSize: '0.75rem' }} onClick={onMoveDown} disabled={idx === total - 1} type="button" title="Mover para baixo">↓</button>
            </div>
            <button style={{ ...s.btnSecondary, fontSize: '0.73rem', padding: '0.3rem 0.6rem' }} onClick={onEdit} type="button">Editar</button>
            <button style={{ ...s.btnDanger, fontSize: '0.7rem', padding: '0.25rem 0.55rem' }} onClick={onDelete} type="button">Remover</button>
          </div>
        </div>
      </div>

      {/* Botão + adicionar depois */}
      <button
        style={{ margin: '4px 0', background: 'transparent', border: '1px dashed #94a3b8', borderRadius: 20, padding: '0.15rem 0.8rem', fontSize: '0.68rem', color: '#94a3b8', cursor: 'pointer' }}
        onClick={onAddAfter}
        type="button"
        title="Inserir etapa aqui"
      >
        + inserir etapa
      </button>
    </div>
  )
}
