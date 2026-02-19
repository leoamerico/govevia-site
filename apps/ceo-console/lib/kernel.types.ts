/**
 * Tipos espelhando os DTOs do Govevia Kernel (Spring Boot).
 * NÃO alterar sem sincronizar com o domínio Java correspondente.
 */

export type WorkItemState = 'OPEN' | 'CLOSED'
export type EnforcementMode = 'AUDIT' | 'WARN' | 'BLOCK'

export interface WorkItemDto {
  id: string              // UUID
  source: string          // "github" | "govevia"
  repo: string
  issueNumber: number
  title: string
  state: WorkItemState
  labels: string[]
  area: string | null     // derivado da label "area/*"
  ownerAccountable: string | null
  createdAt: string       // ISO-8601
  updatedAt: string | null
  closedAt: string | null
}

export interface KernelStubResponse {
  stub: true
  message: string
}

export function isStub(v: unknown): v is KernelStubResponse {
  return typeof v === 'object' && v !== null && 'stub' in v
}
