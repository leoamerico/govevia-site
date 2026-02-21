import Link from 'next/link'

import { ENVNEO_BRAND } from '@/lib/brand/envneo'
import { findRef, FOOTER_SLUGS } from '@/lib/legal/legal-references'
import GoveviaMarkSvg from '@/components/brand/GoveviaMarkSvg'
import { getAllPosts } from '@/lib/blog'

export default function Footer() {
    const currentYear = new Date().getFullYear()
    const b = ENVNEO_BRAND
    const publishedPostCount = getAllPosts().length

    return (
        <footer className="bg-institutional-navy text-white">
            {/* Brand gradient accent bar */}
            <div
                aria-hidden="true"
                style={{ height: '3px', background: 'linear-gradient(90deg, #106efd 0%, #38b6ff 43%, #5ce1e6 72%, #ff751f 100%)' }}
            />

            <div className="container-custom py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

                    {/* COLUNA 1 — Logo + Navegação */}
                    <div>
                        <div className="flex items-center gap-2.5 mb-3">
                            <GoveviaMarkSvg size={24} />
                            <span className="text-xl font-serif font-bold text-white tracking-tight">
                                {b.productName}
                            </span>
                        </div>
                        <p className="text-sm text-slate-300 mb-6">{b.segment}</p>

                        <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
                            <Link href="/" className="text-slate-200 hover:text-primary-light transition-colors">Início</Link>
                            <Link href="/plataforma" className="text-slate-200 hover:text-primary-light transition-colors">Plataforma</Link>
                            {publishedPostCount > 0 && (
                                <Link href="/blog" className="text-slate-200 hover:text-primary-light transition-colors">Publicações</Link>
                            )}
                            <Link href="/sobre" className="text-slate-200 hover:text-primary-light transition-colors">Sobre</Link>
                        </nav>
                        <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm mt-2">
                            <Link href="/politica-privacidade" className="text-slate-200 hover:text-primary-light transition-colors">Política de Privacidade</Link>
                            <Link href="/termos-de-uso" className="text-slate-200 hover:text-primary-light transition-colors">Termos de Uso</Link>
                        </nav>
                    </div>

                    {/* COLUNA 2 — Marco Regulatório */}
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
                                        className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-white/5 border border-white/10 text-xs text-slate-200 font-mono tracking-tight hover:border-white/20 hover:text-gray-200 transition-colors"
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

                    {/* COLUNA 3 — placeholder mantém grid 3 colunas */}
                    <div />
                </div>
            </div>

            {/* Copyright */}
            <div className="border-t border-white/10 py-6 text-center text-xs text-gray-500">
                <p>
                    {b.legalEntityName} · CNPJ {b.cnpj} · © {currentYear} {b.productName}. Todos os direitos reservados.
                </p>
            </div>
        </footer>
    )
}
