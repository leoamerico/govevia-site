import { readFileSync } from 'fs';
import { resolve } from 'path';
import type { Metadata } from 'next';
import { MDXRemote } from 'next-mdx-remote/rsc';
import Header from '@/components/Header';
import { Callout } from '@/components/ui/Callout';
import { DecisionBadge } from '@/components/ui/DecisionBadge';

// Garante runtime Node.js — readFileSync não funciona em Edge Runtime.
// Nunca remover sem migrar a leitura do MDX para fetch/import estático.
export const runtime = 'nodejs';

export const metadata: Metadata = {
  title: 'Arquitetura Técnica | Govevia',
  description:
    'Apêndice técnico de arquitetura da plataforma Govevia — decisões, trade-offs e gates de qualidade.',
};

const MASTER_PATH = resolve(process.cwd(), 'docs/platform/appendix-architecture.mdx');

const components = { Callout, DecisionBadge };

export default function ArquiteturaPage() {
  const source = readFileSync(MASTER_PATH, 'utf8');

  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <article className="prose prose-invert prose-headings:font-semibold prose-h2:mt-12 prose-h3:mt-8 prose-table:text-sm max-w-none">
          <MDXRemote source={source} components={components} />
        </article>
      </main>
    </>
  );
}
