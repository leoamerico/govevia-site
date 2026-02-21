/**
 * dosimetry.service.ts
 *
 * Serviço de dosimetria — aplica a regra vigente na data do fato (GATE-R3).
 * Nunca usa a versão atual; consulta `vigente_de / vigente_ate`.
 *
 * Implementação mínima: o motor de regras real será conectado ao banco
 * via repositório injetável; por ora, opera sobre regras fornecidas em memória.
 */

import { z } from 'zod'

/* ── Schemas Zod ─────────────────────────────────────────────────────── */

export const DosimetryRuleSchema = z.object({
  id: z.string().uuid(),
  dispositivoLegal: z.string().min(1),
  vigenteDe: z.string().datetime(),
  vigenteAte: z.string().datetime().nullable(),
  /** Percentual-base sobre valor do contrato (ex.: 0.02 = 2 %). */
  percentualBase: z.number().min(0).max(1),
  /** Multiplicador por gravidade (leve=1, média=2, grave=3). */
  multiplicadorGravidade: z.record(z.enum(['leve', 'media', 'grave']), z.number()),
})

export type DosimetryRule = z.infer<typeof DosimetryRuleSchema>

export interface DosimetryInput {
  dataFato: string
  valorContrato: number
  gravidade: 'leve' | 'media' | 'grave'
}

export interface DosimetryResult {
  ruleId: string
  dispositivoLegal: string
  vigenteDe: string
  vigenteAte: string | null
  valorMulta: number
  formula: string
}

/* ── Repository contract ─────────────────────────────────────────────── */

export interface DosimetryRuleRepository {
  findVigenteNaData(dataFato: string): Promise<DosimetryRule | null>
}

/* ── Service ─────────────────────────────────────────────────────────── */

export class DosimetryService {
  constructor(private readonly ruleRepo: DosimetryRuleRepository) {}

  async calcular(input: DosimetryInput): Promise<DosimetryResult> {
    const rule = await this.ruleRepo.findVigenteNaData(input.dataFato)

    if (!rule) {
      throw new Error(
        `GATE-R3: nenhuma regra de dosimetria vigente em ${input.dataFato}`,
      )
    }

    const multiplicador = rule.multiplicadorGravidade[input.gravidade]
    if (multiplicador === undefined) {
      throw new Error(
        `GATE-R3: gravidade '${input.gravidade}' sem multiplicador na regra ${rule.id}`,
      )
    }

    const valorMulta = input.valorContrato * rule.percentualBase * multiplicador

    return {
      ruleId: rule.id,
      dispositivoLegal: rule.dispositivoLegal,
      vigenteDe: rule.vigenteDe,
      vigenteAte: rule.vigenteAte,
      valorMulta: Math.round(valorMulta * 100) / 100,
      formula: `${input.valorContrato} × ${rule.percentualBase} × ${multiplicador} (${input.gravidade})`,
    }
  }
}
