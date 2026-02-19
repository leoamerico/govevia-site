import { NextResponse } from 'next/server'
import { cookieOptions } from '@/lib/auth/admin'

export async function POST() {
  const res = NextResponse.json({ ok: true })
  // Expire cookie immediately
  res.cookies.set({ ...cookieOptions(0), value: '', maxAge: 0 })
  return res
}
