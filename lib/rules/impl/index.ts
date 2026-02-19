/**
 * lib/rules/impl/index.ts
 *
 * Implementações determinísticas das Regras Institucionais (RN01..RN05).
 * Cada função recebe um payload arbitrário e retorna um PureResult.
 * Sem IA, sem DSL externo — lógica auditável e testável.
 *
 * INVARIANTE: toda função exportada aqui DEVE estar referenciada como
 * engine_ref em envneo/control-plane/core/institutional-rules.yaml.
 * Gate gate-impl-registered.mjs bloqueia qualquer exportação não registrada.
 */

export interface RuleResult {
  result: 'PASS' | 'FAIL'
  violations: string[]
  evidence: Record<string, unknown>
}

type Payload = Record<string, unknown>

function pass(evidence: Record<string, unknown> = {}): RuleResult {
  return { result: 'PASS', violations: [], evidence }
}

function fail(violations: string[], evidence: Record<string, unknown> = {}): RuleResult {
  return { result: 'FAIL', violations, evidence }
}

// ─── RN01 — Legalidade Estrita ────────────────────────────────────────────────
// CF/88 Art. 37 — todo ato deve ter base normativa identificável.
export function rn01_legalidade_estrita(payload: Payload): RuleResult {
  const v = payload['base_normativa_id']
  if (v === undefined || v === null || String(v).trim() === '') {
    return fail(
      ['base_normativa_id é obrigatório — CF/88 Art. 37: ato sem base normativa é inválido.'],
      { base_normativa_id: null }
    )
  }
  return pass({ base_normativa_id: String(v).slice(0, 80) })
}

// ─── RN02 — Responsabilidade Solidária ────────────────────────────────────────
// CF/88 Art. 74 §1º — irregularidade registrada deve ter encaminhamento ao controle externo.
export function rn02_responsabilidade_solidaria_trigger(payload: Payload): RuleResult {
  const irregular = payload['status_irregularidade']
  const isIrregular = irregular === true || irregular === 'true' || irregular === 1
  if (!isIrregular) {
    return pass({ status_irregularidade: irregular ?? false })
  }
  const ref = payload['controle_externo_event_ref']
  if (!ref || String(ref).trim() === '') {
    return fail(
      ['status_irregularidade=true exige controle_externo_event_ref preenchido (CF/88 Art. 74 §1º): evidência de encaminhamento obrigatória.'],
      { status_irregularidade: true, controle_externo_event_ref: null }
    )
  }
  return pass({
    status_irregularidade: true,
    controle_externo_event_ref: String(ref).slice(0, 100),
  })
}

// ─── RN03 — Segregação de Funções ─────────────────────────────────────────────
// Princípio de controle interno — quem registra não pode auditar o mesmo ato.
export function rn03_segregacao_de_funcoes(payload: Payload): RuleResult {
  const reg = payload['usuario_registra_id']
  const aud = payload['usuario_audita_id']
  if (reg === undefined || reg === null || String(reg).trim() === '') {
    return fail(['usuario_registra_id é obrigatório para verificação de segregação de funções.'], { usuario_registra_id: null })
  }
  if (aud === undefined || aud === null || String(aud).trim() === '') {
    return fail(['usuario_audita_id é obrigatório para verificação de segregação de funções.'], { usuario_audita_id: null })
  }
  if (String(reg).trim() === String(aud).trim()) {
    return fail(
      [`usuario_registra_id e usuario_audita_id são iguais ("${reg}") — segregação de funções violada (conflito de interesse).`],
      { same_user: true }
    )
  }
  return pass({ segregated: true })
}

// ─── RN04 — Classificação de Sigilo + Mascaramento ────────────────────────────
// LAI (Lei 12.527/2011) + LGPD (Lei 13.709/2018).
// Se contem_dados_pessoais=true, campos_sensiveis devem estar mascarados em public_payload.
export function rn04_classificacao_sigilo_mascaramento(payload: Payload): RuleResult {
  const hasPII =
    payload['contem_dados_pessoais'] === true ||
    payload['contem_dados_pessoais'] === 'true' ||
    payload['contem_dados_pessoais'] === 1
  if (!hasPII) {
    return pass({ contem_dados_pessoais: false })
  }
  const sensitive: string[] = Array.isArray(payload['campos_sensiveis'])
    ? (payload['campos_sensiveis'] as string[])
    : typeof payload['campos_sensiveis'] === 'string' && payload['campos_sensiveis'].trim() !== ''
    ? String(payload['campos_sensiveis']).split(',').map((s) => s.trim())
    : []
  if (sensitive.length === 0) {
    return fail(
      ['contem_dados_pessoais=true mas campos_sensiveis está vazio — não é possível verificar mascaramento (LGPD Art. 46).'],
      { contem_dados_pessoais: true, campos_sensiveis: [] }
    )
  }
  const pub = (payload['public_payload'] !== undefined && typeof payload['public_payload'] === 'object'
    ? payload['public_payload']
    : {}) as Record<string, unknown>
  const exposed: string[] = []
  for (const field of sensitive) {
    const val = pub[field]
    if (val !== undefined && val !== null && val !== '***' && val !== '[REDACTED]') {
      exposed.push(field)
    }
  }
  if (exposed.length > 0) {
    return fail(
      [`Campos sensíveis expostos sem mascaramento em public_payload: ${exposed.join(', ')} — mascaramento obrigatório (LGPD/LAI).`],
      { exposed_fields: exposed, total_sensitive: sensitive.length }
    )
  }
  return pass({ contem_dados_pessoais: true, campos_mascarados: sensitive.length })
}

// ─── RN05 — Limite de Gasto com Pessoal (LRF) ────────────────────────────────
// LC 101/2000 Art. 19 — limite prudencial: 95% do limite legal (60% da RCL → alerta ≥ 57%).
// Implementação conservadora: alerta a partir de 60% (limite pleno).
export function rn05_limite_gasto_lrf_prudencial(payload: Payload): RuleResult {
  if (payload['tipo_gasto'] !== 'PESSOAL') {
    return pass({ tipo_gasto: payload['tipo_gasto'] ?? null, rn05: 'inaplicável — tipo_gasto ≠ PESSOAL' })
  }
  const val = Number(payload['valor_declarado'])
  const rcl = Number(payload['rcl_valor'])
  if (isNaN(val) || isNaN(rcl)) {
    return fail(
      ['valor_declarado e rcl_valor devem ser valores numéricos para aplicar o limite LRF.'],
      { valor_declarado: payload['valor_declarado'], rcl_valor: payload['rcl_valor'] }
    )
  }
  if (rcl <= 0) {
    return fail(['rcl_valor deve ser positivo (Receita Corrente Líquida > 0).'], { rcl_valor: rcl })
  }
  const ratio = val / rcl
  const limite = 0.6
  if (ratio > limite) {
    return fail(
      [
        `LIMITE_PRUDENCIAL: gasto com pessoal (${(ratio * 100).toFixed(2)}% da RCL) excede o limite de 60% (LC 101/2000 Art. 19).`,
      ],
      { ratio_pct: parseFloat((ratio * 100).toFixed(4)), limite_pct: 60 }
    )
  }
  return pass({ ratio_pct: parseFloat((ratio * 100).toFixed(4)), limite_pct: 60 })
}
