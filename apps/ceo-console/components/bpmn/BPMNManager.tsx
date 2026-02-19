'use client'

import { useState, useCallback } from 'react'

// ─── Tipos ────────────────────────────────────────────────────────────────────

/** Subconjunto de NormaLegal necessário para o picker — carregado SSR */
interface NormaLegal {
  id: string        // ex: NRM-2026-001 — é o base_normativa_id
  titulo: string
  lei: string
  artigo: string
  status: 'ativa' | 'revogada' | 'suspensa'
}

type TipoNo =
  | 'evento_inicio'
  | 'tarefa_humana'
  | 'tarefa_automatica'
  | 'gateway_decisao'
  | 'gateway_paralelo'
  | 'evento_timer'
  | 'evento_mensagem'
  | 'subprocesso'
  | 'evento_fim'

type TipoComunicacao =
  | 'despacho'
  | 'memorando'
  | 'oficio'
  | 'notificacao'
  | 'publicacao_dou'
  | 'email_institucional'
  | 'autuacao'
  | 'intimacao'

type TipoFim =
  | 'deferimento'
  | 'indeferimento'
  | 'arquivamento'
  | 'encaminhamento'
  | 'homologacao'
  | 'cancelamento'

type StatusProcesso = 'rascunho' | 'em_revisao' | 'aprovado' | 'em_uso' | 'obsoleto'

interface Comunicacao {
  tipo: TipoComunicacao
  destinatario: string
  assunto: string
  template: string
}

interface OpcaoDecisao {
  id: string
  condicao: string
  label: string
  proximo_id: string
}

interface No {
  id: string
  tipo: TipoNo
  nome: string
  descricao: string
  ator: string
  prazo_dias_uteis: number
  base_normativa_id: string   // chave estruturada — NRM-YYYY-NNN do catálogo
  base_legal: string          // texto livre complementar
  documentos_entrada: string[]
  documentos_saida: string[]
  comunicacao: Comunicacao | null
  decisao: { criterio: string; opcoes: OpcaoDecisao[] } | null
  tipo_fim: TipoFim | null
  prazo_inicio_contagem: string
  observacoes: string
  ordem: number
}

interface ProcessoBPMN {
  id: string
  nome: string
  descricao: string
  area_responsavel: string
  base_legal: string[]
  prazo_total_dias: number
  atores: string[]
  nos: No[]
  status: StatusProcesso
  versao: string
  observacoes: string
  created_at: string
  updated_at: string
}

// ─── Labels ───────────────────────────────────────────────────────────────────

const TIPO_NO_LABELS: Record<TipoNo, string> = {
  evento_inicio:      'Início do processo',
  tarefa_humana:      'Tarefa — servidor ou cidadão',
  tarefa_automatica:  'Tarefa — sistema automático',
  gateway_decisao:    'Decisão (XOR) — um caminho ou outro',
  gateway_paralelo:   'Divisão paralela (AND) — tarefas simultâneas',
  evento_timer:       'Aguardar prazo / temporizador',
  evento_mensagem:    'Enviar ou receber comunicação',
  subprocesso:        'Subprocesso — grupo de etapas',
  evento_fim:         'Fim do processo',
}

const TIPO_NO_ICONES: Record<TipoNo, string> = {
  evento_inicio:      '▶',
  tarefa_humana:      '👤',
  tarefa_automatica:  '⚙',
  gateway_decisao:    '◇',
  gateway_paralelo:   '◈',
  evento_timer:       '⏱',
  evento_mensagem:    '✉',
  subprocesso:        '⊞',
  evento_fim:         '⏹',
}

const TIPO_NO_CORES: Record<TipoNo, { bg: string; border: string; badge: string; badgeText: string }> = {
  evento_inicio:     { bg: '#f0fdf4', border: '#16a34a', badge: '#16a34a', badgeText: '#fff' },
  tarefa_humana:     { bg: '#eff6ff', border: '#2563eb', badge: '#2563eb', badgeText: '#fff' },
  tarefa_automatica: { bg: '#f8fafc', border: '#64748b', badge: '#64748b', badgeText: '#fff' },
  gateway_decisao:   { bg: '#fffbeb', border: '#d97706', badge: '#d97706', badgeText: '#fff' },
  gateway_paralelo:  { bg: '#f0f9ff', border: '#0284c7', badge: '#0284c7', badgeText: '#fff' },
  evento_timer:      { bg: '#fff7ed', border: '#ea580c', badge: '#ea580c', badgeText: '#fff' },
  evento_mensagem:   { bg: '#fdf4ff', border: '#9333ea', badge: '#9333ea', badgeText: '#fff' },
  subprocesso:       { bg: '#f8fafc', border: '#475569', badge: '#475569', badgeText: '#fff' },
  evento_fim:        { bg: '#fef2f2', border: '#dc2626', badge: '#dc2626', badgeText: '#fff' },
}

