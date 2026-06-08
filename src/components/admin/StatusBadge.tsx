interface StatusBadgeProps {
  status: string
  /** 狀態對照表：key 為 status 值，value 為 { label, bg, color } */
  map: Record<string, { label: string; bg: string; color: string }>
  /** 若 status 不在 map 中的預設值 */
  fallbackLabel?: string
  /** 覆寫文字大小 class（預設 text-[11px]） */
  sizeClass?: string
}

export function StatusBadge({
  status,
  map,
  fallbackLabel,
  sizeClass = 'text-[11px]',
}: StatusBadgeProps) {
  const s = map[status] ?? { label: fallbackLabel ?? status, bg: '#F5F5F5', color: '#9E9E9E' }
  return (
    <span
      className={`inline-flex items-center px-[8px] py-[3px] ${sizeClass} font-semibold rounded-[12px]`}
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  )
}

// 常用的狀態對照表預設值

export const PRODUCT_STATUS_MAP: Record<string, { label: string; bg: string; color: string }> = {
  active: { label: '上架中', bg: '#7C907025', color: '#7C9070' },
  inactive: { label: '已下架', bg: '#E5E4E1', color: '#8E8E93' },
}

export const MEMBER_STATUS_MAP: Record<string, { label: string; bg: string; color: string }> = {
  active: { label: '正常', bg: '#7C907025', color: '#7C9070' },
  inactive: { label: '停用', bg: '#E5E4E1', color: '#8E8E93' },
}

export const BANNER_STATUS_MAP: Record<string, { label: string; bg: string; color: string }> = {
  active: { label: '顯示中', bg: '#7C907025', color: '#7C9070' },
  inactive: { label: '已隱藏', bg: '#E5E4E1', color: '#8E8E93' },
}

export const DISCOUNT_STATUS_MAP: Record<string, { label: string; bg: string; color: string }> = {
  active: { label: '進行中', bg: '#7C907025', color: '#7C9070' },
  inactive: { label: '未啟用', bg: '#E5E4E1', color: '#8E8E93' },
  expired: { label: '已過期', bg: '#F5F5F5', color: '#9E9E9E' },
}

export const REFUND_STATUS_MAP: Record<string, { label: string; bg: string; color: string }> = {
  pending: { label: '待處理', bg: '#FFF3E0', color: '#E65100' },
  approved: { label: '已核准', bg: '#E8F5E9', color: '#2E7D32' },
  rejected: { label: '已拒絕', bg: '#FCE4EC', color: '#C62828' },
  completed: { label: '已完成', bg: '#F3E5F5', color: '#7B1FA2' },
}

export const ORDER_STATUS_MAP: Record<string, { label: string; bg: string; color: string }> = {
  pending_ship: { label: '待出貨', bg: '#E3F2FD', color: '#1565C0' },
  shipped: { label: '已出貨', bg: '#E8F5E9', color: '#2E7D32' },
  completed: { label: '已完成', bg: '#F3E5F5', color: '#7B1FA2' },
  cancelled: { label: '已取消', bg: '#F5F5F5', color: '#9E9E9E' },
  refund_pending: { label: '退款中', bg: '#FCE4EC', color: '#C62828' },
  refunded: { label: '已退款', bg: '#F5F5F5', color: '#9E9E9E' },
}
