'use client'

import { useEffect, useState } from 'react'
import { stopImpersonationAction } from '@/app/admin/impersonate/actions'

type ImpersonationInfo = {
  personaId: string
  personaLabel: string
  contextId: string | null
  contextLabel: string | null
}

function readDisplayCookie(): ImpersonationInfo | null {
  if (typeof document === 'undefined') return null
  const entry = document.cookie
    .split('; ')
    .find((row) => row.startsWith('govevia_impersonation_info='))
  if (!entry) return null
  try {
    const raw = decodeURIComponent(entry.split('=').slice(1).join('='))
    return JSON.parse(raw) as ImpersonationInfo
  } catch {
    return null
  }
}

export default function ImpersonationBanner() {
  const [info, setInfo] = useState<ImpersonationInfo | null>(null)

  useEffect(() => {
    setInfo(readDisplayCookie())
  }, [])

  if (!info) return null

  return (
    <div
      role="banner"
      aria-label="Modo de personificação ativo"
      className="fixed bottom-0 left-0 right-0 z-[9998] flex items-center justify-between gap-4 bg-amber-500 px-4 py-2.5 text-sm text-white shadow-[0_-2px_12px_rgba(0,0,0,0.15)] font-sans"
    >
      {/* Left: info */}
      <div className="flex min-w-0 items-center gap-2">
        {/* Eye icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
        <span className="shrink-0 font-semibold">Personificação:</span>
        <span className="truncate">
          {info.personaLabel}
          {info.contextLabel ? <> &middot; {info.contextLabel}</> : null}
        </span>
      </div>

      {/* Right: actions */}
      <div className="flex shrink-0 items-center gap-3">
        <a
          href="/admin/impersonate"
          className="text-xs text-white/90 underline hover:no-underline"
        >
          Ajustar
        </a>
        <form action={stopImpersonationAction}>
          <button
            type="submit"
            className="rounded bg-white/20 px-3 py-1 text-xs font-semibold hover:bg-white/30 transition-colors"
          >
            Encerrar
          </button>
        </form>
      </div>
    </div>
  )
}
