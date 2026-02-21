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
  GOVEVIA_TAGLINE,
  GOVEVIA_DESCRIPTION,
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
  authors: [{ name: GOVEVIA_PRODUCT_NAME, url: ENVNEO_SITE_URL }],
  creator: GOVEVIA_PRODUCT_NAME,
  publisher: GOVEVIA_PRODUCT_NAME,
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
    url: ENVNEO_SITE_URL,
    title: `${GOVEVIA_PRODUCT_NAME} | ${GOVEVIA_TAGLINE}`,
    description: GOVEVIA_DESCRIPTION,
    siteName: GOVEVIA_PRODUCT_NAME,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${GOVEVIA_PRODUCT_NAME} | ${GOVEVIA_TAGLINE}`,
    description: GOVEVIA_DESCRIPTION,
  },
}

const schemaOrg = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${ENVNEO_SITE_URL}/#organization`,
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
      '@id': `${ENVNEO_SITE_URL}/#software`,
      name: GOVEVIA_PRODUCT_NAME,
      applicationCategory: 'GovernmentApplication',
      operatingSystem: 'Web',
      description: GOVEVIA_DESCRIPTION,
      author: { '@id': `${ENVNEO_SITE_URL}/#organization` },
      offers: {
        '@type': 'Offer',
        category: 'Government Software',
      },
    },
    {
      '@type': 'WebSite',
      '@id': `${ENVNEO_SITE_URL}/#website`,
      url: ENVNEO_SITE_URL,
      name: GOVEVIA_PRODUCT_NAME,
      publisher: { '@id': `${ENVNEO_SITE_URL}/#organization` },
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