const COMUNICACAO_LABELS: Record<TipoComunicacao, string> = {
  despacho:          'Despacho',
  memorando:         'Memorando interno',
  oficio:            'Ofício',
  notificacao:       'Notificação',
  publicacao_dou:    'Publicação no DOU / DOM',
  email_institucional: 'E-mail institucional',
  autuacao:          'Auto de autuação',
  intimacao:         'Intimação',
}

const FIM_LABELS: Record<TipoFim, string> = {
  deferimento:    'Deferimento — pedido aceito',
  indeferimento:  'Indeferimento — pedido negado',
  arquivamento:   'Arquivamento',
  encaminhamento: 'Encaminhamento a outro órgão',
  homologacao:    'Homologação',
  cancelamento:   'Cancelamento',
}

const STATUS_LABELS: Record<StatusProcesso, string> = {
  rascunho:    'Rascunho',
  em_revisao:  'Em revisão',
  aprovado:    'Aprovado',
  em_uso:      'Em uso',
  obsoleto:    'Obsoleto',
}

const STATUS_CORES: Record<StatusProcesso, { bg: string; color: string; border: string }> = {
  rascunho:   { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' },
  em_revisao: { bg: '#fffbeb', color: '#92400e', border: '#fde68a' },
  aprovado:   { bg: '#f0fdf4', color: '#166534', border: '#bbf7d0' },
  em_uso:     { bg: '#eff6ff', color: '#1e40af', border: '#bfdbfe' },
  obsoleto:   { bg: '#f8fafc', color: '#94a3b8', border: '#e2e8f0' },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function noId(): string {
  return `n${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`
}

function noVazio(tipo: TipoNo, ordem: number): No {
  return {
    id: noId(),
    tipo,
    nome: '',
    descricao: '',
    ator: '',
    prazo_dias_uteis: 0,
    base_normativa_id: '',
    base_legal: '',
    documentos_entrada: [],
    documentos_saida: [],
    comunicacao: tipo === 'evento_mensagem' ? { tipo: 'oficio', destinatario: '', assunto: '', template: '' } : null,
    decisao: (tipo === 'gateway_decisao' || tipo === 'gateway_paralelo')
      ? { criterio: '', opcoes: [{ id: noId(), condicao: '', label: 'Sim', proximo_id: '' }, { id: noId(), condicao: '', label: 'Não', proximo_id: '' }] }
      : null,
    tipo_fim: tipo === 'evento_fim' ? 'deferimento' : null,
    prazo_inicio_contagem: '',
    observacoes: '',
    ordem,
  }
}

function processoVazio(): Omit<ProcessoBPMN, 'id' | 'created_at' | 'updated_at'> {
  return {
    nome: '',
    descricao: '',
    area_responsavel: '',
    base_legal: [],
    prazo_total_dias: 0,
    atores: [],
    nos: [
      noVazio('evento_inicio', 0),
      noVazio('evento_fim', 1),
    ],
    status: 'rascunho',
    versao: '1.0',
    observacoes: '',
  }
}

function listToLines(arr: string[]): string {
  return arr.join('\n')
}
function linesToList(str: string): string[] {
  return str.split('\n').map(s => s.trim()).filter(Boolean)
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const s = {
  page:        { padding: '2rem', fontFamily: "'Open Sans', sans-serif", maxWidth: 1100, margin: '0 auto' } as React.CSSProperties,
  header:      { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' } as React.CSSProperties,
  title:       { fontSize: '1.4rem', fontWeight: 700, color: '#f1f5f9', fontFamily: 'Georgia, serif', margin: 0 } as React.CSSProperties,
  subtitle:    { fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.2rem' } as React.CSSProperties,
  btnPrimary:  { background: '#0059B3', color: '#fff', border: 'none', borderRadius: 6, padding: '0.55rem 1.1rem', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' } as React.CSSProperties,
  btnSecondary:{ background: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0', borderRadius: 6, padding: '0.45rem 0.9rem', fontSize: '0.78rem', fontWeight: 500, cursor: 'pointer' } as React.CSSProperties,
  btnDanger:   { background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', borderRadius: 6, padding: '0.35rem 0.7rem', fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer' } as React.CSSProperties,
  btnGhost:    { background: 'transparent', color: '#94a3b8', border: '1px dashed #475569', borderRadius: 6, padding: '0.3rem 0.7rem', fontSize: '0.75rem', cursor: 'pointer' } as React.CSSProperties,
  card:        { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '1.25rem 1.5rem', marginBottom: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' } as React.CSSProperties,
  label:       { display: 'block', fontSize: '0.73rem', fontWeight: 600, color: '#475569', marginBottom: '0.3rem', textTransform: 'uppercase' as const, letterSpacing: '0.04em' } as React.CSSProperties,
  input:       { width: '100%', border: '1px solid #cbd5e1', borderRadius: 5, padding: '0.4rem 0.65rem', fontSize: '0.83rem', color: '#1e293b', background: '#fff', boxSizing: 'border-box' as const } as React.CSSProperties,
  select:      { width: '100%', border: '1px solid #cbd5e1', borderRadius: 5, padding: '0.4rem 0.65rem', fontSize: '0.83rem', color: '#1e293b', background: '#fff', boxSizing: 'border-box' as const } as React.CSSProperties,
  textarea:    { width: '100%', border: '1px solid #cbd5e1', borderRadius: 5, padding: '0.4rem 0.65rem', fontSize: '0.83rem', color: '#1e293b', background: '#fff', boxSizing: 'border-box' as const, resize: 'vertical' as const } as React.CSSProperties,
  field:       { marginBottom: '0.85rem' } as React.CSSProperties,
  grid2:       { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' } as React.CSSProperties,
  grid3:       { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' } as React.CSSProperties,
  divider:     { border: 'none', borderTop: '1px solid #f1f5f9', margin: '1.25rem 0' } as React.CSSProperties,
  sectionLabel:{ fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '0.65rem', display: 'block' } as React.CSSProperties,
  overlay:     { position: 'fixed' as const, inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' } as React.CSSProperties,
  modal:       { background: '#fff', borderRadius: 12, width: '100%', maxWidth: 720, maxHeight: '92vh', overflowY: 'auto' as const, padding: '2rem', boxShadow: '0 20px 50px rgba(0,0,0,0.25)' } as React.CSSProperties,
  modalTitle:  { fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', fontFamily: 'Georgia, serif', margin: '0 0 1.5rem 0' } as React.CSSProperties,
  idBadge:     { fontFamily: 'monospace', fontSize: '0.72rem', color: '#0059B3', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 4, padding: '0.1rem 0.45rem', marginRight: '0.5rem' } as React.CSSProperties,
  emptyState:  { textAlign: 'center' as const, padding: '3rem', color: '#94a3b8', fontSize: '0.9rem' } as React.CSSProperties,
}

// ─── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: StatusProcesso }) {
  const c = STATUS_CORES[status]
  return (
    <span style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}`, borderRadius: 20, padding: '0.15rem 0.6rem', fontSize: '0.72rem', fontWeight: 600 }}>
      {STATUS_LABELS[status]}
    </span>
  )
}

// ─── Formulário de nó ──────────────────────────────────────────────────────────
function NoForm({ no, atores, todos_nos, normas, onChange, onClose }: {
  no: No
  atores: string[]
  todos_nos: No[]
  normas: NormaLegal[]
  onChange: (updated: No) => void
  onClose: () => void
}) {
  const [form, setForm] = useState<No>({ ...no })
  const cor = TIPO_NO_CORES[form.tipo]

  const set = <K extends keyof No>(k: K, v: No[K]) => setForm(f => ({ ...f, [k]: v }))
  const setCom = <K extends keyof Comunicacao>(k: K, v: Comunicacao[K]) =>
    setForm(f => ({ ...f, comunicacao: { ...(f.comunicacao ?? { tipo: 'oficio', destinatario: '', assunto: '', template: '' }), [k]: v } }))
  const setDecisao = (field: 'criterio', v: string) =>
    setForm(f => ({ ...f, decisao: { ...(f.decisao ?? { criterio: '', opcoes: [] }), [field]: v } }))
  const setOpcao = (idx: number, field: keyof OpcaoDecisao, v: string) =>
    setForm(f => {
      const opcoes = [...(f.decisao?.opcoes ?? [])]
      opcoes[idx] = { ...opcoes[idx], [field]: v }
      return { ...f, decisao: { ...(f.decisao ?? { criterio: '', opcoes: [] }), opcoes } }
    })
  const addOpcao = () =>
    setForm(f => ({
      ...f,
      decisao: { ...(f.decisao ?? { criterio: '', opcoes: [] }), opcoes: [...(f.decisao?.opcoes ?? []), { id: noId(), condicao: '', label: '', proximo_id: '' }] }
    }))
  const removeOpcao = (idx: number) =>
    setForm(f => ({ ...f, decisao: { ...(f.decisao ?? { criterio: '', opcoes: [] }), opcoes: (f.decisao?.opcoes ?? []).filter((_, i) => i !== idx) } }))

  const outrosNos = todos_nos.filter(n => n.id !== form.id)

  return (
    <div>
      {/* Tipo + nome */}
      <div style={s.grid2}>
        <div style={s.field}>
          <label style={s.label}>Tipo de elemento</label>
          <select style={s.select} value={form.tipo} onChange={e => set('tipo', e.target.value as TipoNo)}>
            {(Object.entries(TIPO_NO_LABELS) as [TipoNo, string][]).map(([v, l]) => (
              <option key={v} value={v}>{TIPO_NO_ICONES[v]} {l}</option>
            ))}
          </select>
        </div>
        <div style={s.field}>
          <label style={s.label}>Nome desta etapa *</label>
          <input style={s.input} value={form.nome} onChange={e => set('nome', e.target.value)} placeholder="Ex: Triagem do requerimento" />
        </div>
      </div>

      <div style={s.field}>
        <label style={s.label}>O que acontece aqui?</label>
        <textarea style={s.textarea} rows={2} value={form.descricao} onChange={e => set('descricao', e.target.value)} placeholder="Descreva as ações, critérios ou condições desta etapa." />
      </div>

      {/* Responsável + prazo */}
      {!['evento_inicio', 'evento_fim', 'gateway_decisao', 'gateway_paralelo'].includes(form.tipo) && (
        <div style={s.grid3}>
          <div style={s.field}>
            <label style={s.label}>Responsável pela etapa</label>
            <input style={s.input} list="atores-list" value={form.ator} onChange={e => set('ator', e.target.value)} placeholder="Selecionar ou digitar…" />
            <datalist id="atores-list">{atores.map(a => <option key={a} value={a} />)}</datalist>
          </div>
          <div style={s.field}>
            <label style={s.label}>Prazo (dias úteis)</label>
            <input style={s.input} type="number" min={0} value={form.prazo_dias_uteis} onChange={e => set('prazo_dias_uteis', parseInt(e.target.value) || 0)} />
          </div>
          <div style={s.field}>
            <label style={s.label}>Contagem do prazo inicia em</label>
            <input style={s.input} value={form.prazo_inicio_contagem} onChange={e => set('prazo_inicio_contagem', e.target.value)} placeholder="Ex: Protocolo, despacho de abertura…" />
          </div>
        </div>
      )}

      {/* Base legal — norma estruturada + texto livre */}
      {!['evento_inicio', 'gateway_paralelo'].includes(form.tipo) && (
        <>
          <div style={s.grid2}>
            <div style={s.field}>
              <label style={s.label}>Norma do catálogo (base_normativa_id)</label>
              <select style={s.select} value={form.base_normativa_id} onChange={e => set('base_normativa_id', e.target.value)}>
                <option value="">— nenhuma selecionada —</option>
                {normas.filter(n => n.status === 'ativa').map(n => (
                  <option key={n.id} value={n.id}>
                    {n.id} · {n.lei} {n.artigo} — {n.titulo.length > 50 ? n.titulo.slice(0, 50) + '…' : n.titulo}
                  </option>
                ))}
                {normas.filter(n => n.status !== 'ativa').length > 0 && (
                  <optgroup label="── Revogadas / Suspensas ──">
                    {normas.filter(n => n.status !== 'ativa').map(n => (
                      <option key={n.id} value={n.id} style={{ color: '#94a3b8' }}>
                        {n.id} · {n.lei} {n.artigo} [{n.status}]
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
              {form.base_normativa_id && (
                <span style={{ fontSize: '0.68rem', color: '#0059B3', marginTop: '0.2rem', display: 'block' }}>
                  ✓ Vinculado — RN01 (legalidade estrita) verificável pelo motor de regras
                </span>
              )}
            </div>
            <div style={s.field}>
              <label style={s.label}>Descrição da fundamentação (texto livre)</label>
              <input style={s.input} value={form.base_legal} onChange={e => set('base_legal', e.target.value)}
                placeholder="Ex: Prazo de 30 dias para decisão administrativa" />
            </div>
          </div>
        </>
      )}

      {/* Documentos */}
      {!['gateway_decisao', 'gateway_paralelo'].includes(form.tipo) && (
        <div style={s.grid2}>
          <div style={s.field}>
            <label style={s.label}>Documentos ou informações necessários para entrar nesta etapa</label>
            <textarea style={s.textarea} rows={2}
              value={listToLines(form.documentos_entrada)}
              onChange={e => set('documentos_entrada', linesToList(e.target.value))}
              placeholder="Um item por linha. Ex:&#10;Requerimento assinado&#10;Comprovante de endereço" />
          </div>
          <div style={s.field}>
            <label style={s.label}>Documentos ou registros produzidos nesta etapa</label>
            <textarea style={s.textarea} rows={2}
              value={listToLines(form.documentos_saida)}
              onChange={e => set('documentos_saida', linesToList(e.target.value))}
              placeholder="Um item por linha. Ex:&#10;Despacho de triagem&#10;Número de protocolo" />
          </div>
        </div>
      )}

      {/* Comunicação formal */}
      {(form.tipo === 'evento_mensagem' || form.tipo === 'tarefa_humana' || form.tipo === 'tarefa_automatica') && (
        <>
          <hr style={s.divider} />
          <span style={s.sectionLabel}>Comunicação formal emitida nesta etapa</span>
          <div style={{ ...s.card, background: '#fafafa', padding: '1rem' }}>
            <div style={s.grid2}>
              <div style={s.field}>
                <label style={s.label}>Tipo de comunicação</label>
                <select style={s.select} value={form.comunicacao?.tipo ?? 'oficio'}
                  onChange={e => setCom('tipo', e.target.value as TipoComunicacao)}>
                  {(Object.entries(COMUNICACAO_LABELS) as [TipoComunicacao, string][]).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
              <div style={s.field}>
                <label style={s.label}>Destinatário</label>
                <input style={s.input} value={form.comunicacao?.destinatario ?? ''} onChange={e => setCom('destinatario', e.target.value)} placeholder="Ex: Requerente, Departamento Jurídico…" />
              </div>
            </div>
            <div style={s.field}>
              <label style={s.label}>Assunto</label>
              <input style={s.input} value={form.comunicacao?.assunto ?? ''} onChange={e => setCom('assunto', e.target.value)} placeholder="Ex: Solicitação de documentação complementar" />
            </div>
            <div style={s.field}>
              <label style={s.label}>Modelo / Template do texto</label>
              <textarea style={s.textarea} rows={4} value={form.comunicacao?.template ?? ''} onChange={e => setCom('template', e.target.value)}
                placeholder="Escreva aqui o modelo do texto. Use [VARIAVEL] para campos que serão preenchidos automaticamente." />
            </div>
          </div>
        </>
      )}

      {/* Gateway decisão */}
      {form.tipo === 'gateway_decisao' && (
        <>
          <hr style={s.divider} />
          <span style={s.sectionLabel}>Critério de decisão e caminhos possíveis</span>
          <div style={s.field}>
            <label style={s.label}>Pergunta ou critério que orienta a decisão</label>
            <input style={s.input} value={form.decisao?.criterio ?? ''} onChange={e => setDecisao('criterio', e.target.value)}
              placeholder="Ex: A documentação está completa?" />
          </div>
          {(form.decisao?.opcoes ?? []).map((op, idx) => (
            <div key={op.id} style={{ ...s.card, background: '#f8fafc', padding: '0.85rem', marginBottom: '0.5rem' }}>
              <div style={s.grid3}>
                <div style={s.field}>
                  <label style={s.label}>Rótulo da saída {idx + 1}</label>
                  <input style={s.input} value={op.label} onChange={e => setOpcao(idx, 'label', e.target.value)} placeholder="Sim / Não / Parcial…" />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Condição</label>
                  <input style={s.input} value={op.condicao} onChange={e => setOpcao(idx, 'condicao', e.target.value)} placeholder="documentos_completos = true" />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Vai para qual etapa?</label>
                  <select style={s.select} value={op.proximo_id} onChange={e => setOpcao(idx, 'proximo_id', e.target.value)}>
                    <option value="">— selecionar —</option>
                    {outrosNos.map(n => <option key={n.id} value={n.id}>{TIPO_NO_ICONES[n.tipo]} {n.nome || `(sem nome — ${n.id.slice(0, 6)})`}</option>)}
                  </select>
                </div>
              </div>
              {idx >= 2 && (
                <button style={s.btnDanger} onClick={() => removeOpcao(idx)} type="button">Remover esta saída</button>
              )}
            </div>
          ))}
          <button style={s.btnGhost} onClick={addOpcao} type="button">+ Adicionar outro caminho</button>
        </>
      )}

      {/* Gateway paralelo */}
      {form.tipo === 'gateway_paralelo' && (
        <>
          <hr style={s.divider} />
          <span style={s.sectionLabel}>Divisão paralela — tarefas que ocorrem ao mesmo tempo</span>
          <div style={{ ...s.card, background: '#f0f9ff', padding: '1rem' }}>
            <p style={{ fontSize: '0.82rem', color: '#0369a1', margin: 0, lineHeight: 1.6 }}>
              Este elemento divide o fluxo em ramificações paralelas. As tarefas listadas nos caminhos de saída são executadas simultaneamente. O processo só avança quando <strong>todas</strong> as ramificações estiverem concluídas. Configure as saídas na seção de decisão acima ou nas etapas seguintes.
            </p>
          </div>
        </>
      )}

      {/* Evento início */}
      {form.tipo === 'evento_inicio' && (
        <>
          <hr style={s.divider} />
          <span style={s.sectionLabel}>Como este processo é iniciado?</span>
          <div style={s.field}>
            <label style={s.label}>Forma de abertura</label>
            <select style={s.select} value={form.observacoes} onChange={e => set('observacoes', e.target.value)}>
              <option value="">— selecionar —</option>
              <option value="requerimento_cidadao">Requerimento do cidadão — via protocolo</option>
              <option value="ex_officio">Ex officio — por iniciativa do próprio órgão</option>
              <option value="prazo_legal_vencimento">Vencimento de prazo legal previsto em norma</option>
              <option value="denuncia">Denúncia ou representação</option>
              <option value="determinacao_superior">Determinação de autoridade hierárquica superior</option>
              <option value="oficio_externo">Ofício recebido de outro órgão ou instância</option>
              <option value="automatico_sistema">Gatilho automático do sistema</option>
            </select>
          </div>
        </>
      )}

      {/* Evento fim */}
      {form.tipo === 'evento_fim' && (
        <>
          <hr style={s.divider} />
          <span style={s.sectionLabel}>Como este processo termina?</span>
          <div style={s.field}>
            <label style={s.label}>Tipo de conclusão</label>
            <select style={s.select} value={form.tipo_fim ?? 'deferimento'} onChange={e => set('tipo_fim', e.target.value as TipoFim)}>
              {(Object.entries(FIM_LABELS) as [TipoFim, string][]).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
        </>
      )}

      {/* Timer */}
      {form.tipo === 'evento_timer' && (
        <>
          <hr style={s.divider} />
          <span style={s.sectionLabel}>Configuração do temporizador</span>
          <div style={s.grid2}>
            <div style={s.field}>
              <label style={s.label}>Aguardar quantos dias úteis?</label>
              <input style={s.input} type="number" min={0} value={form.prazo_dias_uteis} onChange={e => set('prazo_dias_uteis', parseInt(e.target.value) || 0)} />
            </div>
            <div style={s.field}>
              <label style={s.label}>A partir de quando conta o prazo?</label>
              <input style={s.input} value={form.prazo_inicio_contagem} onChange={e => set('prazo_inicio_contagem', e.target.value)} placeholder="Ex: data do protocolo, data da publicação…" />
            </div>
          </div>
          <div style={s.field}>
            <label style={s.label}>O que acontece quando o prazo vence?</label>
            <input style={s.input} value={form.descricao} onChange={e => set('descricao', e.target.value)} placeholder="Ex: Gera alerta automático, encaminha para arquivamento…" />
          </div>
        </>
      )}

      {/* Observações */}
      <hr style={s.divider} />
      <div style={s.field}>
        <label style={s.label}>Anotações sobre esta etapa</label>
        <textarea style={s.textarea} rows={2} value={form.observacoes} onChange={e => set('observacoes', e.target.value)}
          placeholder="Notas de implementação, exceções, histórico de revisões desta etapa…" />
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
        <button style={s.btnSecondary} onClick={onClose} type="button">Voltar sem salvar</button>
        <button style={s.btnPrimary} onClick={() => { onChange(form); onClose() }} type="button"
          disabled={!form.nome.trim() && form.tipo !== 'evento_inicio' && form.tipo !== 'evento_fim'}>
          Salvar etapa
        </button>
      </div>
    </div>
  )
}

// ─── Card de nó no fluxo ───────────────────────────────────────────────────────
function NoCard({ no, idx, total, onEdit, onDelete, onMoveUp, onMoveDown, onAddAfter }: {
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

// ─── Editor de processo ────────────────────────────────────────────────────────
function ProcessoEditor({
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
            <input style={{ ...s.input, background: '#f8fafc', color: '#64748b' }}
              value={`${totalPrazo} dias úteis`} readOnly />
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
        <div style={s.overlay} onClick={e => { if (e.target === e.currentTarget) setAddAfterIdx(null) }}>
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
        <div style={s.overlay} onClick={e => { if (e.target === e.currentTarget) setEditingNo(null) }}>
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

// ─── Lista de processos ────────────────────────────────────────────────────────
function ProcessoCard({ processo, onEdit }: { processo: ProcessoBPMN; onEdit: () => void }) {
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

// ─── Componente raiz ──────────────────────────────────────────────────────────
export default function BPMNManager({ initialProcessos, normas }: { initialProcessos: ProcessoBPMN[]; normas: NormaLegal[] }) {
  const [processos, setProcessos] = useState<ProcessoBPMN[]>(initialProcessos)
  const [editando, setEditando] = useState<ProcessoBPMN | null>(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

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
      if (!res.ok) throw new Error()
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
      if (!res.ok) throw new Error()
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
    if (!confirm('Tem certeza que deseja excluir este processo? Esta ação não pode ser desfeita.')) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/bpmn', {
        method: 'DELETE',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) throw new Error()
      await refresh()
      setEditando(null)
      showToast('Processo removido.')
    } catch {
      showToast('Não foi possível remover o processo.', 'err')
    } finally {
      setSaving(false)
    }
  }

  // Editor de processo
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
        {toast && (
          <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', background: toast.type === 'ok' ? '#166534' : '#991b1b', color: '#fff', borderRadius: 8, padding: '0.75rem 1.25rem', fontSize: '0.82rem', fontWeight: 600, zIndex: 200, boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
            {toast.msg}
          </div>
        )}
      </>
    )
  }

  // Lista de processos
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
          Clique em <strong>"+ Novo processo"</strong> para modelar o primeiro fluxo administrativo.
        </div>
      ) : (
        processos.map(p => (
          <ProcessoCard key={p.id} processo={p} onEdit={() => setEditando(p)} />
        ))
      )}

      {toast && (
        <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', background: toast.type === 'ok' ? '#166534' : '#991b1b', color: '#fff', borderRadius: 8, padding: '0.75rem 1.25rem', fontSize: '0.82rem', fontWeight: 600, zIndex: 200, boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}
