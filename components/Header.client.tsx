'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'

type Props = {
  productName: string
  legalEntityName: string
  goveviaLogoSvg: string | null
  inpiStatus: string
}

export default function HeaderClient({ productName, legalEntityName, goveviaLogoSvg, inpiStatus }: Props) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navigation = [
    { name: 'Início', href: '/' },
    { name: 'Plataforma', href: '/plataforma' },
    { name: 'Publicações', href: '/blog' },
    { name: 'Histórico', href: '/historico' },
    { name: 'Sobre', href: '/sobre' },
  ]

  const logoAriaLabel = `${productName}${inpiStatus.trim() ? ` (${inpiStatus.trim()})` : ''}`

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md' : 'bg-white/95 backdrop-blur-sm'
      }`}
    >
      <nav className="container-custom" aria-label="Navegação principal">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center">
            {goveviaLogoSvg ? (
              <span
                className="h-7 w-auto text-institutional-navy"
                aria-label={logoAriaLabel}
                role="img"
                dangerouslySetInnerHTML={{ __html: goveviaLogoSvg }}
              />
            ) : (
              <Image
                src="/brand/govevia-wordmark-on-white.png"
                alt={productName}
                width={325}
                height={313}
                className="h-7 w-auto"
                priority
              />
            )}

            <span className="mx-3 h-6 w-px bg-gray-200" aria-hidden="true" />

            <span className="flex items-center gap-2">
              <Image
                src="/brand/envneo-on-white.png"
                alt={legalEntityName}
                width={28}
                height={28}
                className="h-6 w-6"
                priority
              />
              {legalEntityName.trim().length > 0 ? (
                <span className="hidden sm:inline text-xs font-sans font-semibold text-institutional-slate tracking-wide">
                  {legalEntityName}
                </span>
              ) : null}
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-institutional-graphite hover:text-primary font-medium transition-colors duration-200 text-sm"
              >
                {item.name}
              </Link>
            ))}
            <Link href="#contato" className="btn-primary text-sm px-6 py-3">
              Fale com nossa equipe
            </Link>
          </div>

          <button
            type="button"
            className="md:hidden p-2 rounded-md text-institutional-graphite hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Abrir menu de navegação"
            aria-expanded={isMobileMenuOpen}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {isMobileMenuOpen ? (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-institutional-graphite hover:text-primary font-medium transition-colors duration-200 py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <Link href="#contato" className="btn-primary text-center" onClick={() => setIsMobileMenuOpen(false)}>
                Fale com nossa equipe
              </Link>
            </div>
          </div>
        ) : null}
      </nav>
    </header>
  )
}
