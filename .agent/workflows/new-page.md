---
description: Como criar uma nova página no site Govevia
---

# Criando uma nova página

1. Crie o arquivo em `app/<slug>/page.tsx`.

2. Importe o Header (o Footer já está no layout global):

```tsx
import Header from '@/components/Header'
```

1. Adicione metadata do Next.js:

```tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Título da Página',
  description: 'Descrição para SEO.',
}
```

1. Use a estrutura padrão:

```tsx
export default function NomeDaPagina() {
  return (
    <>
      <Header />
      <main>
        {/* Conteúdo da página */}
      </main>
    </>
  )
}
```

1. **Não** importe `Footer` — ele é renderizado automaticamente pelo `app/layout.tsx`.

2. Para dados institucionais, use:

```tsx
import { ENVNEO_BRAND } from '@/lib/brand/envneo'
```

1. Para referências legais, use:

```tsx
import { findRef, refUrl } from '@/lib/legal/legal-references'
```

1. Use as classes CSS padrão: `container-custom`, `bg-zinc-950`, `font-serif` (headings), `font-sans` (corpo).

2. Se a página precisar de links de navegação, adicione-os no Footer (`components/Footer.tsx`) e no Header.
