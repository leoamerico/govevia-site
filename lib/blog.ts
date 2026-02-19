import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'
import readingTime from 'reading-time'
import { ENVNEO_LEGAL_ENTITY_NAME } from '@/lib/brand/envneo'

const postsDirectory = path.join(process.cwd(), 'content/blog')

export interface BlogPost {
  slug: string
  title: string
  date: string
  lastModified: string
  description: string
  author: string
  tags: string[]
  readingTime: string
  content: string
  format: 'mdx' | 'md'
  draft: boolean
}

export interface BlogPostMeta {
  slug: string
  title: string
  date: string
  lastModified: string
  description: string
  author: string
  tags: string[]
  readingTime: string
  draft: boolean
}

export function getAllPostSlugs(): string[] {
  if (!fs.existsSync(postsDirectory)) return []
  return fs.readdirSync(postsDirectory)
    .filter((file) => (file.endsWith('.mdx') || file.endsWith('.md')) && !file.startsWith('_'))
    .map((file) => file.replace(/\.(mdx|md)$/, ''))
}

/**
 * Retorna todos os posts publicados (draft: false ou ausente).
 * Passe `{ includeDrafts: true }` para incluir rascunhos (ex.: admin).
 */
export function getAllPosts({ includeDrafts = false } = {}): BlogPostMeta[] {
  const slugs = getAllPostSlugs()
  const posts = slugs.map(slug => getPostMeta(slug)).filter(Boolean) as BlogPostMeta[]
  const filtered = includeDrafts ? posts : posts.filter((p) => !p.draft)
  return filtered.sort((a, b) => (a.date > b.date ? -1 : 1))
}

export function getPostMeta(slug: string): BlogPostMeta | null {
  const mdxPath = path.join(postsDirectory, `${slug}.mdx`)
  const mdPath = path.join(postsDirectory, `${slug}.md`)
  const fullPath = fs.existsSync(mdxPath) ? mdxPath : mdPath
  if (!fs.existsSync(fullPath)) return null

  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)
  const stats = readingTime(content)

  let lastModified = new Date().toISOString()
  try {
    lastModified = fs.statSync(fullPath).mtime.toISOString()
  } catch {
    // Keep default lastModified
  }

  return {
    slug,
    title: data.title || '',
    date: data.date || '',
    lastModified,
    description: data.description || '',
    author: data.author || ENVNEO_LEGAL_ENTITY_NAME,
    tags: data.tags || [],
    readingTime: stats.text.replace('min read', 'min de leitura'),
    draft: data.draft === true,
  }
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const mdxPath = path.join(postsDirectory, `${slug}.mdx`)
  const mdPath = path.join(postsDirectory, `${slug}.md`)
  const fullPath = fs.existsSync(mdxPath) ? mdxPath : mdPath
  if (!fs.existsSync(fullPath)) return null

  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)
  const stats = readingTime(content)

  let lastModified = new Date().toISOString()
  try {
    lastModified = fs.statSync(fullPath).mtime.toISOString()
  } catch {
    // Keep default lastModified
  }

  const format = fullPath.endsWith('.mdx') ? 'mdx' : 'md'

  const rendered =
    format === 'md'
      ? (
          await remark()
            .use(html, { sanitize: false })
            .process(content)
        ).toString()
      : content

  return {
    slug,
    title: data.title || '',
    date: data.date || '',
    lastModified,
    description: data.description || '',
    author: data.author || ENVNEO_LEGAL_ENTITY_NAME,
    tags: data.tags || [],
    readingTime: stats.text.replace('min read', 'min de leitura'),
    content: rendered,
    format,
    draft: data.draft === true,
  }
}
