/**
 * Admin section layout — adiciona barra de navegação interna ao /admin/*.
 * Não exibido na tela de login (pois o login tem seu próprio layout inline).
 */
import Link from 'next/link'

const navLinks = [
  { href: '/admin/ops', label: 'Ops' },
  { href: '/admin/rules', label: 'Regras' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <nav
        style={{
          background: '#1e293b',
          borderBottom: '1px solid #334155',
          padding: '0.5rem 1.5rem',
          display: 'flex',
          gap: '1.25rem',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            color: '#0059B3',
            letterSpacing: '0.1em',
            textTransform: 'uppercase' as const,
            fontFamily: 'monospace',
            marginRight: '0.5rem',
          }}
        >
          CEO Console
        </span>
        {navLinks.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            style={{
              color: '#94a3b8',
              fontSize: '0.8rem',
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            {l.label}
          </Link>
        ))}
      </nav>
      {children}
    </>
  )
}
