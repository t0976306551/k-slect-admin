import { NextRequest, NextResponse } from 'next/server'

// Mock 管理員帳號
const MOCK_ADMINS = [
  { email: 'admin@k-slect.com', password: 'admin123', name: '系統管理員', role: 'admin' },
  { email: 'staff@k-slect.com', password: 'staff123', name: '客服人員', role: 'staff' },
]

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { email, password } = body as { email?: string; password?: string }

  if (!email || !password) {
    return NextResponse.json(
      { data: null, error: { code: 'MISSING_FIELDS', message: '請填寫帳號與密碼' } },
      { status: 400 },
    )
  }

  const admin = MOCK_ADMINS.find(
    (a) => a.email === email.trim().toLowerCase() && a.password === password,
  )

  if (!admin) {
    // 模擬網路延遲
    await new Promise((r) => setTimeout(r, 400))
    return NextResponse.json(
      { data: null, error: { code: 'INVALID_CREDENTIALS', message: '帳號或密碼錯誤' } },
      { status: 401 },
    )
  }

  // 模擬 token（實際上線時換成真正 JWT）
  const token = Buffer.from(
    JSON.stringify({ id: admin.email, role: admin.role, exp: Date.now() + 86400_000 }),
  ).toString('base64')

  const res = NextResponse.json({
    data: { name: admin.name, email: admin.email, role: admin.role },
    error: null,
  })

  // 設定 httpOnly cookie，有效期 24 小時
  res.cookies.set('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 86400,
    path: '/',
  })

  return res
}
