'use client'

import { useState, useEffect } from 'react'
import { fetchOrders, updateOrder } from '@/lib/api'
import { ShipOrderModal } from '@/components/admin/ShipOrderModal'
import {
  OrderFilterTabs,
  OrderSearchBar,
  OrderTable,
  OrderDetailDrawer,
  CancelOrderModal,
} from '@/components/admin/orders'
import type { FilterTab } from '@/components/admin/orders'
import type { AdminOrder } from '@/types'

export default function OrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [drawerOrder, setDrawerOrder] = useState<AdminOrder | null>(null)
  const [shipOrderTarget, setShipOrderTarget] = useState<AdminOrder | null>(null)
  const [cancelOrderTarget, setCancelOrderTarget] = useState<AdminOrder | null>(null)

  useEffect(() => {
    async function load() {
      const r = await fetchOrders()
      if (r.data) setOrders(r.data.orders)
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
    if (res.data) applyUpdate(res.data)
  }

  async function handleCancelOrder(order: AdminOrder): Promise<void> {
    const res = await updateOrder(order.id, { status: 'cancelled' })
    if (res.data) applyUpdate(res.data)
  }

  return (
    <div className="p-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1
          className="text-[28px] font-medium tracking-[-0.5px]"
          style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2D2D' }}
        >
          訂單管理
        </h1>
        <OrderFilterTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          orders={orders}
        />
      </div>

      <OrderSearchBar value={searchQuery} onChange={setSearchQuery} />

      <OrderTable
        orders={filtered}
        searchQuery={searchQuery}
        onSelectOrder={setDrawerOrder}
        onShipOrder={setShipOrderTarget}
      />

      {/* Order Detail Drawer */}
      {drawerOrder && (
        <OrderDetailDrawer
          order={drawerOrder}
          onClose={() => setDrawerOrder(null)}
          onShipOrder={setShipOrderTarget}
          onCancelOrder={setCancelOrderTarget}
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

      {/* Cancel Order Modal */}
      {cancelOrderTarget && (
        <CancelOrderModal
          order={cancelOrderTarget}
          onConfirm={() => handleCancelOrder(cancelOrderTarget)}
          onClose={() => setCancelOrderTarget(null)}
        />
      )}
    </div>
  )
}
