'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

const capabilities = [
  {
    title: 'Enforcement Normativo Automático',
    description: 'Regras institucionais podem ser traduzidas em validações e restrições técnicas (conforme escopo e configuração) para reduzir inconformidades. O foco é prevenção, não apenas alerta.',
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  },
  {
    title: 'Evidência Verificável',
    description: 'Atos administrativos podem ser acompanhados por registros de rastreabilidade e evidência operacional. Onde aplicável, pode suportar encadeamento e carimbo de tempo, conforme requisitos do órgão.',
    icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
  },
  {
    title: 'Versionamento Temporal Normativo',
    description: 'Parâmetros legais e normativos podem ser versionados com vigência temporal, permitindo consulta “no tempo” conforme política e implementação.',
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    title: 'Isolamento Institucional Garantido',
    description: 'Isolamento institucional é tratado como requisito de arquitetura (ex.: segregação lógica por tenant e controles de acesso). O desenho e a implementação dependem do ambiente e do escopo de implantação.',
    icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
  },
  {
    title: 'Assinatura Digital',
    description: 'Prevê integração com assinatura eletrônica e trilha de evidência. Requisitos específicos (incluindo ICP-Brasil, quando aplicável) dependem de escopo, tipologia do ato e implementação.',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  },
  {
    title: 'Controles de Conformidade Incorporados',
    description: 'A plataforma é desenhada para suportar controles técnicos alinhados a requisitos recorrentes de processo administrativo, governo digital, licitações, transparência e proteção de dados — com foco em rastreabilidade e evidência operacional.',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  },
]

export default function Platform() {
  return (
    <section className="py-24 bg-gradient-to-b from-slate-50 to-white" id="plataforma">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="section-title">Como Govevia resolve</h2>
          <p className="section-subtitle mx-auto font-sans">
            Capacidades institucionais traduzidas em controles técnicos, conforme escopo, implementação e configuração.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {capabilities.map((capability, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100"
            >
              <div className="text-primary mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={capability.icon} />
                </svg>
              </div>
              <h3 className="font-serif font-semibold text-xl text-institutional-navy mb-4">
                {capability.title}
              </h3>
              <p className="text-institutional-slate leading-relaxed font-sans text-sm">
                {capability.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link href="/plataforma" className="btn-primary">
            Detalhamento Técnico Completo
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
