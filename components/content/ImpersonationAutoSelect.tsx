'use client'

/**
 * ImpersonationAutoSelect
 *
 * When a CEO/admin impersonation session is active (detected via the non-httpOnly
 * display cookie), and the current blog post page has no ?view= param already,
 * this component automatically navigates to ?view=<personaId>[&ctx=<ctxId>]
 * so the ViewProvider renders the correct persona-specific ViewBlocks.
 *
 * Must be wrapped in <Suspense> at the call-site because it uses useSearchParams.
 */

import { useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

type ImpersonationInfo = {
  personaId: string
  contextId: string | null
}

function readImpersonationCookie(): ImpersonationInfo | null {
  if (typeof document === 'undefined') return null
  const entry = document.cookie
    .split('; ')
    .find((row) => row.startsWith('govevia_impersonation_info='))
  if (!entry) return null
  try {
    const raw = decodeURIComponent(entry.split('=').slice(1).join('='))
    const parsed = JSON.parse(raw) as { personaId?: unknown; contextId?: unknown }
    if (typeof parsed.personaId !== 'string') return null
    return {
      personaId: parsed.personaId,
      contextId: typeof parsed.contextId === 'string' ? parsed.contextId : null,
    }
  } catch {
    return null
  }
}

export default function ImpersonationAutoSelect() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Only auto-navigate once: if view is already set, don't override
    if (searchParams.get('view')) return

    const info = readImpersonationCookie()
    if (!info) return

    const p = new URLSearchParams()
    p.set('view', info.personaId)
    if (info.contextId) p.set('ctx', info.contextId)
    router.replace(`${pathname}?${p.toString()}`)
  }, [pathname, router, searchParams])

  return null
}
