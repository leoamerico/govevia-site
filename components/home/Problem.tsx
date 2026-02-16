'use client'

import { motion } from 'framer-motion'

const problems = [
  {
    title: 'Atos administrativos sem evidência auditável',
    description: 'Decisões registradas sem cadeia de custódia digital verificável. Em auditoria, não há como comprovar integridade e contexto do ato de forma reprodutível.',
  },
  {
    title: 'Regras urbanísticas que dependem de memória humana',
    description: 'Parâmetros normativos armazenados em documentos ou planilhas. O sistema permite violações porque não implementa enforcement técnico.',
  },
  {
    title: 'Dados de municípios misturados em sistemas compartilhados',
    description: 'Ausência de isolamento por Row-Level Security. Risco de vazamento de dados entre entidades e vulnerabilidade à auditoria de conformidade LGPD.',
  },
  {
    title: 'Versões de leis sobrescritas sem histórico',
    description: 'Alterações normativas que apagam versões anteriores. Impossível verificar sob qual regra um ato foi praticado em determinada data.',
  },
]

export default function Problem() {
  return (
    <section className="py-24 bg-white" id="problema">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="section-title">
            Regras sem enforcement são apenas sugestões
          </h2>
          <p className="section-subtitle mx-auto font-sans">
            Sistemas que documentam violações, mas não as impedem, criam responsabilidade
            institucional sem proteção técnica.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {problems.map((problem, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-institutional-offwhite p-8 rounded-lg border-l-4 border-primary hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-4">
                  <svg className="w-6 h-6 text-accent-gold" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-serif font-semibold text-lg text-institutional-navy mb-3">
                    {problem.title}
                  </h3>
                  <p className="text-institutional-slate leading-relaxed font-sans">
                    {problem.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <div className="inline-block bg-institutional-navy text-white px-8 py-4 rounded-lg">
            <p className="font-serif font-semibold text-lg">
              A ausência de evidência equivale à inexistência do ato
            </p>
            <p className="mt-2 text-sm text-gray-300 font-sans">
              Sem evidência técnica reprodutível, a defesa institucional fica frágil.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
