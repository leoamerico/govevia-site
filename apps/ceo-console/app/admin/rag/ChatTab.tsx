'use client'

/**
 * ChatTab — 4ª aba da RAG Demo (/admin/rag)
 *
 * Interface conversacional sobre os documentos indexados no kernel.
 * Mantém histórico de mensagens no estado local.
 * Exibe banner de stub quando kernel indisponível.
 */

import { useState, useRef, useEffect, type KeyboardEvent } from 'react'
import type { ChatMessage } from '@/types/chat'

// ─── Tipos locais ─────────────────────────────────────────────────────────────

interface Source {
  doc_id?: string
  title?: string
  score?: number
  excerpt?: string
}

interface ChatEntry {
  role: 'user' | 'assistant'
  content: string
  sources?: Source[]
  stub?: boolean
}

// ─── Estilos inline (alinhados ao padrão do RagDemoClient) ───────────────────

const S = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    height: '520px',
  },
  stubBanner: {
    background: '#431407',
    border: '1px solid #9a3412',
    borderRadius: '6px',
    padding: '8px 12px',
    marginBottom: '12px',
    fontSize: '12px',
    color: '#fdba74',
    fontFamily: 'monospace',
  },
  history: {
    flex: 1,
    overflowY: 'auto' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
    padding: '4px 0 12px',
    marginBottom: '12px',
  },
  bubble: (role: 'user' | 'assistant', stub: boolean) => ({
    maxWidth: '82%',
    alignSelf: role === 'user' ? 'flex-end' : 'flex-start' as const,
    background: role === 'user' ? '#0059B3' : stub ? '#431407' : '#1e293b',
    border: `1px solid ${role === 'user' ? '#0047a0' : stub ? '#9a3412' : '#334155'}`,
    borderRadius: role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
    padding: '10px 14px',
    fontSize: '13.5px',
    color: '#f1f5f9',
    lineHeight: 1.6,
    whiteSpace: 'pre-wrap' as const,
    wordBreak: 'break-word' as const,
  }),
  sourcesWrap: {
    marginTop: '8px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
  },
  sourceChip: {
    fontSize: '11px',
    color: '#94a3b8',
    background: '#0f172a',
    border: '1px solid #1e3a5f',
    borderRadius: '4px',
    padding: '3px 8px',
    fontFamily: 'monospace' as const,
  },
  inputRow: {
    display: 'flex',
    gap: '8px',
    alignItems: 'flex-end',
  },
  textarea: {
    flex: 1,
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '8px',
    color: '#f8fafc',
    fontSize: '13.5px',
    lineHeight: 1.5,
    padding: '10px 12px',
    resize: 'none' as const,
    outline: 'none',
    fontFamily: 'inherit',
    minHeight: '42px',
    maxHeight: '120px',
    overflowY: 'auto' as const,
  },
  sendBtn: (disabled: boolean) => ({
    background: disabled ? '#1e3a5f' : '#0059B3',
    color: disabled ? '#475569' : '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 18px',
    fontWeight: 600,
    fontSize: '13px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    flexShrink: 0,
    transition: 'background 0.15s',
    height: '42px',
  }),
  clearBtn: {
    background: 'transparent',
    color: '#475569',
    border: '1px solid #334155',
    borderRadius: '6px',
    padding: '6px 10px',
    fontSize: '11px',
    cursor: 'pointer',
    flexShrink: 0,
    fontFamily: 'monospace' as const,
  },
  typing: {
    display: 'inline-flex',
    gap: '4px',
    alignItems: 'center',
    padding: '10px 14px',
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '12px 12px 12px 2px',
    alignSelf: 'flex-start' as const,
  },
  dot: (delay: string) => ({
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#64748b',
    animation: 'dot-bounce 1.2s infinite',
    animationDelay: delay,
  }),
}

const EMPTY_PROMPT = 'Pergunte sobre os documentos indexados… (Enter para enviar, Shift+Enter para nova linha)'

// ─── Componente ───────────────────────────────────────────────────────────────

export function ChatTab() {
  const [history, setHistory] = useState<ChatEntry[]>([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [hasStub, setHasStub] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const sessionId = useRef(`sess-${Date.now()}`)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history, loading])

  async function send() {
    const text = message.trim()
    if (!text || loading) return

    const userEntry: ChatEntry = { role: 'user', content: text }
    setHistory(h => [...h, userEntry])
    setMessage('')
    setLoading(true)

    try {
      const res = await fetch('/api/admin/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: history.map(e => ({ role: e.role, content: e.content })),
          session_id: sessionId.current,
        }),
      })

      const data = await res.json() as {
        answer: string
        sources: Source[]
        kernel_available: boolean
      }

      if (!data.kernel_available) setHasStub(true)

      setHistory(h => [...h, {
        role: 'assistant',
        content: data.answer,
        sources: data.sources,
        stub: !data.kernel_available,
      }])
    } catch {
      setHistory(h => [...h, {
        role: 'assistant',
        content: '[Erro de rede — não foi possível contatar o servidor.]',
        stub: true,
      }])
      setHasStub(true)
    } finally {
      setLoading(false)
    }
  }

  function handleKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div style={S.container}>
      {hasStub && (
        <div style={S.stubBanner} data-testid="stub-banner">
          ⚠ STUB — Kernel indisponível. Respostas simuladas para fins de demonstração.
        </div>
      )}

      {/* Histórico */}
      <div style={S.history} data-testid="chat-history">
        {history.length === 0 && (
          <p style={{ color: '#475569', fontSize: '13px', textAlign: 'center', marginTop: '2rem', fontStyle: 'italic' }}>
            Sem mensagens. Inicie uma conversa sobre os documentos indexados.
          </p>
        )}

        {history.map((entry, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: entry.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <span style={{ fontSize: '10px', color: '#475569', marginBottom: '3px', fontFamily: 'monospace' }}>
              {entry.role === 'user' ? 'Você' : 'Govevia AI'}
            </span>
            <div style={S.bubble(entry.role, !!entry.stub)}>
              {entry.content}
              {entry.sources && entry.sources.length > 0 && (
                <div style={S.sourcesWrap}>
                  <span style={{ fontSize: '10px', color: '#64748b', marginTop: '4px' }}>Fontes:</span>
                  {entry.sources.map((s, si) => (
                    <span key={si} style={S.sourceChip}>
                      {s.title ?? s.doc_id ?? `fonte-${si + 1}`}
                      {s.score != null ? ` · ${(s.score * 100).toFixed(0)}%` : ''}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div style={S.typing}>
            <div style={S.dot('0s')} />
            <div style={S.dot('0.2s')} />
            <div style={S.dot('0.4s')} />
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={S.inputRow}>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={handleKey}
          placeholder={EMPTY_PROMPT}
          rows={1}
          style={S.textarea}
          disabled={loading}
          data-testid="chat-input"
          aria-label="Mensagem para o chat RAG"
        />
        {history.length > 0 && (
          <button
            type="button"
            onClick={() => { setHistory([]); setHasStub(false); sessionId.current = `sess-${Date.now()}` }}
            style={S.clearBtn}
            title="Limpar conversa"
          >
            Limpar
          </button>
        )}
        <button
          type="button"
          onClick={send}
          disabled={!message.trim() || loading}
          style={S.sendBtn(!message.trim() || loading)}
          data-testid="chat-send"
        >
          Enviar
        </button>
      </div>

      <style>{`
        @keyframes dot-bounce {
          0%, 60%, 100% { transform: translateY(0) }
          30% { transform: translateY(-6px) }
        }
      `}</style>
    </div>
  )
}
