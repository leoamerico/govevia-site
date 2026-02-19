import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CEO Console | EnvNeo',
  description: 'Console interno de gestão — acesso restrito.',
  robots: { index: false, follow: false },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#0f172a', color: '#f8fafc' }}>
        {children}
      </body>
    </html>
  )
}
