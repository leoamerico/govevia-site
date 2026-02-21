import HeaderClient from '@/components/Header.client'
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
      navigation={navigation}
    />
  )
}
