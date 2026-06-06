'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingBag, User, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [account, setAccount] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: account, password }),
      })
      const json = await res.json()

      if (!res.ok || json.error) {
        setError(json.error?.message ?? '登入失敗，請稍後再試')
        return
      }

      router.push('/products')
    } catch {
      setError('網路異常，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, rgba(124,144,112,0.09) 0%, #F7F6F3 50%, rgba(124,144,112,0.06) 100%)',
      }}
    >
      <div
        className="w-full max-w-[440px] flex flex-col gap-8 mx-4"
        style={{
          background: '#FFFFFF',
          borderRadius: 20,
          padding: 'clamp(24px, 5vw, 48px)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.07)',
          animation: 'scale-in 0.3s cubic-bezier(0.34,1.3,0.64,1) both',
        }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div
            className="flex items-center justify-center"
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: '#7C9070',
            }}
          >
            <ShoppingBag size={28} color="#FFFFFF" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <span
              className="text-[24px] font-bold"
              style={{ fontFamily: 'var(--font-inter)', color: '#2D2D2D' }}
            >
              K-slect
            </span>
            <span
              className="text-[13px]"
              style={{ fontFamily: 'var(--font-inter)', color: '#6B6B6B' }}
            >
              後台管理系統
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          {/* 帳號 */}
          <div className="flex flex-col gap-[6px]">
            <label
              className="text-[13px] font-semibold"
              style={{ fontFamily: 'var(--font-inter)', color: '#2D2D2D' }}
            >
              帳號
            </label>
            <div
              className="flex items-center gap-2 px-[14px]"
              style={{
                background: '#F7F6F3',
                borderRadius: 10,
                border: '1.5px solid #F0EFEC',
                height: 46,
              }}
            >
              <User size={16} color="#8E8E93" className="shrink-0" />
              <input
                type="text"
                value={account}
                onChange={e => setAccount(e.target.value)}
                className="flex-1 bg-transparent outline-none text-[14px]"
                style={{ fontFamily: 'var(--font-inter)', color: '#2D2D2D' }}
              />
            </div>
          </div>

          {/* 密碼 */}
          <div className="flex flex-col gap-[6px]">
            <label
              className="text-[13px] font-semibold"
              style={{ fontFamily: 'var(--font-inter)', color: '#2D2D2D' }}
            >
              密碼
            </label>
            <div
              className="flex items-center justify-between px-[14px]"
              style={{
                background: '#F7F6F3',
                borderRadius: 10,
                border: '1.5px solid #7C9070',
                height: 46,
              }}
            >
              <div className="flex items-center gap-2 flex-1">
                <Lock size={16} color="#8E8E93" className="shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-[14px]"
                  style={{ fontFamily: 'var(--font-inter)', color: '#2D2D2D' }}
                />
              </div>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="shrink-0"
              >
                {showPassword
                  ? <Eye size={16} color="#8E8E93" />
                  : <EyeOff size={16} color="#8E8E93" />
                }
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              className="flex items-center gap-2 px-[14px] py-[10px]"
              style={{
                background: '#FEF2F2',
                border: '1.5px solid #FECACA',
                borderRadius: 10,
              }}
            >
              <AlertCircle size={15} color="#EF4444" className="shrink-0" />
              <span
                className="text-[13px]"
                style={{ fontFamily: 'var(--font-inter)', color: '#DC2626' }}
              >
                {error}
              </span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center transition-all hover:opacity-90 active:scale-[0.98]"
            style={{
              background: '#7C9070',
              borderRadius: 10,
              height: 48,
              fontFamily: 'var(--font-inter)',
              fontSize: 15,
              fontWeight: 600,
              color: '#FFFFFF',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? '登入中...' : '登入'}
          </button>

          {/* Demo Login */}
          <button
            type="button"
            onClick={() => {
              setAccount('admin@k-slect.com')
              setPassword('admin123')
              setError(null)
            }}
            className="w-full flex items-center justify-center gap-1.5 transition-colors"
            style={{
              height: 40,
              borderRadius: 10,
              border: '1.5px dashed #C8D4C2',
              background: 'transparent',
              fontFamily: 'var(--font-inter)',
              fontSize: 13,
              color: '#7C9070',
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: 15 }}>⚡</span>
            使用測試帳號快速填入
          </button>
        </form>

        {/* Copyright */}
        <p
          className="text-[11px] text-center"
          style={{ fontFamily: 'var(--font-inter)', color: '#8E8E93' }}
        >
          © 2024 K-slect 韓貨電商. All rights reserved.
        </p>
      </div>
    </div>
  )
}
