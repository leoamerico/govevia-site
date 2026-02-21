/**
 * app/api/core/leis/route.ts
 * ────────────────────────────────────────────────────────
 * BFF — Rota de API do Next.js que expõe dispositivos legais.
 *
 * Estratégia (kernel-first com fallback estático):
 *   1. Se KERNEL_API_URL + KERNEL_SERVICE_TOKEN estiverem
 *      configurados, chama GET /public/v1/portal/legislation
 *      do govevia-kernel (endpoint a ser adicionado).
 *   2. Caso o kernel não esteja disponível (variáveis ausentes
 *      ou erro na chamada), cai no arquivo estático:
 *      content/normas-legais.json
 *
 * Parâmetros de query:
 *   esfera   "federal" | "estadual" | "municipal"
 *   status   "ativa" | "revogada" | "suspensa"  (default: "ativa")
 *   q        texto livre (filtra label + content)
 *
 * Cache: revalidado a cada 1 hora (ISR).
 * ────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  fromKernelDevice,
  fromStaticNorma,
  type KernelLegalDevice,
  type LegalDevicesPayload,
  type NormaLegal,
  type StaticNorma,
} from '@/lib/kernel/types'
import normasJson from '@/content/normas-legais.json'

// Revalida a cada 1 hora no Vercel Edge Cache
export const revalidate = 3600

// ── Dados estáticos de fallback ───────────────────────────
const STATIC_NORMAS = normasJson as StaticNorma[]

// ── Helpers ───────────────────────────────────────────────
function applyFilters(
  data: NormaLegal[],
  esfera: string | null,
  status: string | null,
  q: string | null,
): NormaLegal[] {
  let result = data
  if (esfera) result = result.filter((n) => n.esfLegal === esfera)
  if (status) result = result.filter((n) => n.status === status)
  if (q) {
    const term = q.toLowerCase()
    result = result.filter(
      (n) =>
        n.label.toLowerCase().includes(term) ||
        n.content.toLowerCase().includes(term) ||
        n.lei?.toLowerCase().includes(term),
    )
  }
  return result
}

// ── Handler ───────────────────────────────────────────────
export async function GET(req: NextRequest): Promise<NextResponse<LegalDevicesPayload>> {
  const { searchParams } = req.nextUrl
  const esfera = searchParams.get('esfera')
  const status = searchParams.get('status') ?? 'ativa'
  const q = searchParams.get('q')

  const kernelUrl = process.env.KERNEL_API_URL
  const kernelToken = process.env.KERNEL_SERVICE_TOKEN

  // ── Tentativa 1: kernel Java ──────────────────────────
  if (kernelUrl && kernelToken) {
    try {
      const res = await fetch(
        `${kernelUrl}/public/v1/portal/legislation`,
        {
          headers: {
            Authorization: `Bearer ${kernelToken}`,
            Accept: 'application/json',
          },
          // Cache gerenciado pelo revalidate acima
          next: { revalidate: 3600 },
        },
      )

      if (res.ok) {
        const raw: KernelLegalDevice[] = await res.json()
        const all = raw.map(fromKernelDevice)
        const data = applyFilters(all, esfera, status, q)
        return NextResponse.json({ data, source: 'kernel', total: data.length })
      }
    } catch {
      // kernel indisponível — cai no fallback estático
    }
  }

  // ── Fallback: arquivo estático ────────────────────────
  const all = STATIC_NORMAS.map(fromStaticNorma)
  const data = applyFilters(all, esfera, status, q)
  return NextResponse.json({ data, source: 'static', total: data.length })
}
