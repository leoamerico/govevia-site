'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import type { PersonaId } from '@/lib/plataforma/model'

type Props = {
  activePersonaId: PersonaId | null
  helperText: string
  ariaLabel: string
  personas: Array<{ id: PersonaId; label: string; role: string }>
}

export default function PersonaSelector({ activePersonaId, helperText, ariaLabel, personas }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function setView(next: PersonaId | null) {
    const p = new URLSearchParams(searchParams.toString())
    if (next) p.set('view', next)
    else p.delete('view')

    const qs = p.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname)
  }

  return (
    <div>
      {helperText.trim().length > 0 ? (
        <div className="text-xs font-mono text-gray-500 mb-3">
          {helperText}
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2" role="group" aria-label={ariaLabel}>
        {personas.map((persona) => {
          const id = persona.id
          const isActive = activePersonaId === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => setView(isActive ? null : id)}
              aria-pressed={isActive}
              className={
                isActive
                  ? 'rounded-md border border-primary bg-primary/20 px-4 py-2 text-sm font-sans font-semibold text-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
                  : 'rounded-md border border-white/20 bg-white/5 px-4 py-2 text-sm font-sans font-semibold text-gray-200 hover:border-primary/50 hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
              }
            >
              {persona.label}
              {persona.role.trim().length > 0 ? (
                <span className="ml-2 text-xs font-mono text-gray-400">{persona.role}</span>
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}
