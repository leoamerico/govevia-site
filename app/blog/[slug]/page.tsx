import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getPostBySlug, getAllPosts } from '@/lib/blog'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { Suspense } from 'react'

interface Props {
  params: { slug: string }
  searchParams?: { view?: string; ctx?: string }
}

export async function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPostBySlug(params.slug)
  if (!post) return {}

  return {
    title: post.title,
    description: post.description,
    authors: [{ name: post.author }],
    keywords: post.tags,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      modifiedTime: post.lastModified,
      authors: [post.author],
      tags: post.tags,
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const post = await getPostBySlug(params.slug)
  if (!post || post.draft) notFound()

  const schemaArticle = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.lastModified,
    author: {
      '@type': 'Organization',
      name: post.author,
      url: 'https://govevia.com.br',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Govevia',
      url: 'https://govevia.com.br',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://govevia.com.br/blog/${post.slug}`,
    },
    keywords: post.tags.join(', '),
  }

  return (
    <>
      <Header />
      <main>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaArticle) }}
        />

        {/* Article Header */}
        <section className="pt-32 pb-12 bg-zinc-950">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto">
              <Link
                href="/blog"
                className="inline-flex items-center text-sm text-gray-300 hover:text-primary transition-colors font-sans mb-8"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Voltar às publicações
              </Link>

              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-sans font-semibold text-primary bg-primary/10 px-3 py-1 rounded-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-6 leading-tight">
                {post.title}
              </h1>

              <p className="text-xl text-gray-300 font-sans leading-relaxed mb-8">
                {post.description}
              </p>

              <div className="flex items-center gap-4 text-sm text-gray-300 font-sans pb-8 border-b border-white/10">
                <time dateTime={post.date}>
                  {new Date(post.date).toLocaleDateString('pt-BR', {
                    year: 'numeric', month: 'long', day: 'numeric',
                  })}
                </time>
                <span>·</span>
                <span>{post.readingTime}</span>
                <span>·</span>
                <span>{post.author}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Article Body */}
        <section className="py-12 bg-zinc-950">
          <div className="container-custom">
            <article
              className="max-w-3xl mx-auto prose prose-lg prose-slate
                  prose-headings:font-serif prose-headings:text-white prose-headings:font-bold
                  prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4
                  prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                  prose-p:font-sans prose-p:text-gray-300 prose-p:leading-relaxed
                  prose-li:font-sans prose-li:text-gray-300
                  prose-strong:text-white
                  prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                  prose-blockquote:border-primary prose-blockquote:bg-zinc-900 prose-blockquote:py-1 prose-blockquote:px-6 prose-blockquote:rounded-r-lg
                  prose-code:text-primary prose-code:bg-primary/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
                  prose-pre:bg-zinc-800 prose-pre:text-gray-200"
            >
              {post.format === 'mdx' ? (
                <Suspense fallback={null}>
                  <MDXRemote source={post.content} />
                </Suspense>
              ) : (
                <div dangerouslySetInnerHTML={{ __html: post.content }} />
              )}
            </article>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-zinc-900">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-gray-300 font-sans mb-6">
                Tem dúvidas sobre conformidade digital na sua administração municipal?
              </p>
              <Link href="/#contato" className="btn-primary">
                Fale com nossa equipe técnica
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
