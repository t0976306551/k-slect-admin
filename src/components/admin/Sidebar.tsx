'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Package,
  FolderOpen,
  ClipboardList,
  Settings,
  LogOut,
} from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ size?: number; className?: string; color?: string }>
}

const navItems: NavItem[] = [
  // { label: '儀表板', href: '/dashboard', icon: LayoutDashboard },
  { label: '商品管理', href: '/products', icon: Package },
  { label: '商品分類', href: '/categories', icon: FolderOpen },
  { label: '訂單管理', href: '/orders', icon: ClipboardList },
  // { label: '出貨管理', href: '/shipping', icon: Truck },
  // { label: '退款管理', href: '/returns', icon: Undo2 },
  // { label: '折扣活動', href: '/discounts', icon: Tag },
  // { label: '會員管理', href: '/members', icon: Users },
  // { label: '報表統計', href: '/reports', icon: BarChart3 },
  // { label: 'Banner 管理', href: '/banners', icon: Image },
  // { label: '通知推播', href: '/notifications', icon: Bell },
  { label: '系統設定', href: '/settings', icon: Settings },
]

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (err) {
      console.error('登出請求失敗', err)
    }
    router.push('/login')
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Mobile 遮罩（md 以上隱藏） */}
      {isOpen && (
        <div
          className="fixed inset-0 md:hidden"
          style={{ background: 'rgba(0,0,0,0.4)', zIndex: 45, animation: 'fade-in 0.2s ease both' }}
          onClick={onClose}
        />
      )}

    <aside
      className={[
        'fixed top-0 left-0 h-full w-[240px] bg-white flex flex-col',
        'transition-transform duration-300 ease-in-out',
        isOpen ? 'translate-x-0' : '-translate-x-full',
        'md:translate-x-0',
      ].join(' ')}
      style={{ borderRight: '1px solid #F0EFEC', zIndex: 50 }}
    >
      {/* Logo */}
      <div className="flex flex-col gap-[2px] px-5 pt-6 pb-4">
        <span
          className="text-[20px] font-semibold leading-tight"
          style={{ fontFamily: 'var(--font-fraunces)', color: '#7C9070' }}
        >
          韓好物
        </span>
        <span
          className="text-[11px] font-medium"
          style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}
        >
          管理後台
        </span>
      </div>

      <div className="w-full h-px" style={{ background: '#F0EFEC' }} />

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 flex flex-col gap-1">
        {navItems.map((item) => {
          const active = isActive(item.href)
          const Icon = item.icon
          return (
            <div key={item.href}>
              <Link
                href={item.href}
                className="flex items-center gap-[10px] mx-2 px-3 py-[10px] rounded-[8px] transition-all duration-200 hover:bg-[#F0EFEC] active:scale-[0.98]"
                style={{
                  background: active ? '#7C907025' : 'transparent',
                  color: active ? '#7C9070' : '#6B6B6B',
                }}
              >
                <Icon
                  size={18}
                  className="shrink-0"
                  color={active ? '#7C9070' : '#8E8E93'}
                />
                <span
                  className="text-[13px] leading-none"
                  style={{
                    fontFamily: 'var(--font-jakarta)',
                    fontWeight: active ? 600 : 500,
                  }}
                >
                  {item.label}
                </span>
              </Link>

            </div>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-2 py-3 flex flex-col gap-1" style={{ borderTop: '1px solid #F0EFEC' }}>
        <button
          onClick={handleLogout}
          className="flex items-center gap-[10px] px-3 py-[10px] rounded-[8px] w-full transition-colors hover:bg-[#F7F6F3]"
          style={{ color: '#6B6B6B' }}
        >
          <LogOut size={18} color="#8E8E93" className="shrink-0" />
          <span
            className="text-[13px] leading-none"
            style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 500 }}
          >
            登出
          </span>
        </button>
        <p
          className="text-[11px] text-center pb-1"
          style={{ fontFamily: 'var(--font-jakarta)', color: '#C7C7CC' }}
        >
          © 2026 K-slect
        </p>
      </div>
    </aside>
    </>
  )
}
