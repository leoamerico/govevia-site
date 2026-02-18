import { getContent } from '@/lib/content/getContent'
import { CAPABILITIES, PERSONAS, reorderCapabilities, type AxisId, type CapabilityId, type PersonaId } from '@/lib/plataforma/model'

type Props = {
  activePersonaId: PersonaId | null
}

async function text(key: string): Promise<string> {
  const res = await getContent({ key, fallback: '' })
  return res.value.trim()
}

const PERSONA_LABEL_KEY: Record<PersonaId, string> = {
  prefeito: 'persona.prefeito.label',
  procurador: 'persona.procurador.label',
  auditor: 'persona.auditor.label',
  secretario: 'persona.secretario.label',
}

const CAP_KEY: Record<CapabilityId, { title: string; subtitle: string; description: string }> = {
  assinatura: {
    title: 'cap.assinatura.title',
    subtitle: 'cap.assinatura.subtitle',
    description: 'cap.assinatura.description',
  },
  versionamento: {
    title: 'cap.versionamento.title',
    subtitle: 'cap.versionamento.subtitle',
    description: 'cap.versionamento.description',
  },
  alertas: {
    title: 'cap.alertas.title',
    subtitle: 'cap.alertas.subtitle',
    description: 'cap.alertas.description',
  },
  trilha: {
    title: 'cap.trilha.title',
    subtitle: 'cap.trilha.subtitle',
    description: 'cap.trilha.description',
  },
  exportacao: {
    title: 'cap.exportacao.title',
    subtitle: 'cap.exportacao.subtitle',
    description: 'cap.exportacao.description',
  },
}

const AXIS_KEY: Record<AxisId, string> = {
  gestao: 'cap.axis.gestao.label',
  planejamento: 'cap.axis.planejamento.label',
  assinatura: 'cap.axis.assinatura.label',
  auditoria: 'cap.axis.auditoria.label',
  governanca: 'cap.axis.governanca.label',
  transparencia: 'cap.axis.transparencia.label',
}

export default async function CapabilitiesMatrix({ activePersonaId }: Props) {
  const persona = activePersonaId ? PERSONAS[activePersonaId] : null
  const ordered = persona ? reorderCapabilities(persona.order) : CAPABILITIES
  const evidenceSet = new Set(persona?.evidences ?? [])

  const [
    captionGlobal,
    captionPrefix,
    pillPriority,
    pillEvidence,
    personaLabel,
  ] = await Promise.all([
    text('site.plataforma.matrix.caption.global'),
    text('site.plataforma.matrix.caption.prefix'),
    text('site.plataforma.matrix.pill.priority'),
    text('site.plataforma.matrix.pill.evidence'),
    persona ? text(PERSONA_LABEL_KEY[persona.id]) : Promise.resolve(''),
  ])

  const caption = persona && captionPrefix && personaLabel
    ? `${captionPrefix} ${personaLabel}`
    : captionGlobal

  const cards = await Promise.all(
    ordered.map(async (cap) => {
      const keys = CAP_KEY[cap.id]
      const [title, subtitle, description] = await Promise.all([text(keys.title), text(keys.subtitle), text(keys.description)])

      if (!title && !subtitle && !description) return null

      const axes = await Promise.all(
        cap.axes.map(async (ax) => ({ ax, label: await text(AXIS_KEY[ax]) })),
      )

      return {
        cap,
        title,
        subtitle,
        description,
        axes: axes.filter((a) => a.label.trim().length > 0),
      }
    }),
  )

  const visibleCards = cards.filter((c): c is NonNullable<typeof c> => Boolean(c))

  if (visibleCards.length === 0) {
    return null
  }

  return (
    <div>
      {caption ? <div className="text-xs font-mono text-institutional-silver mb-6">{caption}</div> : null}

      <div className="grid grid-cols-1 gap-6">
        {visibleCards.map((card, idx) => {
          const { cap, title, subtitle, description, axes } = card
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
                    {title ? (
                      <h2 className="text-lg md:text-xl font-serif font-semibold text-institutional-navy">{title}</h2>
                    ) : null}
                    {isPriority && pillPriority ? (
                      <span className="text-xs font-mono rounded-md border border-primary/20 bg-primary/5 px-2 py-0.5 text-institutional-navy">
                        {pillPriority}
                      </span>
                    ) : null}
                    {isEvidence && pillEvidence ? (
                      <span className="text-xs font-mono rounded-md border border-primary/20 bg-primary/5 px-2 py-0.5 text-institutional-navy">
                        {pillEvidence}
                      </span>
                    ) : null}
                  </div>
                  {subtitle ? <p className="mt-2 text-sm font-mono text-institutional-slate">{subtitle}</p> : null}
                </div>
              </div>

              {description ? (
                <p className="mt-4 text-sm text-institutional-graphite font-sans leading-relaxed max-w-4xl">{description}</p>
              ) : null}

              {axes.length > 0 ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  {axes.map(({ ax, label }) => (
                  <span
                    key={ax}
                    className="text-[0.65rem] font-mono tracking-wide rounded-md border border-gray-200 bg-institutional-offwhite px-2 py-1 text-institutional-slate"
                  >
                    {label}
                  </span>
                  ))}
                </div>
              ) : null}
            </article>
          )
        })}
      </div>
    </div>
  )
}
