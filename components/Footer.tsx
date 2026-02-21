import Link from 'next/link'

import { ENVNEO_BRAND } from '@/lib/brand/envneo'
import GoveviaMarkSvg from '@/components/brand/GoveviaMarkSvg'

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
        {/* Brand mark + Title */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <GoveviaMarkSvg size={28} />
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-white tracking-tight">
            {productName}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* ── Contato Institucional ─────────────────────── */}
          <div>
            <h3 className="text-xl font-serif font-bold text-white mb-6">
              Contato Institucional
            </h3>

            {/* E-mail + Telefone row */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-300 mb-1">E-mail</p>
                <a
                  href={`mailto:${ENVNEO_BRAND.email}`}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {ENVNEO_BRAND.email}
                </a>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-300 mb-1">Telefone</p>
                <a
                  href={`tel:${ENVNEO_BRAND.phone.replace(/[\s()-]/g, '')}`}
                  className="text-sm text-gray-200 hover:text-white transition-colors"
                >
                  {ENVNEO_BRAND.phone}
                </a>
              </div>
            </div>

            {/* Details list */}
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-2.5">
                <svg className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <div>
                  <p className="text-gray-300 font-medium">Razão Social</p>
                  <p className="text-gray-200">{ENVNEO_BRAND.legalEntityName}</p>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <svg className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div>
                  <p className="text-gray-300 font-medium">CNPJ</p>
                  <p className="text-gray-200">{ENVNEO_BRAND.cnpj}</p>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <svg className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <p className="text-gray-300 font-medium">Endereço</p>
                  <p className="text-gray-200">{ENVNEO_BRAND.address.street}</p>
                  <p className="text-gray-200">CEP: {ENVNEO_BRAND.address.zip}</p>
                  <p className="text-gray-200">{ENVNEO_BRAND.address.city}, {ENVNEO_BRAND.address.country}</p>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <svg className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <div>
                  <p className="text-gray-300 font-medium">Atividade</p>
                  <p className="text-gray-200">{ENVNEO_BRAND.segment}</p>
                </div>
              </li>
            </ul>
          </div>

          {/* ── Liderança ────────────────────────────────── */}
          <div className="bg-white/5 rounded-2xl p-8">
            <h3 className="text-xl font-serif font-bold text-white mb-6">
              Liderança
            </h3>

            <p className="text-xs uppercase tracking-wider text-primary-light font-semibold mb-2">
              {ENVNEO_BRAND.founder.role}
            </p>
            <p className="text-xl font-serif font-bold text-white mb-1">
              {ENVNEO_BRAND.founder.name}
            </p>
            <p className="text-sm text-gray-300 mb-4">
              Responsável por implantação e desenvolvimento
            </p>

            <a
              href={`mailto:${ENVNEO_BRAND.founder.email}`}
              className="block text-sm text-blue-400 hover:text-blue-300 transition-colors mb-3"
            >
              {ENVNEO_BRAND.founder.email}
            </a>

            <a
              href={`https://wa.me/${ENVNEO_BRAND.founder.phone.replace(/[\s()+\-]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-gray-200 hover:text-white transition-colors"
            >
              {/* WhatsApp icon */}
              <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              {ENVNEO_BRAND.founder.phone}
            </a>
          </div>
        </div>

        {/* ── Links institucionais ─────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 pt-8 border-t border-white/10">
          <Link href="/" className="text-sm text-gray-300 hover:text-primary-light transition-colors">Início</Link>
          <Link href="/plataforma" className="text-sm text-gray-300 hover:text-primary-light transition-colors">Plataforma</Link>
          <Link href="/blog" className="text-sm text-gray-300 hover:text-primary-light transition-colors">Publicações</Link>
          <Link href="/sobre" className="text-sm text-gray-300 hover:text-primary-light transition-colors">Sobre</Link>
          <Link href="/politica-privacidade" className="text-sm text-gray-300 hover:text-primary-light transition-colors">Política de Privacidade</Link>
          <Link href="/termos-de-uso" className="text-sm text-gray-300 hover:text-primary-light transition-colors">Termos de Uso</Link>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-sm">
              <p className="font-semibold text-gray-200 mb-1">{ENVNEO_BRAND.legalEntityName}</p>
              <p className="text-xs text-gray-300">CNPJ: {ENVNEO_BRAND.cnpj}</p>
              <p className="text-xs text-gray-400 mt-1">{ENVNEO_BRAND.segment}</p>
              <address className="not-italic text-xs text-gray-500 mt-2 leading-relaxed">
                {ENVNEO_BRAND.address.street}<br />
                CEP {ENVNEO_BRAND.address.zip}<br />
                {ENVNEO_BRAND.address.city}, {ENVNEO_BRAND.address.country}
              </address>
            </div>
            <div className="text-xs text-gray-400 md:text-right">
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

        <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>© {currentYear} {productName}. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
