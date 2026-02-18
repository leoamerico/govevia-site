export type PersonaId = 'prefeito' | 'procurador' | 'auditor' | 'secretario'

export type CapabilityId = 'assinatura' | 'versionamento' | 'alertas' | 'trilha' | 'exportacao'

export type AxisId = 'gestao' | 'planejamento' | 'assinatura' | 'auditoria' | 'governanca' | 'transparencia'

export const AXES: AxisId[] = ['gestao', 'planejamento', 'assinatura', 'auditoria', 'governanca', 'transparencia']

export type Capability = {
  id: CapabilityId
  icon: string
  axes: AxisId[]
}

export const CAPABILITIES: Capability[] = [
  {
    id: 'assinatura',
    icon: '✦',
    axes: ['gestao', 'assinatura', 'auditoria', 'governanca'],
  },
  {
    id: 'versionamento',
    icon: '⊞',
    axes: ['gestao', 'planejamento', 'assinatura', 'auditoria', 'governanca', 'transparencia'],
  },
  {
    id: 'alertas',
    icon: '◈',
    axes: ['gestao', 'planejamento', 'auditoria', 'governanca'],
  },
  {
    id: 'trilha',
    icon: '⊸',
    axes: ['gestao', 'auditoria', 'governanca', 'transparencia'],
  },
  {
    id: 'exportacao',
    icon: '⟳',
    axes: ['gestao', 'auditoria', 'governanca', 'transparencia'],
  },
]

export type Persona = {
  id: PersonaId
  order: CapabilityId[]
  evidences: CapabilityId[]
}

export const PERSONAS: Record<PersonaId, Persona> = {
  prefeito: {
    id: 'prefeito',
    evidences: ['trilha', 'exportacao', 'versionamento', 'alertas'],
    order: ['alertas', 'trilha', 'exportacao', 'versionamento', 'assinatura'],
  },
  procurador: {
    id: 'procurador',
    evidences: ['assinatura', 'versionamento', 'exportacao', 'trilha'],
    order: ['assinatura', 'versionamento', 'exportacao', 'trilha', 'alertas'],
  },
  auditor: {
    id: 'auditor',
    evidences: ['trilha', 'versionamento', 'exportacao'],
    order: ['trilha', 'versionamento', 'exportacao', 'assinatura', 'alertas'],
  },
  secretario: {
    id: 'secretario',
    evidences: ['alertas', 'trilha', 'versionamento'],
    order: ['alertas', 'versionamento', 'trilha', 'assinatura', 'exportacao'],
  },
}

export function reorderCapabilities(order: CapabilityId[], capabilities = CAPABILITIES) {
  const byId = new Map(capabilities.map((c) => [c.id, c] as const))
  const ordered = order
    .map((id) => byId.get(id))
    .filter((c): c is Capability => Boolean(c))
  const orderedIds = new Set(order)
  const rest = capabilities.filter((c) => !orderedIds.has(c.id))
  return [...ordered, ...rest]
}
