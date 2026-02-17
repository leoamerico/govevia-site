import { ImageResponse } from 'next/og'
import { TOKENS_RUNTIME } from '@/packages/design-tokens/dist/tokens.runtime'

export const runtime = 'edge'

export const alt = 'Govevia — Governança Executável para Administração Pública'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
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
          }}
        >
          <div
            style={{
              fontSize: 80,
              fontWeight: 800,
              color: white,
              letterSpacing: '-2px',
              lineHeight: 1,
            }}
          >
            GOVEVIA
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginTop: 16,
              gap: 12,
            }}
          >
            <div style={{ width: 40, height: 1, background: 'rgba(255,255,255,0.3)' }} />
            <div
              style={{
                fontSize: 18,
                fontWeight: 400,
                color: 'rgba(255,255,255,0.5)',
                letterSpacing: '6px',
                textTransform: 'uppercase' as const,
              }}
            >
              by EnvNeo
            </div>
            <div style={{ width: 40, height: 1, background: 'rgba(255,255,255,0.3)' }} />
          </div>

          <div
            style={{
              width: 80,
              height: 2,
              background: gold,
              marginTop: 40,
              marginBottom: 40,
              borderRadius: 1,
            }}
          />

          <div
            style={{
              fontSize: 24,
              fontWeight: 400,
              color: 'rgba(255,255,255,0.85)',
              letterSpacing: '0.5px',
            }}
          >
            Governança Executável para Administração Pública
          </div>

          <div
            style={{
              fontSize: 14,
              fontWeight: 300,
              color: 'rgba(255,255,255,0.35)',
              marginTop: 24,
              letterSpacing: '2px',
            }}
          >
            Lei 9.784/99 · LGPD · ICP-Brasil · LAI
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: 30,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: 'rgba(255,255,255,0.25)',
              letterSpacing: '1px',
            }}
          >
            ENV-NEO LTDA · CNPJ 36.207.211/0001-47
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
