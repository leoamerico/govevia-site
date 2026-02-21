import { ImageResponse } from 'next/og'

export const size = { width: 64, height: 64 }
export const contentType = 'image/png'
export const runtime = 'edge'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#080C14',
          borderRadius: '14px',
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="52"
          height="52"
          viewBox="0 0 100 100"
        >
          <defs>
            <linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff7a3c" />
              <stop offset="100%" stopColor="#ffb380" />
            </linearGradient>
            <linearGradient id="gg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3a8bfe" />
              <stop offset="100%" stopColor="#106efd" />
            </linearGradient>
          </defs>

          {/* G arc */}
          <path
            d="M50 12 A39 39 0 1 0 84 62 L68 62 L68 48 L50 48"
            fill="none"
            stroke="url(#gg)"
            strokeWidth={9}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Connector dot */}
          <circle cx={68} cy={48} r={5} fill="#106efd" />

          {/* Star spark — top-right */}
          <path
            d="M80 16 L82 21.5 L88 23.5 L82 25.5 L80 31 L78 25.5 L72 23.5 L78 21.5 Z"
            fill="url(#sg)"
          />

          {/* Star spark — bottom-left */}
          <path
            d="M16 70 L17.4 74 L22 75.5 L17.4 77 L16 81 L14.6 77 L10 75.5 L14.6 74 Z"
            fill="url(#sg)"
          />

          {/* Star spark — bottom-right */}
          <path
            d="M83 74 L84 77 L87 78 L84 79 L83 82 L82 79 L79 78 L82 77 Z"
            fill="url(#sg)"
            opacity={0.85}
          />
        </svg>
      </div>
    ),
    { ...size },
  )
}
