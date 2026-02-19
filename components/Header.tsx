import HeaderClient from '@/components/Header.client'
import { ENVNEO_LEGAL_ENTITY_NAME, GOVEVIA_PRODUCT_NAME } from '@/lib/brand/envneo'
import { getAllPosts } from '@/lib/blog'

export default function Header() {
  const publishedPostCount = getAllPosts().length

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
      goveviaLogoSvg={null}
      inpiStatus=""
      navigation={navigation}
    />
  )
}
