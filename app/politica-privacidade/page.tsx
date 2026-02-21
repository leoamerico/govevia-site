import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Política de Privacidade | Govevia',
  description: 'Política de Privacidade da Env Neo Ltda. e Govevia em conformidade com a Lei Geral de Proteção de Dados (LGPD).',
  robots: {
    index: true,
    follow: true,
  },
}

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      <main className="pt-32 pb-24 bg-zinc-950">
        <div className="container-custom max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-8">
            Política de Privacidade
          </h1>
          
          <div className="prose prose-lg max-w-none text-gray-300">
            <p className="text-sm text-gray-400 mb-8">
              Última atualização: 13 de fevereiro de 2026
            </p>

            <section className="mb-12">
              <h2 className="text-2xl font-display font-semibold text-white mb-4">
                1. Informações Gerais
              </h2>
              <p className="leading-relaxed mb-4">
                A Env Neo Ltda., inscrita no CNPJ 36.207.211/0001-47, com sede na Avenida Palmeira Imperial,
                165 / 302, CEP 38.406-582, Uberlândia-MG, é a controladora dos dados pessoais coletados 
                através do site govevia.com.br.
              </p>
              <p className="leading-relaxed">
                Esta Política de Privacidade está em conformidade com a Lei Geral de Proteção de Dados 
                (Lei 13.709/2018 - LGPD) e descreve como coletamos, usamos, armazenamos e protegemos 
                informações pessoais dos usuários deste site.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-display font-semibold text-white mb-4">
                2. Dados Coletados
              </h2>
              <p className="leading-relaxed mb-4">
                Quando o canal de contato do site estiver disponível, podemos coletar os seguintes dados pessoais:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Nome completo</li>
                <li>Cargo profissional</li>
                <li>Nome do município ou órgão de vinculação</li>
                <li>Endereço de e-mail institucional</li>
                <li>Mensagem enviada pelo usuário</li>
              </ul>
              <p className="leading-relaxed">
                Adicionalmente, por questões de segurança e prevenção de abuso, podemos tratar dados técnicos de conexão (como endereço IP e identificadores de requisição) de forma proporcional, para detectar abuso e proteger a disponibilidade do serviço.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-display font-semibold text-white mb-4">
                3. Finalidade do Tratamento
              </h2>
              <p className="leading-relaxed mb-4">
                Os dados pessoais coletados são utilizados exclusivamente para:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Responder às solicitações de contato enviadas através do formulário</li>
                <li>Manter comunicação institucional sobre a plataforma Govevia</li>
                <li>Prevenir abuso e garantir segurança do sistema (registro de IP)</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-display font-semibold text-white mb-4">
                4. Base Legal
              </h2>
              <p className="leading-relaxed">
                O tratamento dos dados pessoais está fundamentado no <strong>legítimo interesse</strong> 
                (Art. 7º, IX, LGPD) para atendimento de solicitações de contato relacionadas à plataforma 
                Govevia, bem como no <strong>consentimento</strong> do titular ao preencher voluntariamente 
                o formulário.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-display font-semibold text-white mb-4">
                5. Compartilhamento de Dados
              </h2>
              <p className="leading-relaxed mb-4">
                Os dados pessoais coletados <strong>não são compartilhados</strong> com terceiros, exceto:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Quando exigido por lei ou determinação judicial</li>
                <li>Com prestadores de serviço essenciais (hospedagem, e-mail) que atuam como 
                    operadores de dados sob contratos de confidencialidade</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-display font-semibold text-white mb-4">
                6. Armazenamento e Segurança
              </h2>
              <p className="leading-relaxed mb-4">
                Os dados são armazenados em servidores seguros com as seguintes medidas de proteção:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Criptografia de dados em trânsito (HTTPS/TLS)</li>
                <li>Controles de acesso restrito a dados pessoais</li>
                <li>Registros técnicos mínimos para diagnóstico e segurança (ex.: identificação de requisição e eventos de erro), quando necessário.</li>
                <li>Medidas de continuidade e recuperação proporcionais ao tipo de serviço, quando aplicável</li>
              </ul>
              <p className="leading-relaxed">
                Os dados são tratados pelo período necessário para cumprimento da finalidade de contato e de obrigações legais aplicáveis. Prazos específicos de retenção e descarte dependem do canal, do tipo de demanda e de requisitos legais/regulatórios incidentes.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-display font-semibold text-white mb-4">
                7. Direitos do Titular
              </h2>
              <p className="leading-relaxed mb-4">
                Conforme a LGPD (Art. 18), você tem direito a:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><strong>Confirmação e acesso:</strong> Confirmar se tratamos seus dados e acessá-los</li>
                <li><strong>Retificação:</strong> Corrigir dados incompletos, inexatos ou desatualizados</li>
                <li><strong>Eliminação:</strong> Solicitar exclusão de dados tratados com seu consentimento</li>
                <li><strong>Portabilidade:</strong> Receber seus dados em formato estruturado</li>
                <li><strong>Revogação do consentimento:</strong> Retirar consentimento a qualquer momento</li>
                <li><strong>Informação sobre compartilhamento:</strong> Saber com quem compartilhamos seus dados</li>
                <li><strong>Oposição ao tratamento:</strong> Opor-se ao tratamento realizado</li>
              </ul>
              <p className="leading-relaxed">
                Para exercer seus direitos, entre em contato através do e-mail{' '}
                <a href="mailto:govevia@govevia.com.br" className="text-primary hover:underline">
                  govevia@govevia.com.br
                </a>
                {' '}com o assunto &ldquo;LGPD - Direitos do Titular&rdquo;.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-display font-semibold text-white mb-4">
                8. Cookies e Tecnologias Similares
              </h2>
              <p className="leading-relaxed">
                Este site <strong>não utiliza cookies de terceiros</strong> para rastreamento ou publicidade. 
                Cookies técnicos essenciais para funcionamento básico do site podem ser utilizados, mas 
                não coletam dados pessoais identificáveis.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-display font-semibold text-white mb-4">
                9. Alterações nesta Política
              </h2>
              <p className="leading-relaxed">
                Esta Política de Privacidade pode ser atualizada periodicamente. Alterações significativas 
                serão comunicadas através do próprio site, com indicação da data da última atualização.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-display font-semibold text-white mb-4">
                10. Contato
              </h2>
              <p className="leading-relaxed mb-4">
                Para dúvidas sobre esta Política de Privacidade ou sobre o tratamento de dados pessoais:
              </p>
              <div className="bg-zinc-900 p-6 rounded-lg border-l-4 border-primary">
                <p className="font-semibold text-white mb-2">Env Neo Ltda.</p>
                <p className="mb-1">E-mail: <a href="mailto:govevia@govevia.com.br" className="text-primary hover:underline">govevia@govevia.com.br</a></p>
                <p className="mb-1">CNPJ: 36.207.211/0001-47</p>
                <p>Endereço: Av. Palmeira Imperial, 165 / 302, CEP 38.406-582, Uberlândia-MG</p>
              </div>
            </section>

            <div className="mt-16 pt-8 border-t border-white/10">
              <p className="text-sm text-gray-400 text-center">
                Esta Política de Privacidade está em conformidade com a Lei 13.709/2018 (LGPD)
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
