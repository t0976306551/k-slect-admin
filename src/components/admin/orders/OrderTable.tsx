import { ORDER_STATUS_MAP, StatusBadge } from '@/components/admin/StatusBadge'
import type { AdminOrder } from '@/types'

// --- ActionButton ---

interface ActionButtonProps {
  order: AdminOrder
  onShipOrder: (order: AdminOrder) => void
}

function ActionButton({ order, onShipOrder }: ActionButtonProps) {
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

// --- 表頭欄位 ---

const COLUMNS = [
  { label: '訂單編號', width: 'w-[160px]' },
  { label: '客戶', width: 'w-[100px]' },
  { label: '商品', width: 'w-[160px]' },
  { label: '金額', width: 'w-[90px]' },
  { label: '取貨門市', width: 'w-[80px]' },
  { label: '狀態', width: 'w-[80px]' },
  { label: '操作', width: 'flex-1' },
] as const

function TableHeader() {
  return (
    <div
      className="flex items-center px-5 py-[10px]"
      style={{ background: '#FAFAF8' }}
    >
      {COLUMNS.map(col => (
        <span
          key={col.label}
          className={`${col.width} text-[11px] font-semibold`}
          style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}
        >
          {col.label}
        </span>
      ))}
    </div>
  )
}

// --- OrderTable ---

interface OrderTableProps {
  orders: readonly AdminOrder[]
  searchQuery: string
  onSelectOrder: (order: AdminOrder) => void
  onShipOrder: (order: AdminOrder) => void
}

export function OrderTable({ orders, searchQuery, onSelectOrder, onShipOrder }: OrderTableProps) {
  return (
    <div
      className="w-full overflow-x-auto"
      style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #F0EFEC' }}
    >
      <div className="flex flex-col min-w-[700px]">
        <TableHeader />

        {orders.map(order => {
          const itemSummary = order.items.map(i => `${i.productName} x${i.quantity}`).join(', ')

          return (
            <div
              key={order.id}
              className="flex items-center px-5 py-[10px] cursor-pointer hover:bg-[#FAFAF8] transition-colors"
              style={{ borderTop: '1px solid #F0EFEC' }}
              onClick={() => onSelectOrder(order)}
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
                {order.cvsStoreCode ?? '\u2014'}
              </span>

              <div className="w-[80px]">
                <StatusBadge status={order.status} map={ORDER_STATUS_MAP} sizeClass="text-[10px]" />
              </div>

              <div className="flex-1">
                <ActionButton order={order} onShipOrder={onShipOrder} />
              </div>
            </div>
          )
        })}

        {orders.length === 0 && (
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
    </div>
  )
}
