import { ORDER_STATUS_MAP } from '@/components/admin/StatusBadge'
import { InfoRow } from '@/components/admin/InfoRow'
import type { AdminOrder } from '@/types'

interface OrderDetailDrawerProps {
  order: AdminOrder
  onClose: () => void
  onShipOrder: (order: AdminOrder) => void
  onCancelOrder: (order: AdminOrder) => void
}

function statusLabel(status: AdminOrder['status']): { label: string; bg: string; color: string } {
  return ORDER_STATUS_MAP[status] ?? { label: status, bg: '#F5F5F5', color: '#9E9E9E' }
}

// --- 區塊標題 ---

function SectionTitle({ children }: { children: string }) {
  return (
    <h2
      className="text-[13px] font-medium mb-3"
      style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2D2D' }}
    >
      {children}
    </h2>
  )
}

// --- 區塊容器 ---

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-[12px] p-4 flex flex-col gap-2"
      style={{ background: '#F7F6F3', border: '1px solid #F0EFEC' }}
    >
      {children}
    </div>
  )
}

// --- 商品清單表格 ---

function ItemsTable({ items }: { items: AdminOrder['items'] }) {
  return (
    <div
      className="rounded-[12px] overflow-x-auto"
      style={{ border: '1px solid #F0EFEC' }}
    >
      <div
        className="grid grid-cols-[1fr_60px_60px_72px] px-4 py-2 min-w-[350px]"
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
      {items.map((item, idx) => (
        <div
          key={idx}
          className="grid grid-cols-[1fr_60px_60px_72px] px-4 py-3 items-start min-w-[350px]"
          style={{ borderBottom: idx < items.length - 1 ? '1px solid #F0EFEC' : 'none' }}
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
  )
}

// --- OrderDetailDrawer ---

export function OrderDetailDrawer({
  order,
  onClose,
  onShipOrder,
  onCancelOrder,
}: OrderDetailDrawerProps) {
  const st = statusLabel(order.status)
  const showFooter = order.status === 'pending_ship'

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />

      <div
        className="fixed right-0 top-0 h-full z-50 flex flex-col overflow-hidden w-full sm:w-[480px]"
        style={{ background: '#FFFFFF', boxShadow: '-4px 0 24px rgba(0,0,0,0.08)' }}
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
          <section>
            <SectionTitle>顧客資訊</SectionTitle>
            <SectionCard>
              <InfoRow label="姓名" value={order.customerName} />
              <InfoRow label="Email" value={order.customerEmail} />
              <InfoRow label="電話" value={order.customerPhone || '\u2014'} />
            </SectionCard>
          </section>

          <section>
            <SectionTitle>物流資訊</SectionTitle>
            <SectionCard>
              <InfoRow label="取貨門市" value={order.cvsStoreCode ?? '\u2014'} mono />
              {order.cvsPickupCode && (
                <InfoRow label="取件代碼" value={order.cvsPickupCode} mono />
              )}
            </SectionCard>
          </section>

          <section>
            <SectionTitle>商品清單</SectionTitle>
            <ItemsTable items={order.items} />
          </section>

          <section>
            <SectionTitle>付款資訊</SectionTitle>
            <SectionCard>
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
            </SectionCard>
          </section>

          {order.note && (
            <section>
              <SectionTitle>備註</SectionTitle>
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
