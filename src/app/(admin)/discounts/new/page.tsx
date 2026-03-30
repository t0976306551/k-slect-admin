'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown } from 'lucide-react'

const inputStyle = {
  background: '#F7F6F3',
  borderRadius: 8,
  border: '1px solid #F0EFEC',
  height: 40,
  fontFamily: 'var(--font-jakarta)',
  color: '#2D2D2D',
  fontSize: 13,
  paddingLeft: 12,
  paddingRight: 12,
  outline: 'none',
  width: '100%',
}

export default function NewDiscountPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage')
  const [value, setValue] = useState('')
  const [minAmount, setMinAmount] = useState('')
  const [usageLimit, setUsageLimit] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  return (
    <div className="p-8 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1
          className="text-[28px] font-medium tracking-[-0.5px]"
          style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2D2D' }}
        >
          新增折扣活動
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="px-5 py-[10px] text-[13px] font-medium rounded-[10px] transition-colors hover:bg-gray-50"
            style={{ border: '1px solid #F0EFEC', color: '#6B6B6B', fontFamily: 'var(--font-jakarta)' }}
          >
            取消
          </button>
          <button
            className="px-5 py-[10px] text-[13px] font-semibold rounded-[10px] transition-opacity hover:opacity-80"
            style={{ background: '#7C9070', color: '#FFFFFF', fontFamily: 'var(--font-jakarta)' }}
          >
            建立活動
          </button>
        </div>
      </div>

      <div className="max-w-2xl">
        <div
          className="flex flex-col gap-5 p-6"
          style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #F0EFEC' }}
        >
          <div className="flex flex-col gap-[6px]">
            <label className="text-[13px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}>活動名稱</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="例：春季特惠" style={inputStyle} />
          </div>

          <div className="flex flex-col gap-[6px]">
            <label className="text-[13px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}>折扣碼</label>
            <input type="text" value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="例：SPRING2026" style={inputStyle} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-[6px]">
              <label className="text-[13px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}>折扣類型</label>
              <div className="relative">
                <select value={type} onChange={e => setType(e.target.value as 'percentage' | 'fixed')} className="appearance-none w-full outline-none" style={{ ...inputStyle, paddingRight: 32 }}>
                  <option value="percentage">百分比折扣 (%)</option>
                  <option value="fixed">固定金額 (NT$)</option>
                </select>
                <ChevronDown size={14} color="#8E8E93" className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            <div className="flex flex-col gap-[6px]">
              <label className="text-[13px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}>
                折扣值 ({type === 'percentage' ? '%' : 'NT$'})
              </label>
              <input type="number" value={value} onChange={e => setValue(e.target.value)} placeholder="0" style={inputStyle} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-[6px]">
              <label className="text-[13px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}>最低消費 (NT$)</label>
              <input type="number" value={minAmount} onChange={e => setMinAmount(e.target.value)} placeholder="選填" style={inputStyle} />
            </div>
            <div className="flex flex-col gap-[6px]">
              <label className="text-[13px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}>使用上限</label>
              <input type="number" value={usageLimit} onChange={e => setUsageLimit(e.target.value)} placeholder="不限" style={inputStyle} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-[6px]">
              <label className="text-[13px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}>開始日期</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={inputStyle} />
            </div>
            <div className="flex flex-col gap-[6px]">
              <label className="text-[13px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}>結束日期</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={inputStyle} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
