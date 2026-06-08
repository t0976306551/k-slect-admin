'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { InfoRow } from './InfoRow'
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import type { AdminOrder } from '@/types'

interface ShipOrderModalProps {
  order: AdminOrder
  onConfirm: () => Promise<void>
  onClose: () => void
}

export function ShipOrderModal({ order, onConfirm, onClose }: ShipOrderModalProps) {
  const [loading, setLoading] = useState(false)
  useBodyScrollLock(true)

  async function handleConfirm() {
    setLoading(true)
    try {
      await onConfirm()
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.4)', animation: 'fade-in 0.18s ease both' }}
    >
      <div
        className="w-full max-w-[440px] max-h-[90dvh] overflow-y-auto flex flex-col gap-5 p-6 rounded-[16px]"
        style={{
          background: '#FFFFFF',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          animation: 'modal-in 0.26s cubic-bezier(0.34,1.3,0.64,1) both',
        }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-[16px] font-medium" style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2D2D' }}>
            安排出貨
          </h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100" style={{ color: '#6B6B6B' }}>
            <X size={14} />
          </button>
        </div>

        <span className="text-[12px]" style={{ fontFamily: 'var(--font-space-mono)', color: '#8E8E93' }}>
          {order.orderNo}
        </span>

        <div className="rounded-[12px] p-4 flex flex-col gap-2" style={{ background: '#F7F6F3', border: '1px solid #F0EFEC' }}>
          <InfoRow label="訂單金額" value={`NT$ ${order.totalAmount.toLocaleString()}`} />
          <InfoRow label="取貨門市" value={order.cvsStoreCode ?? order.shippingAddress ?? '—'} mono />
        </div>

        <div className="flex items-start gap-2 rounded-[10px] p-3" style={{ background: '#E8F5E9', border: '1px solid #C8E6C9' }}>
          <span className="text-[13px] mt-[1px] text-[#2E7D32]">ℹ</span>
          <p className="text-[12px] leading-relaxed" style={{ fontFamily: 'var(--font-jakarta)', color: '#2E7D32' }}>
            確認後訂單狀態將更新為「已出貨」。
          </p>
        </div>

        <div className="flex gap-3">
          <button
            className="flex-1 py-[10px] text-[13px] font-medium rounded-[10px] transition-all hover:opacity-80 active:scale-[0.96]"
            style={{ border: '1px solid #F0EFEC', color: '#6B6B6B', fontFamily: 'var(--font-jakarta)' }}
            onClick={onClose}
          >
            取消
          </button>
          <button
            className="flex-1 py-[10px] text-[13px] font-semibold rounded-[10px] transition-all hover:opacity-80 active:scale-[0.96] disabled:opacity-50"
            style={{ background: '#D4845E', color: '#FFFFFF', fontFamily: 'var(--font-jakarta)' }}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? '處理中...' : '確認出貨'}
          </button>
        </div>
      </div>
    </div>
  )
}
