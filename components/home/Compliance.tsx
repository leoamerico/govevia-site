'use client'

import { motion } from 'framer-motion'

const regulations = [
  { law: 'Lei 9.784/99', title: 'Processo Administrativo (referência)', description: 'Controles de tramitação, prazos e requisitos recorrentes de atos administrativos implementados como regras de fluxo.', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { law: 'Lei 14.129/2021', title: 'Governo Digital', description: 'Controles para tramitação digital e registro de evidências alinhados a práticas de governo digital.', icon: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z' },
  { law: 'LGPD', title: 'Proteção de Dados', description: 'Isolamento por tenant, controles de acesso e trilha de auditoria alinhados a requisitos recorrentes de proteção de dados.', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
  { law: 'LAI', title: 'Acesso à Informação', description: 'Transparência ativa estruturada com dados máquina-legíveis. Pedidos de acesso rastreáveis com prazos automáticos.', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
  { law: 'Lei 14.133/2021', title: 'Nova Lei de Licitações', description: 'Planejamento de contratações, controle de prazos e publicidade conforme exigências dos arts. 18 e seguintes.', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
  { law: 'Assinatura', title: 'Assinatura Eletrônica', description: 'Integração com assinatura eletrônica e evidência operacional, com evolução governada para requisitos compatíveis com ICP-Brasil.', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
]

export default function Compliance() {
  return (
    <section className="py-24 bg-gradient-to-b from-slate-50 to-institutional-offwhite">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="section-title">Conformidade Regulatória</h2>
          <p className="section-subtitle mx-auto font-sans">
            Controles técnicos incorporados, alinhados a requisitos recorrentes do setor público.
            O foco é reduzir risco e produzir evidência operacional para auditoria.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {regulations.map((reg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.05 }}
              viewport={{ once: true }}
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 border-l-4 border-primary"
            >
              <div className="flex items-start mb-4">
                <div className="flex-shrink-0 text-primary mr-3 mt-1">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={reg.icon} />
                  </svg>
                </div>
                <div>
                  <div className="inline-block bg-primary/10 px-3 py-1 rounded-md mb-2">
                    <span className="text-xs font-bold text-primary font-sans tracking-wide">{reg.law}</span>
                  </div>
                  <h3 className="font-serif font-semibold text-lg text-institutional-navy mb-2">{reg.title}</h3>
                </div>
              </div>
              <p className="text-sm text-institutional-slate leading-relaxed font-sans">{reg.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 max-w-4xl mx-auto text-center"
        >
          <div className="bg-institutional-navy text-white p-8 rounded-lg">
            <h3 className="font-serif font-semibold text-xl mb-4">Conformidade Nativa vs. Conformidade Configurada</h3>
            <p className="text-gray-300 leading-relaxed font-sans">
              Lei não é feature. O que a plataforma implementa são controles técnicos que reduzem risco,
              estruturam evidência e ajudam a sustentar auditorias e controles internos.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
