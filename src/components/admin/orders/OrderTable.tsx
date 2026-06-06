import Link from 'next/link'
import { Pencil, Package, Trash2 } from 'lucide-react'
import { ORDER_STATUS_MAP, StatusBadge } from '@/components/admin/StatusBadge'
import type { AdminOrder } from '@/types'

const PAYMENT_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: '待付款', color: '#B45309', bg: '#FEF3C7' },
  paid:    { label: '已付款', color: '#166534', bg: '#DCFCE7' },
  failed:  { label: '付款失敗', color: '#991B1B', bg: '#FEE2E2' },
}

function PaymentBadge({ status }: { status: string }) {
  const s = PAYMENT_STATUS[status] ?? PAYMENT_STATUS.pending
  return (
    <span
      className="inline-flex px-1.5 py-0.5 rounded-[4px] text-[10px] font-semibold"
      style={{ background: s.bg, color: s.color, fontFamily: 'var(--font-jakarta)' }}
    >
      {s.label}
    </span>
  )
}

function fmtDate(iso: string) {
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

function ItemSummary({ items }: { items: AdminOrder['items'] }) {
  const first = items[0]
  if (!first) return <span style={{ color: '#AEAAA4' }}>—</span>
  const rest = items.length - 1
  return (
    <span className="line-clamp-1 leading-snug" style={{ fontFamily: 'var(--font-jakarta)', fontSize: 12, color: '#6B6B6B' }}>
      {first.productName}
      {first.quantity > 1 ? ` ×${first.quantity}` : ''}
      {rest > 0 ? ` +${rest}` : ''}
    </span>
  )
}

// ── Desktop row ──────────────────────────────────────────────────────────────

interface RowProps {
  order: AdminOrder
  onSelect: (order: AdminOrder) => void
  onShipOrder: (order: AdminOrder) => void
  onDeleteOrder: (order: AdminOrder) => void
}

function DesktopRow({ order, onSelect, onShipOrder, onDeleteOrder }: RowProps) {
  const shipping = order.shippingMethod === 'cvs_pickup'
    ? (order.cvsStoreName ?? order.cvsStoreCode ?? '超商取貨')
    : (order.shippingAddress ?? '宅配')

  return (
    <div
      className="hidden md:flex items-center px-5 py-3 hover:bg-[#FAFAF8] transition-colors cursor-pointer"
      style={{ borderTop: '1px solid #F0EFEC' }}
      onClick={() => onSelect(order)}
    >
      {/* 訂單編號 */}
      <div className="w-[155px] shrink-0">
        <span className="text-[12px]" style={{ fontFamily: 'var(--font-space-mono)', color: '#2D2D2D' }}>
          {order.orderNo}
        </span>
      </div>

      {/* 客戶 */}
      <div className="w-[110px] shrink-0 flex flex-col gap-[2px]">
        <span className="text-[13px] font-medium truncate" style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}>
          {order.customerName}
        </span>
        <span className="text-[11px]" style={{ fontFamily: 'var(--font-jakarta)', color: '#AEAAA4' }}>
          {order.customerPhone}
        </span>
      </div>

      {/* 商品 */}
      <div className="flex-1 min-w-0 pr-4">
        <ItemSummary items={order.items} />
      </div>

      {/* 金額 + 付款狀態 */}
      <div className="w-[110px] shrink-0 flex flex-col gap-1">
        <span className="text-[13px] font-semibold tabular-nums" style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}>
          NT$ {order.totalAmount.toLocaleString()}
        </span>
        <PaymentBadge status={order.paymentStatus} />
      </div>

      {/* 運送 */}
      <div className="w-[120px] shrink-0">
        <span className="text-[11px] truncate block" style={{ fontFamily: 'var(--font-jakarta)', color: '#6B6B6B' }}>
          {shipping}
        </span>
      </div>

      {/* 日期 */}
      <div className="w-[55px] shrink-0">
        <span className="text-[11px]" style={{ fontFamily: 'var(--font-jakarta)', color: '#AEAAA4' }}>
          {fmtDate(order.createdAt)}
        </span>
      </div>

      {/* 狀態 + 出貨按鈕 */}
      <div className="w-[160px] shrink-0 flex items-center gap-2" onClick={e => e.stopPropagation()}>
        <StatusBadge status={order.status} map={ORDER_STATUS_MAP} sizeClass="text-[10px]" />
        {order.status === 'pending_ship' && (
          <button
            onClick={() => onShipOrder(order)}
            className="px-3 py-[5px] text-[11px] font-semibold rounded-[8px] transition-all hover:opacity-80 active:scale-[0.96] whitespace-nowrap"
            style={{ background: '#D4845E', color: '#FFFFFF', fontFamily: 'var(--font-jakarta)' }}
          >
            安排出貨
          </button>
        )}
      </div>

      {/* 編輯 + 刪除 */}
      <div className="w-[72px] shrink-0 flex items-center gap-1 justify-end" onClick={e => e.stopPropagation()}>
        <Link
          href={`/orders/${order.id}/edit`}
          className="w-8 h-8 flex items-center justify-center rounded-[8px] hover:bg-[#F0F4EE] transition-colors"
          title="編輯訂單"
        >
          <Pencil size={14} color="#7C9070" />
        </Link>
        <button
          onClick={() => onDeleteOrder(order)}
          className="w-8 h-8 flex items-center justify-center rounded-[8px] hover:bg-[#FEE2E2] transition-colors"
          title="刪除訂單"
        >
          <Trash2 size={14} color="#991B1B" />
        </button>
      </div>
    </div>
  )
}

