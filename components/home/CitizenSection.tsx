'use client'

import { type ReactNode } from 'react'
import { motion } from 'framer-motion'

type Item = {
  icon: ReactNode
  title: string
  body: string
}

const CITIZEN_ITEMS: Item[] = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
    title: 'Transparência verificável, não declaratória',
    body: 'Quando um município usa o Govevia, cada ato administrativo gera trilha rastreável por design — não porque alguém decidiu publicar, mas porque o sistema não permite que seja diferente.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: 'Acesso à informação com prazo cumprido',
    body: 'Pedidos de acesso à informação (LAI) com prazos monitorados e trilha de tratamento. O seu direito de saber tem deadline — e o sistema verifica se ele está sendo respeitado.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: 'Seus dados com proteção por lei',
    body: 'Conformidade com a LGPD embutida na arquitetura. Dados pessoais tratados com base legal explícita, finalidade registrada e controles de acesso. Não como política de privacidade — como restrição técnica.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    title: 'Gestão pública prestada de contas por arquitetura',
    body: 'Municípios com governança estruturada produzem evidências para TCU, CGU e Tribunais de Contas automaticamente. Quanto mais accountability no back-end, menos espaço para decisões sem responsável.',
  },
]

type Props = {
  title: string
  subtitle: string
  closing: string
}

export default function CitizenSection({ title, subtitle, closing }: Props) {
  return (
    <section className="py-24 bg-gradient-to-b from-white to-institutional-offwhite">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-xs tracking-widest uppercase text-institutional-slate font-mono mb-4">Para quem mora no município</p>
          {title ? <h2 className="section-title">{title}</h2> : null}
          {subtitle ? <p className="section-subtitle mx-auto font-sans">{subtitle}</p> : null}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {CITIZEN_ITEMS.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="flex items-start gap-5 bg-white p-7 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="text-primary flex-shrink-0 mt-1">{item.icon}</div>
              <div>
                <h3 className="font-serif font-semibold text-lg text-institutional-navy mb-2 leading-snug">{item.title}</h3>
                <p className="text-institutional-slate text-sm leading-relaxed font-sans">{item.body}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {closing ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="mt-14 max-w-3xl mx-auto text-center"
          >
            <div className="bg-primary/5 border border-primary/20 rounded-xl px-8 py-6">
              <p className="font-serif font-semibold text-xl text-institutional-navy leading-relaxed">{closing}</p>
            </div>
          </motion.div>
        ) : null}
      </div>
    </section>
  )
}
