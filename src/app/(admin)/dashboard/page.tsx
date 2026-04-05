import Link from 'next/link'
import { fetchDashboardStats, fetchOrders } from '@/lib/api'

function formatAmount(n: number) {
  return `NT$ ${n.toLocaleString()}`
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    pending_ship: { label: '待出貨', bg: '#7C907025', color: '#7C9070' },
    shipped: { label: '已出貨', bg: '#D4845E15', color: '#D4845E' },
    pending_confirm: { label: '待確認', bg: '#5B9BD515', color: '#5B9BD5' },
    pending_payment: { label: '待付款', bg: '#5B9BD515', color: '#5B9BD5' },
    completed: { label: '已完成', bg: '#F3E5F5', color: '#7B1FA2' },
    cancelled: { label: '已取消', bg: '#F5F5F5', color: '#9E9E9E' },
  }
  const s = map[status] ?? { label: status, bg: '#F5F5F5', color: '#9E9E9E' }
  return (
    <span
      className="inline-flex items-center px-[8px] py-[3px] text-[10px] font-semibold rounded-[12px]"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  )
}

function PaymentBadge({ method, status }: { method: string; status: string }) {
  if (method === 'bank_transfer' && status === 'paid') {
    return <span className="text-[12px]" style={{ color: '#7C9070' }}>已匯款</span>
  }
  if (method === 'bank_transfer' && status === 'pending') {
    return <span className="text-[12px]" style={{ color: '#D4845E' }}>待匯款</span>
  }
  return <span className="text-[12px]" style={{ color: '#5B9BD5' }}>取貨付款</span>
}

export default async function DashboardPage() {
  const [statsResult, ordersResult] = await Promise.all([
    fetchDashboardStats(),
    fetchOrders({ limit: 3 }),
  ])
  const stats = statsResult.data ?? { todayOrders: 0, todayOrdersChange: 0, todayRevenue: 0, todayRevenueChange: 0, pendingShip: 0, pendingConfirm: 0 }
  const recentOrders = ordersResult.data?.orders ?? []

  const today = new Date()
  const dateStr = today.toLocaleDateString('zh-TW', {
    year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short',
  })

  return (
    <div className="p-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1
          className="text-[28px] font-medium tracking-[-0.5px]"
          style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2D2D' }}
        >
          儀表板
        </h1>
        <span
          className="text-[13px]"
          style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}
        >
          {dateStr}
        </span>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {/* 今日訂單 */}
        <div
          className="flex flex-col gap-2 p-5"
          style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #F0EFEC' }}
        >
          <span
            className="text-[12px] font-medium"
            style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}
          >
            今日訂單
          </span>
          <span
            className="text-[32px] font-medium tracking-[-1px]"
            style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2D2D' }}
          >
            {stats.todayOrders}
          </span>
          <span
            className="text-[11px]"
            style={{ fontFamily: 'var(--font-space-mono)', color: '#7C9070' }}
          >
            +{stats.todayOrdersChange}% vs 昨日
          </span>
        </div>

        {/* 今日營收 */}
        <div
          className="flex flex-col gap-2 p-5"
          style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #F0EFEC' }}
        >
          <span
            className="text-[12px] font-medium"
            style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}
          >
            今日營收
          </span>
          <span
            className="text-[32px] font-medium tracking-[-1px]"
            style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2D2D' }}
          >
            NT$ {stats.todayRevenue.toLocaleString()}
          </span>
          <span
            className="text-[11px]"
            style={{ fontFamily: 'var(--font-space-mono)', color: '#7C9070' }}
          >
            +{stats.todayRevenueChange}% vs 昨日
          </span>
        </div>

        {/* 待出貨 */}
        <div
          className="flex flex-col gap-2 p-5"
          style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #F0EFEC' }}
        >
          <span
            className="text-[12px] font-medium"
            style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}
          >
            待出貨
          </span>
          <span
            className="text-[32px] font-medium tracking-[-1px]"
            style={{ fontFamily: 'var(--font-fraunces)', color: '#D4845E' }}
          >
            {stats.pendingShip}
          </span>
          <span
            className="text-[11px]"
            style={{ fontFamily: 'var(--font-space-mono)', color: '#8E8E93' }}
          >
            需盡快處理
          </span>
        </div>

      </div>

      {/* 最近訂單 */}
      <div
        className="flex flex-col w-full overflow-hidden"
        style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #F0EFEC' }}
      >
        {/* 卡片標題 */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid #F0EFEC' }}
        >
          <span
            className="text-[18px] font-medium"
            style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2D2D' }}
          >
            最近訂單
          </span>
          <Link
            href="/orders"
            className="text-[12px] font-semibold"
            style={{ fontFamily: 'var(--font-jakarta)', color: '#7C9070' }}
          >
            查看全部
          </Link>
        </div>

        {/* 表格區域（手機可橫向滑動） */}
        <div className="overflow-x-auto">
          {/* 表頭 */}
          <div
            className="flex items-center px-5 py-[10px]"
            style={{ background: '#FAFAF8' }}
          >
            <span className="w-[140px] shrink-0 text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>訂單編號</span>
            <span className="w-[120px] shrink-0 text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>客戶</span>
            <span className="w-[100px] shrink-0 text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>金額</span>
            <span className="w-[100px] shrink-0 text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>付款</span>
            <span className="flex-1 text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>狀態</span>
          </div>

          {/* 訂單列 */}
          {recentOrders.map((order) => (
            <div
              key={order.id}
              className="flex items-center px-5 py-3"
              style={{ borderTop: '1px solid #F0EFEC' }}
            >
              <span
                className="w-[140px] shrink-0 text-[12px]"
                style={{ fontFamily: 'var(--font-space-mono)', color: '#2D2D2D' }}
              >
                {order.orderNo}
              </span>
              <span
                className="w-[120px] shrink-0 text-[13px]"
                style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}
              >
                {order.customerName}
              </span>
              <span
                className="w-[100px] shrink-0 text-[13px] font-medium"
                style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}
              >
                {formatAmount(order.totalAmount)}
              </span>
              <span className="w-[100px] shrink-0">
                <PaymentBadge method={order.paymentMethod} status={order.paymentStatus} />
              </span>
              <span className="flex-1">
                <StatusBadge status={order.status} />
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
