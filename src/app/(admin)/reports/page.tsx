import { mockOrders, mockProducts } from '@/lib/mock-data'
import { TrendingUp, ShoppingBag, Users, Package } from 'lucide-react'

export default function ReportsPage() {
  const totalRevenue = mockOrders.reduce((acc, o) => acc + o.totalAmount, 0)
  const completedOrders = mockOrders.filter(o => o.status === 'completed').length
  const activeProducts = mockProducts.filter(p => p.status === 'active').length

  const stats = [
    { label: '本月總營收', value: `NT$ ${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: '#7C9070', bg: '#7C907025' },
    { label: '本月訂單數', value: mockOrders.length.toString(), icon: ShoppingBag, color: '#5B9BD5', bg: '#5B9BD515' },
    { label: '上架商品', value: activeProducts.toString(), icon: Package, color: '#D4845E', bg: '#D4845E15' },
    { label: '活躍會員', value: '5', icon: Users, color: '#7B1FA2', bg: '#F3E5F5' },
  ]

  return (
    <div className="p-8 flex flex-col gap-6">
      <h1
        className="text-[28px] font-medium tracking-[-0.5px]"
        style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2D2D' }}
      >
        報表統計
      </h1>

      <div className="grid grid-cols-4 gap-4">
        {stats.map(stat => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="flex flex-col gap-3 p-5"
              style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #F0EFEC' }}
            >
              <div
                className="flex items-center justify-center w-10 h-10 rounded-[10px]"
                style={{ background: stat.bg }}
              >
                <Icon size={20} color={stat.color} />
              </div>
              <div className="flex flex-col gap-1">
                <span
                  className="text-[12px] font-medium"
                  style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}
                >
                  {stat.label}
                </span>
                <span
                  className="text-[24px] font-medium tracking-[-0.5px]"
                  style={{ fontFamily: 'var(--font-fraunces)', color: stat.color }}
                >
                  {stat.value}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* 商品銷售排行 */}
      <div
        className="flex flex-col overflow-hidden"
        style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #F0EFEC' }}
      >
        <div className="px-5 py-4" style={{ borderBottom: '1px solid #F0EFEC' }}>
          <span
            className="text-[18px] font-medium"
            style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2D2D' }}
          >
            商品銷售排行
          </span>
        </div>
        <div className="flex items-center px-5 py-[10px]" style={{ background: '#FAFAF8' }}>
          <span className="w-8 text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>#</span>
          <span className="flex-1 text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>商品名稱</span>
          <span className="w-[100px] text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>銷售數量</span>
          <span className="w-[120px] text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>銷售金額</span>
        </div>
        {mockProducts.filter(p => p.status === 'active').slice(0, 5).map((p, i) => (
          <div
            key={p.id}
            className="flex items-center px-5 py-3"
            style={{ borderTop: '1px solid #F0EFEC' }}
          >
            <span
              className="w-8 text-[14px] font-bold"
              style={{ fontFamily: 'var(--font-fraunces)', color: i < 3 ? '#7C9070' : '#8E8E93' }}
            >
              {i + 1}
            </span>
            <span className="flex-1 text-[13px] font-medium" style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}>{p.name}</span>
            <span className="w-[100px] text-[12px]" style={{ fontFamily: 'var(--font-jakarta)', color: '#6B6B6B' }}>{Math.floor(Math.random() * 50 + 10)} 件</span>
            <span className="w-[120px] text-[12px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}>NT$ {(p.price * Math.floor(Math.random() * 50 + 10)).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
