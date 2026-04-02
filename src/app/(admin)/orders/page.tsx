'use client'

import { useState, useEffect } from 'react'
import { fetchOrders, updateOrder } from '@/lib/api'
import type { AdminOrder } from '@/types'

type FilterTab = 'all' | 'pending_ship' | 'shipped' | 'completed'

const tabs: { key: FilterTab; label: string; color: string }[] = [
  { key: 'all', label: '全部', color: '#FFFFFF' },
  { key: 'pending_ship', label: '待出貨', color: '#D4845E' },
  { key: 'shipped', label: '已出貨', color: '#7C9070' },
  { key: 'completed', label: '已完成', color: '#7B1FA2' },
]

function statusLabel(status: AdminOrder['status']): { label: string; bg: string; color: string } {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    pending_ship: { label: '待出貨', bg: '#E3F2FD', color: '#1565C0' },
    shipped: { label: '已出貨', bg: '#E8F5E9', color: '#2E7D32' },
    completed: { label: '已完成', bg: '#F3E5F5', color: '#7B1FA2' },
    cancelled: { label: '已取消', bg: '#F5F5F5', color: '#9E9E9E' },
    refund_pending: { label: '退款中', bg: '#FCE4EC', color: '#C62828' },
    refunded: { label: '已退款', bg: '#F5F5F5', color: '#9E9E9E' },
  }
  return map[status] ?? { label: status, bg: '#F5F5F5', color: '#9E9E9E' }
}

// --- InfoRow ---
function InfoRow({
  label,
  value,
  mono,
  valueColor,
}: {
  label: string
  value: string
  mono?: boolean
  valueColor?: string
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span
        className="text-[12px] shrink-0"
        style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}
      >
        {label}
      </span>
      <span
        className="text-[12px] text-right"
        style={{
          fontFamily: mono ? 'var(--font-space-mono)' : 'var(--font-jakarta)',
          color: valueColor ?? '#2D2D2D',
        }}
      >
        {value}
      </span>
    </div>
  )
}

