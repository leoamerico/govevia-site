'use client'

import { motion } from 'framer-motion'

export default function Principles() {
  const principles = [
    {
      title: 'Regra sem enforcement automático não deve existir',
      description: 'Se uma regra institucional é importante o suficiente para estar em lei, ela é importante o suficiente para ser implementada como restrição técnica. Sistemas que apenas "alertam" sobre violações transferem responsabilidade sem oferecer proteção.',
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      title: 'Ausência de evidência equivale à inexistência do ato',
      description: 'Atos administrativos que não geram trilha de evidência verificável e resistente a adulteração são institucionalmente vulneráveis. Defendibilidade exige evidência técnica e contexto normativo, não apenas documentação.',
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      title: 'Falha é sucesso: preferimos falso negativo a falso positivo',
      description: 'Sistemas de governança devem operar com viés conservador. É preferível bloquear um ato válido (que pode ser desbloqueado com justificativa) do que permitir um ato inválido. Falha segura é princípio de design, não bug.',
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
  ]

  return (
    <section className="py-24 bg-institutional-navy text-white">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">
            Nossos Princípios
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Fundamentos técnicos e institucionais que orientam o desenvolvimento de Govevia
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {principles.map((principle, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white/5 backdrop-blur-sm p-8 rounded-lg border border-white/10 hover:border-primary-light transition-all duration-300"
            >
              <div className="text-primary-light mb-6">
                {principle.icon}
              </div>
              <h3 className="font-serif font-semibold text-xl mb-4 leading-tight">
                {principle.title}
              </h3>
              <p className="text-gray-300 leading-relaxed">
                {principle.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="inline-block bg-primary/20 border border-primary-light/30 px-8 py-6 rounded-lg">
            <p className="text-lg text-gray-200">
              Esses princípios não são aspiracionais. Eles orientam a arquitetura e a evolução do produto,
              com políticas, evidências e testes automatizados onde aplicável.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
