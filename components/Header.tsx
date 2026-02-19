import HeaderClient from '@/components/Header.client'
import { getPortalBrand, sanitizeSvgAllowlist } from '@/lib/core/portalBrand'
import { getContent } from '@/lib/content/getContent'
import { normalizeLegalEntityName } from '@/lib/brand/envneo'

function isBlank(value: string | null | undefined): boolean {
  return !value || value.trim().length === 0
}

function parseClasses(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean)
}

export default async function Header() {
  const core = await getPortalBrand()

  const [
    overrideLegalEntityName,
    overrideProductName,
    overrideLogoSvg,
    overrideInpiStatus,
    overrideInpiProcessNumber,
    overrideInpiClasses,
    overrideInpiLastEventAt,
  ] = (
    await Promise.all([
      getContent({ key: 'brand.envneo.legal_entity_name', fallback: '' }),
      getContent({ key: 'brand.govevia.product_name', fallback: '' }),
      getContent({ key: 'brand.govevia.logo_svg', fallback: '' }),
      getContent({ key: 'brand.govevia.inpi.status', fallback: '' }),
      getContent({ key: 'brand.govevia.inpi.process_number', fallback: '' }),
      getContent({ key: 'brand.govevia.inpi.classes', fallback: '' }),
      getContent({ key: 'brand.govevia.inpi.last_event_at', fallback: '' }),
    ])
  ).map((r) => r.value)

  const legalEntityName = normalizeLegalEntityName(
    !isBlank(overrideLegalEntityName) ? overrideLegalEntityName : core.legal_entity_name
  )

  const productName = !isBlank(overrideProductName) ? overrideProductName : core.product_name

  const inpiStatus = !isBlank(overrideInpiStatus) ? overrideInpiStatus : core.inpi.status
  const inpiProcessNumber = !isBlank(overrideInpiProcessNumber) ? overrideInpiProcessNumber : (core.inpi.process_number ?? '')
  const inpiLastEventAt = !isBlank(overrideInpiLastEventAt) ? overrideInpiLastEventAt : (core.inpi.last_event_at ?? '')
  const inpiClasses = !isBlank(overrideInpiClasses) ? parseClasses(overrideInpiClasses) : core.inpi.classes

  // Read but do not expose more than needed in the UI; keep values local-first.
  void inpiProcessNumber
  void inpiLastEventAt
  void inpiClasses

  const rawLogoSvg = !isBlank(overrideLogoSvg) ? overrideLogoSvg : (core.logo_svg ?? '')
  const goveviaLogoSvg = sanitizeSvgAllowlist(rawLogoSvg)

  return (
    <HeaderClient
      productName={productName}
      legalEntityName={legalEntityName}
      goveviaLogoSvg={goveviaLogoSvg}
      inpiStatus={inpiStatus}
    />
  )
}
