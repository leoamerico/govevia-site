'use client'

import { motion } from 'framer-motion'

const municipalities = [
  {
    name: 'Unaí',
    state: 'MG',
    status: 'Em operação desde 2023',
    modules: ['Processos Administrativos', 'Planejamento Urbano', 'Assinatura Digital'],
  },
  {
    name: 'Coromandel',
    state: 'MG',
    status: 'Em operação desde 2023',
    modules: ['Processos Administrativos', 'Governança de Dados', 'Auditoria'],
  },
  {
    name: 'Araguari',
    state: 'MG',
    status: 'Em operação desde 2024',
    modules: ['Processos Administrativos', 'Planejamento Urbano', 'Transparência'],
  },
]

export default function Municipalities() {
  return (
    <section className="py-24 bg-white">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="section-title">Em produção</h2>
          <p className="section-subtitle mx-auto font-sans">
            Municípios mineiros utilizando Govevia para governança institucional com enforcement técnico.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {municipalities.map((municipality, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-institutional-offwhite p-8 rounded-lg border-2 border-gray-200 hover:border-primary transition-all duration-300 shadow-sm hover:shadow-lg"
            >
              <div className="flex items-center justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-primary-accent/10 rounded-full flex items-center justify-center border-2 border-primary/20">
                  <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>

              <h3 className="font-serif font-bold text-2xl text-institutional-navy text-center mb-2">
                {municipality.name}
              </h3>
              <p className="text-institutional-slate text-center mb-4 font-sans font-medium">
                {municipality.state}
              </p>

              <div className="bg-primary/10 px-4 py-2 rounded-md text-center mb-6">
                <p className="text-sm font-semibold text-primary font-sans">{municipality.status}</p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-institutional-slate mb-3 uppercase tracking-wide font-sans">
                  Módulos Ativos:
                </p>
                {municipality.modules.map((mod, idx) => (
                  <div key={idx} className="flex items-start">
                    <svg className="w-4 h-4 text-primary mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-institutional-graphite font-sans">{mod}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 max-w-3xl mx-auto text-center"
        >
          <div className="bg-institutional-offwhite border-l-4 border-institutional-slate p-6 rounded-r-lg">
            <p className="text-sm text-institutional-slate leading-relaxed font-sans">
              <span className="font-semibold text-institutional-navy">Transparência Institucional:</span> Listamos
              apenas municípios com sistemas em produção verificável. Não fabricamos casos de uso ou
              depoimentos. A credibilidade institucional se constrói por evidência, não por marketing.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
