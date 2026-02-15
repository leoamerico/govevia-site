import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'
import readingTime from 'reading-time'

const postsDirectory = path.join(process.cwd(), 'content/blog')

export interface BlogPost {
  slug: string
  title: string
  date: string
  description: string
  author: string
  tags: string[]
  readingTime: string
  content: string
}

export interface BlogPostMeta {
  slug: string
  title: string
  date: string
  description: string
  author: string
  tags: string[]
  readingTime: string
}

export function getAllPostSlugs(): string[] {
  if (!fs.existsSync(postsDirectory)) return []
  return fs.readdirSync(postsDirectory)
    .filter(file => file.endsWith('.md'))
    .map(file => file.replace(/\.md$/, ''))
}

export function getAllPosts(): BlogPostMeta[] {
  const slugs = getAllPostSlugs()
  const posts = slugs.map(slug => getPostMeta(slug)).filter(Boolean) as BlogPostMeta[]
  return posts.sort((a, b) => (a.date > b.date ? -1 : 1))
}

export function getPostMeta(slug: string): BlogPostMeta | null {
  const fullPath = path.join(postsDirectory, `${slug}.md`)
  if (!fs.existsSync(fullPath)) return null

  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)
  const stats = readingTime(content)

  return {
    slug,
    title: data.title || '',
    date: data.date || '',
    description: data.description || '',
    author: data.author || 'ENV-NEO LTDA',
    tags: data.tags || [],
    readingTime: stats.text.replace('min read', 'min de leitura'),
  }
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const fullPath = path.join(postsDirectory, `${slug}.md`)
  if (!fs.existsSync(fullPath)) return null

  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)
  const stats = readingTime(content)

  const processedContent = await remark()
    .use(html, { sanitize: false })
    .process(content)

  return {
    slug,
    title: data.title || '',
    date: data.date || '',
    description: data.description || '',
    author: data.author || 'ENV-NEO LTDA',
    tags: data.tags || [],
    readingTime: stats.text.replace('min read', 'min de leitura'),
    content: processedContent.toString(),
  }
}
