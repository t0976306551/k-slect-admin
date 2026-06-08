'use client'

import { useState, useEffect } from 'react'
import { fetchOrders, updateOrder } from '@/lib/api'
import { Truck, Package } from 'lucide-react'
import { ShipOrderModal } from '@/components/admin/ShipOrderModal'
import type { AdminOrder } from '@/types'

export default function ShippingPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [shipOrderTarget, setShipOrderTarget] = useState<AdminOrder | null>(null)

  useEffect(() => {
    async function load() {
      const r = await fetchOrders()
      if (r.data) setOrders(r.data.orders)
    }
    load()
  }, [])

  const pending = orders.filter(o => o.status === 'pending_ship')
  const shipped = orders.filter(o => o.status === 'shipped')

  const handleShipOrder = async (order: AdminOrder) => {
    const res = await updateOrder(order.id, { status: 'shipped' })
    if (res.data) {
      setOrders(prev => prev.map(o => o.id === res.data!.id ? res.data! : o))
    }
  }

  return (
    <div className="p-4 sm:p-8 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1
          className="text-[28px] font-medium tracking-[-0.5px]"
          style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2D2D' }}
        >
          出貨管理
        </h1>
      </div>

      {/* 統計 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          className="flex items-center gap-4 p-5"
          style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #F0EFEC' }}
        >
          <div
            className="flex items-center justify-center"
            style={{ width: 48, height: 48, borderRadius: 12, background: '#D4845E15' }}
          >
            <Package size={24} color="#D4845E" />
          </div>
          <div className="flex flex-col gap-1">
            <span
              className="text-[12px] font-medium"
              style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}
            >
              待出貨
            </span>
            <span
              className="text-[28px] font-medium tracking-[-1px]"
              style={{ fontFamily: 'var(--font-fraunces)', color: '#D4845E' }}
            >
              {pending.length}
            </span>
          </div>
        </div>
        <div
          className="flex items-center gap-4 p-5"
          style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #F0EFEC' }}
        >
          <div
            className="flex items-center justify-center"
            style={{ width: 48, height: 48, borderRadius: 12, background: '#7C907025' }}
          >
            <Truck size={24} color="#7C9070" />
          </div>
          <div className="flex flex-col gap-1">
            <span
              className="text-[12px] font-medium"
              style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}
            >
              已出貨
            </span>
            <span
              className="text-[28px] font-medium tracking-[-1px]"
              style={{ fontFamily: 'var(--font-fraunces)', color: '#7C9070' }}
            >
              {shipped.length}
            </span>
          </div>
        </div>
      </div>

      {/* 待出貨列表 */}
      <div
        className="flex flex-col overflow-hidden"
        style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #F0EFEC' }}
      >
        <div className="px-5 py-4" style={{ borderBottom: '1px solid #F0EFEC' }}>
          <span
            className="text-[18px] font-medium"
            style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2D2D' }}
          >
            待出貨訂單
          </span>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[560px]">
            <div className="flex items-center px-5 py-[10px]" style={{ background: '#FAFAF8' }}>
              <span className="w-[160px] text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>訂單編號</span>
              <span className="w-[100px] text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>客戶</span>
              <span className="flex-1 text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>取貨門市</span>
              <span className="w-[90px] text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>金額</span>
              <span className="w-[100px] text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>操作</span>
            </div>
            {pending.map(order => (
              <div
                key={order.id}
                className="flex items-center px-5 py-3"
                style={{ borderTop: '1px solid #F0EFEC' }}
              >
                <span className="w-[160px] text-[12px]" style={{ fontFamily: 'var(--font-space-mono)', color: '#2D2D2D' }}>{order.orderNo}</span>
                <span className="w-[100px] text-[13px]" style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}>{order.customerName}</span>
                <span className="flex-1 text-[12px]" style={{ fontFamily: 'var(--font-space-mono)', color: '#6B6B6B' }}>{order.cvsStoreCode ?? '—'}</span>
                <span className="w-[90px] text-[12px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}>NT$ {order.totalAmount.toLocaleString()}</span>
                <div className="w-[100px]">
                  <button
                    className="px-3 py-[6px] text-[11px] font-semibold rounded-[8px] hover:opacity-80 transition-opacity"
                    style={{ background: '#D4845E', color: '#FFFFFF', fontFamily: 'var(--font-jakarta)' }}
                    onClick={() => setShipOrderTarget(order)}
                  >
                    安排出貨
                  </button>
                </div>
              </div>
            ))}
            {pending.length === 0 && (
              <div className="flex items-center justify-center py-10">
                <span className="text-[13px]" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>目前沒有待出貨訂單</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 已出貨列表 */}
      <div
        className="flex flex-col overflow-hidden"
        style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #F0EFEC' }}
      >
        <div className="px-5 py-4" style={{ borderBottom: '1px solid #F0EFEC' }}>
          <span
            className="text-[18px] font-medium"
            style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2D2D' }}
          >
            已出貨訂單
          </span>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[540px]">
            <div className="flex items-center px-5 py-[10px]" style={{ background: '#FAFAF8' }}>
              <span className="w-[160px] text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>訂單編號</span>
              <span className="w-[100px] text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>客戶</span>
              <span className="flex-1 text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>取件代碼</span>
              <span className="w-[90px] text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>金額</span>
              <span className="w-[80px] text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>操作</span>
            </div>
            {shipped.map(order => (
              <div
                key={order.id}
                className="flex items-center px-5 py-3"
                style={{ borderTop: '1px solid #F0EFEC' }}
              >
                <span className="w-[160px] text-[12px]" style={{ fontFamily: 'var(--font-space-mono)', color: '#2D2D2D' }}>{order.orderNo}</span>
                <span className="w-[100px] text-[13px]" style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}>{order.customerName}</span>
                <span className="flex-1 text-[12px]" style={{ fontFamily: 'var(--font-space-mono)', color: '#7C9070' }}>{order.cvsPickupCode ?? '—'}</span>
                <span className="w-[90px] text-[12px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}>NT$ {order.totalAmount.toLocaleString()}</span>
                <div className="w-[80px]">
                  <button
                    className="px-3 py-[6px] text-[11px] font-medium rounded-[8px] hover:bg-gray-50 transition-colors"
                    style={{ border: '1px solid #F0EFEC', color: '#6B6B6B', fontFamily: 'var(--font-jakarta)' }}
                  >
                    查看
                  </button>
                </div>
              </div>
            ))}
            {shipped.length === 0 && (
              <div className="flex items-center justify-center py-10">
                <span className="text-[13px]" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>目前沒有已出貨訂單</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ship Order Modal */}
      {shipOrderTarget && (
        <ShipOrderModal
          order={shipOrderTarget}
          onConfirm={() => handleShipOrder(shipOrderTarget)}
          onClose={() => setShipOrderTarget(null)}
        />
      )}
    </div>
  )
}
