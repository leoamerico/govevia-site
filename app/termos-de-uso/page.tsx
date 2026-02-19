import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Termos de Uso | Govevia',
  description: 'Termos e condições de uso do site govevia.com.br e da plataforma Govevia, operada pela Env Neo Ltda.',
  robots: {
    index: true,
    follow: true,
  },
}

export default function TermsOfUsePage() {
  return (
    <>
      <Header />
      <main className="pt-32 pb-24 bg-white">
        <div className="container-custom max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-institutional-navy mb-8">
            Termos de Uso
          </h1>

          <div className="prose prose-lg max-w-none text-institutional-slate">
            <p className="text-sm text-institutional-lightgray mb-8">
              Última atualização: 19 de fevereiro de 2026
            </p>

            <section className="mb-12">
              <h2 className="text-2xl font-display font-semibold text-institutional-navy mb-4">
                1. Aceitação dos Termos
              </h2>
              <p className="leading-relaxed mb-4">
                Ao acessar e utilizar o site <strong>govevia.com.br</strong>, você concorda com os
                presentes Termos de Uso. Se não concordar com qualquer dispositivo destes Termos,
                você não deve utilizar este site.
              </p>
              <p className="leading-relaxed">
                Estes Termos regem o acesso ao site público da plataforma Govevia, operado pela
                <strong> Env Neo Ltda.</strong>, inscrita no CNPJ 36.207.211/0001-47, com sede na
                Avenida Palmeira Imperial, 165 / 302, CEP 38.406-582, Uberlândia-MG.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-display font-semibent text-institutional-navy mb-4">
                2. Descrição do Serviço
              </h2>
              <p className="leading-relaxed mb-4">
                O site govevia.com.br é um canal institucional de divulgação da plataforma Govevia —
                solução de governança executável para a administração pública municipal. Por meio
                deste site, a Env Neo Ltda. apresenta informações sobre a plataforma, suas
                funcionalidades e formas de contato.
              </p>
              <p className="leading-relaxed">
                O acesso à plataforma Govevia em si é regido por contrato específico celebrado entre
                a Env Neo Ltda. e o ente público contratante.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-display font-semibold text-institutional-navy mb-4">
                3. Uso Permitido
              </h2>
              <p className="leading-relaxed mb-4">
                Você pode acessar e utilizar este site para fins informativos lícitos, respeitando
                a legislação brasileira e estes Termos. São vedadas, entre outras:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Ações que comprometam a segurança, disponibilidade ou integridade do site;</li>
                <li>Tentativas de acesso não autorizado a sistemas ou dados;</li>
                <li>Envio de comunicações não solicitadas (spam) ou conteúdo malicioso;</li>
                <li>Reprodução, distribuição ou modificação de conteúdo protegido sem autorização;</li>
                <li>Uso de scrapers automatizados que gerem carga desproporcional na infraestrutura.</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-display font-semibold text-institutional-navy mb-4">
                4. Propriedade Intelectual
              </h2>
              <p className="leading-relaxed mb-4">
                Todo o conteúdo disponível neste site — incluindo textos, imagens, logotipo,
                identidade visual, arquitetura da informação e código-fonte — é de propriedade da
                Env Neo Ltda. ou está licenciado para seu uso, sendo protegido pela legislação de
                propriedade intelectual aplicável.
              </p>
              <p className="leading-relaxed">
                A marca <strong>Govevia</strong> e o nome <strong>Env Neo</strong> são ativos da
                Env Neo Ltda., com registro e uso reservados. Qualquer reprodução, uso ou
                referência à marca sem autorização expressa é proibida.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-display font-semibold text-institutional-navy mb-4">
                5. Isenção de Responsabilidade
              </h2>
              <p className="leading-relaxed mb-4">
                O site é fornecido &ldquo;no estado em que se encontra&rdquo;. A Env Neo Ltda. não
                garante que o site estará disponível ininterruptamente ou isento de erros, e se
                reserva o direito de modificar, suspender ou descontinuar qualquer parte do site a
                qualquer momento, sem aviso prévio.
              </p>
              <p className="leading-relaxed">
                As informações disponibilizadas têm caráter exclusivamente institucional e
                informativo, não constituindo oferta, proposta ou garantia de qualquer natureza
                sobre os serviços descritos.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-display font-semibold text-institutional-navy mb-4">
                6. Links Externos
              </h2>
              <p className="leading-relaxed">
                Este site pode conter links para sites de terceiros inseridos apenas como referência.
                A Env Neo Ltda. não controla o conteúdo desses sites e não assume responsabilidade
                por seu conteúdo, políticas ou práticas.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-display font-semibold text-institutional-navy mb-4">
                7. Privacidade
              </h2>
              <p className="leading-relaxed">
                O tratamento de dados pessoais eventualmente coletados por meio deste site é
                descrito na nossa{' '}
                <a href="/politica-privacidade" className="text-primary hover:underline">
                  Política de Privacidade
                </a>
                , em conformidade com a Lei Geral de Proteção de Dados (Lei 13.709/2018 — LGPD).
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-display font-semibold text-institutional-navy mb-4">
                8. Modificações dos Termos
              </h2>
              <p className="leading-relaxed">
                A Env Neo Ltda. pode atualizar estes Termos de Uso a qualquer momento. Alterações
                significativas serão indicadas pela data de &ldquo;Última atualização&rdquo; no
                início deste documento. O uso continuado do site após alterações constitui aceite
                dos novos Termos.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-display font-semibold text-institutional-navy mb-4">
                9. Lei Aplicável e Foro
              </h2>
              <p className="leading-relaxed">
                Estes Termos são regidos pela legislação brasileira. Quaisquer disputas
                relacionadas ao uso deste site serão submetidas ao foro da comarca de
                Uberlândia-MG, com renúncia expressa a qualquer outro, por mais privilegiado que seja.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-display font-semibold text-institutional-navy mb-4">
                10. Contato
              </h2>
              <p className="leading-relaxed mb-4">
                Para dúvidas sobre estes Termos de Uso:
              </p>
              <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-primary">
                <p className="font-semibold text-institutional-navy mb-2">Env Neo Ltda.</p>
                <p className="mb-1">
                  E-mail:{' '}
                  <a href="mailto:govevia@govevia.com.br" className="text-primary hover:underline">
                    govevia@govevia.com.br
                  </a>
                </p>
                <p className="mb-1">CNPJ: 36.207.211/0001-47</p>
                <p>Endereço: Av. Palmeira Imperial, 165 / 302, CEP 38.406-582, Uberlândia-MG</p>
              </div>
            </section>

            <div className="mt-16 pt-8 border-t border-gray-200">
              <p className="text-sm text-institutional-lightgray text-center">
                Estes Termos de Uso são regidos pela legislação brasileira — Lei nº 12.965/2014 (Marco Civil da Internet)
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
