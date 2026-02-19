import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      service: 'ceo-console',
      build: process.env.VERCEL_GIT_COMMIT_SHA || null,
    },
    {
      status: 200,
      headers: {
        'cache-control': 'no-store, max-age=0',
      },
    }
  )
}
