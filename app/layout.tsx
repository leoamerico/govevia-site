import type { Metadata } from 'next'
import { Playfair_Display, Source_Sans_3 } from 'next/font/google'
import './globals.css'
import CookieConsent from '@/components/CookieConsent'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  weight: ['400', '600', '700', '800'],
})

const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-source-sans',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://govevia.com.br'),
  title: {
    default: 'Govevia | Governança Executável para Administração Pública',
    template: '%s | Govevia'
  },
  description: 'Plataforma de governança para administração pública municipal, com foco em controles técnicos, rastreabilidade e evidência operacional conforme implementação e configuração.',
  keywords: [
    'governança pública',
    'govtech',
    'administração municipal',
    'compliance público',
    'enforcement normativo',
    'evidência verificável',
    'auditoria pública',
    'Lei 14.129/2021',
    'LGPD setor público',
    'ICP-Brasil',
    'tribunais de contas'
  ],
  authors: [{ name: 'ENV-NEO LTDA', url: 'https://govevia.com.br' }],
  creator: 'ENV-NEO LTDA',
  publisher: 'ENV-NEO LTDA',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://govevia.com.br',
    title: 'Govevia | Governança Executável para Administração Pública',
    description: 'Plataforma de governança para administração pública municipal com foco em controles técnicos, rastreabilidade e evidência operacional.',
    siteName: 'Govevia',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Govevia | Governança Executável para Administração Pública',
    description: 'Plataforma de governança para administração pública municipal com foco em controles técnicos e rastreabilidade.',
  },
}

const schemaOrg = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://govevia.com.br/#organization',
      name: 'ENV-NEO LTDA',
      url: 'https://govevia.com.br',
      logo: 'https://govevia.com.br/brand/envneo-on-white.png',
      description: 'Tecnologia para Governança Pública',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Avenida Palmeira Imperial, 165 / 302',
        addressLocality: 'Uberlândia',
        addressRegion: 'MG',
        postalCode: '38406-582',
        addressCountry: 'BR',
      },
      taxID: '36.207.211/0001-47',
    },
    {
      '@type': 'SoftwareApplication',
      '@id': 'https://govevia.com.br/#software',
      name: 'Govevia',
      applicationCategory: 'GovernmentApplication',
      operatingSystem: 'Web',
      description: 'Plataforma de governança para administração pública municipal com foco em controles técnicos, rastreabilidade e evidência operacional.',
      author: { '@id': 'https://govevia.com.br/#organization' },
      offers: {
        '@type': 'Offer',
        category: 'Government Software',
      },
    },
    {
      '@type': 'WebSite',
      '@id': 'https://govevia.com.br/#website',
      url: 'https://govevia.com.br',
      name: 'Govevia',
      publisher: { '@id': 'https://govevia.com.br/#organization' },
      inLanguage: 'pt-BR',
    },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={`${playfair.variable} ${sourceSans.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
        />
      </head>
      <body>
        {children}
        <CookieConsent />
      </body>
    </html>
  )
}
