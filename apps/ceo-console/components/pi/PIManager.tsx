'use client'

import { useState, useCallback } from 'react'

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
  software: 'Programa de Computador',
  marca: 'Marca',
  patente: 'Patente de Invenção',
  direito_autoral: 'Direito Autoral',
  design_industrial: 'Desenho Industrial',
  segredo_industrial: 'Segredo Industrial',
}

const STATUS_LABELS: Record<StatusPI, string> = {
  documentando: 'Documentando',
  em_pedido: 'Pedido Protocolado',
  em_exame: 'Em Exame',
  registrado: 'Registrado ✓',
  expirado: 'Expirado',
  arquivado: 'Arquivado',
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

// ─── Estilos inline reutilizáveis ──────────────────────────────────────────────

const s = {
  page: {
    padding: '2rem',
    fontFamily: "'Open Sans', sans-serif",
    maxWidth: 1100,
    margin: '0 auto',
  } as React.CSSProperties,
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  } as React.CSSProperties,
  title: {
    fontSize: '1.4rem',
    fontWeight: 700,
    color: '#1e293b',
    fontFamily: 'Georgia, serif',
    margin: 0,
  } as React.CSSProperties,
  subtitle: {
    fontSize: '0.8rem',
    color: '#64748b',
    marginTop: '0.2rem',
  } as React.CSSProperties,
  btnPrimary: {
    background: '#0059B3',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    padding: '0.55rem 1.1rem',
    fontSize: '0.82rem',
    fontWeight: 600,
    cursor: 'pointer',
  } as React.CSSProperties,
  btnSecondary: {
    background: '#f1f5f9',
    color: '#334155',
    border: '1px solid #e2e8f0',
    borderRadius: 6,
    padding: '0.45rem 0.9rem',
    fontSize: '0.78rem',
    fontWeight: 500,
    cursor: 'pointer',
  } as React.CSSProperties,
  btnDanger: {
    background: '#fee2e2',
    color: '#991b1b',
    border: '1px solid #fca5a5',
    borderRadius: 6,
    padding: '0.35rem 0.7rem',
    fontSize: '0.75rem',
    fontWeight: 500,
    cursor: 'pointer',
  } as React.CSSProperties,
  card: {
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: 10,
    padding: '1.25rem 1.5rem',
    marginBottom: '0.75rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  } as React.CSSProperties,
  label: {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#475569',
    marginBottom: '0.3rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.04em',
  } as React.CSSProperties,
  input: {
    width: '100%',
    border: '1px solid #cbd5e1',
    borderRadius: 5,
    padding: '0.4rem 0.65rem',
    fontSize: '0.83rem',
    color: '#1e293b',
    background: '#fff',
    boxSizing: 'border-box' as const,
  } as React.CSSProperties,
  select: {
    width: '100%',
    border: '1px solid #cbd5e1',
    borderRadius: 5,
    padding: '0.4rem 0.65rem',
    fontSize: '0.83rem',
    color: '#1e293b',
    background: '#fff',
    boxSizing: 'border-box' as const,
  } as React.CSSProperties,
  textarea: {
    width: '100%',
    border: '1px solid #cbd5e1',
    borderRadius: 5,
    padding: '0.4rem 0.65rem',
    fontSize: '0.83rem',
    color: '#1e293b',
    background: '#fff',
    boxSizing: 'border-box' as const,
    resize: 'vertical' as const,
  } as React.CSSProperties,
  field: {
    marginBottom: '0.9rem',
  } as React.CSSProperties,
  grid2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.75rem',
  } as React.CSSProperties,
  divider: {
    border: 'none',
    borderTop: '1px solid #f1f5f9',
    margin: '1.25rem 0',
  } as React.CSSProperties,
  section: {
    fontSize: '0.7rem',
    fontWeight: 700,
    color: '#94a3b8',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    marginBottom: '0.75rem',
  } as React.CSSProperties,
  overlay: {
    position: 'fixed' as const,
    inset: 0,
    background: 'rgba(0,0,0,0.45)',
    zIndex: 50,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
  } as React.CSSProperties,
  modal: {
    background: '#fff',
    borderRadius: 12,
    width: '100%',
    maxWidth: 680,
    maxHeight: '90vh',
    overflowY: 'auto' as const,
    padding: '2rem',
    boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
  } as React.CSSProperties,
  modalTitle: {
    fontSize: '1.15rem',
    fontWeight: 700,
    color: '#1e293b',
    fontFamily: 'Georgia, serif',
    margin: '0 0 1.5rem 0',
  } as React.CSSProperties,
  emptyState: {
    textAlign: 'center' as const,
    padding: '3rem',
    color: '#94a3b8',
    fontSize: '0.9rem',
  } as React.CSSProperties,
  idBadge: {
    fontFamily: 'monospace',
    fontSize: '0.72rem',
    color: '#0059B3',
    background: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: 4,
    padding: '0.1rem 0.45rem',
    marginRight: '0.5rem',
  } as React.CSSProperties,
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
      <p style={s.section}>Identificação da Obra / Criação</p>
      <div style={s.field}>
        <label style={s.label}>Título *</label>
        <input style={s.input} value={form.titulo} onChange={(e) => set('titulo', e.target.value)} placeholder="Nome da criação, software, marca…" />
      </div>
      <div style={s.grid2}>
        <div style={s.field}>
          <label style={s.label}>Tipo de PI *</label>
          <select style={s.select} value={form.tipo} onChange={(e) => set('tipo', e.target.value as TipoPI)}>
            {(Object.entries(TIPO_LABELS) as [TipoPI, string][]).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
        <div style={s.field}>
          <label style={s.label}>Data de Criação</label>
          <input style={s.input} type="date" value={form.data_criacao} onChange={(e) => set('data_criacao', e.target.value)} />
        </div>
      </div>
      <div style={s.field}>
        <label style={s.label}>Descrição</label>
        <textarea style={s.textarea} rows={3} value={form.descricao} onChange={(e) => set('descricao', e.target.value)} placeholder="Descrição técnica e/ou resumo da criação…" />
      </div>

      <hr style={s.divider} />

      {/* Titular */}
      <p style={s.section}>Titular dos Direitos</p>
      <div style={s.grid2}>
        <div style={s.field}>
          <label style={s.label}>Tipo do Titular</label>
          <select style={s.select} value={form.titular.tipo} onChange={(e) => setTitular('tipo', e.target.value as 'pessoa_fisica' | 'pessoa_juridica')}>
            <option value="pessoa_fisica">Pessoa Física</option>
            <option value="pessoa_juridica">Pessoa Jurídica</option>
          </select>
        </div>
        <div style={s.field}>
          <label style={s.label}>Nome do Titular</label>
          <input style={s.input} value={form.titular.nome} onChange={(e) => setTitular('nome', e.target.value)} placeholder="Nome completo…" />
        </div>
      </div>
      <div style={s.grid2}>
        <div style={s.field}>
          <label style={s.label}>{form.titular.tipo === 'pessoa_fisica' ? 'CPF' : 'CNPJ'}</label>
          <input style={s.input} value={form.titular.documento} onChange={(e) => setTitular('documento', e.target.value)} placeholder={form.titular.tipo === 'pessoa_fisica' ? '000.000.000-00' : '00.000.000/0001-00'} />
        </div>
        <div style={s.field}>
          <label style={s.label}>Qualificação</label>
          <input style={s.input} value={form.titular.qualificacao ?? ''} onChange={(e) => setTitular('qualificacao', e.target.value)} placeholder="Desenvolvedor, inventor, autor…" />
        </div>
      </div>

      <hr style={s.divider} />

      {/* Registro */}
      <p style={s.section}>Processo de Registro</p>
      <div style={s.grid2}>
        <div style={s.field}>
          <label style={s.label}>Órgão</label>
          <input style={s.input} value={form.orgao} onChange={(e) => set('orgao', e.target.value)} placeholder="INPI, EDA, outro…" />
        </div>
        <div style={s.field}>
          <label style={s.label}>Status</label>
          <select style={s.select} value={form.status} onChange={(e) => set('status', e.target.value as StatusPI)}>
            {(Object.entries(STATUS_LABELS) as [StatusPI, string][]).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
      </div>
      <div style={s.grid2}>
        <div style={s.field}>
          <label style={s.label}>Nº do Pedido</label>
          <input style={s.input} value={form.numero_pedido} onChange={(e) => set('numero_pedido', e.target.value)} placeholder="Protocolo INPI…" />
        </div>
        <div style={s.field}>
          <label style={s.label}>Nº de Registro</label>
          <input style={s.input} value={form.numero_registro} onChange={(e) => set('numero_registro', e.target.value)} placeholder="Após concessão…" />
        </div>
      </div>
      <div style={s.field}>
        <label style={s.label}>Classe / Classificação</label>
        <input style={s.input} value={form.classe} onChange={(e) => set('classe', e.target.value)} placeholder="Nice (marcas), CPC/IPC (patentes), NCL (software)…" />
      </div>

      <hr style={s.divider} />

      {/* Observações */}
      <div style={s.field}>
        <label style={s.label}>Observações / Notas Internas</label>
        <textarea style={s.textarea} rows={3} value={form.observacoes} onChange={(e) => set('observacoes', e.target.value)} placeholder="Histórico, advogado responsável, próximos passos…" />
      </div>

      {/* Ações */}
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
        <button style={s.btnSecondary} type="button" onClick={onCancel} disabled={saving}>
          Cancelar
        </button>
        <button
          style={{ ...s.btnPrimary, opacity: saving ? 0.6 : 1 }}
          type="button"
          onClick={() => onSave(form)}
          disabled={saving || !form.titulo.trim()}
        >
          {saving ? 'Salvando…' : 'Salvar Registro'}
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
              {registro.titular.nome} ({registro.titular.tipo === 'pessoa_fisica' ? 'PF' : 'PJ'})
            </span>
            {registro.orgao && (
              <span><strong style={{ color: '#334155' }}>Órgão:</strong> {registro.orgao}</span>
            )}
            {registro.numero_pedido && (
              <span><strong style={{ color: '#334155' }}>Pedido:</strong> <code>{registro.numero_pedido}</code></span>
            )}
            {registro.numero_registro && (
              <span><strong style={{ color: '#334155' }}>Registro:</strong> <code>{registro.numero_registro}</code></span>
            )}
            {registro.data_criacao && (
              <span><strong style={{ color: '#334155' }}>Criado em:</strong> {registro.data_criacao}</span>
            )}
          </div>
        </div>

        {/* Ações */}
        <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
          <button style={s.btnSecondary} onClick={() => onEdit(registro)} type="button">
            Editar
          </button>
          <button style={s.btnDanger} onClick={() => onDelete(registro)} type="button">
            Excluir
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
    setTimeout(() => setToast(null), 3500)
  }

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
      showToast('Registro criado com sucesso.')
    } catch {
      showToast('Erro ao criar registro.', 'err')
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
      showToast('Registro atualizado.')
    } catch {
      showToast('Erro ao atualizar registro.', 'err')
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
      showToast('Registro excluído.')
    } catch {
      showToast('Erro ao excluir.', 'err')
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
            Env Neo Ltda. — Gestão de registros de PI (software, marcas, patentes, direitos autorais)
          </p>
        </div>
        <button style={s.btnPrimary} onClick={() => setModal({ mode: 'create' })}>
          + Novo Registro
        </button>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Status:</span>
          <select style={{ ...s.select, width: 'auto' }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as StatusPI | 'todos')}>
            <option value="todos">Todos</option>
            {(Object.entries(STATUS_LABELS) as [StatusPI, string][]).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Tipo:</span>
          <select style={{ ...s.select, width: 'auto' }} value={filterTipo} onChange={(e) => setFilterTipo(e.target.value as TipoPI | 'todos')}>
            <option value="todos">Todos</option>
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
            ? 'Nenhum registro de PI cadastrado. Clique em "Novo Registro" para começar.'
            : 'Nenhum registro corresponde aos filtros selecionados.'}
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
      {toast && (
        <div style={{
          position: 'fixed', bottom: '1.5rem', right: '1.5rem',
          background: toast.type === 'ok' ? '#166534' : '#991b1b',
          color: '#fff', borderRadius: 8, padding: '0.75rem 1.25rem',
          fontSize: '0.82rem', fontWeight: 600, zIndex: 100,
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        }}>
          {toast.msg}
        </div>
      )}

      {/* Modal Criar / Editar */}
      {(modal?.mode === 'create' || modal?.mode === 'edit') && (
        <div style={s.overlay} onClick={(e) => { if (e.target === e.currentTarget) setModal(null) }}>
          <div style={s.modal}>
            <h2 style={s.modalTitle}>
              {modal.mode === 'create' ? 'Novo Registro de PI' : `Editar — ${(modal as { mode: 'edit'; registro: PIRegistro }).registro.id}`}
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
        <div style={s.overlay} onClick={(e) => { if (e.target === e.currentTarget) setModal(null) }}>
          <div style={{ ...s.modal, maxWidth: 440 }}>
            <h2 style={{ ...s.modalTitle, color: '#991b1b' }}>Confirmar Exclusão</h2>
            <p style={{ fontSize: '0.88rem', color: '#475569', marginBottom: '1rem' }}>
              Tem certeza que deseja excluir o registro{' '}
              <strong>{(modal as { mode: 'delete'; registro: PIRegistro }).registro.id}</strong>
              {' — '}<em>{(modal as { mode: 'delete'; registro: PIRegistro }).registro.titulo}</em>?
            </p>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '1.5rem' }}>
              Esta ação não pode ser desfeita.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button style={s.btnSecondary} onClick={() => setModal(null)} disabled={saving}>
                Cancelar
              </button>
              <button
                style={{ ...s.btnDanger, padding: '0.5rem 1rem', fontSize: '0.82rem', opacity: saving ? 0.6 : 1 }}
                onClick={handleDelete}
                disabled={saving}
              >
                {saving ? 'Excluindo…' : 'Excluir definitivamente'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
