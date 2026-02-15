'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('govevia-cookie-consent')
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('govevia-cookie-consent', 'accepted')
    setIsVisible(false)
  }

  const handleDecline = () => {
    localStorage.setItem('govevia-cookie-consent', 'declined')
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div
      role="dialog"
      aria-label="Consentimento de cookies"
      className="fixed bottom-0 left-0 right-0 z-50 bg-institutional-navy/95 backdrop-blur-sm border-t border-white/10 p-4 md:p-6"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="text-sm text-gray-300 leading-relaxed max-w-3xl">
          Este site utiliza cookies estritamente necessários para funcionamento.
          Não utilizamos cookies de rastreamento ou publicidade.
          Seus dados são tratados conforme a{' '}
          <Link
            href="/politica-privacidade"
            className="text-primary-light underline hover:text-white transition-colors"
          >
            Política de Privacidade
          </Link>{' '}
          e a LGPD (Lei 13.709/2018).
        </p>
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={handleDecline}
            className="text-sm text-gray-400 hover:text-white transition-colors px-4 py-2"
          >
            Rejeitar
          </button>
          <button
            onClick={handleAccept}
            className="text-sm bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-2 rounded-md transition-colors"
          >
            Aceitar
          </button>
        </div>
      </div>
    </div>
  )
}
