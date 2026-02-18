import { NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(request: Request) {
  const url = new URL(request.url)
  return NextResponse.redirect(new URL('/brand/govevia-mark-on-white.png', url.origin), 307)
}
