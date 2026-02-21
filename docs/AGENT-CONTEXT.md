# Contexto para Agentes de IA — Govevia Site

> **Documento canônico.** Os arquivos `.cursorrules`, `.github/copilot-instructions.md` e `.agent/workflows/*.md` referenciam este documento. Para identidade do produto, personas e matriz de relacionamento, veja [MASTER-PROMPT-GOVEVIA.md](MASTER-PROMPT-GOVEVIA.md).

---

## 1. Visão Geral do Projeto

| Item | Valor |
|---|---|
| **Framework** | Next.js 14 (App Router) |
| **Estilo** | Tailwind CSS |
| **Tipografia** | `font-serif` (headings), `font-sans` (corpo), `font-mono` (badges/código) |
| **Deploy** | Vercel (webhook GitHub → build automático) |
| **Linguagem do código** | TypeScript (strict) |
| **Linguagem do conteúdo** | Português (pt-BR) |
| **Repositórios** | Site: `d:/govevia-site` · Core/Produto: `d:/govevia` |

---

## 2. Regras Hard (não negociáveis)

1. **ZERO HEX hardcoded** — usar tokens/classes Tailwind, nunca `style={{ color: '#xxx' }}`
2. **ZERO `@import` externo** — nada de Google Fonts, `url(http)`, etc. CSP estrita
3. **Fail-closed** — qualquer auth/middleware/admin falha fechado se env faltar ou for inválido
4. **CHANGELOG.md é SSOT** — toda mudança atualiza o changelog (gate `history:check`)
5. **1 commit = 1 escopo lógico** — não misturar escopos em um único commit
6. **ADRs imutáveis** — após status `Aceito`, mudança de decisão = novo ADR
7. **Domínios separados** — Produto/Serviço ≠ Corporativo (Marca/INPI/CRM)

---

## 3. Arquitetura de Layout

### Componentes globais (definidos em `app/layout.tsx`)

| Componente | Arquivo | Observação |
|---|---|---|
| `Footer` | `components/Footer.tsx` | Renderizado automaticamente em todas as páginas |
| `CookieConsent` | `components/CookieConsent.tsx` | Banner de consentimento LGPD |
| `AdminAccessButton` | `components/AdminAccessButton.tsx` | Acesso administrativo |

> **REGRA CRÍTICA**: `Footer` **nunca** deve ser importado em páginas individuais. É gerenciado exclusivamente pelo `layout.tsx`.

### Header

O `Header` ainda é importado **por página** (não está no layout). Ao criar novas páginas, incluir:

```tsx
import Header from '@/components/Header'
```

---

## 4. Fontes Únicas de Verdade (SSOT)

### Dados da marca — `lib/brand/envneo.ts`

Todas as informações institucionais (nome, CNPJ, endereço, e-mail, telefone, tagline) vêm deste arquivo. **Nunca hardcodar** esses dados em componentes.

```tsx
// ✅ Correto
import { ENVNEO_BRAND } from '@/lib/brand/envneo'

// ❌ Errado
const cnpj = '36.207.211/0001-47'
```

### Referências legais — `lib/legal/legal-references.ts`

URLs de leis, nomes curtos e completos. Usar `findRef()`, `refUrl()`, `FOOTER_SLUGS` e `BADGE_SLUGS`.

```tsx
// ✅ Correto
import { findRef, refUrl } from '@/lib/legal/legal-references'

// ❌ Errado
const lgpdUrl = 'https://planalto.gov.br/...'
```

---

## 5. Convenções de Código

### Componentes

- **Server Components** por padrão
- **Client Components** sufixados com `.client.tsx` (ex.: `Header.client.tsx`)
- Classes CSS: usar tokens Tailwind, nunca hex hardcoded
- Container padrão: `container-custom`

### Commits

```
tipo(escopo): descrição em português
```

Tipos: `feat`, `fix`, `refactor`, `docs`, `chore`, `style`, `test`

### Nomenclatura Padrão

