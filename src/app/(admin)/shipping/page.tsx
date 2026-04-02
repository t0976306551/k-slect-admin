'use client'

import { useState, useEffect } from 'react'
import { fetchOrders, updateOrder } from '@/lib/api'
import { Truck, Package } from 'lucide-react'
import type { AdminOrder } from '@/types'

// --- InfoRow ---
function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[12px] shrink-0" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>
        {label}
      </span>
      <span className="text-[12px] text-right" style={{ fontFamily: mono ? 'var(--font-space-mono)' : 'var(--font-jakarta)', color: '#2D2D2D' }}>
        {value}
      </span>
    </div>
  )
}

// --- ShipOrderModal ---
function ShipOrderModal({
  order,
  onConfirm,
  onClose,
}: {
  order: AdminOrder
  onConfirm: () => Promise<void>
  onClose: () => void
}) {
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    await onConfirm()
    onClose()
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/40" style={{ zIndex: 60 }} onClick={onClose} />
      <div
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-5"
        style={{ width: 440, background: '#FFFFFF', borderRadius: 16, padding: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', zIndex: 70 }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-[16px] font-medium" style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2D2D' }}>
            安排出貨
          </h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100" style={{ color: '#6B6B6B' }}>
            ✕
          </button>
        </div>

        <span className="text-[12px]" style={{ fontFamily: 'var(--font-space-mono)', color: '#8E8E93' }}>
          {order.orderNo}
        </span>

        <div className="rounded-[12px] p-4 flex flex-col gap-2" style={{ background: '#F7F6F3', border: '1px solid #F0EFEC' }}>
          <InfoRow label="訂單金額" value={`NT$ ${order.totalAmount.toLocaleString()}`} />
          <InfoRow label="取貨門市" value={order.cvsStoreCode ?? order.shippingAddress} mono />
        </div>

        <div className="flex items-start gap-2 rounded-[10px] p-3" style={{ background: '#E8F5E9', border: '1px solid #C8E6C9' }}>
          <span className="text-[13px] mt-[1px]">ℹ️</span>
          <p className="text-[12px] leading-relaxed" style={{ fontFamily: 'var(--font-jakarta)', color: '#2E7D32' }}>
            請前往 7-11 ibon 機台完成寄件，確認後訂單狀態將更新為「已出貨」。
          </p>
        </div>

        <div className="flex gap-3">
          <button
            className="flex-1 py-[10px] text-[13px] font-medium rounded-[10px] transition-opacity hover:opacity-80"
            style={{ border: '1px solid #F0EFEC', color: '#6B6B6B', fontFamily: 'var(--font-jakarta)' }}
            onClick={onClose}
          >
            取消
          </button>
          <button
            className="flex-1 py-[10px] text-[13px] font-semibold rounded-[10px] transition-opacity hover:opacity-80 disabled:opacity-50"
            style={{ background: '#D4845E', color: '#FFFFFF', fontFamily: 'var(--font-jakarta)' }}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? '處理中...' : '確認出貨'}
          </button>
        </div>
      </div>
    </>
  )
}

export default function ShippingPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [shipOrderTarget, setShipOrderTarget] = useState<AdminOrder | null>(null)

  useEffect(() => {
    fetchOrders().then(r => { if (r.data) setOrders(r.data.orders) })
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
    <div className="p-8 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1
          className="text-[28px] font-medium tracking-[-0.5px]"
          style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2D2D' }}
        >
          出貨管理
        </h1>
      </div>

      {/* 統計 */}
      <div className="grid grid-cols-2 gap-4">
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
