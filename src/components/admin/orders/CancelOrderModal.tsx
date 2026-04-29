'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { InfoRow } from '@/components/admin/InfoRow'
import type { AdminOrder } from '@/types'

interface CancelOrderModalProps {
  order: AdminOrder
  onConfirm: () => Promise<void>
  onClose: () => void
}

export function CancelOrderModal({ order, onConfirm, onClose }: CancelOrderModalProps) {
  const [loading, setLoading] = useState(false)

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
    <>
      <div
        className="fixed inset-0 bg-black/40"
        style={{ zIndex: 60 }}
        onClick={onClose}
      />
      <div
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-5 w-[90vw] max-w-[440px]"
        style={{ background: '#FFFFFF', borderRadius: 16, padding: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', zIndex: 70 }}
      >
        <div className="flex items-center justify-between">
          <h2
            className="text-[16px] font-medium"
            style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2D2D' }}
          >
            取消訂單
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100"
            style={{ color: '#6B6B6B' }}
          >
            <X size={14} />
          </button>
        </div>

        <div
          className="rounded-[12px] p-4"
          style={{ background: '#F7F6F3', border: '1px solid #F0EFEC' }}
        >
          <InfoRow label="訂單編號" value={order.orderNo} mono />
        </div>

        <div
          className="flex items-start gap-3 rounded-[10px] p-3"
          style={{ background: '#FCE4EC', border: '1px solid #FFCDD2' }}
        >
          <p
            className="text-[12px] leading-relaxed"
            style={{ fontFamily: 'var(--font-jakarta)', color: '#C62828' }}
          >
            取消後庫存將自動補回，此操作無法撤銷。
          </p>
        </div>

        <div className="flex gap-3">
          <button
            className="flex-1 py-[10px] text-[13px] font-medium rounded-[10px] transition-opacity hover:opacity-80"
            style={{ border: '1px solid #F0EFEC', color: '#6B6B6B', fontFamily: 'var(--font-jakarta)' }}
            onClick={onClose}
          >
            返回
          </button>
          <button
            className="flex-1 py-[10px] text-[13px] font-semibold rounded-[10px] transition-opacity hover:opacity-80 disabled:opacity-50"
            style={{ background: '#C62828', color: '#FFFFFF', fontFamily: 'var(--font-jakarta)' }}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? '處理中...' : '確認取消'}
          </button>
        </div>
      </div>
    </>
  )
}
