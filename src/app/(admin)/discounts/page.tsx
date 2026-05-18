'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { fetchDiscounts } from '@/lib/api'
import { StatusBadge, DISCOUNT_STATUS_MAP } from '@/components/admin/StatusBadge'
import type { Discount } from '@/types'

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([])

  useEffect(() => {
    async function load() {
      const r = await fetchDiscounts()
      if (r.data) setDiscounts(r.data)
    }
    load()
  }, [])

  return (
    <div className="p-8 flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h1
          className="text-[28px] font-medium tracking-[-0.5px]"
          style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2D2D' }}
        >
          折扣活動
        </h1>
        <Link
          href="/discounts/new"
          className="flex items-center gap-[6px] px-5 py-[10px] transition-all hover:opacity-80 active:scale-[0.96]"
          style={{ background: '#7C9070', borderRadius: 10, fontSize: 13, fontWeight: 600, color: '#FFFFFF', fontFamily: 'var(--font-jakarta)' }}
        >
          <Plus size={16} color="#FFFFFF" />
          新增活動
        </Link>
      </div>

      <div
        className="flex flex-col overflow-hidden"
        style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #F0EFEC' }}
      >
        <div className="overflow-x-auto">
          <div className="min-w-[680px]">
            <div className="flex items-center px-5 py-[10px]" style={{ background: '#FAFAF8' }}>
              <span className="w-[160px] text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>活動名稱</span>
              <span className="w-[130px] text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>折扣碼</span>
              <span className="w-[100px] text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>折扣</span>
              <span className="w-[120px] text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>使用量</span>
              <span className="flex-1 text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>有效期間</span>
              <span className="w-[80px] text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>狀態</span>
            </div>

            {discounts.map(discount => (
              <div
                key={discount.id}
                className="flex items-center px-5 py-3"
                style={{ borderTop: '1px solid #F0EFEC' }}
              >
                <span className="w-[160px] text-[13px] font-medium" style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}>{discount.name}</span>
                <span className="w-[130px] text-[12px]" style={{ fontFamily: 'var(--font-space-mono)', color: '#7C9070' }}>{discount.code}</span>
                <span className="w-[100px] text-[12px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#D4845E' }}>
                  {discount.type === 'percentage' ? `${discount.value}% off` : `NT$ ${discount.value}`}
                </span>
                <span className="w-[120px] text-[12px]" style={{ fontFamily: 'var(--font-jakarta)', color: '#6B6B6B' }}>
                  {discount.usedCount}{discount.usageLimit ? ` / ${discount.usageLimit}` : ''}
                </span>
                <span className="flex-1 text-[12px]" style={{ fontFamily: 'var(--font-jakarta)', color: '#6B6B6B' }}>
                  {discount.startDate} — {discount.endDate}
                </span>
                <div className="w-[80px]">
                  <StatusBadge status={discount.status} map={DISCOUNT_STATUS_MAP} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
