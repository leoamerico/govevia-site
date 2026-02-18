import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET() {
  let portalApiBaseHost: string | null = null
  try {
    const v = process.env.NEXT_PUBLIC_API_BASE_URL
    if (v) portalApiBaseHost = new URL(v).host
  } catch {
    portalApiBaseHost = null
  }

  const body = {
    commitSha: process.env.VERCEL_GIT_COMMIT_SHA || null,
    commitRef: process.env.VERCEL_GIT_COMMIT_REF || null,
    vercelEnv: process.env.VERCEL_ENV || null,
    vercelRegion: process.env.VERCEL_REGION || null,
    portalApiBaseHost,
    deployedAt: new Date().toISOString(),
  }

  return NextResponse.json(body, {
    status: 200,
    headers: {
      'cache-control': 'no-store, max-age=0',
    },
  })
}