// --- ActionButton ---
function ActionButton({
  order,
  onShipOrder,
}: {
  order: AdminOrder
  onShipOrder: (order: AdminOrder) => void
}) {
  if (order.status === 'pending_ship') {
    return (
      <button
        className="px-3 py-[6px] text-[11px] font-semibold rounded-[8px] transition-opacity hover:opacity-80"
        style={{ background: '#D4845E', color: '#FFFFFF', fontFamily: 'var(--font-jakarta)' }}
        onClick={(e) => { e.stopPropagation(); onShipOrder(order) }}
      >
        安排出貨
      </button>
    )
  }
  return (
    <button
      className="px-3 py-[6px] text-[11px] font-medium rounded-[8px] transition-colors hover:bg-gray-50"
      style={{ border: '1px solid #F0EFEC', color: '#6B6B6B', fontFamily: 'var(--font-jakarta)' }}
      onClick={(e) => e.stopPropagation()}
    >
      查看詳情
    </button>
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
      <div
        className="fixed inset-0 bg-black/40"
        style={{ zIndex: 60 }}
        onClick={onClose}
      />
      <div
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-5"
        style={{ width: 440, background: '#FFFFFF', borderRadius: 16, padding: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', zIndex: 70 }}
      >
        <div className="flex items-center justify-between">
          <h2
            className="text-[16px] font-medium"
            style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2D2D' }}
          >
            安排出貨
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100"
            style={{ color: '#6B6B6B' }}
          >
            ✕
          </button>
        </div>

        <span
          className="text-[12px]"
          style={{ fontFamily: 'var(--font-space-mono)', color: '#8E8E93' }}
        >
          {order.orderNo}
        </span>

        <div
          className="rounded-[12px] p-4 flex flex-col gap-2"
          style={{ background: '#F7F6F3', border: '1px solid #F0EFEC' }}
        >
          <InfoRow label="訂單金額" value={`NT$ ${order.totalAmount.toLocaleString()}`} />
          <InfoRow label="取貨門市" value={order.cvsStoreCode ?? order.shippingAddress} />
        </div>

        <div
          className="flex items-start gap-2 rounded-[10px] p-3"
          style={{ background: '#E8F5E9', border: '1px solid #C8E6C9' }}
        >
          <span className="text-[13px] mt-[1px]">ℹ️</span>
          <p
            className="text-[12px] leading-relaxed"
            style={{ fontFamily: 'var(--font-jakarta)', color: '#2E7D32' }}
          >
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

// --- CancelOrderModal ---
function CancelOrderModal({
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
      <div
        className="fixed inset-0 bg-black/40"
        style={{ zIndex: 60 }}
        onClick={onClose}
      />
      <div
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-5"
        style={{ width: 400, background: '#FFFFFF', borderRadius: 16, padding: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', zIndex: 70 }}
      >
        <div className="flex items-center justify-between">
          <h2
            className="text-[16px] font-medium"
            style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2D2D' }}
          >
            取消訂單
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100"
            style={{ color: '#6B6B6B' }}
          >
            ✕
          </button>
        </div>

        <div
          className="rounded-[12px] p-4"
          style={{ background: '#F7F6F3', border: '1px solid #F0EFEC' }}
        >
          <InfoRow label="訂單編號" value={order.orderNo} mono />
        </div>

        <div
          className="flex items-start gap-3 rounded-[10px] p-3"
          style={{ background: '#FCE4EC', border: '1px solid #FFCDD2' }}
        >
          <span className="text-[15px] mt-[1px]">⚠️</span>
          <p
            className="text-[12px] leading-relaxed"
            style={{ fontFamily: 'var(--font-jakarta)', color: '#C62828' }}
          >
            取消後庫存將自動補回，此操作無法撤銷。
          </p>
        </div>

        <div className="flex gap-3">
          <button
            className="flex-1 py-[10px] text-[13px] font-medium rounded-[10px] transition-opacity hover:opacity-80"
            style={{ border: '1px solid #F0EFEC', color: '#6B6B6B', fontFamily: 'var(--font-jakarta)' }}
            onClick={onClose}
          >
            返回
          </button>
          <button
            className="flex-1 py-[10px] text-[13px] font-semibold rounded-[10px] transition-opacity hover:opacity-80 disabled:opacity-50"
            style={{ background: '#C62828', color: '#FFFFFF', fontFamily: 'var(--font-jakarta)' }}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? '處理中...' : '確認取消'}
          </button>
        </div>
      </div>
    </>
  )
}

// --- OrderDetailDrawer ---
function OrderDetailDrawer({
  order,
  onClose,
  onShipOrder,
  onCancelOrder,
}: {
  order: AdminOrder
  onClose: () => void
  onShipOrder: (order: AdminOrder) => void
  onCancelOrder: (order: AdminOrder) => void
}) {
  const st = statusLabel(order.status)
  const showFooter = order.status === 'pending_ship'

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />

      <div
        className="fixed right-0 top-0 h-full z-50 flex flex-col overflow-hidden"
        style={{ width: 480, background: '#FFFFFF', boxShadow: '-4px 0 24px rgba(0,0,0,0.08)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: '1px solid #F0EFEC' }}
        >
          <div className="flex items-center gap-3">
            <span
              className="text-[15px] font-medium"
              style={{ fontFamily: 'var(--font-space-mono)', color: '#2D2D2D' }}
            >
              {order.orderNo}
            </span>
            <span
              className="inline-flex items-center px-[8px] py-[3px] text-[10px] font-semibold rounded-[12px]"
              style={{ background: st.bg, color: st.color }}
            >
              {st.label}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:bg-gray-100"
            style={{ color: '#6B6B6B' }}
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">

          {/* 顧客資訊 */}
          <section>
            <h2
              className="text-[13px] font-medium mb-3"
              style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2D2D' }}
            >
              顧客資訊
            </h2>
            <div
              className="rounded-[12px] p-4 flex flex-col gap-2"
              style={{ background: '#F7F6F3', border: '1px solid #F0EFEC' }}
            >
              <InfoRow label="姓名" value={order.customerName} />
              <InfoRow label="Email" value={order.customerEmail} />
              <InfoRow label="電話" value={order.customerPhone || '—'} />
            </div>
          </section>

          {/* 物流資訊 */}
          <section>
            <h2
              className="text-[13px] font-medium mb-3"
              style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2D2D' }}
            >
              物流資訊
            </h2>
            <div
              className="rounded-[12px] p-4 flex flex-col gap-2"
              style={{ background: '#F7F6F3', border: '1px solid #F0EFEC' }}
            >
              <InfoRow label="取貨門市" value={order.cvsStoreCode ?? '—'} mono />
              {order.cvsPickupCode && (
                <InfoRow label="取件代碼" value={order.cvsPickupCode} mono />
              )}
            </div>
          </section>

          {/* 商品清單 */}
          <section>
            <h2
              className="text-[13px] font-medium mb-3"
              style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2D2D' }}
            >
              商品清單
            </h2>
            <div
              className="rounded-[12px] overflow-hidden"
              style={{ border: '1px solid #F0EFEC' }}
            >
              <div
                className="grid grid-cols-[1fr_60px_60px_72px] px-4 py-2"
                style={{ background: '#FAFAF8', borderBottom: '1px solid #F0EFEC' }}
              >
                {['商品', '數量', '單價', '小計'].map(h => (
                  <span
                    key={h}
                    className="text-[11px] font-semibold"
                    style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}
                  >
                    {h}
                  </span>
                ))}
              </div>
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-[1fr_60px_60px_72px] px-4 py-3 items-start"
                  style={{ borderBottom: idx < order.items.length - 1 ? '1px solid #F0EFEC' : 'none' }}
                >
                  <div className="flex flex-col gap-[2px]">
                    <span
                      className="text-[12px] font-medium leading-snug"
                      style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}
                    >
                      {item.productName}
                    </span>
                    <span
                      className="text-[11px]"
                      style={{ fontFamily: 'var(--font-space-mono)', color: '#8E8E93' }}
                    >
                      {item.sku}
                    </span>
                  </div>
                  <span className="text-[12px]" style={{ fontFamily: 'var(--font-jakarta)', color: '#6B6B6B' }}>
                    {item.quantity}
                  </span>
                  <span className="text-[12px]" style={{ fontFamily: 'var(--font-space-mono)', color: '#6B6B6B' }}>
                    {item.priceAtOrder.toLocaleString()}
                  </span>
                  <span className="text-[12px] font-medium" style={{ fontFamily: 'var(--font-space-mono)', color: '#2D2D2D' }}>
                    {(item.priceAtOrder * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* 付款資訊 */}
          <section>
            <h2
              className="text-[13px] font-medium mb-3"
              style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2D2D' }}
            >
              付款資訊
            </h2>
            <div
              className="rounded-[12px] p-4 flex flex-col gap-2"
              style={{ background: '#F7F6F3', border: '1px solid #F0EFEC' }}
            >
              <InfoRow label="付款方式" value="取貨付款" />
              <div className="flex items-center justify-between pt-2 mt-1" style={{ borderTop: '1px solid #F0EFEC' }}>
                <span
                  className="text-[13px] font-semibold"
                  style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}
                >
                  總金額
                </span>
                <span
                  className="text-[16px] font-semibold"
                  style={{ fontFamily: 'var(--font-space-mono)', color: '#2D2D2D' }}
                >
                  NT$ {order.totalAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </section>

          {/* 備註 */}
          {order.note && (
            <section>
              <h2
                className="text-[13px] font-medium mb-3"
                style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2D2D' }}
              >
                備註
              </h2>
              <div
                className="rounded-[12px] p-4"
                style={{ background: '#F7F6F3', border: '1px solid #F0EFEC' }}
              >
                <p
                  className="text-[13px] leading-relaxed"
                  style={{ fontFamily: 'var(--font-jakarta)', color: '#6B6B6B' }}
                >
                  {order.note}
                </p>
              </div>
            </section>
          )}
        </div>

        {/* Sticky Footer */}
        {showFooter && (
          <div
            className="shrink-0 px-6 py-4 flex gap-3"
            style={{ borderTop: '1px solid #F0EFEC' }}
          >
            <button
              className="flex-1 py-[10px] text-[13px] font-semibold rounded-[10px] transition-opacity hover:opacity-80"
              style={{ background: '#D4845E', color: '#FFFFFF', fontFamily: 'var(--font-jakarta)' }}
              onClick={() => onShipOrder(order)}
            >
              安排出貨
            </button>
            <button
              className="flex-1 py-[10px] text-[13px] font-medium rounded-[10px] transition-colors hover:bg-gray-50"
              style={{ border: '1px solid #F0EFEC', color: '#6B6B6B', fontFamily: 'var(--font-jakarta)' }}
              onClick={() => onCancelOrder(order)}
            >
              取消訂單
            </button>
          </div>
        )}
      </div>
    </>
  )
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [drawerOrder, setDrawerOrder] = useState<AdminOrder | null>(null)
  const [shipOrderTarget, setShipOrderTarget] = useState<AdminOrder | null>(null)
  const [cancelOrderTarget, setCancelOrderTarget] = useState<AdminOrder | null>(null)

  useEffect(() => {
    fetchOrders().then(r => { if (r.data) setOrders(r.data.orders) })
  }, [])

  const filtered = orders
    .filter(o => activeTab === 'all' || o.status === activeTab)
    .filter(o => {
      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase()
      return o.orderNo.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q)
    })

  const getCount = (key: FilterTab) => {
    if (key === 'all') return orders.length
    return orders.filter(o => o.status === key).length
  }

  const applyUpdate = (updated: AdminOrder) => {
    setOrders(prev => prev.map(o => o.id === updated.id ? updated : o))
    if (drawerOrder?.id === updated.id) setDrawerOrder(updated)
  }

  const handleShipOrder = async (order: AdminOrder) => {
    const res = await updateOrder(order.id, { status: 'shipped' })
    if (res.data) applyUpdate(res.data)
  }

  const handleCancelOrder = async (order: AdminOrder) => {
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

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
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

      {/* Search */}
      <div className="relative">
        <span
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] pointer-events-none"
          style={{ color: '#8E8E93' }}
        >
          🔍
        </span>
        <input
          type="text"
          placeholder="搜尋訂單編號或客戶姓名..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-[10px] text-[13px] rounded-[12px] outline-none"
          style={{
            border: '1px solid #F0EFEC',
            background: '#FFFFFF',
            fontFamily: 'var(--font-jakarta)',
            color: '#2D2D2D',
          }}
        />
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
          <span className="w-[80px] text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>取貨門市</span>
          <span className="w-[80px] text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>狀態</span>
          <span className="flex-1 text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>操作</span>
        </div>

        {/* 訂單列 */}
        {filtered.map(order => {
          const st = statusLabel(order.status)
          const itemSummary = order.items.map(i => `${i.productName} x${i.quantity}`).join(', ')

          return (
            <div
              key={order.id}
              className="flex items-center px-5 py-[10px] cursor-pointer hover:bg-[#FAFAF8] transition-colors"
              style={{ borderTop: '1px solid #F0EFEC' }}
              onClick={() => setDrawerOrder(order)}
            >
              <span
                className="w-[160px] text-[12px]"
                style={{ fontFamily: 'var(--font-space-mono)', color: '#2D2D2D' }}
              >
                {order.orderNo}
              </span>

              <span
                className="w-[100px] text-[13px]"
                style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}
              >
                {order.customerName}
              </span>

              <span
                className="w-[160px] text-[12px] line-clamp-2 leading-snug"
                style={{ fontFamily: 'var(--font-jakarta)', color: '#6B6B6B' }}
              >
                {itemSummary}
              </span>

              <span
                className="w-[90px] text-[12px] font-semibold"
                style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}
              >
                NT$ {order.totalAmount.toLocaleString()}
              </span>

              <span
                className="w-[80px] text-[12px]"
                style={{ fontFamily: 'var(--font-space-mono)', color: '#6B6B6B' }}
              >
                {order.cvsStoreCode ?? '—'}
              </span>

              <div className="w-[80px]">
                <span
                  className="inline-flex items-center px-[8px] py-[3px] text-[10px] font-semibold rounded-[12px]"
                  style={{ background: st.bg, color: st.color }}
                >
                  {st.label}
                </span>
              </div>

              <div className="flex-1">
                <ActionButton
                  order={order}
                  onShipOrder={setShipOrderTarget}
                />
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
              {searchQuery ? '找不到符合的訂單' : '目前沒有此狀態的訂單'}
            </span>
          </div>
        )}
      </div>

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
