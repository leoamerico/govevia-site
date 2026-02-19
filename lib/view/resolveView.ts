/**
 * resolveView — Seleção determinística de persona de ViewBlock
 *
 * Ordem de prioridade:
 *  1. Query string ?view=<persona>
 *  2. Cookie gv_view
 *  3. Default: 'procurador'
 *
 * ADR: docs/architecture/decisions/ADR-VIEW-SELECTION-PERSONAS.md
 */

export type ViewPersona =
  | 'default'
  | 'prefeito'
  | 'procurador'
  | 'controlador'
  | 'secretario'

const VALID_PERSONAS: ReadonlySet<ViewPersona> = new Set([
  'default',
  'prefeito',
  'procurador',
  'controlador',
  'secretario',
])

const DEFAULT_PERSONA: ViewPersona = 'procurador'
const COOKIE_NAME = 'gv_view'

function isValidPersona(v: unknown): v is ViewPersona {
  return typeof v === 'string' && VALID_PERSONAS.has(v as ViewPersona)
}

/**
 * Resolve a persona de ViewBlock a partir de searchParams e cookies.
 *
 * @param searchParams - URLSearchParams ou Record<string, string> (ex: from Next.js page props)
 * @param cookieStore  - objeto com método get(name): { value: string } | undefined
 */
export function resolveView(
  searchParams: URLSearchParams | Record<string, string | string[] | undefined> | null,
  cookieStore?: { get(name: string): { value: string } | undefined } | null,
): ViewPersona {
  // 1. Query string ?view=
  if (searchParams) {
    const raw =
      searchParams instanceof URLSearchParams
        ? searchParams.get('view')
        : (searchParams['view'] as string | undefined)
    if (isValidPersona(raw)) return raw
  }

  // 2. Cookie gv_view
  if (cookieStore) {
    const cookie = cookieStore.get(COOKIE_NAME)
    if (cookie && isValidPersona(cookie.value)) return cookie.value
  }

  // 3. Padrão determinístico
  return DEFAULT_PERSONA
}
