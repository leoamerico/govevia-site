import type { Metadata } from 'next'
import Header from '@/components/Header'
import LegalDevicesSection from '@/components/legal/LegalDevicesSection.client'

export const metadata: Metadata = {
  title: 'Base Legal | Govevia',
  description:
    'Marco regulatório brasileiro que fundamenta a plataforma Govevia: LGPD, LAI, LRF, Lei 14.129/21, CF/88 e os principais dispositivos de compliance para a administração pública municipal.',
  keywords: [
    'base legal',
    'marco regulatório',
    'LGPD',
    'LAI',
    'LRF',
    'Lei 14.129',
    'compliance público',
    'administração pública',
    'Govevia',
  ],
  openGraph: {
    title: 'Base Legal — Marco Regulatório | Govevia',
    description:
      'Dispositivos legais que a plataforma Govevia monitora e executa para prefeituras e órgãos públicos.',
    url: 'https://govevia.com.br/base-legal',
  },
}

export default function BaseLegalPage() {
  return (
    <>
      <Header />

      <main>
        {/* Hero */}
        <section className="bg-slate-950 pb-12 pt-24">
          <div className="container-custom">
            <div className="mx-auto max-w-2xl text-center">
              <span className="mb-4 inline-block rounded-full border border-sky-800 bg-sky-950 px-4 py-1.5 font-mono text-xs font-medium text-sky-400">
                Marco Regulatório
              </span>
              <h1 className="font-sans text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Base Legal
              </h1>
              <p className="mt-4 text-lg leading-relaxed text-gray-400">
                Dispositivos legais, constitucionais e infralegais que a
                plataforma Govevia monitora, aplica e executa em tempo real para
                órgãos públicos municipais.
              </p>
            </div>
          </div>
        </section>

        {/* Seção de normas */}
        <section className="bg-slate-950 py-12">
          <div className="container-custom">
            <LegalDevicesSection showSource={false} />
          </div>
        </section>

        {/* Nota metodológica */}
        <section className="border-t border-white/5 bg-slate-950 py-10">
          <div className="container-custom">
            <div className="mx-auto max-w-2xl rounded-lg border border-white/10 bg-white/4 p-6 text-sm text-gray-500">
              <p className="font-semibold text-gray-400">Nota metodológica</p>
              <p className="mt-2 leading-relaxed">
                Os dispositivos listados são registrados e mantidos no banco de
                dados da plataforma Govevia (modelo{' '}
                <code className="font-mono text-xs text-gray-400">
                  LegalDevice
                </code>
                ). Novos dispositivos são adicionados pelo time técnico à medida
                que novas regras de conformidade são incorporadas ao motor de
                governança. A coluna{' '}
                <em>urnLex</em> identifica cada norma de forma inequívoca
                seguindo o padrão{' '}
                <a
                  href="https://lexml.gov.br"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-500 hover:text-sky-400 hover:underline"
                >
                  LexML Brasil
                </a>
                .
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
