import Link from 'next/link'

import { ENVNEO_BRAND } from '@/lib/brand/envneo'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const legalEntityNameNormalized = ENVNEO_BRAND.legalEntityName
  const productName = ENVNEO_BRAND.productName
  const inpiStatus = 'Marca em processo de registro no INPI.'

  return (
    <footer className="bg-institutional-navy text-white">
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="mb-4">
              <h3 className="text-2xl font-serif font-bold" title={inpiStatus.trim() ? inpiStatus : undefined}>
                {productName}
              </h3>
              <div className="mt-2 flex items-center gap-2 text-gray-400">
                <p className="text-xs font-mono tracking-widest uppercase">
                  por {legalEntityNameNormalized}
                </p>
              </div>
            </div>
            <p className="text-gray-300 mb-4 leading-relaxed">
              {ENVNEO_BRAND.tagline}
            </p>
            <p className="text-sm text-gray-400 leading-relaxed">
              {ENVNEO_BRAND.description}
            </p>
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
              <li><a href={`mailto:${ENVNEO_BRAND.email}`} className="hover:text-primary-light transition-colors">{ENVNEO_BRAND.email}</a></li>
              <li className="pt-2">
                <p className="text-xs text-gray-500">
                  {ENVNEO_BRAND.address.street}<br />
                  CEP: {ENVNEO_BRAND.address.zip}<br />
                  {ENVNEO_BRAND.address.city}, {ENVNEO_BRAND.address.country}
                </p>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-sm text-gray-400">
              <p className="font-semibold text-gray-300 mb-2">{legalEntityNameNormalized}</p>
              <p>CNPJ: {ENVNEO_BRAND.cnpj}</p>
              <p className="mt-2">{ENVNEO_BRAND.segment}</p>
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
          <p>© {currentYear} {legalEntityNameNormalized}. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
