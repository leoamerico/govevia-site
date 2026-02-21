/**
 * components/brand/BrandWordmark.tsx
 * ─────────────────────────────────────────────────────────
 * SSOT da identidade tipográfica da marca Govevia.
 *
 * Toda renderização do logotipo textual + ícone deve usar
 * este componente — nunca duplicar classes de fonte/tamanho
 * em Header, Footer ou qualquer outra superfície.
 *
 * Variantes de tamanho:
 *   • "sm"  — Footer, e-mail, contextos compactos  (text-lg  / ícone 20px)
 *   • "md"  — Header de navegação                  (text-xl  / ícone 28px)
 *   • "lg"  — Hero ou splash                       (text-2xl / ícone 36px)
 *
 * Tipografia canônica: font-sans (IBM Plex Sans) font-bold
 * — alinhado a section-title e h1-h6 definidos em globals.css.
 */

import Link from 'next/link'
import GoveviaMarkSvg from '@/components/brand/GoveviaMarkSvg'
import { GOVEVIA_PRODUCT_NAME } from '@/lib/brand/envneo'

type Size = 'sm' | 'md' | 'lg'

const SIZE_MAP: Record<Size, { text: string; icon: number }> = {
  sm: { text: 'text-lg',   icon: 20 },
  md: { text: 'text-xl',   icon: 28 },
  lg: { text: 'text-2xl',  icon: 36 },
}

type Props = {
  size?: Size
  /** Wraps in <Link href="/">.  Set false quando já está dentro de um link. */
  linked?: boolean
  className?: string
}

export default function BrandWordmark({ size = 'md', linked = true, className = '' }: Props) {
  const { text, icon } = SIZE_MAP[size]

  const inner = (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <GoveviaMarkSvg size={icon} className="flex-shrink-0" />
      <span className={`font-sans font-bold tracking-tight text-white leading-none ${text}`}>
        {GOVEVIA_PRODUCT_NAME}
      </span>
    </span>
  )

  if (!linked) return inner

  return (
    <Link href="/" aria-label={GOVEVIA_PRODUCT_NAME}>
      {inner}
    </Link>
  )
}
