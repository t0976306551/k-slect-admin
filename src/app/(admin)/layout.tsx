'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import Sidebar from '@/components/admin/Sidebar'

// Auth is enforced by middleware.ts — no redirect needed here.
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-full min-h-screen" style={{ background: '#F7F6F3' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 md:ml-[240px] min-h-screen flex flex-col">
        {/* Mobile TopBar（僅 md 以下顯示） */}
        <header
          className="md:hidden sticky top-0 z-30 flex items-center gap-3 px-4 h-14 bg-white"
          style={{ borderBottom: '1px solid #F0EFEC' }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1 rounded-[6px]"
            style={{ color: '#6B6B6B' }}
          >
            <Menu size={22} />
          </button>
          <span
            className="text-[18px] font-semibold"
            style={{ fontFamily: 'var(--font-fraunces)', color: '#7C9070' }}
          >
            韓好物
          </span>
        </header>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
