import fs from 'fs'
import path from 'path'
import HeaderClient from '@/components/Header.client'
import { GOVEVIA_PRODUCT_NAME } from '@/lib/brand/envneo'
import { getAllPosts } from '@/lib/blog'

export default function Header() {
  const publishedPostCount = getAllPosts().length

  let goveviaLogoSvg: string | null = null
  try {
    let raw = fs.readFileSync(
      path.join(process.cwd(), 'public/brand/govevia-mark-on-white.svg'),
      'utf8'
    )
    // Force SVG to fill its container instead of using fixed 500×500
    raw = raw.replace(/width="500"/, 'width="100%"').replace(/height="500"/, 'height="100%"')
    goveviaLogoSvg = raw
  } catch {
    // fallback to PNG if SVG not found
  }

  const navigation = [
    { name: 'Início', href: '/' },
    { name: 'Plataforma', href: '/plataforma' },
    ...(publishedPostCount > 0 ? [{ name: 'Publicações', href: '/blog' }] : []),
    { name: 'Sobre', href: '/sobre' },
  ]

  return (
    <HeaderClient
      productName={GOVEVIA_PRODUCT_NAME}
      legalEntityName=""
      goveviaLogoSvg={goveviaLogoSvg}
      inpiStatus=""
      navigation={navigation}
    />
  )
}
