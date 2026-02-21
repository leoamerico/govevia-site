import type { Metadata } from 'next'
import './globals.css'
import { Analytics } from '@vercel/analytics/next'
import Footer from '@/components/Footer'
import CookieConsent from '@/components/CookieConsent'
import AdminAccessButton from '@/components/AdminAccessButton'
import {
  ENVNEO_CNPJ,
  ENVNEO_ADDRESS,
  ENVNEO_SEGMENT,
  GOVEVIA_PRODUCT_NAME,
  ENVNEO_SITE_URL,
} from '@/lib/brand/envneo'

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
  authors: [{ name: 'Govevia', url: 'https://govevia.com.br' }],
  creator: 'Govevia',
  publisher: 'Govevia',
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
      name: GOVEVIA_PRODUCT_NAME,
      url: ENVNEO_SITE_URL,
      logo: `${ENVNEO_SITE_URL}/brand/govevia-mark-on-white.png`,
      description: ENVNEO_SEGMENT,
      address: {
        '@type': 'PostalAddress',
        streetAddress: ENVNEO_ADDRESS.street,
        addressLocality: ENVNEO_ADDRESS.city.split('-')[0],
        addressRegion: ENVNEO_ADDRESS.city.split('-')[1],
        postalCode: ENVNEO_ADDRESS.zip.replace(/\./g, ''),
        addressCountry: 'BR',
      },
      taxID: ENVNEO_CNPJ,
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
    <html lang="pt-BR">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
        />
      </head>
      <body>
        {children}
        <Footer />
        <CookieConsent />
        <AdminAccessButton />
        <Analytics />
      </body>
    </html>
  )
}
