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

export const CAPABILITIES: Array<{
  id: CapabilityId
  title: string
  subtitle: string
  icon: string
  axes: Array<keyof typeof AXES_LABELS>
  personas: PersonaId[]
  description: string
}> = [
  {
    id: 'assinatura',
    title: 'Assinatura Eletrônica',
    subtitle: 'Evolução governada para ICP-Brasil',
    icon: '✦',
    axes: ['Gestao', 'Assinatura', 'Auditoria', 'Governanca'],
    personas: ['procurador', 'auditor', 'prefeito'],
    description:
      'Fluxo de assinatura com rastreabilidade completa, evolução progressiva de padrão (simples → avançado → ICP-Brasil) e registro de eventos para auditoria.',
  },
  {
    id: 'versionamento',
    title: 'Versionamento & Integridade',
    subtitle: 'Histórico temporal com verificação criptográfica',
    icon: '⊞',
    axes: ['Gestao', 'Planejamento', 'Assinatura', 'Auditoria', 'Governanca', 'Transparencia'],
    personas: ['auditor', 'procurador', 'secretario'],
    description:
      'Cada versão recebe hash e referência à versão anterior, permitindo detecção de adulteração e reconstrução do contexto de decisão.',
  },
  {
    id: 'alertas',
    title: 'Alertas & Escalonamento',
    subtitle: 'Prazos automáticos com hierarquia definida',
    icon: '◈',
    axes: ['Gestao', 'Planejamento', 'Auditoria', 'Governanca'],
    personas: ['secretario', 'prefeito', 'procurador'],
    description:
      'Regras de antecedência e escalonamento para chefia em caso de inação, com registro de notificações e evidência de cumprimento de SLA.',
  },
  {
    id: 'trilha',
    title: 'Trilha de Tramitação',
    subtitle: 'Registro auditável de cada evento do processo',
    icon: '⊸',
    axes: ['Gestao', 'Auditoria', 'Governanca', 'Transparencia'],
    personas: ['auditor', 'procurador', 'prefeito'],
    description:
      'Cada ação gera evento com ator e timestamp, preservando a trilha auditável do processo e suportando defensibilidade institucional.',
  },
  {
    id: 'exportacao',
    title: 'Exportação de Evidências',
    subtitle: 'Pacote auditável para TCE, MP e arquivamento',
    icon: '⟳',
    axes: ['Gestao', 'Auditoria', 'Governanca', 'Transparencia'],
    personas: ['auditor', 'procurador', 'prefeito'],
    description:
      'Geração de pacote de evidências contendo documentos, metadados e registros necessários para auditoria e instrução, conforme configuração.',
  },
]

export const PERSONAS: Record<PersonaId, {
  id: PersonaId
  label: string
  role: string
  dor: string
  risco: string
  resultado: string
  evidencias: CapabilityId[]
  order: CapabilityId[]
  cta: {
    label: string
    href: string
    text: string
  }
}> = {
  prefeito: {
    id: 'prefeito',
    label: 'Prefeito',
    role: 'Decisão política',
    dor: 'Não virar manchete. Previsibilidade pública.',
    risco: 'Falhas de prazo, assinatura e evidência virando crise política.',
    resultado: 'Entrega pública com prestação de contas e redução de incidentes.',
    evidencias: ['trilha', 'exportacao', 'versionamento', 'alertas'],
    order: ['alertas', 'trilha', 'exportacao', 'versionamento', 'assinatura'],
    cta: {
      label: 'Agendar conversa executiva',
      href: '/contato?context=prefeito',
      text: 'Solicite uma conversa executiva com foco em risco institucional, prazos e evidências exigidas.',
    },
  },
  procurador: {
    id: 'procurador',
    label: 'Procurador',
    role: 'Conformidade jurídica',
    dor: 'Responsabilização e contestação por MP, TCE e Judiciário.',
    risco: 'Nulidade, fragilidade probatória e assinatura inadequada.',
    resultado: 'Defensibilidade em ação/TC e conformidade verificável.',
    evidencias: ['assinatura', 'versionamento', 'exportacao', 'trilha'],
    order: ['assinatura', 'versionamento', 'exportacao', 'trilha', 'alertas'],
    cta: {
      label: 'Solicitar pacote de conformidade',
      href: '/contato?context=procurador',
      text: 'Solicite um pacote de conformidade com matriz de evidências e limites/condições aplicáveis ao seu cenário.',
    },
  },
  auditor: {
    id: 'auditor',
    label: 'Controlador / Auditor',
    role: 'Evidência contínua',
    dor: 'Auditoria vira “caça ao papel”. Dados sem integridade.',
    risco: 'Sem logs contínuos, sem reprodutibilidade, sem achado resolvido.',
    resultado: 'Auditoria contínua e redução de achados recorrentes.',
    evidencias: ['trilha', 'versionamento', 'exportacao'],
    order: ['trilha', 'versionamento', 'exportacao', 'assinatura', 'alertas'],
    cta: {
      label: 'Solicitar matriz de evidências',
      href: '/contato?context=auditor',
      text: 'Solicite uma matriz de evidências por requisito e trilhas auditáveis necessárias para auditoria e controle interno.',
    },
  },
  secretario: {
    id: 'secretario',
    label: 'Secretário / Operação',
    role: 'Processo e SLA',
    dor: 'Fila, atraso, retrabalho, baixa adesão e cobrança por prazo.',
    risco: 'Alertas falhando, fluxo quebrando e equipe abandonando o sistema.',
    resultado: 'Produtividade, redução de tramitação e previsibilidade.',
    evidencias: ['alertas', 'trilha', 'versionamento'],
    order: ['alertas', 'versionamento', 'trilha', 'assinatura', 'exportacao'],
    cta: {
      label: 'Agendar avaliação operacional',
      href: '/contato?context=secretario',
      text: 'Agende uma avaliação operacional com foco em SLA, alertas, fluxo e evidência mínima para operação do órgão.',
    },
  },
}
