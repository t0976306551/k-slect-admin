import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_PATHS = ['/login', '/api/auth/login', '/api/auth/logout']

/** 解析 JWT payload 並回傳是否已過期 */
function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split('.')
    if (parts.length === 3) {
      // 標準 JWT：base64url decode 中段 payload
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
      const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
      const payload = JSON.parse(atob(padded)) as { exp?: number }
      return typeof payload.exp === 'number' && Date.now() / 1000 > payload.exp
    }
    // Mock token：純 base64 JSON，exp 單位為 ms
    const payload = JSON.parse(atob(token)) as { exp?: number }
    return typeof payload.exp === 'number' && Date.now() > payload.exp
  } catch {
    return true
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get('admin_token')?.value

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p))

  // 未登入或 token 過期 → 導向 /login
  if (!isPublic && (!token || isTokenExpired(token))) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // 已登入又訪問 /login → 導向 /products
  if (token && !isTokenExpired(token) && pathname === '/login') {
    return NextResponse.redirect(new URL('/products', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|favicon.ico).*)'],
}
