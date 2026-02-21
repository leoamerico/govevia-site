/**
 * components/brand/GoveviaMarkSvg.tsx
 * ─────────────────────────────────────────────────────────
 * SSOT — Marca Govevia como componente React (SVG inline).
 *
 * Fonte: public/brand/govevia-mark-on-white.svg
 * Consumidores: Header, Footer, e qualquer componente que
 * precise da marca visual.
 *
 * Props:
 *   size — largura/altura em px (padrão 32)
 *   className — classes Tailwind adicionais
 * ─────────────────────────────────────────────────────────
 */

type Props = {
  /** Largura e altura em px. @default 32 */
  size?: number
  className?: string
}

export default function GoveviaMarkSvg({ size = 32, className }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
      className={className}
      aria-hidden="true"
      role="img"
    >
      <defs>
        <linearGradient id="gvMark-sparkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff7a3c" />
          <stop offset="100%" stopColor="#ffb380" />
        </linearGradient>
        <linearGradient id="gvMark-gGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3a8bfe" />
          <stop offset="100%" stopColor="#106efd" />
        </linearGradient>
      </defs>

      {/* G arc — main mark */}
      <path
        d="M50 12 A39 39 0 1 0 84 62 L68 62 L68 48 L50 48"
        fill="none"
        stroke="url(#gvMark-gGrad)"
        strokeWidth={8.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Connector dot at open end of G */}
      <circle cx={68} cy={48} r={4.5} fill="#106efd" />

      {/* Constellation node — top-left */}
      <circle cx={26} cy={22} r={2.5} fill="#3a8bfe" opacity={0.55} />
      <line x1={26} y1={22} x2={35} y2={12} stroke="#3a8bfe" strokeWidth={1.2} opacity={0.3} />

      {/* Star spark — large, top-right */}
      <path
        d="M80 16 L82 21.5 L88 23.5 L82 25.5 L80 31 L78 25.5 L72 23.5 L78 21.5 Z"
        fill="url(#gvMark-sparkGrad)"
      />

      {/* Star spark — medium, bottom-left */}
      <path
        d="M16 70 L17.4 74 L22 75.5 L17.4 77 L16 81 L14.6 77 L10 75.5 L14.6 74 Z"
        fill="url(#gvMark-sparkGrad)"
      />

      {/* Star spark — small, bottom-right */}
      <path
        d="M83 74 L84 77 L87 78 L84 79 L83 82 L82 79 L79 78 L82 77 Z"
        fill="url(#gvMark-sparkGrad)"
        opacity={0.85}
      />
    </svg>
  )
}
