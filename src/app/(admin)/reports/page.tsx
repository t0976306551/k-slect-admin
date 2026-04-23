'use client'

import { useState, useEffect } from 'react'
import { fetchProducts, fetchOrders, fetchMembers } from '@/lib/api'
import { TrendingUp, ShoppingBag, Users, Package } from 'lucide-react'
import type { Product, AdminOrder, Member } from '@/types'

type ProductWithSales = Product & { soldCount: number; revenue: number }

export default function ReportsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetchProducts(),
      fetchOrders(),
      fetchMembers(),
    ]).then(([pRes, oRes, mRes]) => {
      if (pRes.data) setProducts(pRes.data)
      if (oRes.data) setOrders(oRes.data.orders)
      if (mRes.data) setMembers(mRes.data)
      setLoading(false)
    })
  }, [])

  const completedOrders = orders.filter(o => o.status !== 'cancelled')
  const totalRevenue = completedOrders.reduce((acc, o) => acc + o.totalAmount, 0)
  const activeProducts = products.filter(p => p.status === 'active').length
  const activeMembers = members.filter(m => m.status === 'active').length

  // 從訂單明細計算商品銷售數量
  const salesMap = new Map<string, { soldCount: number; revenue: number }>()
  completedOrders.forEach(order => {
    order.items?.forEach(item => {
      if (!item.productId) return
      const cur = salesMap.get(item.productId) ?? { soldCount: 0, revenue: 0 }
      salesMap.set(item.productId, {
        soldCount: cur.soldCount + item.quantity,
        revenue: cur.revenue + item.priceAtOrder * item.quantity,
      })
    })
  })

  const topProducts: ProductWithSales[] = products
    .filter(p => p.status === 'active')
    .map(p => ({
      ...p,
      soldCount: salesMap.get(p.id)?.soldCount ?? 0,
      revenue: salesMap.get(p.id)?.revenue ?? 0,
    }))
    .sort((a, b) => b.soldCount - a.soldCount)
    .slice(0, 5)

  const stats = [
    { label: '總營收', value: `NT$ ${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: '#7C9070', bg: '#7C907025' },
    { label: '訂單數', value: completedOrders.length.toString(), icon: ShoppingBag, color: '#5B9BD5', bg: '#5B9BD515' },
    { label: '上架商品', value: activeProducts.toString(), icon: Package, color: '#D4845E', bg: '#D4845E15' },
    { label: '活躍會員', value: activeMembers.toString(), icon: Users, color: '#7B1FA2', bg: '#F3E5F5' },
  ]

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <span style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93', fontSize: 14 }}>載入中...</span>
      </div>
    )
  }

  return (
    <div className="p-8 flex flex-col gap-6">
      <h1
        className="text-[28px] font-medium tracking-[-0.5px]"
        style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2D2D' }}
      >
        報表統計
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                <span className="text-[12px] font-medium" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>
                  {stat.label}
                </span>
                <span className="text-[24px] font-medium tracking-[-0.5px]" style={{ fontFamily: 'var(--font-fraunces)', color: stat.color }}>
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
          <span className="text-[18px] font-medium" style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2D2D' }}>
            商品銷售排行
          </span>
        </div>
        <div className="overflow-x-auto">
          <div className="flex items-center px-5 py-[10px]" style={{ background: '#FAFAF8' }}>
            <span className="w-8 shrink-0 text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>#</span>
            <span className="flex-1 text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>商品名稱</span>
            <span className="w-[100px] shrink-0 text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>銷售數量</span>
            <span className="w-[120px] shrink-0 text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>銷售金額</span>
          </div>
          {topProducts.length === 0 ? (
            <div className="px-5 py-8 text-center text-[13px]" style={{ color: '#8E8E93', fontFamily: 'var(--font-jakarta)' }}>
              尚無銷售紀錄
            </div>
          ) : (
            topProducts.map((p, i) => (
              <div
                key={p.id}
                className="flex items-center px-5 py-3"
                style={{ borderTop: '1px solid #F0EFEC' }}
              >
                <span className="w-8 shrink-0 text-[14px] font-bold" style={{ fontFamily: 'var(--font-fraunces)', color: i < 3 ? '#7C9070' : '#8E8E93' }}>
                  {i + 1}
                </span>
                <span className="flex-1 text-[13px] font-medium" style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}>{p.name}</span>
                <span className="w-[100px] shrink-0 text-[12px]" style={{ fontFamily: 'var(--font-jakarta)', color: '#6B6B6B' }}>{p.soldCount} 件</span>
                <span className="w-[120px] shrink-0 text-[12px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}>NT$ {p.revenue.toLocaleString()}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
