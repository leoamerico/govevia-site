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
  icon: string
  subtitle: string
  dor: string
  risco: string
  resultado: string
  seoTitle: string
  seoDescription: string
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
    icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
    subtitle: 'Governança, prazos e prestação de contas',
    dor: 'Não virar manchete. Previsibilidade pública.',
    risco: 'Falhas de prazo, assinatura e evidência virando crise política.',
    resultado: 'Entrega pública com prestação de contas e redução de incidentes.',
    seoTitle: 'Govevia para Prefeitos | Governança e Redução de Risco Institucional',
    seoDescription: 'Ferramentas de governança executável para Prefeitos. Garanta previsibilidade pública, controle de prazos e defensibilidade política com evidência real.',
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
    icon: 'M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3',
    subtitle: 'Defensibilidade jurídica e conformidade',
    dor: 'Responsabilização e contestação por MP, TCE e Judiciário.',
    risco: 'Nulidade, fragilidade probatória e assinatura adequada.',
    resultado: 'Defensibilidade em ação/TC e conformidade verificável.',
    seoTitle: 'Govevia para Procuradores | Defensibilidade Jurídica e Conformidade',
    seoDescription: 'Proteja a administração pública com evidência probatória robusta. Gestão de conformidade para Procuradores Municipais com foco em defensibilidade técnica.',
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
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    subtitle: 'Trilha auditável e evidência contínua',
    dor: 'Auditoria vira "caça ao papel". Dados sem integridade.',
    risco: 'Sem logs contínuos, sem reprodutibilidade, sem achado resolvido.',
    resultado: 'Auditoria contínua e redução de achados recorrentes.',
    seoTitle: 'Govevia para Auditores | Trilha Auditável e Integridade de Dados',
    seoDescription: 'Transforme auditoria em um processo contínuo e automatizado. Garanta integridade de dados e conformidade normativa com trilhas auditáveis nativas.',
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
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
    subtitle: 'Produtividade, SLA e fluxo operacional',
    dor: 'Fila, atraso, retrabalho, baixa adesão e cobrança por prazo.',
    risco: 'Alertas falhando, fluxo quebrando e equipe abandonando o sistema.',
    resultado: 'Produtividade, redução de tramitação e previsibilidade.',
    seoTitle: 'Govevia para Secretários | Eficiência Operacional e Gestão de Prazos',
    seoDescription: 'Otimize a operação municipal com fluxos automatizados e alertas inteligentes. Reduza filas e aumente a produtividade da sua secretaria.',
    evidencias: ['alertas', 'trilha', 'versionamento'],
    order: ['alertas', 'versionamento', 'trilha', 'assinatura', 'exportacao'],
    cta: {
      label: 'Agendar avaliação operacional',
      href: '/contato?context=secretario',
      text: 'Agende uma avaliação operacional com foco em SLA, alertas, fluxo e evidência mínima para operação do órgão.',
    },
  },
}

