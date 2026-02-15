import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PlatformHero from '@/components/platform/PlatformHero'
import ModulesDetail from '@/components/platform/ModulesDetail'

export const metadata: Metadata = {
  title: 'Plataforma | Detalhamento Técnico',
  description: 'Detalhamento técnico dos módulos Govevia: enforcement normativo, evidência imutável, assinatura digital ICP-Brasil e conformidade regulatória para administração pública municipal.',
  keywords: [
    'plataforma govtech', 'módulos governança pública', 'enforcement normativo',
    'assinatura digital municipal', 'auditoria pública automatizada', 'conformidade LGPD setor público'
  ],
}

export default function PlatformPage() {
  return (
    <>
      <Header />
      <main>
        <PlatformHero />
        <ModulesDetail />
      </main>
      <Footer />
    </>
  )
}
