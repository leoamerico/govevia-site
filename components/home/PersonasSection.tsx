'use client'

import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, type ReactNode } from 'react'

type Persona = {
  id: string
  role: string
  roleShort: string
  icon: ReactNode
  headline: string
  subheadline: string
  pain: string
  solution: string
  proof: string
  cta: { label: string; href: string }
}

const personas: Persona[] = [
  {
    id: 'prefeito',
    role: 'Prefeito',
    roleShort: 'Prefeito',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
      </svg>
    ),
    headline: 'Sua gestão protegida em cada decisão',
    subheadline: 'Quando o TCU, CGU ou TCE chegarem, você responde com rastreabilidade — não com memória.',
    pain: 'Cada ato da sua gestão é potencial alvo de auditoria, ação de improbidade ou notícia adversa. Gestores que decidem sem evidência verificável carregam risco pessoal desnecessário.',
    solution: 'O Govevia estrutura cada decisão com motivação técnica registrada, competência verificada e cadeia de evidência imutável. Sua gestão fica defensável perante qualquer instância de controle — por design, não por sorte.',
    proof: 'Cada ato com fundamento legal registrado. Cada delegação com alçada verificada. Cada prazo monitorado antes de vencer.',
    cta: { label: 'Proteja sua gestão', href: '/plataforma' },
  },
  {
    id: 'procurador',
    role: 'Procurador Jurídico',
    roleShort: 'Procurador',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
      </svg>
    ),
    headline: 'Pareceres com evidência. Defesa com contexto.',
    subheadline: 'O ato que você assinou há dois anos: a motivação ainda está lá, intacta e verificável.',
    pain: 'Você emite pareceres e assina atos com base em contexto que só você conhece naquele momento. Quando a questão é levantada meses depois, o contexto sumiu e a memória não basta como defesa.',
    solution: 'Cada manifestação jurídica é encadeada à normativa aplicada, ao expediente original e ao agente responsável. O Govevia preserva o contexto técnico e institucional dos atos — de forma estruturada, imutável e exportável para qualquer instância de controle.',
    proof: 'Trilha de evidências com hash SHA-256. Normativa aplicada registrada com versão temporal. Exportação formatada para TCU, CGU e Judiciário.',
    cta: { label: 'Ver trilha de evidências', href: '/plataforma#auditoria' },
  },
  {
    id: 'secretario',
    role: 'Secretário Municipal',
    roleShort: 'Secretário',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    headline: 'Entregas com conformidade embutida',
    subheadline: 'Prazos monitorados. Competências verificadas. Sem surpresas na auditoria.',
    pain: 'Sua secretaria opera com dezenas de processos paralelos, prazos críticos e uma equipe que depende de orientação constante. Quando algo falha, você é o primeiro a saber — mas frequentemente tarde demais.',
    solution: 'Fluxos administrativos com checklist normativo integrado. Alertas antes da preclusão. Delegação com alçada verificada em tempo real. O Govevia torna a conformidade parte do processo — não uma verificação posterior.',
    proof: 'Prazos legais e recursais monitorados automaticamente. Impedimentos e conflitos de interesse bloqueados antes de gerar ato inválido. Relatórios prontos para o controle interno.',
    cta: { label: 'Ver módulos operacionais', href: '/plataforma' },
  },
  {
    id: 'servidor',
    role: 'Servidor Público',
    roleShort: 'Servidor',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    headline: 'Faça seu trabalho com segurança jurídica real',
    subheadline: 'Cada ato que você pratica: competência verificada, motivação registrada, evidência encadeada.',
    pain: 'Você conhece seu trabalho de dentro para fora. Mas quando um ato é questionado — meses ou anos depois — o ônus de provar que agiu corretamente recai sobre você, com base em memória e documentos espalhados.',
    solution: 'O Govevia registra o contexto de cada ato que você pratica: quem autorizou, com qual fundamento, em qual momento. Sua competência é verificada antes do ato — não questionada depois. Sua memória institucional passa a existir em sistema.',
    proof: 'Verificação de alçada antes de cada ato. Motivação técnica estruturada e associada ao expediente. Trilha pessoal de atos praticados, verificável a qualquer tempo.',
    cta: { label: 'Como o Govevia protege servidores', href: '/plataforma' },
  },
  {
    id: 'cidadao',
    role: 'Cidadão',
    roleShort: 'Cidadão',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    headline: 'Sua cidade governada com transparência verificável',
    subheadline: 'Não uma promessa de transparência. Uma arquitetura de prestação de contas — por design.',
    pain: 'Você paga impostos, usa serviços públicos e tem o direito de saber como as decisões que afetam sua vida são tomadas. Mas transparência hoje depende de quem está no poder querer ser transparente.',
    solution: 'Municípios que usam o Govevia produzem rastreabilidade estrutural de cada ato administrativo — não porque alguém escolheu publicar, mas porque o sistema não permite que seja diferente. Acesso à informação, prazos e motivação são verificáveis, não declaratórios.',
    proof: 'Conformidade com LAI e LGPD por design. Pedidos de acesso à informação com prazos monitorados. Dados em formatos abertos para reutilização pública.',
    cta: { label: 'Transparência que funciona', href: '/plataforma#transparencia' },
  },
]

