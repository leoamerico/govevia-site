import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import { getAllPosts } from '@/lib/blog'

export const metadata: Metadata = {
  title: 'Publicações | Governança Digital Municipal',
  description: 'Artigos técnicos sobre enforcement normativo, evidência verificável, controles de conformidade e governança executável para administração pública municipal.',
  keywords: [
    'governança digital municipal', 'enforcement normativo', 'evidência verificável',
    'compliance público', 'auditoria pública digital', 'LGPD setor público',
  ],
}

export default function BlogPage() {
  const posts = getAllPosts()

  return (
    <>
      <Header />
      <main>
        <section className="relative pt-32 pb-16 bg-zinc-950">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">
                Publicações
              </h1>
              <p className="text-xl text-gray-300 font-sans leading-relaxed max-w-3xl mx-auto">
                Artigos técnicos sobre governança digital, enforcement normativo e conformidade
                regulatória para administração pública municipal.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 bg-zinc-950">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto">
              {posts.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-gray-300 font-sans text-lg">
                    Não há publicações disponíveis no momento.
                  </p>
                </div>
              ) : (
                <div className="space-y-8">
                  {posts.map((post) => (
                    <article
                      key={post.slug}
                      className="border-b border-white/10 pb-8 last:border-b-0"
                    >
                      <Link href={`/blog/${post.slug}`} className="group block">
                        <div className="flex flex-wrap gap-2 mb-3">
                          {post.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-xs font-sans font-semibold text-primary bg-primary/10 px-3 py-1 rounded-md"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        <h2 className="text-2xl md:text-3xl font-serif font-bold text-white group-hover:text-primary transition-colors duration-200 mb-3">
                          {post.title}
                        </h2>

                        <p className="text-gray-300 font-sans leading-relaxed mb-4">
                          {post.description}
                        </p>

                        <div className="flex items-center gap-4 text-sm text-gray-300 font-sans">
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
                      </Link>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
