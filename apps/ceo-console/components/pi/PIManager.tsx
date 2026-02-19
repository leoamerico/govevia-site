'use client'

import { useState, useCallback, useEffect } from 'react'
import { tokens as s, Toast } from '@/components/ui'

// ─── Tipos (espelho do route.ts) ──────────────────────────────────────────────

type TipoPI = 'software' | 'marca' | 'patente' | 'direito_autoral' | 'design_industrial' | 'segredo_industrial'
type StatusPI = 'documentando' | 'em_pedido' | 'em_exame' | 'registrado' | 'expirado' | 'arquivado'

interface PITitular {
  tipo: 'pessoa_fisica' | 'pessoa_juridica'
  nome: string
  documento: string
  qualificacao?: string
}

interface PIRegistro {
  id: string
  tipo: TipoPI
  titulo: string
  descricao: string
  titular: PITitular
  data_criacao: string
  orgao: string
  numero_pedido: string
  numero_registro: string
  classe: string
  status: StatusPI
  observacoes: string
  created_at: string
  updated_at: string
}

// ─── Constantes de UI ─────────────────────────────────────────────────────────

const TIPO_LABELS: Record<TipoPI, string> = {
  software:           'Programa de Computador (Software)',
  marca:              'Marca — nome, logo ou slogan',
  patente:            'Patente de Invenção',
  direito_autoral:    'Direito Autoral — obra intelectual',
  design_industrial:  'Desenho Industrial',
  segredo_industrial: 'Segredo de Negócio',
}

const STATUS_LABELS: Record<StatusPI, string> = {
  documentando: 'Reunindo documentação',
  em_pedido:    'Pedido protocolado no órgão',
  em_exame:     'Em análise pelo órgão',
  registrado:   'Registrado e protegido ✓',
  expirado:     'Proteção expirada',
  arquivado:    'Arquivado / Abandonado',
}

const STATUS_COLORS: Record<StatusPI, { bg: string; color: string; border: string }> = {
  documentando: { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' },
  em_pedido:    { bg: '#fffbeb', color: '#92400e', border: '#fde68a' },
  em_exame:     { bg: '#eff6ff', color: '#1e40af', border: '#bfdbfe' },
  registrado:   { bg: '#f0fdf4', color: '#166534', border: '#bbf7d0' },
  expirado:     { bg: '#fff1f2', color: '#9f1239', border: '#fecdd3' },
  arquivado:    { bg: '#f8fafc', color: '#94a3b8', border: '#e2e8f0' },
}

const TITULAR_PADRAO: PITitular = {
  tipo: 'pessoa_fisica',
  nome: 'Leonardo Américo',
  documento: '',
  qualificacao: 'Desenvolvedor e criador da obra / invenção',
}

const EMPTY_FORM: Omit<PIRegistro, 'id' | 'created_at' | 'updated_at'> = {
  tipo: 'software',
  titulo: '',
  descricao: '',
  titular: { ...TITULAR_PADRAO },
  data_criacao: new Date().toISOString().slice(0, 10),
  orgao: 'INPI',
  numero_pedido: '',
  numero_registro: '',
  classe: '',
  status: 'documentando',
  observacoes: '',
}



// ─── Status Badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: StatusPI }) {
  const c = STATUS_COLORS[status]
  return (
    <span style={{
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
      borderRadius: 20, padding: '0.15rem 0.6rem', fontSize: '0.72rem', fontWeight: 600,
    }}>
      {STATUS_LABELS[status]}
    </span>
  )
}

// ─── Formulário ────────────────────────────────────────────────────────────────

type FormData = Omit<PIRegistro, 'id' | 'created_at' | 'updated_at'>

function PIForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial: FormData
  onSave: (data: FormData) => void
  onCancel: () => void
  saving: boolean
}) {
  const [form, setForm] = useState<FormData>(initial)

  const set = <K extends keyof FormData>(k: K, v: FormData[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const setTitular = <K extends keyof PITitular>(k: K, v: PITitular[K]) =>
    setForm((f) => ({ ...f, titular: { ...f.titular, [k]: v } }))

  return (
    <div>
      {/* Identificação */}
      <p style={s.sectionLabel}>O que está sendo registrado?</p>
      <div style={s.field}>
        <label style={s.label}>Nome da criação *</label>
        <input style={s.input} value={form.titulo} onChange={(e) => set('titulo', e.target.value)} placeholder="Ex: Govevia, módulo de auditoria, logotipo Env Neo…" />
      </div>
      <div style={s.grid2}>
        <div style={s.field}>
          <label style={s.label}>Qual é o tipo desta propriedade intelectual? *</label>
          <select style={s.select} value={form.tipo} onChange={(e) => set('tipo', e.target.value as TipoPI)}>
            {(Object.entries(TIPO_LABELS) as [TipoPI, string][]).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
        <div style={s.field}>
          <label style={s.label}>Quando foi criada?</label>
          <input style={s.input} type="date" value={form.data_criacao} onChange={(e) => set('data_criacao', e.target.value)} />
        </div>
      </div>
      <div style={s.field}>
        <label style={s.label}>Descrição da criação</label>
        <textarea style={s.textarea} rows={3} value={form.descricao} onChange={(e) => set('descricao', e.target.value)} placeholder="Descreva o que foi criado, sua finalidade e o que o distingue de outras obras ou produtos." />
      </div>

      <hr style={s.divider} />

      {/* Titular */}
      <p style={s.sectionLabel}>Quem é o titular desta criação?</p>
      <div style={s.grid2}>
        <div style={s.field}>
          <label style={s.label}>O titular é uma pessoa física ou empresa?</label>
          <select style={s.select} value={form.titular.tipo} onChange={(e) => setTitular('tipo', e.target.value as 'pessoa_fisica' | 'pessoa_juridica')}>
            <option value="pessoa_fisica">Pessoa física (CPF)</option>
            <option value="pessoa_juridica">Empresa / Pessoa jurídica (CNPJ)</option>
          </select>
        </div>
        <div style={s.field}>
          <label style={s.label}>Nome completo do titular</label>
          <input style={s.input} value={form.titular.nome} onChange={(e) => setTitular('nome', e.target.value)} placeholder="Nome exatamente como consta no documento" />
        </div>
      </div>
      <div style={s.grid2}>
        <div style={s.field}>
          <label style={s.label}>{form.titular.tipo === 'pessoa_fisica' ? 'CPF do titular' : 'CNPJ da empresa'}</label>
          <input style={s.input} value={form.titular.documento} onChange={(e) => setTitular('documento', e.target.value)} placeholder={form.titular.tipo === 'pessoa_fisica' ? '000.000.000-00' : '00.000.000/0001-00'} />
        </div>
        <div style={s.field}>
          <label style={s.label}>Papel do titular nesta criação</label>
          <input style={s.input} value={form.titular.qualificacao ?? ''} onChange={(e) => setTitular('qualificacao', e.target.value)} placeholder="Ex: desenvolvedor, inventor, autor da obra…" />
        </div>
      </div>

      <hr style={s.divider} />

      {/* Registro */}
      <p style={s.sectionLabel}>Situação junto ao órgão competente</p>
      <div style={s.grid2}>
        <div style={s.field}>
          <label style={s.label}>Órgão responsável pelo registro</label>
          <input style={s.input} value={form.orgao} onChange={(e) => set('orgao', e.target.value)} placeholder="Ex: INPI, EDA, Receita Federal…" />
        </div>
        <div style={s.field}>
          <label style={s.label}>Em que fase está o processo?</label>
          <select style={s.select} value={form.status} onChange={(e) => set('status', e.target.value as StatusPI)}>
            {(Object.entries(STATUS_LABELS) as [StatusPI, string][]).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
      </div>
      <div style={s.grid2}>
        <div style={s.field}>
          <label style={s.label}>Número do pedido (protocolo)</label>
          <input style={s.input} value={form.numero_pedido} onChange={(e) => set('numero_pedido', e.target.value)} placeholder="Número gerado pelo órgão ao receber o pedido" />
        </div>
        <div style={s.field}>
          <label style={s.label}>Número de registro oficial</label>
          <input style={s.input} value={form.numero_registro} onChange={(e) => set('numero_registro', e.target.value)} placeholder="Preenchido após a concessão do registro" />
        </div>
      </div>
      <div style={s.field}>
        <label style={s.label}>Classificação da criação</label>
        <input style={s.input} value={form.classe} onChange={(e) => set('classe', e.target.value)} placeholder="Ex: Classe 42 Nice (marcas), CPC G06 (software/patentes)" />
      </div>

      <hr style={s.divider} />

      {/* Observações */}
      <div style={s.field}>
        <label style={s.label}>Anotações e próximos passos</label>
        <textarea style={s.textarea} rows={3} value={form.observacoes} onChange={(e) => set('observacoes', e.target.value)} placeholder="Ex: advogado responsável, histórico de despachos, prazos importantes, custos envolvidos…" />
      </div>

      {/* Ações */}
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
        <button style={s.btnSecondary} type="button" onClick={onCancel} disabled={saving}>
          Voltar sem salvar
        </button>
        <button
          style={{ ...s.btnPrimary, opacity: saving ? 0.6 : 1 }}
          type="button"
          onClick={() => onSave(form)}
          disabled={saving || !form.titulo.trim()}
        >
          {saving ? 'Salvando…' : 'Salvar'}
        </button>
      </div>
    </div>
  )
}

// ─── Card de Registro ──────────────────────────────────────────────────────────

function RegistroCard({
  registro,
  onEdit,
  onDelete,
}: {
  registro: PIRegistro
  onEdit: (r: PIRegistro) => void
  onDelete: (r: PIRegistro) => void
}) {
  return (
    <div style={s.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.35rem' }}>
            <span style={s.idBadge}>{registro.id}</span>
            <StatusBadge status={registro.status} />
            <span style={{
              fontSize: '0.7rem', color: '#64748b', background: '#f8fafc',
              border: '1px solid #e2e8f0', borderRadius: 4, padding: '0.1rem 0.45rem',
            }}>
              {TIPO_LABELS[registro.tipo]}
            </span>
          </div>
          <h3 style={{ margin: '0 0 0.3rem', fontSize: '1rem', fontWeight: 700, color: '#1e293b', fontFamily: 'Georgia, serif' }}>
            {registro.titulo || <em style={{ color: '#94a3b8' }}>Sem título</em>}
          </h3>
          {registro.descricao && (
            <p style={{ margin: '0 0 0.6rem', fontSize: '0.81rem', color: '#475569', lineHeight: 1.5 }}>
              {registro.descricao.length > 160 ? registro.descricao.slice(0, 160) + '…' : registro.descricao}
            </p>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
            <span>
              <strong style={{ color: '#334155' }}>Titular:</strong>{' '}
              {registro.titular.nome}{' '}
              <span style={{ color: '#94a3b8' }}>({registro.titular.tipo === 'pessoa_fisica' ? 'pessoa física' : 'pessoa jurídica'})</span>
            </span>
            {registro.orgao && (
              <span><strong style={{ color: '#334155' }}>Órgão:</strong> {registro.orgao}</span>
            )}
            {registro.numero_pedido && (
              <span><strong style={{ color: '#334155' }}>Nº do pedido:</strong> <code>{registro.numero_pedido}</code></span>
            )}
            {registro.numero_registro && (
              <span><strong style={{ color: '#334155' }}>Nº de registro:</strong> <code>{registro.numero_registro}</code></span>
            )}
            {registro.data_criacao && (
              <span><strong style={{ color: '#334155' }}>Data de criação:</strong> {registro.data_criacao}</span>
            )}
          </div>
        </div>

        {/* Ações */}
        <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
          <button style={s.btnSecondary} onClick={() => onEdit(registro)} type="button">
            Editar
          </button>
          <button style={s.btnDanger} onClick={() => onDelete(registro)} type="button">
            Remover
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Componente principal ──────────────────────────────────────────────────────

export default function PIManager({ initialRegistros }: { initialRegistros: PIRegistro[] }) {
  const [registros, setRegistros] = useState<PIRegistro[]>(initialRegistros)
  const [modal, setModal] = useState<
    | { mode: 'create' }
    | { mode: 'edit'; registro: PIRegistro }
    | { mode: 'delete'; registro: PIRegistro }
    | null
  >(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setModal(null) }
    if (modal) { document.addEventListener('keydown', handler) }
    return () => document.removeEventListener('keydown', handler)
  }, [modal])

  const refresh = useCallback(async () => {
    const res = await fetch('/api/admin/pi', { cache: 'no-store' })
    if (res.ok) setRegistros(await res.json() as PIRegistro[])
  }, [])

  // Salvar novo
  const handleCreate = async (data: FormData) => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/pi', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error()
      await refresh()
      setModal(null)
      showToast('Criação registrada com sucesso!')
    } catch {
      showToast('Não foi possível salvar o registro. Tente novamente.', 'err')
    } finally {
      setSaving(false)
    }
  }

  // Salvar edição
  const handleUpdate = async (data: FormData) => {
    if (modal?.mode !== 'edit') return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/pi', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: modal.registro.id, ...data }),
      })
      if (!res.ok) throw new Error()
      await refresh()
      setModal(null)
      showToast('Alterações salvas com sucesso!')
    } catch {
      showToast('Não foi possível salvar as alterações. Tente novamente.', 'err')
    } finally {
      setSaving(false)
    }
  }

  // Excluir
  const handleDelete = async () => {
    if (modal?.mode !== 'delete') return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/pi', {
        method: 'DELETE',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: modal.registro.id }),
      })
      if (!res.ok) throw new Error()
      await refresh()
      setModal(null)
      showToast('Registro removido.')
    } catch {
      showToast('Não foi possível remover o registro. Tente novamente.', 'err')
    } finally {
      setSaving(false)
    }
  }

  // ─── Filtro ────────────────────────────────────────────────────────────────
  const [filterStatus, setFilterStatus] = useState<StatusPI | 'todos'>('todos')
  const [filterTipo, setFilterTipo] = useState<TipoPI | 'todos'>('todos')

  const filtered = registros.filter((r) =>
    (filterStatus === 'todos' || r.status === filterStatus) &&
    (filterTipo === 'todos' || r.tipo === filterTipo)
  )

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Propriedade Intelectual</h1>
          <p style={s.subtitle}>
            Registre e acompanhe as criações intelectuais da empresa — software, marcas, patentes, direitos autorais e segredos de negócio.
          </p>
        </div>
        <button style={s.btnPrimary} onClick={() => setModal({ mode: 'create' })}>
          + Registrar nova criação
        </button>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#cbd5e1', fontWeight: 600 }}>Situação:</span>
          <select style={{ ...s.select, width: 'auto' }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as StatusPI | 'todos')}>
            <option value="todos">Todas as situações</option>
            {(Object.entries(STATUS_LABELS) as [StatusPI, string][]).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#cbd5e1', fontWeight: 600 }}>Tipo:</span>
          <select style={{ ...s.select, width: 'auto' }} value={filterTipo} onChange={(e) => setFilterTipo(e.target.value as TipoPI | 'todos')}>
            <option value="todos">Todos os tipos</option>
            {(Object.entries(TIPO_LABELS) as [TipoPI, string][]).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
        <span style={{ fontSize: '0.75rem', color: '#94a3b8', alignSelf: 'center' }}>
          {filtered.length} de {registros.length} registro{registros.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div style={s.emptyState}>
          {registros.length === 0
            ? 'Nenhuma criação cadastrada ainda. Clique em "+ Registrar nova criação" para começar.'
            : 'Nenhum resultado para os filtros aplicados. Tente ampliar a busca.'}
        </div>
      ) : (
        filtered.map((r) => (
          <RegistroCard
            key={r.id}
            registro={r}
            onEdit={(reg) => setModal({ mode: 'edit', registro: reg })}
            onDelete={(reg) => setModal({ mode: 'delete', registro: reg })}
          />
        ))
      )}

      {/* Toast */}
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {/* Modal Criar / Editar */}
      {(modal?.mode === 'create' || modal?.mode === 'edit') && (
        <div role="dialog" aria-modal="true" style={s.overlay} onClick={(e) => { if (e.target === e.currentTarget) setModal(null) }}>
          <div style={s.modal}>
            <h2 style={s.modalTitle}>
              {modal.mode === 'create' ? 'Registrar nova criação intelectual' : `Editar registro ${(modal as { mode: 'edit'; registro: PIRegistro }).registro.id}`}
            </h2>
            <PIForm
              initial={
                modal.mode === 'edit'
                  ? (() => {
                      const { id: _id, created_at: _ca, updated_at: _ua, ...rest } = (modal as { mode: 'edit'; registro: PIRegistro }).registro
                      return rest
                    })()
                  : EMPTY_FORM
              }
              onSave={modal.mode === 'create' ? handleCreate : handleUpdate}
              onCancel={() => setModal(null)}
              saving={saving}
            />
          </div>
        </div>
      )}

      {/* Modal Confirmação Exclusão */}
      {modal?.mode === 'delete' && (
        <div role="dialog" aria-modal="true" style={s.overlay} onClick={(e) => { if (e.target === e.currentTarget) setModal(null) }}>
          <div style={{ ...s.modal, maxWidth: 440 }}>
            <h2 style={{ ...s.modalTitle, color: '#991b1b' }}>Remover este registro?</h2>
            <p style={{ fontSize: '0.88rem', color: '#475569', marginBottom: '0.6rem' }}>
              Você está prestes a remover o registro{' '}
              <strong>{(modal as { mode: 'delete'; registro: PIRegistro }).registro.id}</strong>
              {' '}(<em>{(modal as { mode: 'delete'; registro: PIRegistro }).registro.titulo}</em>).
            </p>
            <p style={{ fontSize: '0.81rem', color: '#64748b', marginBottom: '1.5rem' }}>
              Esta ação é permanente e não pode ser desfeita. Certifique-se de que os documentos físicos ou digitais desta criação estejam salvos em outro lugar antes de continuar.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button style={s.btnSecondary} onClick={() => setModal(null)} disabled={saving}>
                Não, manter o registro
              </button>
              <button
                style={{ ...s.btnDanger, padding: '0.5rem 1rem', fontSize: '0.82rem', opacity: saving ? 0.6 : 1 }}
                onClick={handleDelete}
                disabled={saving}
              >
                {saving ? 'Removendo…' : 'Sim, remover'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
