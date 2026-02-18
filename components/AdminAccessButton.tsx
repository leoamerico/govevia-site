'use client'

import Link from 'next/link'

/**
 * Botão flutuante discreto de acesso à área administrativa.
 * Posicionado acima do ImpersonationBanner (z-[9998], bottom-0).
 * Visível apenas para quem conhece a URL — segurança real é o login.
 */
export default function AdminAccessButton() {
  return (
    <Link
      href="/admin/login"
      aria-label="Área administrativa"
      title="Área administrativa"
      className="
        fixed bottom-6 right-5 z-[9997]
        w-8 h-8
        flex items-center justify-center
        rounded-full
        bg-white/5 border border-white/10
        text-white/20
        hover:bg-institutional-navy hover:border-institutional-navy hover:text-white/80
        transition-all duration-300
        group
      "
    >
      {/* Ícone de cadeado (inline SVG — sem dependência extra) */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-3.5 h-3.5"
        aria-hidden="true"
      >
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    </Link>
  )
}
