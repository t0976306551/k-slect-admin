import type { AdminOrder } from '@/types'

type FilterTab = 'all' | 'pending_ship' | 'shipped' | 'completed'

const TABS: readonly { key: FilterTab; label: string; color: string }[] = [
  { key: 'all', label: '全部', color: '#FFFFFF' },
  { key: 'pending_ship', label: '待出貨', color: '#D4845E' },
  { key: 'shipped', label: '已出貨', color: '#7C9070' },
  { key: 'completed', label: '已完成', color: '#7B1FA2' },
] as const

interface OrderFilterTabsProps {
  activeTab: FilterTab
  onTabChange: (tab: FilterTab) => void
  orders: readonly AdminOrder[]
}

function getCount(orders: readonly AdminOrder[], key: FilterTab): number {
  if (key === 'all') return orders.length
  return orders.filter(o => o.status === key).length
}

export type { FilterTab }

export function OrderFilterTabs({ activeTab, onTabChange, orders }: OrderFilterTabsProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {TABS.map(tab => {
        const active = activeTab === tab.key
        const count = getCount(orders, tab.key)
        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
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
  )
}
