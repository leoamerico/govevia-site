'use client'

import { motion } from 'framer-motion'

const auditTrail = [
  { label: 'Quem', value: 'Agente público identificado', description: 'Identidade e contexto do ato' },
  { label: 'O quê', value: 'Ato administrativo praticado', description: 'Tipificação e parâmetros' },
  { label: 'Base legal', value: 'Regra normativa aplicada', description: 'Dispositivo legal específico' },
  { label: 'Versão', value: 'Vigência temporal da norma', description: 'Contexto normativo do ato' },
  { label: 'Quando', value: 'Carimbo de tempo', description: 'Quando aplicável, com validação reprodutível' },
]

export default function Defensibility() {
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
            Construído para resistir à auditoria
          </h2>
          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed font-sans">
            O sistema estrutura trilha de evidência para auditoria e controles internos.
            Cada ato administrativo registra contexto, regra aplicada e evidência verificável do que ocorreu.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto"
        >
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-8 md:p-12 border border-white/10">
            <h3 className="font-serif font-semibold text-2xl mb-8 text-center text-primary-light">
              Trilha de Evidência Completa
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {auditTrail.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  <div className="bg-white/10 p-6 rounded-lg border border-primary/30 hover:border-primary-light transition-colors duration-300">
                    <div className="text-accent-gold font-sans font-semibold text-sm mb-2">{item.label}</div>
                    <div className="font-semibold text-white mb-2 text-sm font-sans">{item.value}</div>
                    <div className="text-xs text-gray-400 font-sans">{item.description}</div>
                  </div>
                  {index < auditTrail.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                      <svg className="w-6 h-6 text-primary-light" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="inline-block bg-primary/20 border border-primary-light/30 px-8 py-6 rounded-lg">
            <p className="font-serif font-bold text-2xl text-primary-light">
              &ldquo;Se não há rastro verificável, o ato não ocorreu&rdquo;
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
        >
          {[
            { title: 'Integridade e Rastreabilidade', desc: 'Registros podem ser estruturados para suportar detecção de alterações e auditoria reprodutível, conforme requisitos do órgão.', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
            { title: 'Trilha Auditável', desc: 'Histórico com contexto, versão normativa e evidência operacional do que foi feito e por quem (conforme implementação).', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
            { title: 'Exportação para Auditoria', desc: 'Exportação estruturada e documentação de evidências para auditorias e controles internos.', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
          ].map((item, i) => (
            <div key={i} className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-full mb-4">
                <svg className="w-8 h-8 text-primary-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
              </div>
              <h4 className="font-serif font-semibold text-lg mb-2">{item.title}</h4>
              <p className="text-gray-400 text-sm font-sans">{item.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
