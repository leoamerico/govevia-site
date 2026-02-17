import { AXES_LABELS, CAPABILITIES, PERSONAS, reorderCapabilities, type PersonaId } from '@/lib/plataforma/model'

type Props = {
  activePersonaId: PersonaId | null
}

export default function CapabilitiesMatrix({ activePersonaId }: Props) {
  const persona = activePersonaId ? PERSONAS[activePersonaId] : null
  const ordered = persona ? reorderCapabilities(persona.order) : CAPABILITIES
  const evidenceSet = new Set(persona?.evidences ?? [])

  return (
    <div>
      <div className="text-xs font-mono text-institutional-silver mb-6">
        {persona ? `Cards ordenados por relevância — ${persona.label}` : 'Visão canônica — capacidades'}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {ordered.map((cap, idx) => {
          const isEvidence = evidenceSet.has(cap.id)
          const isPriority = Boolean(persona) && idx < 2

          return (
            <article key={cap.id} className="rounded-lg border border-gray-200 bg-white p-6">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="text-primary font-mono" aria-hidden="true">
                      {cap.icon}
                    </div>
                    <h2 className="text-lg md:text-xl font-serif font-semibold text-institutional-navy">{cap.title}</h2>
                    {isPriority ? (
                      <span className="text-xs font-mono rounded-md border border-primary/20 bg-primary/5 px-2 py-0.5 text-institutional-navy">
                        PRIORIDADE
                      </span>
                    ) : null}
                    {isEvidence ? (
                      <span className="text-xs font-mono rounded-md border border-primary/20 bg-primary/5 px-2 py-0.5 text-institutional-navy">
                        EVIDÊNCIA
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm font-mono text-institutional-slate">{cap.subtitle}</p>
                </div>
              </div>

              <p className="mt-4 text-sm text-institutional-graphite font-sans leading-relaxed max-w-4xl">{cap.description}</p>

              <div className="mt-5 flex flex-wrap gap-2">
                {cap.axes.map((ax) => (
                  <span
                    key={ax}
                    className="text-[0.65rem] font-mono tracking-wide rounded-md border border-gray-200 bg-institutional-offwhite px-2 py-1 text-institutional-slate"
                  >
                    {AXES_LABELS[ax]}
                  </span>
                ))}
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
