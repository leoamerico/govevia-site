'use client'

import { motion } from 'framer-motion'

export default function Contact() {
  return (
    <section className="py-24 bg-white" id="contato">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="section-title">Fale com nossa equipe técnica</h2>
          <p className="section-subtitle mx-auto font-sans">
            Sem vendedores, sem demonstrações genéricas. Entre em contato para discutir
            requisitos técnicos e conformidade institucional.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
            <div className="bg-institutional-offwhite p-8 rounded-lg border border-gray-200">
              <h3 className="font-serif font-semibold text-xl text-institutional-navy mb-4">Aviso</h3>
              <p className="text-institutional-slate text-sm leading-relaxed font-sans">
                Formulário temporariamente indisponível. Utilize o e-mail institucional para contato.
              </p>
              <div className="mt-6">
                <p className="text-sm font-semibold text-institutional-navy mb-2 font-sans">E-mail</p>
                <a href="mailto:govevia@govevia.com.br" className="text-primary hover:underline text-sm font-sans">govevia@govevia.com.br</a>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="space-y-8">
            <div className="bg-institutional-offwhite p-8 rounded-lg border border-gray-200">
              <h3 className="font-serif font-semibold text-xl text-institutional-navy mb-6">Informações de Contato</h3>
              <div className="space-y-6 font-sans">
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-primary mr-4 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  <div>
                    <p className="font-semibold text-institutional-navy mb-1">E-mail</p>
                    <a href="mailto:govevia@govevia.com.br" className="text-primary hover:underline text-sm">govevia@govevia.com.br</a><br />
                  </div>
                </div>
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-primary mr-4 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <div>
                    <p className="font-semibold text-institutional-navy mb-1">Endereço</p>
                    <p className="text-institutional-slate text-sm">Avenida Palmeira Imperial, 165 / 302<br />CEP: 38.406-582<br />Uberlândia-MG, Brasil</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-primary mr-4 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                  <div>
                    <p className="font-semibold text-institutional-navy mb-1">ENV-NEO LTDA</p>
                    <p className="text-institutional-slate text-sm">CNPJ: 36.207.211/0001-47<br />Tecnologia para Governança Pública</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-institutional-navy text-white p-8 rounded-lg">
              <h4 className="font-sans font-semibold text-sm uppercase tracking-wider text-gray-400 mb-3">CEO &amp; Founder</h4>
              <p className="text-xl font-serif font-bold mb-2">Leonardo Américo José Ribeiro</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
