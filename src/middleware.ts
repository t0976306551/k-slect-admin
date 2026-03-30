import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_PATHS = ['/login', '/api/auth/login']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get('admin_token')?.value

  // 已登入 → /login 跳 /dashboard
  if (token && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // 未登入 → 保護路由跳 /login
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p))
  if (!token && !isPublic) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|favicon.ico).*)'],
}
