'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import { usePathname } from 'next/navigation'
import Sidebar from '@/components/admin/Sidebar'
import { NavigationProgress } from '@/components/admin/NavigationProgress'
import { ToastProvider } from '@/contexts/ToastContext'

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  return (
    <ToastProvider>
      <div className="flex h-full min-h-screen" style={{ background: '#F7F6F3' }}>
        <NavigationProgress />
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex-1 md:ml-[240px] min-h-screen flex flex-col">
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

          <main
            key={pathname}
            className="flex-1 overflow-auto"
            style={{ animation: 'page-enter 0.25s cubic-bezier(0.25,1,0.5,1) both' }}
          >
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  )
}
