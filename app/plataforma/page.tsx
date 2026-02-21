import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import Header from '@/components/Header'
import type { PersonaId } from '@/lib/plataforma/ssot'
import { PlatformLayout } from './PlatformLayout'

export const metadata: Metadata = {
  title: 'Plataforma | Govevia',
  description:
    'Infraestrutura de governança executável — gestão de processos, urbanismo, assinatura digital, auditoria, LGPD e transparência pública para municípios.',
  keywords: [
    'plataforma govtech',
    'governança executável',
    'gestão de processos municipais',
    'assinatura digital ICP-Brasil',
    'auditoria pública',
    'conformidade LGPD',
    'transparência LAI',
  ],
}

type Props = {
  searchParams?: Record<string, string | string[] | undefined>
}

function parseInitialView(value: unknown): PersonaId | null {
  if (typeof value !== 'string') return null
  const valid: PersonaId[] = ['prefeito', 'procurador', 'auditor', 'secretario']
  return valid.includes(value as PersonaId) ? (value as PersonaId) : null
}

export default function PlatformPage({ searchParams }: Props) {
  const initialView = parseInitialView(searchParams?.view)

  // Se não houver vista inicial, redireciona para o prefeito como padrão
  if (!initialView) {
    redirect('/plataforma/prefeito')
  }

  return (
    <>
      <Header />
      <main>
        <PlatformLayout initialView={initialView} />
      </main>
    </>
  )
}
