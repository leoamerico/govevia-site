import { ImageResponse } from 'next/og'
import { PERSONAS, type PersonaId } from '@/lib/plataforma/ssot'
import { TOKENS_RUNTIME } from '@/packages/design-tokens/dist/tokens.runtime'
import { GOVEVIA_PRODUCT_NAME, GOVEVIA_TAGLINE, ENVNEO_SITE_URL } from '@/lib/brand/envneo'

export const runtime = 'edge'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

type Props = {
    params: { persona: string }
}

export default async function Image({ params }: Props) {
    const personaId = params.persona as PersonaId
    const persona = PERSONAS[personaId]

    if (!persona) {
        return new ImageResponse(<div />)
    }

    const c = TOKENS_RUNTIME
    const navy = c.brand.institutional.navy
    const mid = c.brand.govevia.primary[800]
    const blue = c.brand.govevia.primary[700]
    const white = c.ui.text.inverse
    const gold = c.brand.govevia.accent.gold

    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    background: `linear-gradient(135deg, ${navy} 0%, ${mid} 50%, ${blue} 100%)`,
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    position: 'relative',
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        opacity: 0.06,
                        backgroundImage:
                            'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                        backgroundSize: '40px 40px',
                    }}
                />

                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        position: 'relative',
                        zIndex: 1,
                        padding: '0 80px',
                        textAlign: 'center',
                    }}
                >
                    <div
                        style={{
                            fontSize: 88,
                            fontWeight: 800,
                            color: white,
                            letterSpacing: '-3px',
                            lineHeight: 1.1,
                            marginBottom: 16,
                        }}
                    >
                        {persona.label}
                    </div>

                    <div
                        style={{
                            fontSize: 24,
                            fontWeight: 400,
                            color: 'rgba(255,255,255,0.7)',
                            letterSpacing: '1px',
                            maxWidth: '800px',
                            marginBottom: 40,
                        }}
                    >
                        {persona.subtitle}
                    </div>

                    <div
                        style={{
                            width: 80,
                            height: 2,
                            background: gold,
                            borderRadius: 1,
                            marginBottom: 40,
                        }}
                    />

                    <div
                        style={{
                            fontSize: 28,
                            fontWeight: 600,
                            color: white,
                            letterSpacing: '0.5px',
                        }}
                    >
                        {GOVEVIA_TAGLINE}
                    </div>
                </div>

                <div
                    style={{
                        position: 'absolute',
                        bottom: 40,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                    }}
                >
                    <div
                        style={{
                            fontSize: 14,
                            color: 'rgba(255,255,255,0.4)',
                            letterSpacing: '2px',
                            textTransform: 'uppercase',
                        }}
                    >
                        {GOVEVIA_PRODUCT_NAME} · {new URL(ENVNEO_SITE_URL).hostname}
                    </div>
                </div>
            </div>
        ),
        { ...size }
    )
}
