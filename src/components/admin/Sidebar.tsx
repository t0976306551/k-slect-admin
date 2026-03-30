'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Truck,
  Tag,
  Users,
  Undo2,
  BarChart3,
  Image,
  Bell,
  Settings,
  FolderTree,
} from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ size?: number; className?: string; color?: string }>
  children?: { label: string; href: string }[]
}

const navItems: NavItem[] = [
  { label: '儀表板', href: '/dashboard', icon: LayoutDashboard },
  {
    label: '商品管理', href: '/products', icon: Package,
    children: [
      { label: '商品分類', href: '/categories' },
    ],
  },
  { label: '訂單管理', href: '/orders', icon: ClipboardList },
  { label: '出貨管理', href: '/shipping', icon: Truck },
  { label: '退款管理', href: '/returns', icon: Undo2 },
  { label: '折扣活動', href: '/discounts', icon: Tag },
  { label: '會員管理', href: '/members', icon: Users },
  { label: '報表統計', href: '/reports', icon: BarChart3 },
  { label: 'Banner 管理', href: '/banners', icon: Image },
  { label: '通知推播', href: '/notifications', icon: Bell },
  { label: '系統設定', href: '/settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <aside
      className="fixed top-0 left-0 h-full w-[240px] bg-white flex flex-col"
      style={{ borderRight: '1px solid #F0EFEC', zIndex: 40 }}
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
                className="flex items-center gap-[10px] mx-2 px-3 py-[10px] rounded-[8px] transition-colors"
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
              {/* Sub items */}
              {item.children && (active || item.children.some(c => pathname.startsWith(c.href))) && (
                <div className="ml-[44px] flex flex-col gap-[2px] mt-1">
                  {item.children.map((child) => {
                    const childActive = pathname.startsWith(child.href)
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="flex items-center gap-2 px-3 py-[6px] rounded-[6px] transition-colors"
                        style={{
                          background: childActive ? '#7C907015' : 'transparent',
                          color: childActive ? '#7C9070' : '#8E8E93',
                        }}
                      >
                        <FolderTree size={14} style={{ color: childActive ? '#7C9070' : '#8E8E93' }} />
                        <span
                          className="text-[12px]"
                          style={{
                            fontFamily: 'var(--font-jakarta)',
                            fontWeight: childActive ? 600 : 400,
                          }}
                        >
                          {child.label}
                        </span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4" style={{ borderTop: '1px solid #F0EFEC' }}>
        <p
          className="text-[11px] text-center"
          style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}
        >
          © 2026 K-slect
        </p>
      </div>
    </aside>
  )
}
