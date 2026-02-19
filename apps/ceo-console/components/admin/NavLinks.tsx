'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navLinks = [
  { href: '/admin/pi', label: 'PI' },
  { href: '/admin/bpmn', label: 'Processos' },
  { href: '/admin/legislacao', label: 'Legislação' },
  { href: '/admin/ops', label: 'Ops' },
  { href: '/admin/rules', label: 'Regras' },
]

export function NavLinks() {
  const pathname = usePathname()

  return (
    <>
      {navLinks.map((l) => {
        const active = pathname === l.href || pathname.startsWith(l.href + '/')
        return (
          <Link
            key={l.href}
            href={l.href}
            style={{
              color: active ? '#f1f5f9' : '#94a3b8',
              fontSize: '0.8rem',
              fontWeight: active ? 600 : 500,
              textDecoration: 'none',
              paddingBottom: '0.15rem',
              borderBottom: active ? '2px solid #0059B3' : '2px solid transparent',
              transition: 'color 0.15s, border-color 0.15s',
            }}
          >
            {l.label}
          </Link>
        )
      })}
    </>
  )
}
