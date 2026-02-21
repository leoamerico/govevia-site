/**
 * @module @govevia/org-profile — tipos canônicos
 *
 * OrgProfile é o "passaporte institucional" de um órgão dentro do Govevia.
 * Nenhuma rota de domínio pode ser acessada enquanto o perfil não estiver
 * Confirmed (dual-secretary, 48 h TTL) — esta é a promessa do GATE-R5.
 */

export enum OrgProfileStatus {
  /** Perfil criado, aguardando primeira confirmação. */
  Pending = 'pending',

  /** Primeiro secretário confirmou — aguardando segundo (dual-secretary). */
  AwaitingConfirmation = 'awaiting_confirmation',

  /** Ambos os secretários confirmaram dentro do TTL de 48 h. */
  Confirmed = 'confirmed',

  /** TTL de 48 h expirou antes da confirmação dupla. */
  Expired = 'expired',
}

/** Perfil institucional de um órgão (tenant). */
export interface OrgProfile {
  tenantId: string
  legalName: string
  cnpj: string
  status: OrgProfileStatus
  confirmedBy: string | null
  secondConfirmedBy: string | null
  confirmedAt: string | null
  createdAt: string
  /** ISO-8601. Se ultrapassada, o status deve ser tratado como Expired. */
  expiresAt: string
}

/**
 * Contrato de leitura — qualquer adapter (Pg, in-memory, Redis)
 * deve implementar esta interface para ser plugável no GATE-R5.
 */
export interface OrgProfileRepository {
  findByTenantId(tenantId: string): Promise<OrgProfile | null>
}
