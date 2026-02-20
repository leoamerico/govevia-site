'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'

type Props = {
  productName: string
  legalEntityName: string
  goveviaLogoSvg: string | null
  inpiStatus: string
  /** Itens de navegação filtrados pelo servidor: apenas o que tem conteúdo real. */
  navigation: Array<{ name: string; href: string }>
}

export default function HeaderClient({ productName, legalEntityName, goveviaLogoSvg, inpiStatus, navigation }: Props) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const logoAriaLabel = `${productName}${inpiStatus.trim() ? ` (${inpiStatus.trim()})` : ''}`

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-[#080c14]/98 backdrop-blur-md shadow-[0_1px_0_0_rgba(16,110,253,0.25),0_4px_24px_0_rgba(0,0,0,0.4)]'
          : 'bg-[#080c14]/90 backdrop-blur-sm'
      }`}
    >
      <nav className="container-custom" aria-label="Navegação principal">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center">
            {goveviaLogoSvg ? (
              <span className="flex items-center gap-2.5" role="img" aria-label={logoAriaLabel}>
                <span
                  className="flex-shrink-0"
                  style={{ width: '32px', height: '32px', display: 'inline-flex', alignItems: 'center' }}
                  dangerouslySetInnerHTML={{ __html: goveviaLogoSvg }}
                />
                <span className="font-bold text-[1.15rem] tracking-tight text-white leading-none">
                  {productName}
                </span>
              </span>
            ) : (
              <Image
                src="/brand/govevia-lockup-on-white.png"
                alt={productName}
                width={400}
                height={120}
                className="h-8 w-auto"
                priority
              />
            )}

            {legalEntityName.trim().length > 0 ? (
              <>
                <span className="mx-3 h-6 w-px bg-gray-200" aria-hidden="true" />
                <span className="hidden sm:inline text-xs font-sans font-semibold text-gray-400 tracking-wide">
                  {legalEntityName}
                </span>
              </>
            ) : null}
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-300 hover:text-primary-light font-medium text-sm relative transition-colors duration-200 after:absolute after:bottom-[-3px] after:left-0 after:h-[2px] after:w-0 hover:after:w-full after:bg-primary after:transition-[width] after:duration-300 after:content-['']"
              >
                {item.name}
              </Link>
            ))}
            <Link href="#contato" className="btn-primary text-sm px-6 py-3 group">
              Fale com nossa equipe
              <span className="ml-2 transition-transform duration-200 group-hover:translate-x-0.5 inline-block" aria-hidden="true">→</span>
            </Link>
          </div>

          <button
            type="button"
            className="md:hidden p-2 rounded-md text-gray-300 hover:text-primary-light focus:outline-none focus:ring-2 focus:ring-primary"
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
          <div className="md:hidden py-4 border-t border-white/10">
            <div className="flex flex-col space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-300 hover:text-primary-light font-medium transition-colors duration-200 py-2"
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
