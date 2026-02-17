import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PlataformaView from '@/components/plataforma/PlataformaView.client'
import { PERSONAS, type PersonaId } from '@/lib/plataforma/ssot'

export const metadata: Metadata = {
  title: 'Plataforma | Visão por Persona',
  description: 'Visão da plataforma com capacidades canônicas reordenadas por persona, evidências exigidas e link compartilhável via ?view=.',
  keywords: [
    'plataforma govtech',
    'governança executável',
    'evidência verificável',
    'auditoria pública',
    'conformidade municipal'
  ],
}

type Props = {
  searchParams?: Record<string, string | string[] | undefined>
}

function parseInitialView(value: unknown): PersonaId | null {
  if (typeof value !== 'string') return null
  return value in PERSONAS ? (value as PersonaId) : null
}

export default function PlatformPage({ searchParams }: Props) {
  const initialView = parseInitialView(searchParams?.view)
  return (
    <>
      <Header />
      <PlataformaView initialView={initialView} />
      <Footer />
    </>
  )
}

