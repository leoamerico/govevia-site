'use client'

import { motion } from 'framer-motion'

export default function Mission() {
  return (
    <section className="py-24 bg-deep-navy">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-8">
              Nossa Missão
            </h2>
              <div className="bg-primary/10 border border-primary/20 p-12 rounded-2xl border-l-4">
              <p className="text-2xl font-serif font-semibold text-white leading-relaxed">
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
            <div className="text-slate-200 leading-relaxed space-y-6">
              <p>
                Há milhares de servidores públicos no Brasil que conhecem o seu trabalho de dentro
                para fora — cada prazo que não pode falhar, cada ato que precisa de motivação, cada
                assinatura que carrega peso jurídico real. O que esses profissionais carregam não é
                uma tarefa. É décadas de memória institucional, de erros vistos de perto, de situações
                que nenhum manual descreve. Isso não se automatiza. Isso é o ativo mais valioso que
                existe neste momento.
              </p>
              <p>
                A administração pública brasileira opera sob centenas de normas que regulam cada ato
                praticado por agentes públicos. O problema nunca foi a falta de regra — foi a falta de
                estrutura para torná-la executável. Prazos, competências, motivação do ato e condições
                do rito viram checklists humanos, sujeitos a pressa, interpretação silenciosa e perda
                de memória institucional. Quando a regra depende só de quem lembra, ela deixa de ser
                proteção e vira risco.
              </p>
              <p>
                A Govevia parte de um entendimento simples: regra sem enforcement não é regra — é
                sugestão. E sugestão cria responsabilidade sem proteção, tanto para o cidadão quanto
                para o servidor. Nossa missão é transformar normas institucionais em controles
                técnicos executáveis, onde cada requisito relevante pode ser verificado, registrado e
                rastreado — não para vigiar pessoas, mas para protegê-las.
              </p>
              <p>
                Os agentes de inteligência artificial podem sugerir, organizar e antecipar — mas não
                podem ser responsabilizados, premiados, corrigidos pela experiência de vida ou
                registrados nos livros de história. Quem decide é o humano. Sempre. O que muda é que,
                com o Govevia, essa decisão passa a ter contexto registrado, motivação documentada e
                evidência consistente — pronta para controle interno, auditoria e prestação de contas.
              </p>
              <p>
                O Govevia não &ldquo;decide por você&rdquo; — estrutura o ambiente para que a sua decisão seja
                defensável. A responsabilidade permanece com o agente público; o sistema elimina as
                lacunas que hoje dependem de memória e boa vontade. Profissionais com décadas de
                experiência não são substituídos — são o coração do sistema, pois são eles que sabem
                onde estão os erros que nenhum agente de IA conseguiria encontrar sozinho.
              </p>
              <p className="font-semibold text-white text-xl">
                Govevia é o resultado dessa visão: uma plataforma onde a governança deixa de ser
                documentada para ser executada — e onde cada pessoa que conhece o seu trabalho de
                verdade encontra o lugar que sempre mereceu.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