| Categoria | Padrão | Exemplo |
|---|---|---|
| Commits | `tipo(escopo): descrição` | `feat(footer): adicionar link de contato` |
| Branches | `tipo/descricao-curta` | `feat/nova-pagina-sobre` |
| Artefatos de policy | `POL-*`, `RUN-*`, `REPORT-*` | `POL-ADMIN-ACCESS` |
| Keys CMS | `dominio.secao.item` | `plataforma.capability.alertas.desc` |
| Endpoints | `/v1/<resource>` (kebab-case) | `/v1/legal-references` |
| Eventos | `<domain>.<entity>.<action>` | `portal.content.updated` |

---

## 6. Governance Gates (obrigatório antes de PR)

```bash
npm run governance:check   # Gate G2 — artefatos e referências
npm run governance:g4      # Gate G4 — rastreabilidade /arquitetura
npm run governance:g3      # Gate G3 — Biblioteca de Evidências
npm run build              # Gate G1 — build Next.js
```

Todos devem retornar exit 0. PR com qualquer gate em FAIL não será revisado.

---

## 7. Estrutura de Diretórios Relevantes

```
app/                    ← Páginas (App Router)
  layout.tsx            ← Layout global (Footer, CookieConsent)
  page.tsx              ← Home
  plataforma/           ← Página da plataforma
  blog/                 ← Blog (listagem + [slug])
  sobre/                ← Página sobre
  contato/              ← Página de contato
components/             ← Componentes reutilizáveis
  Footer.tsx            ← Footer global (editado aqui, renderizado no layout)
  Header.tsx            ← Header (server component)
  Header.client.tsx     ← Header (client component)
  brand/                ← SVGs e assets da marca
  home/                 ← Componentes específicos da home
  about/                ← Componentes específicos do sobre
  plataforma/           ← Componentes da plataforma
  ui/                   ← Componentes UI genéricos (Callout, DecisionBadge)
lib/                    ← Módulos de dados e lógica
  brand/envneo.ts       ← SSOT marca/identidade
  legal/legal-references.ts ← SSOT referências legais
  blog.ts               ← Utilitários do blog
  changelog.ts          ← Parser do CHANGELOG
docs/                   ← Documentação técnica
  platform/             ← Plano operacional + ADRs
  AGENT-CONTEXT.md      ← Este arquivo (contexto para agentes)
  MASTER-PROMPT-GOVEVIA.md ← Identidade do produto + personas + matriz
```

---

## 8. Checklist para Novas Páginas

1. Importar `Header` do `@/components/Header`
2. **Não** importar `Footer` (já está no `layout.tsx`)
3. Usar dados de `lib/brand/envneo.ts` para informações institucionais
4. Usar dados de `lib/legal/legal-references.ts` para referências legais
5. Incluir `metadata` do Next.js (title, description)
6. Usar classes `container-custom`, `font-serif`, `font-sans`
7. Background padrão de páginas: `bg-zinc-950`
8. Atualizar `CHANGELOG.md`

---

## 9. Deploy

| Etapa | Ação |
|---|---|
| 1 | `git add -A` |
| 2 | `git commit -m "tipo(escopo): descrição"` |
| 3 | `git push` |
| 4 | Vercel detecta via webhook e dispara build automaticamente |
| 5 | Acompanhar em [vercel.com/dashboard](https://vercel.com/dashboard) |

> **Não é necessário** rodar `npm run build` para deploy. A Vercel faz o build remotamente. Use o build local apenas para validação antes do push.

---

## 10. Documentação Relacionada

| Documento | Localização | Propósito |
|---|---|---|
| Master Prompt | `docs/MASTER-PROMPT-GOVEVIA.md` | Identidade, personas, matriz de relacionamento |
| Contributing | `CONTRIBUTING.md` | Guia rápido para contribuidores |
| ADRs | `docs/platform/adr/` | Decisões arquiteturais |
| Plano Operacional | `docs/platform/PLANO-OPERACIONAL.md` | Regras de manutenção |
| Workflows | `.agent/workflows/` | Workflows para agentes de IA |
