import { MetadataRoute } from 'next'
import fs from 'fs'
import path from 'path'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://govevia.com.br'

  const postsDirectory = path.join(process.cwd(), 'content/blog')
  const blogPostUrls: MetadataRoute.Sitemap = []

  if (fs.existsSync(postsDirectory)) {
    const slugs = fs
      .readdirSync(postsDirectory)
      .filter((file) => (file.endsWith('.mdx') || file.endsWith('.md')) && !file.startsWith('_'))
      .map((file) => file.replace(/\.(mdx|md)$/, ''))

    for (const slug of slugs) {
      const mdxPath = path.join(postsDirectory, `${slug}.mdx`)
      const mdPath = path.join(postsDirectory, `${slug}.md`)
      const fullPath = fs.existsSync(mdxPath) ? mdxPath : mdPath
      let lastModified = new Date()

      try {
        const stat = fs.statSync(fullPath)
        lastModified = stat.mtime
      } catch {
        // Keep default lastModified
      }

      blogPostUrls.push({
        url: `${baseUrl}/blog/${slug}`,
        lastModified,
        changeFrequency: 'monthly',
        priority: 0.7,
      })
    }
  }

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },
    { url: `${baseUrl}/plataforma`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    ...blogPostUrls,
    { url: `${baseUrl}/sobre`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.8 },
    { url: `${baseUrl}/politica-privacidade`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5 },
  ]
}