// ── Mobile card ──────────────────────────────────────────────────────────────

function MobileCard({ order, onSelect, onShipOrder, onDeleteOrder }: RowProps) {
  return (
    <div
      className="md:hidden flex flex-col gap-3 p-4 rounded-[14px] border"
      style={{ background: '#FFFFFF', borderColor: '#F0EFEC', animation: 'fade-up 0.25s ease both' }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <span className="text-[12px]" style={{ fontFamily: 'var(--font-space-mono)', color: '#8E8E93' }}>
            {order.orderNo}
          </span>
          <span className="text-[14px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}>
            {order.customerName}
          </span>
          <span className="text-[11px]" style={{ fontFamily: 'var(--font-jakarta)', color: '#AEAAA4' }}>
            {order.customerPhone}
          </span>
        </div>
        <StatusBadge status={order.status} map={ORDER_STATUS_MAP} sizeClass="text-[10px]" />
      </div>

      {/* Items + amount + payment */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <ItemSummary items={order.items} />
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="text-[14px] font-semibold tabular-nums" style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}>
            NT$ {order.totalAmount.toLocaleString()}
          </span>
          <PaymentBadge status={order.paymentStatus} />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1" style={{ borderTop: '1px solid #F0EFEC' }}>
        <button
          onClick={() => onSelect(order)}
          className="flex-1 h-10 rounded-[10px] text-[12px] font-medium transition-all hover:bg-[#F0EFEC] active:scale-[0.97]"
          style={{ border: '1px solid #F0EFEC', fontFamily: 'var(--font-jakarta)', color: '#6B6B6B' }}
        >
          查看詳情
        </button>
        {order.status === 'pending_ship' && (
          <button
            onClick={() => onShipOrder(order)}
            className="flex-1 h-10 rounded-[10px] text-[12px] font-semibold transition-all hover:opacity-80 active:scale-[0.97]"
            style={{ background: '#D4845E', color: '#FFFFFF', fontFamily: 'var(--font-jakarta)' }}
          >
            安排出貨
          </button>
        )}
        <Link
          href={`/orders/${order.id}/edit`}
          className="w-10 h-10 flex items-center justify-center rounded-[10px] transition-colors hover:bg-[#F0F4EE]"
          style={{ border: '1px solid #F0EFEC' }}
          title="編輯"
        >
          <Pencil size={15} color="#7C9070" />
        </Link>
        <button
          onClick={() => onDeleteOrder(order)}
          className="w-10 h-10 flex items-center justify-center rounded-[10px] transition-colors hover:bg-[#FEE2E2]"
          style={{ border: '1px solid #F0EFEC' }}
          title="刪除"
        >
          <Trash2 size={15} color="#991B1B" />
        </button>
      </div>
    </div>
  )
}

// ── OrderTable ───────────────────────────────────────────────────────────────

interface OrderTableProps {
  orders: readonly AdminOrder[]
  searchQuery: string
  onSelectOrder: (order: AdminOrder) => void
  onShipOrder: (order: AdminOrder) => void
  onDeleteOrder: (order: AdminOrder) => void
}

export function OrderTable({ orders, searchQuery, onSelectOrder, onShipOrder, onDeleteOrder }: OrderTableProps) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center py-20 gap-3">
        <Package size={32} color="#D8D5D0" />
        <span className="text-[14px]" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>
          {searchQuery ? '找不到符合的訂單' : '目前沒有此狀態的訂單'}
        </span>
      </div>
    )
  }

  return (
    <>
      {/* ── Mobile cards ── */}
      <div className="flex flex-col gap-3 md:hidden">
        {orders.map(order => (
          <MobileCard
            key={order.id}
            order={order}
            onSelect={onSelectOrder}
            onShipOrder={onShipOrder}
            onDeleteOrder={onDeleteOrder}
          />
        ))}
      </div>

      {/* ── Desktop table ── */}
      <div
        className="hidden md:block w-full overflow-x-auto"
        style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #F0EFEC' }}
      >
        <div className="min-w-[780px]">
          {/* Header */}
          <div className="flex items-center px-5 py-[10px]" style={{ background: '#FAFAF8' }}>
            {[
              { label: '訂單編號', w: 'w-[155px]' },
              { label: '客戶', w: 'w-[110px]' },
              { label: '商品', w: 'flex-1' },
              { label: '金額 / 付款', w: 'w-[110px]' },
              { label: '運送', w: 'w-[120px]' },
              { label: '日期', w: 'w-[55px]' },
              { label: '狀態', w: 'w-[160px]' },
              { label: '', w: 'w-[72px]' },
            ].map(col => (
              <span key={col.label} className={`${col.w} text-[11px] font-semibold shrink-0`} style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>
                {col.label}
              </span>
            ))}
          </div>

          {orders.map(order => (
            <DesktopRow
              key={order.id}
              order={order}
              onSelect={onSelectOrder}
              onShipOrder={onShipOrder}
              onDeleteOrder={onDeleteOrder}
            />
          ))}
        </div>
      </div>
    </>
  )
}
