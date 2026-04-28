import { Search } from 'lucide-react'

interface OrderSearchBarProps {
  value: string
  onChange: (value: string) => void
}

export function OrderSearchBar({ value, onChange }: OrderSearchBarProps) {
  return (
    <div className="relative">
      <Search
        size={14}
        className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
        color="#8E8E93"
      />
      <input
        type="text"
        placeholder="搜尋訂單編號或客戶姓名..."
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full pl-9 pr-4 py-[10px] text-[13px] rounded-[12px] outline-none"
        style={{
          border: '1px solid #F0EFEC',
          background: '#FFFFFF',
          fontFamily: 'var(--font-jakarta)',
          color: '#2D2D2D',
        }}
      />
    </div>
  )
}
