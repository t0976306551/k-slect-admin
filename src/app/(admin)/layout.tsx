import Sidebar from '@/components/admin/Sidebar'

// Auth is enforced by middleware.ts — no redirect needed here.
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-full min-h-screen" style={{ background: '#F7F6F3' }}>
      <Sidebar />
      <main className="flex-1 ml-[240px] min-h-screen overflow-auto">
        {children}
      </main>
    </div>
  )
}
