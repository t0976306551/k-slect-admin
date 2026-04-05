import { NextRequest, NextResponse } from 'next/server'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'
const BACKEND_API_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL ?? ''

// Mock 管理員帳號（僅 USE_MOCK=true 時使用）
const MOCK_ADMINS = [
  { email: 'admin@k-slect.com', password: 'admin123', name: '系統管理員', role: 'admin' },
  { email: 'staff@k-slect.com', password: 'staff123', name: '客服人員', role: 'staff' },
]

function setAuthCookies(res: NextResponse, token: string) {
  const cookieOpts = {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 86400,
    path: '/',
  }
  // httpOnly — middleware 讀取，防 XSS 竊取
  res.cookies.set('admin_token', token, { ...cookieOpts, httpOnly: true })
  // 非 httpOnly — api.ts 在 client-side 讀取後附加 Authorization header
  res.cookies.set('admin_jwt', token, { ...cookieOpts, httpOnly: false })
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { email, password } = body as { email?: string; password?: string }

  if (!email || !password) {
    return NextResponse.json(
      { data: null, error: { code: 'MISSING_FIELDS', message: '請填寫帳號與密碼' } },
      { status: 400 },
    )
  }

  // ── 真實後端模式 ────────────────────────────────────────────
  if (!USE_MOCK) {
    let backendRes: Response
    try {
      backendRes = await fetch(`${BACKEND_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      })
    } catch {
      return NextResponse.json(
        { data: null, error: { code: 'NETWORK_ERROR', message: '無法連線到後端伺服器' } },
        { status: 503 },
      )
    }

    const json = await backendRes.json()

    if (!backendRes.ok || json.error) {
      return NextResponse.json(json, { status: backendRes.status })
    }

    const { token, user } = json.data as { token: string; user: { email: string; isSuperAdmin: boolean } }

    const res = NextResponse.json({ data: { email: user.email, isSuperAdmin: user.isSuperAdmin }, error: null })
    setAuthCookies(res, token)
    return res
  }

  // ── Mock 模式 ────────────────────────────────────────────────
  const admin = MOCK_ADMINS.find(
    (a) => a.email === email.trim().toLowerCase() && a.password === password,
  )

  if (!admin) {
    await new Promise((r) => setTimeout(r, 400))
    return NextResponse.json(
      { data: null, error: { code: 'INVALID_CREDENTIALS', message: '帳號或密碼錯誤' } },
      { status: 401 },
    )
  }

  const mockToken = Buffer.from(
    JSON.stringify({ id: admin.email, role: admin.role, exp: Date.now() + 86400_000 }),
  ).toString('base64')

  const res = NextResponse.json({
    data: { name: admin.name, email: admin.email, role: admin.role },
    error: null,
  })
  setAuthCookies(res, mockToken)
  return res
}
