import { NextResponse } from 'next/server'

export async function POST() {
  const res = NextResponse.json({ data: null, error: null })
  const base = {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 0,
    path: '/',
  }
  res.cookies.set('admin_token', '', { ...base, httpOnly: true })
  res.cookies.set('admin_jwt', '', { ...base, httpOnly: false })
  return res
}
