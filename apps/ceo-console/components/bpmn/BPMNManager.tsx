'use client'

import { useState, useCallback, useEffect } from 'react'
import { tokens as s, Toast } from '@/components/ui'
import { type ProcessoBPMN, type NormaLegal, processoVazio } from './bpmn.types'
import { ProcessoEditor, ProcessoCard } from './ProcessoEditor'

export default function BPMNManager({ initialProcessos, normas }: { initialProcessos: ProcessoBPMN[]; normas: NormaLegal[] }) {
  const [processos, setProcessos] = useState<ProcessoBPMN[]>(initialProcessos)
  const [editando, setEditando] = useState<ProcessoBPMN | null>(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setEditando(null) }
    if (editando) { document.addEventListener('keydown', handler) }
    return () => document.removeEventListener('keydown', handler)
  }, [editando])

  const refresh = useCallback(async () => {
    const res = await fetch('/api/admin/bpmn', { cache: 'no-store' })
    if (res.ok) setProcessos(await res.json() as ProcessoBPMN[])
  }, [])

  const handleCreate = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/bpmn', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(processoVazio()),
      })
      const data = await res.json() as { processo: ProcessoBPMN }
      await refresh()
      setEditando(data.processo)
    } catch {
      showToast('Não foi possível criar o processo.', 'err')
    } finally {
      setSaving(false)
    }
  }

  const handleSave = async (processo: ProcessoBPMN) => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/bpmn', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(processo),
      })
      await refresh()
      setEditando(processo)
      showToast('Processo salvo com sucesso!')
    } catch {
      showToast('Não foi possível salvar o processo. Tente novamente.', 'err')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/bpmn', {
        method: 'DELETE',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      await refresh()
      setEditando(null)
      showToast('Processo removido.')
    } catch {
      showToast('Não foi possível remover o processo.', 'err')
    } finally {
      setSaving(false)
    }
  }

  if (editando) {
    return (
      <>
        <ProcessoEditor
          processo={editando}
          normas={normas}
          onSave={handleSave}
          onDelete={() => handleDelete(editando.id)}
          onBack={() => setEditando(null)}
          saving={saving}
        />
        {toast && <Toast msg={toast.msg} type={toast.type} />}
      </>
    )
  }

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Processos Administrativos</h1>
          <p style={s.subtitle}>
            Modele os fluxos de trabalho da organização com etapas, prazos, comunicações e responsáveis. Os processos validados aqui são a base de referência para o Govevia.
          </p>
        </div>
        <button style={{ ...s.btnPrimary, opacity: saving ? 0.6 : 1 }} onClick={handleCreate} disabled={saving} type="button">
          + Novo processo
        </button>
      </div>

      {processos.length === 0 ? (
        <div style={s.emptyState}>
          Nenhum processo cadastrado ainda.<br />
          Clique em <strong>&quot;+ Novo processo&quot;</strong> para modelar o primeiro fluxo administrativo.
        </div>
      ) : (
        processos.map(p => (
          <ProcessoCard key={p.id} processo={p} onEdit={() => setEditando(p)} />
        ))
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  )
}
