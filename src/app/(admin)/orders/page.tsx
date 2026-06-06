'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Trash2, X } from 'lucide-react'
import { fetchOrders, updateOrder, deleteOrder } from '@/lib/api'
import { ShipOrderModal } from '@/components/admin/ShipOrderModal'
import { useToast } from '@/contexts/ToastContext'
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import {
  OrderFilterTabs,
  OrderSearchBar,
  OrderTable,
  OrderDetailDrawer,
} from '@/components/admin/orders'
import type { FilterTab } from '@/components/admin/orders'
import { SkeletonOrderTable } from '@/components/admin/SkeletonTable'
import type { AdminOrder } from '@/types'

// ── 刪除確認 Dialog ──────────────────────────────────────────────────────────

function DeleteOrderDialog({
  order,
  onConfirm,
  onClose,
}: {
  order: AdminOrder
  onConfirm: () => Promise<void>
  onClose: () => void
}) {
  const [deleting, setDeleting] = useState(false)
  useBodyScrollLock(true)

  async function handle() {
    setDeleting(true)
    try { await onConfirm() } finally { setDeleting(false) }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.4)', animation: 'fade-in 0.18s ease both' }}
    >
      <div
        className="w-full max-w-[400px] max-h-[90dvh] overflow-y-auto flex flex-col gap-5 p-6 rounded-[16px]"
        style={{ background: '#FFFFFF', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', animation: 'modal-in 0.26s cubic-bezier(0.34,1.3,0.64,1) both' }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-[16px] font-semibold" style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2D2D' }}>
            刪除訂單
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F0EFEC] transition-colors">
            <X size={14} color="#8E8E93" />
          </button>
        </div>

        <div className="rounded-[10px] p-3.5" style={{ background: '#FEE2E2', border: '1px solid #FECACA' }}>
          <p className="text-[13px] font-semibold" style={{ fontFamily: 'var(--font-space-mono)', color: '#991B1B' }}>
            {order.orderNo}
          </p>
          <p className="text-[12px] mt-1" style={{ fontFamily: 'var(--font-jakarta)', color: '#7F1D1D' }}>
            {order.customerName} · NT$ {order.totalAmount.toLocaleString()}
          </p>
        </div>

        <p className="text-[13px] leading-relaxed" style={{ fontFamily: 'var(--font-jakarta)', color: '#6B6B6B' }}>
          刪除後此訂單將永久移除，且無法復原。確定要繼續嗎？
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-11 rounded-[10px] text-[13px] font-medium transition-all hover:bg-[#F7F6F3] active:scale-[0.97]"
            style={{ border: '1.5px solid #F0EFEC', color: '#6B6B6B', fontFamily: 'var(--font-jakarta)' }}
          >
            取消
          </button>
          <button
            onClick={handle}
            disabled={deleting}
            className="flex-1 h-11 rounded-[10px] text-[13px] font-semibold transition-all hover:opacity-85 active:scale-[0.97] disabled:opacity-50"
            style={{ background: '#991B1B', color: '#FFFFFF', fontFamily: 'var(--font-jakarta)' }}
          >
            {deleting ? '刪除中...' : '確認刪除'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── OrdersPage ───────────────────────────────────────────────────────────────

export default function OrdersPage() {
  const { showToast } = useToast()
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [drawerOrder, setDrawerOrder] = useState<AdminOrder | null>(null)
  const [shipOrderTarget, setShipOrderTarget] = useState<AdminOrder | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminOrder | null>(null)

  useEffect(() => {
    async function load() {
      const r = await fetchOrders()
      if (r.data) setOrders(r.data.orders)
      setLoading(false)
    }
    load()
  }, [])

  const filtered = orders
    .filter(o => activeTab === 'all' || o.status === activeTab)
    .filter(o => {
      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase()
      return o.orderNo.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q)
    })

  function applyUpdate(updated: AdminOrder): void {
    setOrders(prev => prev.map(o => o.id === updated.id ? updated : o))
    if (drawerOrder?.id === updated.id) setDrawerOrder(updated)
  }

  async function handleShipOrder(order: AdminOrder): Promise<void> {
    const res = await updateOrder(order.id, { status: 'shipped' })
    if (res.data) { applyUpdate(res.data); showToast('已更新為出貨狀態') }
  }

  async function handleDeleteOrder(): Promise<void> {
    if (!deleteTarget) return
    const res = await deleteOrder(deleteTarget.id)
    if (!res.error) {
      setOrders(prev => prev.filter(o => o.id !== deleteTarget.id))
      if (drawerOrder?.id === deleteTarget.id) setDrawerOrder(null)
      setDeleteTarget(null)
      showToast('訂單已刪除')
    }
  }

  return (
    <div className="p-4 md:p-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1
          className="text-[26px] md:text-[28px] font-medium tracking-[-0.5px]"
          style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2D2D' }}
        >
          訂單管理
        </h1>
        <div className="flex items-center gap-3 flex-wrap">
          <OrderFilterTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            orders={orders}
          />
          <Link
            href="/orders/new"
            className="flex items-center gap-[6px] px-4 py-[9px] transition-all hover:opacity-80 active:scale-[0.96]"
            style={{ background: '#7C9070', borderRadius: 10, fontFamily: 'var(--font-jakarta)', fontSize: 13, fontWeight: 600, color: '#FFFFFF' }}
          >
            <Plus size={15} color="#FFFFFF" />
            新增訂單
          </Link>
        </div>
      </div>

      <OrderSearchBar value={searchQuery} onChange={setSearchQuery} />

      {loading ? (
        <SkeletonOrderTable rows={8} />
      ) : (
        <OrderTable
          orders={filtered}
          searchQuery={searchQuery}
          onSelectOrder={setDrawerOrder}
          onShipOrder={setShipOrderTarget}
          onDeleteOrder={setDeleteTarget}
        />
      )}

      {/* Order Detail Drawer */}
      {drawerOrder && (
        <OrderDetailDrawer
          order={drawerOrder}
          onClose={() => setDrawerOrder(null)}
          onShipOrder={setShipOrderTarget}
          onDeleteOrder={setDeleteTarget}
        />
      )}

      {/* Ship Order Modal */}
      {shipOrderTarget && (
        <ShipOrderModal
          order={shipOrderTarget}
          onConfirm={() => handleShipOrder(shipOrderTarget)}
          onClose={() => setShipOrderTarget(null)}
        />
      )}

      {/* Delete Order Dialog */}
      {deleteTarget && (
        <DeleteOrderDialog
          order={deleteTarget}
          onConfirm={handleDeleteOrder}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
