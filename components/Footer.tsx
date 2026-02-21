import Link from 'next/link'

import { ENVNEO_BRAND } from '@/lib/brand/envneo'
import { findRef, FOOTER_SLUGS } from '@/lib/legal/legal-references'
import GoveviaMarkSvg from '@/components/brand/GoveviaMarkSvg'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const b = ENVNEO_BRAND

  return (
    <footer className="bg-institutional-navy text-white">
      {/* Brand gradient accent bar */}
      <div
        aria-hidden="true"
        style={{ height: '3px', background: 'linear-gradient(90deg, #106efd 0%, #38b6ff 43%, #5ce1e6 72%, #ff751f 100%)' }}
      />

      <div className="container-custom py-12">
        {/* ── 3-column grid ─────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* COLUNA 1 — Marca + Navegação */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <GoveviaMarkSvg size={24} />
              <span className="text-xl font-serif font-bold text-white tracking-tight">
                {b.productName}
              </span>
            </div>
            <p className="text-sm text-gray-400 mb-6">{b.segment}</p>

            <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
              <Link href="/" className="text-gray-300 hover:text-primary-light transition-colors">Início</Link>
              <Link href="/plataforma" className="text-gray-300 hover:text-primary-light transition-colors">Plataforma</Link>
              <Link href="/blog" className="text-gray-300 hover:text-primary-light transition-colors">Publicações</Link>
              <Link href="/sobre" className="text-gray-300 hover:text-primary-light transition-colors">Sobre</Link>
            </nav>
            <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm mt-2">
              <Link href="/politica-privacidade" className="text-gray-300 hover:text-primary-light transition-colors">Política de Privacidade</Link>
              <Link href="/termos-de-uso" className="text-gray-300 hover:text-primary-light transition-colors">Termos de Uso</Link>
            </nav>
          </div>

          {/* COLUNA 2 — Contato resumido */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Fale conosco
            </h3>

            <a
              href={`mailto:${b.email}`}
              className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors mb-2"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {b.email}
            </a>
            <a
              href={b.phoneTel}
              className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors mb-6"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {b.phone}
            </a>

            <Link
              href="#contato"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md border border-primary/40 hover:border-primary text-sm text-primary hover:text-white transition-colors"
            >
              Entre em contato
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {/* COLUNA 3 — Conformidade */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Marco Regulatório
            </h3>
            <div className="flex flex-wrap gap-2">
              {FOOTER_SLUGS.map((slug) => {
                const ref = findRef(slug)
                if (!ref) return null
                return (
                  <a
                    key={slug}
                    href={ref.official_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={ref.full_name}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-white/5 border border-white/10 text-xs text-gray-300 font-mono tracking-tight hover:border-white/20 hover:text-gray-200 transition-colors"
                  >
                    {ref.short_name}
                    <svg className="w-3 h-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── Rodapé final — 1 linha ───────────────────── */}
        <div className="border-t border-white/10 mt-10 pt-6 text-center text-xs text-gray-500">
          <p>
            {b.legalEntityName} · CNPJ {b.cnpj} · © {currentYear} {b.productName}. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