export default function PersonasSection() {
  const [active, setActive] = useState<string>('prefeito')
  const current = personas.find((p) => p.id === active) ?? personas[0]

  return (
    <section className="py-24 bg-gradient-to-b from-white to-slate-50" id="para-quem">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-xs tracking-widest uppercase text-institutional-slate font-mono mb-4">Para quem é o Govevia</p>
          <h2 className="section-title">Uma plataforma. Uma resposta para cada papel.</h2>
          <p className="section-subtitle mx-auto font-sans">
            Governança pública efetiva exige que cada pessoa — de quem governa a quem é governado — encontre aqui o que precisa.
          </p>
        </motion.div>

        {/* Persona Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {personas.map((persona) => (
            <button
              key={persona.id}
              onClick={() => setActive(persona.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-full border text-sm font-sans font-medium transition-all duration-200 ${
                active === persona.id
                  ? 'bg-primary text-white border-primary shadow-md'
                  : 'bg-white text-institutional-slate border-gray-200 hover:border-primary/50 hover:text-primary'
              }`}
            >
              <span className={active === persona.id ? 'text-white' : 'text-primary'}>
                {persona.icon}
              </span>
              {persona.roleShort}
            </button>
          ))}
        </motion.div>

        {/* Active Persona Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="max-w-5xl mx-auto"
          >
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-institutional-navy to-primary px-8 py-6 md:px-12 md:py-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-primary-light">{current.icon}</div>
                  <span className="text-primary-light font-sans text-sm font-semibold uppercase tracking-wider">
                    {current.role}
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-serif font-bold text-white mb-2 leading-tight">
                  {current.headline}
                </h3>
                <p className="text-gray-300 font-sans text-base md:text-lg leading-relaxed">
                  {current.subheadline}
                </p>
              </div>

              {/* Body */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                {/* Pain */}
                <div className="p-8 md:p-10 border-b md:border-b-0 md:border-r border-gray-100">
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-5 h-5 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span className="text-xs font-mono font-semibold text-institutional-slate uppercase tracking-wider">O risco hoje</span>
                  </div>
                  <p className="text-institutional-slate leading-relaxed font-sans text-sm">{current.pain}</p>
                </div>

                {/* Solution */}
                <div className="p-8 md:p-10">
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span className="text-xs font-mono font-semibold text-institutional-slate uppercase tracking-wider">Com o Govevia</span>
                  </div>
                  <p className="text-institutional-slate leading-relaxed font-sans text-sm">{current.solution}</p>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-institutional-offwhite px-8 py-6 md:px-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-mono text-institutional-silver uppercase tracking-wider mb-1">Na prática</p>
                  <p className="text-sm text-institutional-navy font-sans font-medium">{current.proof}</p>
                </div>
                <Link
                  href={current.cta.href}
                  className="btn-primary whitespace-nowrap flex-shrink-0 text-sm"
                >
                  {current.cta.label}
                </Link>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}
