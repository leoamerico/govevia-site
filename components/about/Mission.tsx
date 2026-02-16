'use client'

import { motion } from 'framer-motion'

export default function Mission() {
  return (
    <section className="py-24 bg-white">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-institutional-navy mb-8">
              Nossa Missão
            </h2>
            <div className="bg-gradient-to-br from-primary/10 to-slate-50 p-12 rounded-2xl border-l-4 border-primary">
              <p className="text-2xl font-serif font-semibold text-institutional-navy leading-relaxed">
                Tornar a governança pública tecnicamente executável
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="prose prose-lg max-w-none"
          >
            <div className="text-institutional-slate leading-relaxed space-y-6">
              <p>
                A administração pública brasileira opera sob regime jurídico-administrativo denso, 
                com centenas de normas federais, estaduais e municipais que regulam cada ato praticado 
                por agentes públicos. No entanto, a maioria dos sistemas de gestão municipal trata 
                essas regras como &ldquo;documentação externa&rdquo; — algo que o usuário precisa conhecer e 
                obedecer voluntariamente.
              </p>
              <p>
                A ENV-NEO entende que essa abordagem é institucional e tecnicamente inadequada. 
                Regras sem enforcement automático não são regras — são sugestões. E sugestões 
                criam responsabilidade sem proteção.
              </p>
              <p>
                Nossa missão é transformar normas institucionais em código executável, onde cada 
                artigo de lei relevante pode se manifestar como requisito e controle técnico (conforme 
                implementação e configuração no órgão). Em vez de depender apenas de alertas, o objetivo 
                é apoiar controles preventivos e rastreabilidade operacional.
              </p>
              <p className="font-semibold text-institutional-navy text-xl">
                Govevia é o resultado dessa visão: uma plataforma onde a governança deixa de ser 
                documentada para ser executada.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
