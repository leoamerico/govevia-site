'use client'

import { useState } from 'react'
import { tokens as s } from '@/components/ui'
import {
  type No, type NormaLegal, type TipoNo, type TipoComunicacao, type TipoFim, type OpcaoDecisao,
  type StatusProcesso,
  TIPO_NO_LABELS, TIPO_NO_ICONES, COMUNICACAO_LABELS, FIM_LABELS, STATUS_LABELS, STATUS_CORES,
  noId, listToLines, linesToList,
} from './bpmn.types'

// ─── StatusBadge ──────────────────────────────────────────────────────────────

export function StatusBadge({ status }: { status: StatusProcesso }) {
  const c = STATUS_CORES[status]
  return (
    <span style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}`, borderRadius: 20, padding: '0.15rem 0.6rem', fontSize: '0.72rem', fontWeight: 600 }}>
      {STATUS_LABELS[status]}
    </span>
  )
}

// ─── NoForm ───────────────────────────────────────────────────────────────────

export function NoForm({ no, atores, todos_nos, normas, onChange, onClose }: {
  no: No
  atores: string[]
  todos_nos: No[]
  normas: NormaLegal[]
  onChange: (updated: No) => void
  onClose: () => void
}) {
  const [form, setForm] = useState<No>({ ...no })

  const set = <K extends keyof No>(k: K, v: No[K]) => setForm(f => ({ ...f, [k]: v }))
  const setCom = <K extends keyof { tipo: TipoComunicacao; destinatario: string; assunto: string; template: string }>(k: K, v: string) =>
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
      decisao: {
        ...(f.decisao ?? { criterio: '', opcoes: [] }),
        opcoes: [...(f.decisao?.opcoes ?? []), { id: noId(), condicao: '', label: '', proximo_id: '' }],
      },
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

      {/* Base legal */}
      {!['evento_inicio', 'gateway_paralelo'].includes(form.tipo) && (
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
                  onChange={e => setCom('tipo', e.target.value)}>
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
              Este elemento divide o fluxo em ramificações paralelas. As tarefas listadas nos caminhos de saída são executadas simultaneamente. O processo só avança quando <strong>todas</strong> as ramificações estiverem concluídas.
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
        <button
          style={s.btnPrimary}
          onClick={() => { onChange(form); onClose() }}
          type="button"
          disabled={!form.nome.trim() && form.tipo !== 'evento_inicio' && form.tipo !== 'evento_fim'}
        >
          Salvar etapa
        </button>
      </div>
    </div>
  )
}
