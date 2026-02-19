/**
 * components/bpmn/bpmn.types.ts
 * Types, constants and pure helpers for the BPMN process manager.
 * No React — importable from server and client components alike.
 */

// ─── Tipos ────────────────────────────────────────────────────────────────────

/** Subconjunto de NormaLegal necessário para o picker — carregado SSR */
export interface NormaLegal {
  id: string        // ex: NRM-2026-001
  titulo: string
  lei: string
  artigo: string
  status: 'ativa' | 'revogada' | 'suspensa'
}

export type TipoNo =
  | 'evento_inicio'
  | 'tarefa_humana'
  | 'tarefa_automatica'
  | 'gateway_decisao'
  | 'gateway_paralelo'
  | 'evento_timer'
  | 'evento_mensagem'
  | 'subprocesso'
  | 'evento_fim'

export type TipoComunicacao =
  | 'despacho'
  | 'memorando'
  | 'oficio'
  | 'notificacao'
  | 'publicacao_dou'
  | 'email_institucional'
  | 'autuacao'
  | 'intimacao'

export type TipoFim =
  | 'deferimento'
  | 'indeferimento'
  | 'arquivamento'
  | 'encaminhamento'
  | 'homologacao'
  | 'cancelamento'

export type StatusProcesso = 'rascunho' | 'em_revisao' | 'aprovado' | 'em_uso' | 'obsoleto'

export interface Comunicacao {
  tipo: TipoComunicacao
  destinatario: string
  assunto: string
  template: string
}

export interface OpcaoDecisao {
  id: string
  condicao: string
  label: string
  proximo_id: string
}

export interface No {
  id: string
  tipo: TipoNo
  nome: string
  descricao: string
  ator: string
  prazo_dias_uteis: number
  base_normativa_id: string
  base_legal: string
  documentos_entrada: string[]
  documentos_saida: string[]
  comunicacao: Comunicacao | null
  decisao: { criterio: string; opcoes: OpcaoDecisao[] } | null
  tipo_fim: TipoFim | null
  prazo_inicio_contagem: string
  observacoes: string
  ordem: number
}

export interface ProcessoBPMN {
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

export const TIPO_NO_LABELS: Record<TipoNo, string> = {
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

export const TIPO_NO_ICONES: Record<TipoNo, string> = {
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

export const TIPO_NO_CORES: Record<TipoNo, { bg: string; border: string; badge: string; badgeText: string }> = {
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

export const COMUNICACAO_LABELS: Record<TipoComunicacao, string> = {
  despacho:            'Despacho',
  memorando:           'Memorando interno',
  oficio:              'Ofício',
  notificacao:         'Notificação',
  publicacao_dou:      'Publicação no DOU / DOM',
  email_institucional: 'E-mail institucional',
  autuacao:            'Auto de autuação',
  intimacao:           'Intimação',
}

export const FIM_LABELS: Record<TipoFim, string> = {
  deferimento:    'Deferimento — pedido aceito',
  indeferimento:  'Indeferimento — pedido negado',
  arquivamento:   'Arquivamento',
  encaminhamento: 'Encaminhamento a outro órgão',
  homologacao:    'Homologação',
  cancelamento:   'Cancelamento',
}

export const STATUS_LABELS: Record<StatusProcesso, string> = {
  rascunho:   'Rascunho',
  em_revisao: 'Em revisão',
  aprovado:   'Aprovado',
  em_uso:     'Em uso',
  obsoleto:   'Obsoleto',
}

export const STATUS_CORES: Record<StatusProcesso, { bg: string; color: string; border: string }> = {
  rascunho:   { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' },
  em_revisao: { bg: '#fffbeb', color: '#92400e', border: '#fde68a' },
  aprovado:   { bg: '#f0fdf4', color: '#166534', border: '#bbf7d0' },
  em_uso:     { bg: '#eff6ff', color: '#1e40af', border: '#bfdbfe' },
  obsoleto:   { bg: '#f8fafc', color: '#94a3b8', border: '#e2e8f0' },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function noId(): string {
  return `n${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`
}

export function noVazio(tipo: TipoNo, ordem: number): No {
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
    comunicacao: tipo === 'evento_mensagem'
      ? { tipo: 'oficio', destinatario: '', assunto: '', template: '' }
      : null,
    decisao: (tipo === 'gateway_decisao' || tipo === 'gateway_paralelo')
      ? { criterio: '', opcoes: [
          { id: noId(), condicao: '', label: 'Sim', proximo_id: '' },
          { id: noId(), condicao: '', label: 'Não', proximo_id: '' },
        ] }
      : null,
    tipo_fim: tipo === 'evento_fim' ? 'deferimento' : null,
    prazo_inicio_contagem: '',
    observacoes: '',
    ordem,
  }
}

export function processoVazio(): Omit<ProcessoBPMN, 'id' | 'created_at' | 'updated_at'> {
  return {
    nome: '',
    descricao: '',
    area_responsavel: '',
    base_legal: [],
    prazo_total_dias: 0,
    atores: [],
    nos: [noVazio('evento_inicio', 0), noVazio('evento_fim', 1)],
    status: 'rascunho',
    versao: '1.0',
    observacoes: '',
  }
}

export function listToLines(arr: string[]): string {
  return arr.join('\n')
}

export function linesToList(str: string): string[] {
  return str.split('\n').map(s => s.trim()).filter(Boolean)
}
