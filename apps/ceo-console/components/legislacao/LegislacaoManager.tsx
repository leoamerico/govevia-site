'use client'

import { useState, useCallback } from 'react'

// ─── Tipos ────────────────────────────────────────────────────────────────────

type EsferaLegal = 'federal' | 'estadual' | 'municipal'
type StatusNorma = 'ativa' | 'revogada' | 'suspensa'

interface NormaLegal {
  id: string                    // chave estruturada = base_normativa_id
  titulo: string
  lei: string
  artigo: string
  esfera_legal: EsferaLegal
  vigencia_inicio: string       // ISO date YYYY-MM-DD
  vigencia_fim: string | null
  descricao: string
  status: StatusNorma
  created_at: string
  updated_at: string
}

// ─── Labels e estilos ─────────────────────────────────────────────────────────

const ESFERA_LABELS: Record<EsferaLegal, string> = {
  federal:    'Federal',
  estadual:   'Estadual',
  municipal:  'Municipal',
}

const STATUS_LABELS: Record<StatusNorma, string> = {
  ativa:    'Em vigor ✓',
  revogada: 'Revogada',
  suspensa: 'Suspensa (liminar/judicial)',
}

const STATUS_COLORS: Record<StatusNorma, { bg: string; color: string; border: string }> = {
  ativa:    { bg: '#f0fdf4', color: '#166534', border: '#bbf7d0' },
  revogada: { bg: '#fff1f2', color: '#9f1239', border: '#fecdd3' },
  suspensa: { bg: '#fffbeb', color: '#92400e', border: '#fde68a' },
}

