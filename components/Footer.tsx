import Link from 'next/link'

import { ENVNEO_BRAND } from '@/lib/brand/envneo'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const productName = ENVNEO_BRAND.productName

  return (
    <footer className="bg-institutional-navy text-white">
      {/* Brand gradient accent bar */}
      <div
        aria-hidden="true"
        style={{ height: '3px', background: 'linear-gradient(90deg, #106efd 0%, #38b6ff 43%, #5ce1e6 72%, #ff751f 100%)' }}
      />
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="mb-5 flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #106efd 0%, #5ce1e6 100%)' }}
                aria-hidden="true"
              >
                <span className="text-white font-bold text-lg leading-none">G</span>
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                {productName}
              </h3>
            </div>
            <p className="text-gray-200 mb-4 leading-relaxed font-medium">
              {ENVNEO_BRAND.tagline}
            </p>
            <p className="text-sm text-gray-400 leading-relaxed">
              {ENVNEO_BRAND.description}
            </p>
            <a
              href={`mailto:${ENVNEO_BRAND.email}`}
              className="inline-flex items-center mt-5 text-sm text-primary-light hover:text-white transition-colors gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {ENVNEO_BRAND.email}
            </a>
          </div>

          <div>
            <h4 className="font-sans font-semibold mb-4 text-sm uppercase tracking-wider text-gray-300">Institucional</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/" className="text-gray-400 hover:text-primary-light transition-colors">Início</Link></li>
              <li><Link href="/plataforma" className="text-gray-400 hover:text-primary-light transition-colors">Plataforma</Link></li>
              <li><Link href="/blog" className="text-gray-400 hover:text-primary-light transition-colors">Publicações</Link></li>
              <li><Link href="/historico" className="text-gray-400 hover:text-primary-light transition-colors">Histórico</Link></li>
              <li><Link href="/sobre" className="text-gray-400 hover:text-primary-light transition-colors">Sobre</Link></li>
              <li><Link href="/politica-privacidade" className="text-gray-400 hover:text-primary-light transition-colors">Política de Privacidade</Link></li>
              <li><Link href="/termos-de-uso" className="text-gray-400 hover:text-primary-light transition-colors">Termos de Uso</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-sans font-semibold mb-4 text-sm uppercase tracking-wider text-gray-300">Contato</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="text-xs text-gray-500">
                {ENVNEO_BRAND.address.street}<br />
                CEP: {ENVNEO_BRAND.address.zip}<br />
                {ENVNEO_BRAND.address.city}, {ENVNEO_BRAND.address.country}
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-sm">
              <p className="font-semibold text-gray-200 mb-1">{ENVNEO_BRAND.legalEntityName}</p>
              <p className="text-xs text-gray-400">CNPJ: {ENVNEO_BRAND.cnpj}</p>
              <p className="text-xs text-gray-500 mt-1">{ENVNEO_BRAND.segment}</p>
              <address className="not-italic text-xs text-gray-600 mt-2 leading-relaxed">
                {ENVNEO_BRAND.address.street}<br />
                CEP {ENVNEO_BRAND.address.zip}<br />
                {ENVNEO_BRAND.address.city}, {ENVNEO_BRAND.address.country}
              </address>
            </div>
            <div className="text-xs text-gray-500 md:text-right">
              <p className="mb-1">Conformidade Regulatória:</p>
              <p>
                <a
                  href="https://www.planalto.gov.br/ccivil_03/leis/l9784.htm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary-light transition-colors"
                >
                  Lei 9.784/99
                </a>{' '}
                ·{' '}
                <a
                  href="https://www2.camara.leg.br/legin/fed/lei/2021/lei-14129-29-marco-2021-791203-publicacaooriginal-162567-pl.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary-light transition-colors"
                >
                  Lei 14.129/2021
                </a>{' '}
                ·{' '}
                <a
                  href="https://www2.camara.leg.br/legin/fed/lei/2018/lei-13709-14-agosto-2018-787077-normaatualizada-pl.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary-light transition-colors"
                >
                  LGPD
                </a>
              </p>
              <p>
                <a
                  href="https://www.mpu.mp.br/contratacoes"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary-light transition-colors"
                >
                  Lei 14.133/2021
                </a>{' '}
                ·{' '}
                <a
                  href="https://www.faifsul.org/lei-de-acesso-a-informacao-lei-12-527-2011/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary-light transition-colors"
                >
                  LAI
                </a>{' '}
                ·{' '}
                <a
                  href="http://www.comprasnet.gov.br/legislacao/medidas/2200.htm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary-light transition-colors"
                >
                  ICP-Brasil
                </a>
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm text-gray-500">
          <p>© {currentYear} {productName}. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
