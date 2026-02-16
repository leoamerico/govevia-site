'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

interface Module {
  id: string
  title: string
  subtitle: string
  functional: string
  normative: string
  enforcement: string
  legalBasis: string[]
  technicalFeatures: string[]
  icon: JSX.Element
}

export default function ModulesDetail() {
  const [activeModule, setActiveModule] = useState<string>('processos')

  const modules: Module[] = [
    {
      id: 'processos',
      title: 'Gestão de Processos Administrativos',
      subtitle: 'Tramitação digital com enforcement de prazos e competências',
      functional: 'Permite criação, tramitação, despacho e arquivamento de processos administrativos com apoio a prazos e requisitos procedimentais, validação de competências e rastreabilidade de documentos, conforme configuração e integração no órgão.',
      normative: 'Implementa controles técnicos alinhados a requisitos recorrentes de processo administrativo (prazos, publicidade, fundamentação e competência) e a práticas de tramitação digital. O objetivo é reduzir risco e produzir evidência operacional para auditoria.',
      enforcement: 'O módulo é desenhado para suportar controles de fluxo (ex.: checagem de competência configurada, exigência de assinatura conforme política institucional e registro de justificativas). A aplicação efetiva de bloqueios e trilhas auditáveis depende de implementação e configuração no ambiente do órgão.',
      legalBasis: [
        'Lei 9.784/99 - Arts. 2º, 22, 24, 29, 38, 49 e 59',
        'Lei 14.129/2021 - Arts. 3º, 4º e 5º',
        'LGPD - Arts. 37 a 41 (Relatório de Impacto)',
      ],
      technicalFeatures: [
        'Integração com assinatura eletrônica (evolução governada para ICP-Brasil)',
        'Planejado: versionamento temporal de documentos (quando aplicável) com mecanismos de verificação de integridade.',
        'Alertas automáticos de prazos com escalonamento hierárquico',
        'Registro de eventos de tramitação com trilha auditável',
        'Exportação de processos e evidências para auditoria e arquivamento',
      ],
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      id: 'urbanismo',
      title: 'Planejamento Urbano e Conformidade Urbanística',
      subtitle: 'Regras do Plano Diretor como código executável',
      functional: 'Permite consulta de viabilidade de construção, análise de projetos, emissão de alvarás e habite-se com verificação automatizada de conformidade com Plano Diretor, Código de Obras e legislação urbanística vigente.',
      normative: 'Implementa os parâmetros do Plano Diretor Municipal (coeficientes de aproveitamento, taxas de ocupação e permeabilidade, recuos, gabaritos) e do Código de Obras como restrições técnicas. Cada consulta de viabilidade verifica automaticamente todos os parâmetros aplicáveis ao lote.',
      enforcement: 'O módulo é desenhado para suportar validações de conformidade urbanística (Plano Diretor/Código de Obras) e versionamento temporal de parâmetros, quando implementado e configurado. Isso reduz risco operacional e melhora rastreabilidade, mas depende de integração de dados (cadastro/lote/SIG) e configuração institucional.',
      legalBasis: [
        'Estatuto da Cidade (Lei 10.257/2001) - Arts. 39 a 42',
        'Lei 9.784/99 - Arts. 22 e 50',
        'Código Civil - Art. 1.299 (direito de vizinhança)',
      ],
      technicalFeatures: [
        'Sistema de Informação Geográfica (SIG) integrado',
        'Cálculo automático de parâmetros urbanísticos por lote',
        'Versionamento temporal do Plano Diretor e Código de Obras',
        'Consulta histórica: "sob qual regra este alvará foi emitido?"',
        'Integração com matrícula do imóvel (INCRA/Cartório)',
      ],
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      id: 'assinatura',
      title: 'Assinatura Digital',
      subtitle: 'Assinatura eletrônica com evolução governada',
      functional: 'Integra assinatura eletrônica para atos e documentos, com trilha de evidência e validações conforme políticas institucionais. Prevê evolução governada de requisitos de assinatura, conforme tipologia do ato e políticas institucionais. Integrações específicas (incluindo ICP-Brasil, quando aplicável) dependem de escopo e implementação.',
      normative: 'Alinha-se a requisitos legais aplicáveis (assinaturas eletrônicas, governo digital e regras internas). A política de níveis e exigências por tipo de ato é governada institucionalmente e evolui com evidência.',
      enforcement: 'O módulo é desenhado para suportar validações e controles preventivos (ex.: exigência de assinatura conforme política institucional, checagens de competência quando configuradas e registro de versões), conforme implementação e configuração no órgão.',
      legalBasis: [
        'MP 2.200-2/2001 - Art. 10 (validade jurídica)',
        'Lei 14.063/2020 - Arts. 4º a 6º (níveis de assinatura)',
        'Lei 14.129/2021 - Art. 5º (governo digital)',
      ],
      technicalFeatures: [
        'Validação de assinatura conforme política institucional',
        'Registro de evidência do documento + assinatura + contexto',
        'Exportação de pacote de evidência para auditoria',
        'Evolução governada para ICP-Brasil conforme escopo e tipologia',
      ],
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      id: 'auditoria',
      title: 'Auditoria e Trilha de Evidências',
      subtitle: 'Trilha auditável com evidência verificável',
      functional: 'Gera trilha de auditoria de atos administrativos praticados no sistema, com registro de quem praticou, o quê foi praticado, com base em qual regra, sob qual versão normativa, e quando. Permite exportação estruturada para auditoria.',
      normative: 'Implementa controles de rastreabilidade e evidência alinhados a boas práticas de auditoria e controle, com foco em reprodutibilidade e consistência de registros.',
      enforcement: 'O sistema aplica controles para preservar trilha auditável e integridade de registros, com mecanismos de evidência e versionamento que permitem detecção de adulteração e reconstrução de contexto.',
      legalBasis: [
        'Lei 8.443/92 - Arts. 38 e 39 (competências do TCU)',
        'Decisão Normativa TCU 170/2018 (auditoria de TI)',
        'LGPD - Art. 37 (relatório de impacto)',
      ],
      technicalFeatures: [
        'Planejado: registro de eventos com mecanismos de integridade e trilha de auditoria, conforme requisitos do órgão.',
        'Carimbo de tempo quando aplicável',
        'Exportação em formatos estruturados para auditoria',
        'Dashboard de auditoria com filtros por agente, tipo de ato, período',
        'Geração de relatórios para auditoria e controle interno',
      ],
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
    },
    {
      id: 'lgpd',
      title: 'Governança de Dados e LGPD',
      subtitle: 'Conformidade por arquitetura, não por configuração',
      functional: 'Gerencia ciclo de vida de dados pessoais com registro de finalidade, base legal, consentimento quando aplicável, e controles de acesso granulares. Permite atendimento a solicitações de titulares (direito de acesso, retificação, eliminação) e geração de Relatório de Impacto à Proteção de Dados (RIPD).',
      normative: 'Trata princípios da LGPD (finalidade, adequação, necessidade, transparência, segurança) como requisitos arquiteturais. Metadados e controles podem ser estruturados para apoiar base legal, finalidade e políticas de retenção, conforme implementação. Isolamento institucional (ex.: mecanismos de segregação lógica e controles de acesso) é tratado como requisito de arquitetura e implantação.',
      enforcement: 'O módulo é desenhado para suportar controles preventivos e rastreabilidade (ex.: políticas de coleta, acesso e retenção definidas institucionalmente), conforme implementação e configuração. Mecanismos específicos dependem do ambiente e do escopo de implantação.',
      legalBasis: [
        'LGPD - Arts. 6º (princípios), 7º (bases legais), 37 (relatório de impacto)',
        'LGPD - Arts. 46 a 52 (responsabilização e boas práticas)',
        'Decreto 10.046/2019 (governança de dados no setor público)',
      ],
      technicalFeatures: [
        'Planejado: isolamento lógico por tenant, com mecanismos de controle de acesso e segregação de dados definidos por arquitetura e requisitos de implantação.',
        'Registro de base legal e finalidade para cada dado pessoal',
        'Logs de acesso com justificativa obrigatória',
        'Geração automática de RIPD (Relatório de Impacto)',
        'Planejado: suporte a políticas de retenção e descarte/anonimização, conforme regras e prazos definidos pelo órgão.',
      ],
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
    },
    {
      id: 'transparencia',
      title: 'Transparência e LAI',
      subtitle: 'Transparência ativa com dados máquina-legíveis',
      functional: 'Publica automaticamente dados de transparência ativa conforme Lei de Acesso à Informação (LAI), com datasets em formatos abertos (CSV, JSON, XML). Gerencia pedidos de acesso à informação com controle de prazos e recursos, e disponibiliza APIs públicas para reutilização de dados.',
      normative: 'Implementa os requisitos dos Arts. 8º e 9º da LAI quanto a transparência ativa mínima (receitas, despesas, licitações, contratos, convênios). Atende também ao Decreto 7.724/2012 quanto a estrutura mínima do SIC (Serviço de Informação ao Cidadão) e prazos de resposta.',
      enforcement: 'O módulo é desenhado para suportar transparência ativa e gestão de pedidos LAI com prazos, alertas e trilha de tramitação, quando implementado e configurado. Regras como prazos e permissões dependem de parametrização institucional e integração com sistemas de origem.',
      legalBasis: [
        'Lei 12.527/2011 (LAI) - Arts. 8º, 9º, 10 a 14',
        'Decreto 7.724/2012 - Arts. 7º a 11 (transparência ativa)',
        'Lei 14.129/2021 - Art. 29 (dados abertos)',
      ],
      technicalFeatures: [
        'Publicação automática em formatos abertos (CSV, JSON, XML)',
        'APIs RESTful para reutilização de dados por terceiros',
        'Dashboard de transparência ativa com dados em tempo real',
        'Sistema de protocolo de pedidos de LAI com tramitação controlada',
        'Geração automática de estatísticas para Portal da Transparência',
      ],
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
    },
  ]

  return (
    <section className="py-24 bg-white">
      <div className="container-custom">
        {/* Navegação de Módulos */}
        <div className="mb-16">
          <div className="flex flex-wrap justify-center gap-4">
            {modules.map((module) => (
              <button
                key={module.id}
                onClick={() => setActiveModule(module.id)}
                className={`px-6 py-3 rounded-lg font-serif font-semibold transition-all duration-300 ${
                  activeModule === module.id
                    ? 'bg-primary text-white shadow-lg'
                    : 'bg-gray-100 text-institutional-graphite hover:bg-gray-200'
                }`}
              >
                {module.title.split(' ')[0]} {/* Primeira palavra */}
              </button>
            ))}
          </div>
        </div>

        {/* Detalhe do Módulo Ativo */}
        {modules.map((module) => (
          activeModule === module.id && (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-6xl mx-auto"
            >
              {/* Header do Módulo */}
              <div className="bg-gradient-to-br from-primary/10 to-slate-50 p-12 rounded-2xl mb-8">
                <div className="flex items-start">
                  <div className="text-primary mr-6 flex-shrink-0">
                    {module.icon}
                  </div>
                  <div>
                    <h2 className="text-4xl font-serif font-bold text-institutional-navy mb-4">
                      {module.title}
                    </h2>
                    <p className="text-xl text-institutional-slate">
                      {module.subtitle}
                    </p>
                  </div>
                </div>
              </div>

              {/* Seções de Detalhamento */}
              <div className="grid grid-cols-1 gap-8">
                {/* Descrição Funcional */}
                <div className="bg-white border-2 border-gray-200 rounded-lg p-8">
                  <h3 className="font-serif font-semibold text-2xl text-institutional-navy mb-4 flex items-center">
                    <svg className="w-6 h-6 text-primary mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Descrição Funcional
                  </h3>
                  <p className="text-institutional-slate leading-relaxed">
                    {module.functional}
                  </p>
                </div>

                {/* Descrição Normativa */}
                <div className="bg-white border-2 border-gray-200 rounded-lg p-8">
                  <h3 className="font-serif font-semibold text-2xl text-institutional-navy mb-4 flex items-center">
                    <svg className="w-6 h-6 text-primary mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Descrição Normativa
                  </h3>
                  <p className="text-institutional-slate leading-relaxed">
                    {module.normative}
                  </p>
                </div>

                {/* Mecanismo de Enforcement */}
                <div className="bg-institutional-navy text-white rounded-lg p-8">
                  <h3 className="font-serif font-semibold text-2xl mb-4 flex items-center">
                    <svg className="w-6 h-6 text-primary-light mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Mecanismo de Enforcement
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {module.enforcement}
                  </p>
                </div>

                {/* Base Legal e Features Técnicas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Base Legal */}
                  <div className="bg-slate-50 border-l-4 border-primary rounded-r-lg p-8">
                    <h3 className="font-serif font-semibold text-xl text-institutional-navy mb-4">
                      Base Legal
                    </h3>
                    <ul className="space-y-3">
                      {module.legalBasis.map((law, index) => (
                        <li key={index} className="flex items-start">
                          <svg className="w-5 h-5 text-primary mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm text-institutional-graphite">{law}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Features Técnicas */}
                  <div className="bg-institutional-offwhite border-l-4 border-accent-gold rounded-r-lg p-8">
                    <h3 className="font-serif font-semibold text-xl text-institutional-navy mb-4">
                      Capacidades Técnicas
                    </h3>
                    <ul className="space-y-3">
                      {module.technicalFeatures.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <svg className="w-5 h-5 text-accent-gold mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm text-institutional-graphite">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        ))}
      </div>
    </section>
  )
}
