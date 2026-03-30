'use client'

import { useState, useEffect } from 'react'
import { fetchOrders } from '@/lib/api'
import type { AdminOrder } from '@/types'

type FilterTab = 'all' | 'pending_confirm' | 'pending_ship' | 'shipped' | 'completed'

const tabs: { key: FilterTab; label: string; color: string }[] = [
  { key: 'all', label: '全部', color: '#FFFFFF' },
  { key: 'pending_confirm', label: '待確認', color: '#5B9BD5' },
  { key: 'pending_ship', label: '待出貨', color: '#D4845E' },
  { key: 'shipped', label: '已出貨', color: '#7C9070' },
  { key: 'completed', label: '已完成', color: '#7B1FA2' },
]

function statusLabel(status: AdminOrder['status']): { label: string; bg: string; color: string } {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    pending_confirm: { label: '待確認', bg: '#FFF3E0', color: '#E65100' },
    pending_ship: { label: '待出貨', bg: '#E3F2FD', color: '#1565C0' },
    shipped: { label: '已出貨', bg: '#E8F5E9', color: '#2E7D32' },
    completed: { label: '已完成', bg: '#F3E5F5', color: '#7B1FA2' },
    pending_payment: { label: '待付款', bg: '#FFF3E0', color: '#E65100' },
    cancelled: { label: '已取消', bg: '#F5F5F5', color: '#9E9E9E' },
    refund_pending: { label: '退款中', bg: '#FCE4EC', color: '#C62828' },
    refunded: { label: '已退款', bg: '#F5F5F5', color: '#9E9E9E' },
  }
  return map[status] ?? { label: status, bg: '#F5F5F5', color: '#9E9E9E' }
}

function paymentLabel(method: string, pStatus: string) {
  if (method === 'bank_transfer' && pStatus === 'paid') return { text: '已匯款', color: '#7C9070' }
  if (method === 'bank_transfer') return { text: '待匯款', color: '#D4845E' }
  return { text: '取貨付款', color: '#5B9BD5' }
}

function ActionButton({ status, orderId }: { status: AdminOrder['status']; orderId: string }) {
  void orderId
  if (status === 'pending_confirm') {
    return (
      <button
        className="px-3 py-[6px] text-[11px] font-semibold rounded-[8px] transition-opacity hover:opacity-80"
        style={{ background: '#7C9070', color: '#FFFFFF', fontFamily: 'var(--font-jakarta)' }}
      >
        確認匯款
      </button>
    )
  }
  if (status === 'pending_ship') {
    return (
      <button
        className="px-3 py-[6px] text-[11px] font-semibold rounded-[8px] transition-opacity hover:opacity-80"
        style={{ background: '#D4845E', color: '#FFFFFF', fontFamily: 'var(--font-jakarta)' }}
      >
        安排出貨
      </button>
    )
  }
  return (
    <button
      className="px-3 py-[6px] text-[11px] font-medium rounded-[8px] transition-colors hover:bg-gray-50"
      style={{ border: '1px solid #F0EFEC', color: '#6B6B6B', fontFamily: 'var(--font-jakarta)' }}
    >
      查看詳情
    </button>
  )
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [activeTab, setActiveTab] = useState<FilterTab>('all')

  useEffect(() => {
    fetchOrders().then(r => { if (r.data) setOrders(r.data.orders) })
  }, [])

  const filtered = orders.filter(o => {
    if (activeTab === 'all') return true
    return o.status === activeTab
  })

  const getCount = (key: FilterTab) => {
    if (key === 'all') return orders.length
    return orders.filter(o => o.status === key).length
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

        {/* Filter Tabs */}
        <div className="flex items-center gap-2">
          {tabs.map(tab => {
            const active = activeTab === tab.key
            const count = getCount(tab.key)
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="px-3 py-[6px] text-[11px] font-semibold rounded-[20px] transition-all"
                style={{
                  background: active ? '#7C9070' : 'transparent',
                  border: active ? 'none' : '1px solid #F0EFEC',
                  color: active ? '#FFFFFF' : tab.color === '#FFFFFF' ? '#6B6B6B' : tab.color,
                  fontFamily: 'var(--font-jakarta)',
                }}
              >
                {tab.label} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* 訂單表格 */}
      <div
        className="flex flex-col w-full overflow-hidden"
        style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #F0EFEC' }}
      >
        {/* 表頭 */}
        <div
          className="flex items-center px-5 py-[10px]"
          style={{ background: '#FAFAF8' }}
        >
          <span className="w-[160px] text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>訂單編號</span>
          <span className="w-[100px] text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>客戶</span>
          <span className="w-[160px] text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>商品</span>
          <span className="w-[90px] text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>金額</span>
          <span className="w-[80px] text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>付款方式</span>
          <span className="w-[80px] text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>狀態</span>
          <span className="flex-1 text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>操作</span>
        </div>

        {/* 訂單列 */}
        {filtered.map(order => {
          const st = statusLabel(order.status)
          const pm = paymentLabel(order.paymentMethod, order.paymentStatus)
          const itemSummary = order.items.map(i => `${i.productName} x${i.quantity}`).join(', ')

          return (
            <div
              key={order.id}
              className="flex items-center px-5 py-[10px]"
              style={{ borderTop: '1px solid #F0EFEC' }}
            >
              {/* 訂單編號 */}
              <span
                className="w-[160px] text-[12px]"
                style={{ fontFamily: 'var(--font-space-mono)', color: '#2D2D2D' }}
              >
                {order.orderNo}
              </span>

              {/* 客戶 */}
              <span
                className="w-[100px] text-[13px]"
                style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}
              >
                {order.customerName}
              </span>

              {/* 商品摘要 */}
              <span
                className="w-[160px] text-[12px] line-clamp-2 leading-snug"
                style={{ fontFamily: 'var(--font-jakarta)', color: '#6B6B6B' }}
              >
                {itemSummary}
              </span>

              {/* 金額 */}
              <span
                className="w-[90px] text-[12px] font-semibold"
                style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}
              >
                NT$ {order.totalAmount.toLocaleString()}
              </span>

              {/* 付款 */}
              <span
                className="w-[80px] text-[12px]"
                style={{ fontFamily: 'var(--font-jakarta)', color: pm.color }}
              >
                {pm.text}
              </span>

              {/* 狀態 */}
              <div className="w-[80px]">
                <span
                  className="inline-flex items-center px-[8px] py-[3px] text-[10px] font-semibold rounded-[12px]"
                  style={{ background: st.bg, color: st.color }}
                >
                  {st.label}
                </span>
              </div>

              {/* 操作 */}
              <div className="flex-1">
                <ActionButton status={order.status} orderId={order.id} />
              </div>
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="flex items-center justify-center py-16">
            <span
              className="text-[14px]"
              style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}
            >
              目前沒有此狀態的訂單
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