const ESFERA_COLORS: Record<EsferaLegal, { bg: string; color: string; border: string }> = {
  federal:   { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  estadual:  { bg: '#f5f3ff', color: '#6d28d9', border: '#ddd6fe' },
  municipal: { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
}

const EMPTY_FORM: Omit<NormaLegal, 'id' | 'created_at' | 'updated_at'> = {
  titulo: '',
  lei: '',
  artigo: '',
  esfera_legal: 'federal',
  vigencia_inicio: new Date().toISOString().slice(0, 10),
  vigencia_fim: null,
  descricao: '',
  status: 'ativa',
}

// ─── Estilos ─────────────────────────────────────────────────────────────────

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
    alignItems: 'flex-start',
    marginBottom: '1.5rem',
    gap: '1rem',
  } as React.CSSProperties,
  title: {
    fontSize: '1.4rem',
    fontWeight: 700,
    color: '#0f172a',
    margin: 0,
  } as React.CSSProperties,
  subtitle: {
    fontSize: '0.8rem',
    color: '#64748b',
    marginTop: '0.25rem',
  } as React.CSSProperties,
  badge: (color: { bg: string; color: string; border: string }) => ({
    display: 'inline-block',
    padding: '0.15rem 0.5rem',
    borderRadius: 4,
    fontSize: '0.7rem',
    fontWeight: 600,
    background: color.bg,
    color: color.color,
    border: `1px solid ${color.border}`,
  } as React.CSSProperties),
  btn: (variant: 'primary' | 'ghost' | 'danger' | 'outline') => {
    const base: React.CSSProperties = {
      padding: '0.4rem 1rem',
      borderRadius: 6,
      fontWeight: 600,
      fontSize: '0.8rem',
      cursor: 'pointer',
      border: 'none',
    }
    if (variant === 'primary') return { ...base, background: '#0f172a', color: '#fff' }
    if (variant === 'ghost') return { ...base, background: 'transparent', color: '#64748b', border: '1px solid #e2e8f0' }
    if (variant === 'danger') return { ...base, background: '#fff1f2', color: '#9f1239', border: '1px solid #fecdd3' }
    return { ...base, background: 'transparent', color: '#0f172a', border: '1px solid #cbd5e1' }
  },
  card: {
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    padding: '1.25rem',
    background: '#fff',
    marginBottom: '0.75rem',
  } as React.CSSProperties,
  idBadge: {
    fontFamily: 'monospace',
    fontSize: '0.75rem',
    background: '#f1f5f9',
    border: '1px solid #cbd5e1',
    borderRadius: 4,
    padding: '0.15rem 0.5rem',
    color: '#0f172a',
    userSelect: 'all' as const,
    cursor: 'text',
  } as React.CSSProperties,
  field: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem',
    marginBottom: '0.75rem',
  } as React.CSSProperties,
  label: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#374151',
  } as React.CSSProperties,
  input: {
    padding: '0.45rem 0.6rem',
    borderRadius: 6,
    border: '1px solid #d1d5db',
    fontSize: '0.85rem',
    fontFamily: 'inherit',
    width: '100%',
    boxSizing: 'border-box' as const,
  } as React.CSSProperties,
  textarea: {
    padding: '0.45rem 0.6rem',
    borderRadius: 6,
    border: '1px solid #d1d5db',
    fontSize: '0.85rem',
    fontFamily: 'inherit',
    width: '100%',
    boxSizing: 'border-box' as const,
    resize: 'vertical' as const,
    minHeight: 72,
  } as React.CSSProperties,
  select: {
    padding: '0.45rem 0.6rem',
    borderRadius: 6,
    border: '1px solid #d1d5db',
    fontSize: '0.85rem',
    fontFamily: 'inherit',
    width: '100%',
    boxSizing: 'border-box' as const,
    background: '#fff',
  } as React.CSSProperties,
  modal: {
    position: 'fixed' as const,
    inset: 0,
    background: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    padding: '1rem',
  } as React.CSSProperties,
  modalBox: {
    background: '#fff',
    borderRadius: 10,
    padding: '1.75rem',
    width: '100%',
    maxWidth: 560,
    maxHeight: '90vh',
    overflowY: 'auto' as const,
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
  } as React.CSSProperties,
  error: {
    background: '#fff1f2',
    border: '1px solid #fecdd3',
    borderRadius: 6,
    padding: '0.5rem 0.75rem',
    color: '#9f1239',
    fontSize: '0.8rem',
    marginBottom: '0.75rem',
  } as React.CSSProperties,
  hint: {
    background: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: 6,
    padding: '0.6rem 0.75rem',
    color: '#1e40af',
    fontSize: '0.75rem',
    marginBottom: '1rem',
    lineHeight: 1.5,
  } as React.CSSProperties,
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function LegislacaoManager({ initialNormas }: { initialNormas: NormaLegal[] }) {
  const [normas, setNormas] = useState<NormaLegal[]>(initialNormas)
  const [filtro, setFiltro] = useState<StatusNorma | 'todas'>('todas')
  const [modal, setModal] = useState<'criar' | 'editar' | null>(null)
  const [editing, setEditing] = useState<NormaLegal | null>(null)
  const [form, setForm] = useState<Omit<NormaLegal, 'id' | 'created_at' | 'updated_at'>>(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const normasFiltradas = filtro === 'todas'
    ? normas
    : normas.filter((n) => n.status === filtro)

  const openCriar = useCallback(() => {
    setForm(EMPTY_FORM)
    setEditing(null)
    setError('')
    setModal('criar')
  }, [])

  const openEditar = useCallback((norma: NormaLegal) => {
    setForm({
      titulo: norma.titulo,
      lei: norma.lei,
      artigo: norma.artigo,
      esfera_legal: norma.esfera_legal,
      vigencia_inicio: norma.vigencia_inicio,
      vigencia_fim: norma.vigencia_fim,
      descricao: norma.descricao,
      status: norma.status,
    })
    setEditing(norma)
    setError('')
    setModal('editar')
  }, [])

  const closeModal = useCallback(() => {
    setModal(null)
    setEditing(null)
    setError('')
  }, [])

  const handleSalvar = useCallback(async () => {
    setError('')
    if (!form.titulo.trim()) { setError('Título é obrigatório'); return }
    if (!form.lei.trim()) { setError('Lei é obrigatória'); return }
    if (!form.artigo.trim()) { setError('Artigo é obrigatório'); return }
    if (!form.descricao.trim()) { setError('Descrição é obrigatória'); return }

    setLoading(true)
    try {
      const method = modal === 'criar' ? 'POST' : 'PUT'
      const body = modal === 'criar' ? form : { id: editing!.id, ...form }
      const res = await fetch('/api/admin/legislacao', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Erro ao salvar')
        return
      }
      const salvo: NormaLegal = await res.json()
      if (modal === 'criar') {
        setNormas((prev) => [...prev, salvo])
      } else {
        setNormas((prev) => prev.map((n) => (n.id === salvo.id ? salvo : n)))
      }
      closeModal()
    } catch {
      setError('Erro de rede ao salvar')
    } finally {
      setLoading(false)
    }
  }, [modal, form, editing, closeModal])

  const handleExcluir = useCallback(async (norma: NormaLegal) => {
    if (!confirm(`Excluir "${norma.titulo}"?\n\nATENÇÃO: processos BPMN que referenciam "${norma.id}" como base_normativa_id perderão o vínculo.`)) return
    setLoading(true)
    try {
      const res = await fetch('/api/admin/legislacao', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: norma.id }),
      })
      if (!res.ok) {
        alert('Erro ao excluir')
        return
      }
      setNormas((prev) => prev.filter((n) => n.id !== norma.id))
    } catch {
      alert('Erro de rede ao excluir')
    } finally {
      setLoading(false)
    }
  }, [])

  const field = (
    label: string,
    key: keyof typeof form,
    opts?: { type?: string; placeholder?: string; hint?: string }
  ) => (
    <div style={s.field}>
      <label style={s.label}>{label}{opts?.hint && <span style={{ fontWeight: 400, color: '#6b7280', marginLeft: 4 }}>— {opts.hint}</span>}</label>
      <input
        style={s.input}
        type={opts?.type ?? 'text'}
        placeholder={opts?.placeholder}
        value={(form[key] as string) ?? ''}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value || null }))}
      />
    </div>
  )

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Catálogo de Normas Legais</h1>
          <p style={s.subtitle}>
            Fonte dos valores válidos para <code>base_normativa_id</code> — referenciado por RN01–RN05 e pelos processos BPMN.
          </p>
        </div>
        <button style={s.btn('primary')} onClick={openCriar}>+ Nova Norma</button>
      </div>

      {/* Filtro de status */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {(['todas', 'ativa', 'revogada', 'suspensa'] as const).map((v) => (
          <button
            key={v}
            style={{
              ...s.btn(filtro === v ? 'primary' : 'ghost'),
              fontSize: '0.75rem',
              padding: '0.3rem 0.75rem',
            }}
            onClick={() => setFiltro(v)}
          >
            {v === 'todas' ? `Todas (${normas.length})` : `${STATUS_LABELS[v]} (${normas.filter((n) => n.status === v).length})`}
          </button>
        ))}
      </div>

      {/* Lista */}
      {normasFiltradas.length === 0 && (
        <div style={{ color: '#94a3b8', fontSize: '0.85rem', padding: '2rem 0' }}>
          Nenhuma norma cadastrada. Clique em &ldquo;+ Nova Norma&rdquo; para começar.
        </div>
      )}

      {normasFiltradas.map((norma) => (
        <div key={norma.id} style={s.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
            {/* Info principal */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                <span style={s.idBadge} title="Use este valor como base_normativa_id">{norma.id}</span>
                <span style={s.badge(STATUS_COLORS[norma.status])}>{STATUS_LABELS[norma.status]}</span>
                <span style={s.badge(ESFERA_COLORS[norma.esfera_legal])}>{ESFERA_LABELS[norma.esfera_legal]}</span>
              </div>
              <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem', marginBottom: '0.2rem' }}>
                {norma.titulo}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '0.35rem' }}>
                <strong>{norma.lei}</strong> — {norma.artigo}
                {' · '}
                Vigência: {norma.vigencia_inicio}
                {norma.vigencia_fim ? ` até ${norma.vigencia_fim}` : ' · em vigor'}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.5 }}>{norma.descricao}</div>
            </div>
            {/* Ações */}
            <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
              <button style={s.btn('outline')} onClick={() => openEditar(norma)} disabled={loading}>Editar</button>
              <button style={s.btn('danger')} onClick={() => handleExcluir(norma)} disabled={loading}>Excluir</button>
            </div>
          </div>
        </div>
      ))}

      {/* Modal Criar/Editar */}
      {modal && (
        <div style={s.modal} onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}>
          <div style={s.modalBox}>
            <h2 style={{ ...s.title, fontSize: '1.1rem', marginBottom: '1rem' }}>
              {modal === 'criar' ? 'Nova Norma Legal' : `Editar — ${editing?.id}`}
            </h2>

            {modal === 'criar' && (
              <div style={s.hint}>
                O <strong>ID</strong> (ex: <code>NRM-2026-006</code>) será gerado automaticamente e se tornará
                o valor de <code>base_normativa_id</code> usado pelo motor de regras (RN01) e nos processos BPMN.
              </div>
            )}

            {error && <div style={s.error}>{error}</div>}

            {field('Título', 'titulo', { placeholder: 'ex: Constituição Federal — Princípios da Administração Pública' })}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 0.75rem' }}>
              {field('Lei / Diploma Normativo', 'lei', { placeholder: 'ex: CF/88' })}
              {field('Artigo', 'artigo', { placeholder: 'ex: Art. 37' })}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0 0.75rem' }}>
              <div style={s.field}>
                <label style={s.label}>Esfera</label>
                <select
                  style={s.select}
                  value={form.esfera_legal}
                  onChange={(e) => setForm((f) => ({ ...f, esfera_legal: e.target.value as EsferaLegal }))}
                >
                  {(Object.keys(ESFERA_LABELS) as EsferaLegal[]).map((k) => (
                    <option key={k} value={k}>{ESFERA_LABELS[k]}</option>
                  ))}
                </select>
              </div>
              {field('Vigência — início', 'vigencia_inicio', { type: 'date' })}
              {field('Vigência — fim', 'vigencia_fim', { type: 'date', hint: 'deixe em branco se em vigor' })}
            </div>

            <div style={s.field}>
              <label style={s.label}>Descrição / Escopo de Aplicação</label>
              <textarea
                style={s.textarea}
                value={form.descricao}
                placeholder="Descreva o que a norma determina e em quais casos de uso ela se aplica."
                onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
              />
            </div>

            <div style={s.field}>
              <label style={s.label}>Status</label>
              <select
                style={s.select}
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as StatusNorma }))}
              >
                {(Object.keys(STATUS_LABELS) as StatusNorma[]).map((k) => (
                  <option key={k} value={k}>{STATUS_LABELS[k]}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button style={s.btn('ghost')} onClick={closeModal} disabled={loading}>Cancelar</button>
              <button style={s.btn('primary')} onClick={handleSalvar} disabled={loading}>
                {loading ? 'Salvando…' : modal === 'criar' ? 'Criar Norma' : 'Salvar Alterações'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
