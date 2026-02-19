'use client'

export interface CorporateIdentityProps {
  legalName: string
  cnpj: string
  align?: 'left' | 'center' | 'right'
  tone?: 'strong' | 'muted'
}

export function CorporateIdentity({ legalName, cnpj, align = 'right', tone = 'strong' }: CorporateIdentityProps) {
  const alignItems = align === 'left' ? 'flex-start' : align === 'center' ? 'center' : 'flex-end'
  const textAlign = align === 'left' ? 'left' : align === 'center' ? 'center' : 'right'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems, gap: '1px', textAlign }}>
      <span
        style={{
          fontFamily: "'Open Sans', Arial, sans-serif",
          fontSize: '12px',
          fontWeight: 'normal',
          color: tone === 'muted' ? '#cbd5e1' : '#f8fafc',
          letterSpacing: '0.05em',
        }}
      >
        {legalName}
      </span>
      <span
        style={{
          fontFamily: "'Open Sans', Arial, sans-serif",
          fontSize: '12px',
          fontWeight: 'normal',
          color: '#64748b',
        }}
      >
        {`CNPJ: ${cnpj}`}
      </span>
    </div>
  )
}
