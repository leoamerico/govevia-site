'use client'
/**
 * RagDemoClient.tsx — Interface interativa de demo RAG.
 * Tabs: Upload PDF | Busca Semântica | Tarefas Assíncronas.
 *
 * Upload  → /api/admin/documents/ingest       (proxy → FastAPI, polling via usePollDocJob)
 * Search  → /api/admin/documents/search       (proxy → FastAPI /api/v1/search, stub on down)
 * Tasks   → /api/admin/kernel/task/dispatch   (proxy → FastAPI task queue, polling via usePollTask)
 */
import { useState, useRef, useEffect } from 'react'
import type { ChunkResult } from './actions'
import { usePollTask } from '@/hooks/usePollTask'
import { usePollDocJob } from '@/hooks/usePollDocJob'
import type { DocJobState } from '@/hooks/usePollDocJob'

// ─── Styles ──────────────────────────────────────────────────────────────────

const S = {
  tabs: { display: 'flex', gap: '4px', marginBottom: '24px' },
  tab: (active: boolean) => ({
    padding: '8px 20px',
    borderRadius: '6px 6px 0 0',
    border: '1px solid',
    borderColor: active ? '#334155' : '#1e293b',
    borderBottom: active ? '1px solid #0f172a' : '1px solid #334155',
    background: active ? '#0f172a' : '#1e293b',
    color: active ? '#f1f5f9' : '#64748b',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: active ? 700 : 400,
    transition: 'all 0.1s',
  }),
  panel: { border: '1px solid #334155', borderRadius: '0 6px 6px 6px', background: '#0f172a', padding: '24px' },
  label: { display: 'block', fontSize: '11px', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' as const, letterSpacing: '0.08em', fontWeight: 600 },
  input: { width: '100%', background: '#1e293b', border: '1px solid #334155', color: '#e2e8f0', borderRadius: '6px', padding: '10px 12px', fontSize: '14px', boxSizing: 'border-box' as const, outline: 'none' },
  btn: (loading: boolean, disabled?: boolean) => ({
    background: (loading || disabled) ? '#1e293b' : '#0059B3',
    color: (loading || disabled) ? '#475569' : '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '10px 24px',
    fontWeight: 700,
    cursor: (loading || disabled) ? 'not-allowed' : 'pointer',
    fontSize: '14px',
    marginTop: '12px',
  }),
  badge: (ok: boolean) => ({
    display: 'inline-block',
    padding: '2px 10px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 700,
    background: ok ? '#052e16' : '#450a0a',
    color: ok ? '#4ade80' : '#f87171',
    border: `1px solid ${ok ? '#166534' : '#991b1b'}`,
    marginRight: '8px',
  }),
  stubBanner: { background: '#1c1917', border: '1px solid #44403c', borderRadius: '6px', padding: '10px 14px', fontSize: '12px', color: '#a8a29e', marginBottom: '16px' },
  hashRow: { fontFamily: 'monospace', fontSize: '11px', color: '#475569', marginTop: '8px', wordBreak: 'break-all' as const },
}

// ─── Tab: Upload ─────────────────────────────────────────────────────────────

const JOB_STATUS_COLOR: Record<string, string> = {
  queued:     '#f59e0b',
  processing: '#38bdf8',
  done:       '#4ade80',
  error:      '#f87171',
}

function UploadTab() {
  const fileRef                      = useRef<HTMLInputElement>(null)
  const [selectedName, setName]      = useState<string>('')
  const [uploading, setUploading]    = useState(false)
  const [uploadErr, setUploadErr]    = useState<string | null>(null)
  const [jobId, setJobId]            = useState<string | null>(null)

  const { state, isLoading, error: pollErr, interrupted, reset } = usePollDocJob(jobId)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    setName(f ? f.name : '')
    setUploadErr(null)
    setJobId(null)
    reset()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const file = fileRef.current?.files?.[0]
    if (!file) return

    reset()
    setJobId(null)
    setUploadErr(null)
    setUploading(true)

    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/admin/documents/ingest', {
        method: 'POST',
        body: fd,
        cache: 'no-store',
      })
      const data = await res.json() as { job_id?: string; error?: string }
      if (!res.ok || !data.job_id) {
        setUploadErr(data.error ?? `HTTP ${res.status}`)
      } else {
        setJobId(data.job_id)
      }
    } catch {
      setUploadErr('Erro de rede ao enviar arquivo')
    } finally {
      setUploading(false)
    }
  }

  const isTerminal = state?.status === 'done' || state?.status === 'error'
  const busy = uploading || isLoading

  return (
    <form onSubmit={handleSubmit}>
      {/* UC Info */}
      <div style={{ marginBottom: '16px', fontSize: '12px', color: '#64748b' }}>
        <span style={{ color: '#38bdf8', marginRight: '8px' }}>UC01 — Ingerir Evidência</span>
        <span style={{ color: '#475569' }}>Regras tocadas:</span>
        {[' RN01', ' RN04'].map(r => <code key={r} style={{ marginLeft: '6px', background: '#1e293b', padding: '1px 6px', borderRadius: '4px', fontSize: '10px', color: '#94a3b8' }}>{r}</code>)}
      </div>

      <label style={S.label}>Documento PDF</label>
      <input
        ref={fileRef}
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        style={{ ...S.input, padding: '8px' }}
      />
      {selectedName && (
        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>Selecionado: {selectedName}</div>
      )}

      <button type="submit" style={S.btn(busy, !selectedName)} disabled={busy || !selectedName}>
        {uploading ? 'Enviando…' : isLoading ? 'Processando…' : 'Enviar para Kernel'}
      </button>

      {uploadErr && (
        <div style={{ color: '#f87171', fontSize: '13px', marginTop: '12px' }}>✖ {uploadErr}</div>
      )}
      {pollErr && (
        <div style={{ color: interrupted ? '#fb923c' : '#f87171', fontSize: '13px', marginTop: '12px' }}>
          {interrupted ? '⚠' : '✖'} {pollErr}
        </div>
      )}

      {(jobId || state) && (
        <div style={{ marginTop: '20px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '16px 18px' }}>
          {jobId && (
            <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#475569', marginBottom: '12px' }}>
              job_id: <span style={{ color: '#94a3b8' }}>{jobId}</span>
            </div>
          )}

          {(isLoading || state) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{
                display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%',
                background: state ? (JOB_STATUS_COLOR[state.status] ?? '#64748b') : '#f59e0b',
                boxShadow: isLoading ? '0 0 0 3px rgba(56,189,248,0.3)' : 'none',
              }} />
              <span style={{ fontSize: '14px', fontWeight: 700, color: state ? (JOB_STATUS_COLOR[state.status] ?? '#e2e8f0') : '#f59e0b' }}>
                {state?.status?.toUpperCase() ?? 'QUEUED'}
              </span>
              {isLoading && <span style={{ fontSize: '11px', color: '#475569' }}>polling a cada 1,5s…</span>}
            </div>
          )}

          {isLoading && (
            <div style={{ height: '3px', background: '#334155', borderRadius: '2px', overflow: 'hidden', marginBottom: '12px' }}>
              <div style={{
                height: '100%', width: '40%',
                background: 'linear-gradient(90deg, transparent, #38bdf8, transparent)',
                animation: 'slide 1.2s linear infinite',
              }} />
            </div>
          )}

          {state?.status === 'done' && (
            <div style={{ fontSize: '13px', color: '#86efac', marginTop: '4px' }}>
              ✓ Documento ingerido com sucesso
              {state.result != null && (
                <pre style={{ marginTop: '8px', fontSize: '12px', background: '#052e16', border: '1px solid #166534', borderRadius: '6px', padding: '10px 12px', overflowX: 'auto', whiteSpace: 'pre-wrap', color: '#86efac' }}>
                  {JSON.stringify(state.result, null, 2)}
                </pre>
              )}
            </div>
          )}

          {state?.status === 'error' && (
            <div style={{ color: '#f87171', fontSize: '13px', fontFamily: 'monospace', background: '#450a0a', border: '1px solid #991b1b', borderRadius: '6px', padding: '10px 12px' }}>
              {String(state.error ?? 'Falha na ingestão')}
            </div>
          )}
        </div>
      )}

      <style>{`@keyframes slide { from { transform:translateX(-200%) } to { transform:translateX(400%) } }`}</style>
    </form>
  )
}

