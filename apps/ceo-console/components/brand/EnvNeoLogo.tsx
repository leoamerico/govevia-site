/**
 * EnvNeoLogo — Fonte única de verdade para a logo corporativa Env Neo Ltda.
 *
 * REGRA: O path "/brand/envneo/logo.svg" DEVE existir APENAS neste arquivo.
 * Para trocar a logo: substituir apps/ceo-console/public/brand/envneo/logo.svg
 * Não alterar código. Ver docs/brand/BRAND-ASSETS.md.
 */

interface EnvNeoLogoProps {
  className?: string
}

export function EnvNeoLogo({ className = 'h-10 w-auto' }: EnvNeoLogoProps) {
  return (
    <img
      src="/brand/envneo/logo.svg"
      alt="Env Neo Ltda."
      className={className}
      loading="eager"
      decoding="async"
    />
  )
}
