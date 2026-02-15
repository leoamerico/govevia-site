import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AboutHero from '@/components/about/AboutHero'
import Mission from '@/components/about/Mission'
import Principles from '@/components/about/Principles'
import Company from '@/components/about/Company'

export const metadata: Metadata = {
  title: 'Sobre | ENV-NEO LTDA',
  description: 'A ENV-NEO desenvolve Govevia, plataforma de governança executável para administração pública municipal. Nossa missão: tornar a governança pública tecnicamente executável.',
  keywords: ['ENV-NEO', 'empresa govtech', 'governança pública', 'tecnologia setor público'],
}

export default function AboutPage() {
  return (
    <>
      <Header />
      <main>
        <AboutHero />
        <Mission />
        <Principles />
        <Company />
      </main>
      <Footer />
    </>
  )
}
