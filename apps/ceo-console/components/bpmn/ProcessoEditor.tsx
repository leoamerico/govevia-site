'use client'

import { useState, useEffect } from 'react'
import { tokens as s } from '@/components/ui'
import {
  type No, type NormaLegal, type ProcessoBPMN, type TipoNo, type StatusProcesso,
  TIPO_NO_LABELS, TIPO_NO_ICONES, TIPO_NO_CORES, STATUS_LABELS,
  noVazio, listToLines, linesToList,
} from './bpmn.types'
import { NoForm } from './NoForm'
import { NoCard } from './NoCard'
import { StatusBadge } from './NoForm'

// ─── ProcessoEditor ───────────────────────────────────────────────────────────

export function ProcessoEditor({
  processo,
  normas,
  onSave,
  onDelete,
  onBack,
  saving,
}: {
  processo: ProcessoBPMN
  normas: NormaLegal[]
  onSave: (p: ProcessoBPMN) => void
  onDelete: () => void
  onBack: () => void
  saving: boolean
}) {
  const [form, setForm] = useState<ProcessoBPMN>({ ...processo, nos: processo.nos.map(n => ({ ...n })) })
  const [editingNo, setEditingNo] = useState<No | null>(null)
  const [addAfterIdx, setAddAfterIdx] = useState<number | null>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (editingNo) { setEditingNo(null); return }
      if (addAfterIdx !== null) setAddAfterIdx(null)
    }
    if (editingNo || addAfterIdx !== null) { document.addEventListener('keydown', handler) }
    return () => document.removeEventListener('keydown', handler)
  }, [editingNo, addAfterIdx])

  const setField = <K extends keyof ProcessoBPMN>(k: K, v: ProcessoBPMN[K]) =>
    setForm(f => ({ ...f, [k]: v }))

  const updateNo = (updated: No) =>
    setForm(f => ({ ...f, nos: f.nos.map(n => n.id === updated.id ? updated : n) }))

  const removeNo = (id: string) =>
    setForm(f => ({ ...f, nos: f.nos.filter(n => n.id !== id) }))

  const moveNo = (idx: number, dir: -1 | 1) =>
    setForm(f => {
      const nos = [...f.nos]
      const target = idx + dir
      if (target < 0 || target >= nos.length) return f
      ;[nos[idx], nos[target]] = [nos[target], nos[idx]]
      return { ...f, nos: nos.map((n, i) => ({ ...n, ordem: i })) }
    })

  const insertNoAfter = (idx: number, tipo: TipoNo) =>
    setForm(f => {
      const nos = [...f.nos]
      const newNo = noVazio(tipo, idx + 1)
      nos.splice(idx + 1, 0, newNo)
      setAddAfterIdx(null)
      setEditingNo(newNo)
      return { ...f, nos: nos.map((n, i) => ({ ...n, ordem: i })) }
    })

  const totalPrazo = form.nos.reduce((a, n) => a + (n.prazo_dias_uteis || 0), 0)

  return (
    <div style={s.page}>
      {/* Barra de ação */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <button style={s.btnSecondary} onClick={onBack} type="button">← Voltar à lista</button>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button style={s.btnDanger} onClick={onDelete} type="button" disabled={saving}>Excluir processo</button>
          <button style={{ ...s.btnPrimary, opacity: saving ? 0.6 : 1 }} onClick={() => onSave(form)} disabled={saving} type="button">
            {saving ? 'Salvando…' : 'Salvar processo'}
          </button>
        </div>
      </div>

      {/* Cabeçalho do processo */}
      <div style={{ ...s.card, borderLeft: '4px solid #0059B3' }}>
        <span style={s.sectionLabel}>Identificação do processo</span>
        <div style={s.grid2}>
          <div style={s.field}>
            <label style={s.label}>Nome do processo *</label>
            <input style={s.input} value={form.nome} onChange={e => setField('nome', e.target.value)} placeholder="Ex: Licença de funcionamento — aprovação inicial" />
          </div>
          <div style={s.field}>
            <label style={s.label}>Área / Secretaria responsável</label>
            <input style={s.input} value={form.area_responsavel} onChange={e => setField('area_responsavel', e.target.value)} placeholder="Ex: Secretaria de Obras, Jurídico…" />
          </div>
        </div>
        <div style={s.field}>
          <label style={s.label}>Descrição do processo</label>
          <textarea style={s.textarea} rows={2} value={form.descricao} onChange={e => setField('descricao', e.target.value)} placeholder="Explique o objetivo, quem é afetado e qual o resultado esperado." />
        </div>
        <div style={s.grid3}>
          <div style={s.field}>
            <label style={s.label}>Status</label>
            <select style={s.select} value={form.status} onChange={e => setField('status', e.target.value as StatusProcesso)}>
              {(Object.entries(STATUS_LABELS) as [StatusProcesso, string][]).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          <div style={s.field}>
            <label style={s.label}>Versão</label>
            <input style={s.input} value={form.versao} onChange={e => setField('versao', e.target.value)} placeholder="1.0" />
          </div>
          <div style={s.field}>
            <label style={s.label}>Total acumulado de prazos</label>
            <input style={{ ...s.input, background: '#f8fafc', color: '#64748b' }} value={`${totalPrazo} dias úteis`} readOnly />
          </div>
        </div>

        <hr style={s.divider} />
        <span style={s.sectionLabel}>Base legal e participantes</span>
        <div style={s.grid2}>
          <div style={s.field}>
            <label style={s.label}>Base legal do processo (uma norma por linha)</label>
            <textarea style={s.textarea} rows={3}
              value={listToLines(form.base_legal)}
              onChange={e => setField('base_legal', linesToList(e.target.value))}
              placeholder="Ex:&#10;Lei Federal 9.784/99 — processo administrativo&#10;Lei Municipal 123/2020&#10;Decreto 456/2021" />
          </div>
          <div style={s.field}>
            <label style={s.label}>Atores e papéis envolvidos (um por linha)</label>
            <textarea style={s.textarea} rows={3}
              value={listToLines(form.atores)}
              onChange={e => setField('atores', linesToList(e.target.value))}
              placeholder="Ex:&#10;Requerente&#10;Servidor de protocolo&#10;Técnico de análise&#10;Gestor&#10;Departamento Jurídico" />
          </div>
        </div>
        <div style={s.field}>
          <label style={s.label}>Anotações gerais sobre o processo</label>
          <textarea style={s.textarea} rows={2} value={form.observacoes} onChange={e => setField('observacoes', e.target.value)}
            placeholder="Histórico de versões, escopo, exceções, integrações com outros processos…" />
        </div>
      </div>

      {/* Fluxo de etapas */}
      <div style={{ marginTop: '2rem', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e293b' }}>
          Fluxo do processo — {form.nos.length} etapa{form.nos.length !== 1 ? 's' : ''}
        </span>
        <button style={s.btnGhost} onClick={() => insertNoAfter(form.nos.length - 1, 'tarefa_humana')} type="button">
          + Adicionar etapa no final
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0.5rem 0' }}>
        {form.nos.map((no, idx) => (
          <NoCard
            key={no.id}
            no={no}
            idx={idx}
            total={form.nos.length}
            onEdit={() => setEditingNo(no)}
            onDelete={() => removeNo(no.id)}
            onMoveUp={() => moveNo(idx, -1)}
            onMoveDown={() => moveNo(idx, 1)}
            onAddAfter={() => setAddAfterIdx(idx)}
          />
        ))}
      </div>

      {/* Modal: selecionar tipo para nova etapa */}
      {addAfterIdx !== null && (
        <div role="dialog" aria-modal="true" style={s.overlay} onClick={e => { if (e.target === e.currentTarget) setAddAfterIdx(null) }}>
          <div style={{ ...s.modal, maxWidth: 520 }}>
            <h2 style={s.modalTitle}>Que tipo de etapa quer inserir?</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
              {(Object.entries(TIPO_NO_LABELS) as [TipoNo, string][]).map(([tipo, label]) => {
                const cor = TIPO_NO_CORES[tipo]
                return (
                  <button
                    key={tipo}
                    style={{ background: cor.bg, border: `1.5px solid ${cor.border}`, borderRadius: 8, padding: '0.7rem 0.9rem', cursor: 'pointer', textAlign: 'left' as const }}
                    onClick={() => insertNoAfter(addAfterIdx, tipo)}
                    type="button"
                  >
                    <span style={{ fontSize: '1rem', marginRight: '0.4rem' }}>{TIPO_NO_ICONES[tipo]}</span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#1e293b' }}>{label}</span>
                  </button>
                )
              })}
            </div>
            <div style={{ marginTop: '1rem', textAlign: 'right' as const }}>
              <button style={s.btnSecondary} onClick={() => setAddAfterIdx(null)} type="button">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: editar nó */}
      {editingNo && (
        <div role="dialog" aria-modal="true" style={s.overlay} onClick={e => { if (e.target === e.currentTarget) setEditingNo(null) }}>
          <div style={s.modal}>
            <h2 style={s.modalTitle}>
              {TIPO_NO_ICONES[editingNo.tipo]} Editar etapa: {editingNo.nome || TIPO_NO_LABELS[editingNo.tipo]}
            </h2>
            <NoForm
              no={editingNo}
              atores={form.atores}
              todos_nos={form.nos}
              normas={normas}
              onChange={updated => updateNo(updated)}
              onClose={() => setEditingNo(null)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// ─── ProcessoCard ──────────────────────────────────────────────────────────────

export function ProcessoCard({ processo, onEdit }: { processo: ProcessoBPMN; onEdit: () => void }) {
  const totalPrazo = processo.nos.reduce((a, n) => a + (n.prazo_dias_uteis || 0), 0)
  return (
    <div style={s.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
            <span style={s.idBadge}>{processo.id}</span>
            <StatusBadge status={processo.status} />
            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>v{processo.versao}</span>
          </div>
          <h3 style={{ margin: '0 0 0.3rem', fontSize: '1rem', fontWeight: 700, color: '#1e293b', fontFamily: 'Georgia, serif' }}>
            {processo.nome || <em style={{ color: '#94a3b8' }}>Sem nome</em>}
          </h3>
          {processo.descricao && (
            <p style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', color: '#475569', lineHeight: 1.5 }}>
              {processo.descricao.length > 140 ? processo.descricao.slice(0, 140) + '…' : processo.descricao}
            </p>
          )}
          <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.73rem', color: '#64748b' }}>
            {processo.area_responsavel && <span>🏛 {processo.area_responsavel}</span>}
            <span>📋 {processo.nos.length} etapa{processo.nos.length !== 1 ? 's' : ''}</span>
            {totalPrazo > 0 && <span>⏱ {totalPrazo} dias úteis acumulados</span>}
            {processo.atores.length > 0 && <span>👥 {processo.atores.length} ator{processo.atores.length !== 1 ? 'es' : ''}</span>}
            {processo.base_legal.length > 0 && <span>⚖ {processo.base_legal.length} norma{processo.base_legal.length !== 1 ? 's' : ''}</span>}
          </div>
        </div>
        <button style={{ ...s.btnPrimary, fontSize: '0.78rem', padding: '0.45rem 0.85rem', flexShrink: 0 }} onClick={onEdit} type="button">
          Abrir editor
        </button>
      </div>
    </div>
  )
}