// ─── Tab: Search ─────────────────────────────────────────────────────────────

interface SearchProxyResult {
  chunks: ChunkResult[]
  kernelAvailable: boolean
  stub?: boolean
}

function SearchTab() {
  const [query, setQuery]           = useState('')
  const [searching, setSearching]   = useState(false)
  const [result, setResult]         = useState<SearchProxyResult | null>(null)
  const [error, setError]           = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setSearching(true)
    setResult(null)
    setError(null)

    try {
      const res = await fetch('/api/admin/documents/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim(), top_k: 5 }),
        cache: 'no-store',
      })
      const data = await res.json() as SearchProxyResult & { error?: string }
      if (!res.ok) {
        setError(data.error ?? `HTTP ${res.status}`)
      } else {
        setResult(data)
      }
    } catch {
      setError('Erro de rede ao consultar kernel')
    } finally {
      setSearching(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* UC Info */}
      <div style={{ marginBottom: '16px', fontSize: '12px', color: '#64748b' }}>
        <span style={{ color: '#a78bfa', marginRight: '8px' }}>UC03 — Executar Análise</span>
        <span style={{ color: '#475569' }}>Regras tocadas:</span>
        {[' RN01', ' RN02', ' RN05'].map(r => <code key={r} style={{ marginLeft: '6px', background: '#1e293b', padding: '1px 6px', borderRadius: '4px', fontSize: '10px', color: '#94a3b8' }}>{r}</code>)}
      </div>

      <label style={S.label}>Query semântica</label>
      <input
        type="text"
        value={query}
        onChange={e => { setQuery(e.target.value); setResult(null); setError(null) }}
        placeholder="Ex: limite de gasto com pessoal LRF"
        style={S.input}
      />

      <button type="submit" style={S.btn(searching, !query.trim())} disabled={searching || !query.trim()}>
        {searching ? 'Buscando…' : 'Buscar no Kernel'}
      </button>

      {error && (
        <div style={{ color: '#f87171', fontSize: '13px', marginTop: '12px' }}>✖ {error}</div>
      )}

      {result && (
        <div style={{ marginTop: '20px' }}>
          <div style={{ marginBottom: '12px' }}>
            <span style={S.badge(result.kernelAvailable)}>
              {result.kernelAvailable ? 'LIVE' : 'STUB'}
            </span>
            <span style={{ fontSize: '13px', color: '#94a3b8' }}>
              {result.chunks.length} chunk(s) encontrado(s)
            </span>
          </div>

          {(result.stub || !result.kernelAvailable) && (
            <div style={S.stubBanner}>
              ⚠ Kernel não configurado ou indisponível. Resultado simulado.
            </div>
          )}

          {result.chunks.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {result.chunks.map((chunk, i) => (
                <div key={chunk.chunk_id} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '6px', padding: '12px 14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <code style={{ fontSize: '11px', color: '#64748b' }}>#{i + 1} chunk_id: {chunk.chunk_id}</code>
                    <span style={{ fontSize: '11px', color: '#4ade80' }}>score: {chunk.score.toFixed(3)}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', color: '#cbd5e1', lineHeight: 1.5 }}>{chunk.excerpt}</p>
                  <div style={{ fontSize: '11px', color: '#475569', marginTop: '6px' }}>doc: {chunk.document_id}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </form>
  )
}

// ─── Tab: Tarefas Assíncronas ─────────────────────────────────────────────────

const STATUS_COLOR: Record<string, string> = {
  pending: '#f59e0b',
  running: '#38bdf8',
  success: '#4ade80',
  failed:  '#f87171',
}

function TasksTab() {
  const [handlers, setHandlers]       = useState<string[]>([])
  const [handlersErr, setHandlersErr] = useState<string | null>(null)
  const [handler, setHandler]         = useState('')
  const [rawPayload, setRawPayload]   = useState('{}')
  const [payloadErr, setPayloadErr]   = useState<string | null>(null)
  const [taskId, setTaskId]           = useState<string | null>(null)
  const [dispatchErr, setDispatchErr] = useState<string | null>(null)
  const [dispatching, setDispatching] = useState(false)

  const { state, isLoading, error: pollErr, reset } = usePollTask(taskId)

  useEffect(() => {
    fetch('/api/admin/kernel/task/handlers', { cache: 'no-store' })
      .then(r => r.json())
      .then((d: { handlers?: string[]; error?: string }) => {
        if (d.error) { setHandlersErr(d.error); return }
        setHandlers(d.handlers ?? [])
        if (d.handlers?.length) setHandler(d.handlers[0])
      })
      .catch(() => setHandlersErr('Erro ao carregar handlers'))
  }, [])

  function validatePayload(): Record<string, unknown> | null {
    try {
      const p = JSON.parse(rawPayload)
      if (typeof p !== 'object' || Array.isArray(p)) throw new Error()
      setPayloadErr(null)
      return p as Record<string, unknown>
    } catch {
      setPayloadErr('Payload deve ser um objeto JSON válido, ex: {"chave":"valor"}')
      return null
    }
  }

  async function handleDispatch(e: React.FormEvent) {
    e.preventDefault()
    const payload = validatePayload()
    if (!payload || !handler) return

    reset()
    setTaskId(null)
    setDispatchErr(null)
    setDispatching(true)

    try {
      const res = await fetch('/api/admin/kernel/task/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handler, payload }),
        cache: 'no-store',
      })
      const data = await res.json() as { task_id?: string; error?: string }
      if (!res.ok || !data.task_id) {
        setDispatchErr(data.error ?? `HTTP ${res.status}`)
      } else {
        setTaskId(data.task_id)
      }
    } catch {
      setDispatchErr('Erro de rede ao despachar tarefa')
    } finally {
      setDispatching(false)
    }
  }

  const isTerminal = state?.status === 'success' || state?.status === 'failed'

  return (
    <div>
      <div style={{ marginBottom: '16px', fontSize: '12px', color: '#64748b' }}>
        <span style={{ color: '#fb923c', marginRight: '8px' }}>Sprint C — Task Queue</span>
        <span style={{ color: '#475569' }}>dispatch → pending → running → success|failed</span>
      </div>

      {handlersErr && (
        <div style={{ ...S.stubBanner, color: '#fca5a5' }}>⚠ {handlersErr}</div>
      )}

      <form onSubmit={handleDispatch}>
        <label style={S.label}>Handler</label>
        {handlers.length > 0 ? (
          <select
            value={handler}
            onChange={e => setHandler(e.target.value)}
            style={{ ...S.input, cursor: 'pointer' }}
          >
            {handlers.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
        ) : (
          <input
            type="text"
            value={handler}
            onChange={e => setHandler(e.target.value)}
            placeholder="ping"
            style={S.input}
          />
        )}

        <label style={{ ...S.label, marginTop: '16px' }}>Payload JSON</label>
        <textarea
          value={rawPayload}
          onChange={e => { setRawPayload(e.target.value); setPayloadErr(null) }}
          rows={3}
          style={{ ...S.input, fontFamily: 'monospace', fontSize: '12px', resize: 'vertical' }}
        />
        {payloadErr && <div style={{ color: '#f87171', fontSize: '12px', marginTop: '4px' }}>{payloadErr}</div>}

        <button
          type="submit"
          style={S.btn(dispatching || isLoading, !handler.trim())}
          disabled={dispatching || isLoading || !handler.trim()}
        >
          {dispatching ? 'Despachando…' : isLoading ? 'Aguardando tarefa…' : '⚡ Despachar tarefa'}
        </button>
      </form>

      {dispatchErr && (
        <div style={{ color: '#f87171', fontSize: '13px', marginTop: '12px' }}>✖ {dispatchErr}</div>
      )}
      {pollErr && (
        <div style={{ color: '#fb923c', fontSize: '13px', marginTop: '12px' }}>⚠ {pollErr}</div>
      )}

      {(taskId || state) && (
        <div style={{ marginTop: '20px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '16px 18px' }}>
          {taskId && (
            <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#475569', marginBottom: '12px' }}>
              task_id: <span style={{ color: '#94a3b8' }}>{taskId}</span>
            </div>
          )}

          {(isLoading || state) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{
                display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%',
                background: state ? (STATUS_COLOR[state.status] ?? '#64748b') : '#f59e0b',
                boxShadow: isLoading ? '0 0 0 3px rgba(56,189,248,0.3)' : 'none',
              }} />
              <span style={{ fontSize: '14px', fontWeight: 700, color: state ? (STATUS_COLOR[state.status] ?? '#e2e8f0') : '#f59e0b' }}>
                {state?.status?.toUpperCase() ?? 'PENDING'}
              </span>
              {isLoading && <span style={{ fontSize: '11px', color: '#475569' }}>polling a cada 1,5s…</span>}
              {isTerminal && state?.elapsed_ms != null && (
                <span style={{ fontSize: '11px', color: '#475569', marginLeft: 'auto' }}>
                  elapsed: {state.elapsed_ms.toFixed(0)} ms
                </span>
              )}
            </div>
          )}

          {isLoading && (
            <div style={{ height: '3px', background: '#334155', borderRadius: '2px', overflow: 'hidden', marginBottom: '12px' }}>
              <div style={{
                height: '100%', width: '40%',
                background: 'linear-gradient(90deg, transparent, #38bdf8, transparent)',
                animation: 'slide 1.2s linear infinite',
              }} />
            </div>
          )}

          {state?.status === 'success' && state.result != null && (
            <pre style={{ margin: 0, fontSize: '12px', color: '#86efac', fontFamily: 'monospace', background: '#052e16', border: '1px solid #166534', borderRadius: '6px', padding: '10px 12px', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(state.result, null, 2)}
            </pre>
          )}

          {state?.status === 'failed' && (
            <div style={{ color: '#f87171', fontSize: '13px', fontFamily: 'monospace', background: '#450a0a', border: '1px solid #991b1b', borderRadius: '6px', padding: '10px 12px' }}>
              {String(state.error ?? 'Tarefa falhou sem mensagem de erro')}
            </div>
          )}
        </div>
      )}

      <style>{`@keyframes slide { from { transform:translateX(-200%) } to { transform:translateX(400%) } }`}</style>
    </div>
  )
}

// ─── Main Export ─────────────────────────────────────────────────────────────
import { ChatTab } from './ChatTab'

type Tab = 'upload' | 'search' | 'tasks' | 'chat'

const TAB_LABELS: Record<Tab, string> = {
  upload: '⬆  Upload PDF',
  search: '🔍  Busca Semântica',
  tasks:  '⚡  Tarefas Async',
  chat:   '💬  Chat RAG',
}

export function RagDemoClient() {
  const [tab, setTab] = useState<Tab>('upload')

  return (
    <div>
      <div style={S.tabs}>
        {(['upload', 'search', 'tasks', 'chat'] as Tab[]).map(t => (
          <button key={t} type="button" style={S.tab(tab === t)} onClick={() => setTab(t)}>
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>
      <div style={S.panel}>
        {tab === 'upload' && <UploadTab />}
        {tab === 'search' && <SearchTab />}
        {tab === 'tasks'  && <TasksTab />}
        {tab === 'chat'   && <ChatTab />}
      </div>
    </div>
  )
}
