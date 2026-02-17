export type PersonaId = 'prefeito' | 'procurador' | 'auditor' | 'secretario'

export type CapabilityId = 'assinatura' | 'versionamento' | 'alertas' | 'trilha' | 'exportacao'

export const AXES_LABELS: Record<string, string> = {
  Gestao: 'GESTÃO',
  Planejamento: 'PLANEJ.',
  Assinatura: 'ASSIN.',
  Auditoria: 'AUDIT.',
  Governanca: 'GOVERN.',
  Transparencia: 'TRANSP.',
}

export type Capability = {
  id: CapabilityId
  title: string
  subtitle: string
  icon: string
  axes: Array<keyof typeof AXES_LABELS>
  description: string
}

export const CAPABILITIES: Capability[] = [
  {
    id: 'assinatura',
    title: 'Assinatura Eletrônica',
    subtitle: 'Evolução governada para ICP-Brasil',
    icon: '✦',
    axes: ['Gestao', 'Assinatura', 'Auditoria', 'Governanca'],
    description:
      'Fluxo de assinatura com rastreabilidade completa, evolução progressiva de padrão (simples → avançado → ICP-Brasil) e registro de eventos para auditoria.',
  },
  {
    id: 'versionamento',
    title: 'Versionamento & Integridade',
    subtitle: 'Histórico temporal com verificação criptográfica',
    icon: '⊞',
    axes: ['Gestao', 'Planejamento', 'Assinatura', 'Auditoria', 'Governanca', 'Transparencia'],
    description:
      'Cada versão recebe hash e referência à versão anterior, permitindo detecção de adulteração e reconstrução do contexto de decisão.',
  },
  {
    id: 'alertas',
    title: 'Alertas & Escalonamento',
    subtitle: 'Prazos automáticos com hierarquia definida',
    icon: '◈',
    axes: ['Gestao', 'Planejamento', 'Auditoria', 'Governanca'],
    description:
      'Regras de antecedência e escalonamento para chefia em caso de inação, com registro de notificações e evidência de cumprimento de SLA.',
  },
  {
    id: 'trilha',
    title: 'Trilha de Tramitação',
    subtitle: 'Registro auditável de cada evento do processo',
    icon: '⊸',
    axes: ['Gestao', 'Auditoria', 'Governanca', 'Transparencia'],
    description:
      'Cada ação gera evento com ator e timestamp, preservando a trilha auditável do processo e suportando defensibilidade institucional.',
  },
  {
    id: 'exportacao',
    title: 'Exportação de Evidências',
    subtitle: 'Pacote auditável para TCE, MP e arquivamento',
    icon: '⟳',
    axes: ['Gestao', 'Auditoria', 'Governanca', 'Transparencia'],
    description:
      'Geração de pacote de evidências contendo documentos, metadados e registros necessários para auditoria e instrução, conforme configuração.',
  },
]

export type Persona = {
  id: PersonaId
  label: string
  role: string
  order: CapabilityId[]
  evidences: CapabilityId[]
}

export const PERSONAS: Record<PersonaId, Persona> = {
  prefeito: {
    id: 'prefeito',
    label: 'Prefeito',
    role: 'Decisão política',
    evidences: ['trilha', 'exportacao', 'versionamento', 'alertas'],
    order: ['alertas', 'trilha', 'exportacao', 'versionamento', 'assinatura'],
  },
  procurador: {
    id: 'procurador',
    label: 'Procurador',
    role: 'Conformidade jurídica',
    evidences: ['assinatura', 'versionamento', 'exportacao', 'trilha'],
    order: ['assinatura', 'versionamento', 'exportacao', 'trilha', 'alertas'],
  },
  auditor: {
    id: 'auditor',
    label: 'Controlador / Auditor',
    role: 'Evidência contínua',
    evidences: ['trilha', 'versionamento', 'exportacao'],
    order: ['trilha', 'versionamento', 'exportacao', 'assinatura', 'alertas'],
  },
  secretario: {
    id: 'secretario',
    label: 'Secretário / Operação',
    role: 'Processo e SLA',
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
