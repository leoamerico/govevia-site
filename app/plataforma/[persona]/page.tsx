import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import Header from '@/components/Header'
import { PERSONAS, type PersonaId } from '@/lib/plataforma/ssot'
import { PlatformLayout } from '../PlatformLayout'

type Props = {
    params: { persona: string }
}

export async function generateStaticParams() {
    return (Object.keys(PERSONAS) as PersonaId[]).map((persona) => ({
        persona,
    }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const personaId = params.persona as PersonaId
    const persona = PERSONAS[personaId]

    if (!persona) return {}

    return {
        title: `${persona.seoTitle} | Govevia`,
        description: persona.seoDescription,
        alternates: {
            canonical: `/plataforma/${personaId}`,
        },
        openGraph: {
            title: persona.seoTitle,
            description: persona.seoDescription,
            type: 'website',
        },
    }
}

export default function PersonaPage({ params }: Props) {
    const personaId = params.persona as PersonaId
    const persona = PERSONAS[personaId]

    if (!persona) {
        notFound()
    }

    return (
        <>
            <Header />
            <main>
                <PlatformLayout initialView={personaId} />
            </main>
        </>
    )
}
