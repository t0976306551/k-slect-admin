'use client'

import { useState, useEffect } from 'react'
import { fetchRefunds, updateRefund } from '@/lib/api'
import type { RefundRequest } from '@/types'

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    pending: { label: '待處理', bg: '#FFF3E0', color: '#E65100' },
    approved: { label: '已核准', bg: '#E8F5E9', color: '#2E7D32' },
    rejected: { label: '已拒絕', bg: '#FCE4EC', color: '#C62828' },
    completed: { label: '已完成', bg: '#F3E5F5', color: '#7B1FA2' },
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

export default function ReturnsPage() {
  const [refunds, setRefunds] = useState<RefundRequest[]>([])
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    fetchRefunds().then(r => { if (r.data) setRefunds(r.data) })
  }, [])

  const handleAction = async (id: string, status: 'approved' | 'rejected') => {
    setProcessing(id)
    const res = await updateRefund(id, { status })
    setProcessing(null)
    if (!res.error && res.data) {
      setRefunds(prev => prev.map(r => r.id === id ? { ...r, status } : r))
    }
  }

  return (
    <div className="p-8 flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h1
          className="text-[28px] font-medium tracking-[-0.5px]"
          style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2D2D' }}
        >
          退款管理
        </h1>
      </div>

      <div
        className="flex flex-col overflow-hidden"
        style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #F0EFEC' }}
      >
        <div className="overflow-x-auto">
          <div className="min-w-[620px]">
            <div className="flex items-center px-5 py-[10px]" style={{ background: '#FAFAF8' }}>
              <span className="w-[160px] text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>訂單編號</span>
              <span className="w-[100px] text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>客戶</span>
              <span className="flex-1 text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>退款原因</span>
              <span className="w-[90px] text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>退款金額</span>
              <span className="w-[80px] text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>狀態</span>
              <span className="w-[120px] text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>操作</span>
            </div>

            {refunds.map(refund => (
              <div
                key={refund.id}
                className="flex items-center px-5 py-3"
                style={{ borderTop: '1px solid #F0EFEC' }}
              >
                <span className="w-[160px] text-[12px]" style={{ fontFamily: 'var(--font-space-mono)', color: '#2D2D2D' }}>{refund.orderNo}</span>
                <span className="w-[100px] text-[13px]" style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}>{refund.customerName}</span>
                <span className="flex-1 text-[12px]" style={{ fontFamily: 'var(--font-jakarta)', color: '#6B6B6B' }}>{refund.reason}</span>
                <span className="w-[90px] text-[12px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#D4845E' }}>NT$ {refund.amount.toLocaleString()}</span>
                <div className="w-[80px]">
                  <StatusBadge status={refund.status} />
                </div>
                <div className="w-[120px] flex gap-2">
                  {refund.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleAction(refund.id, 'approved')}
                        disabled={processing === refund.id}
                        className="px-3 py-[5px] text-[11px] font-semibold rounded-[6px] hover:opacity-80 transition-opacity disabled:opacity-50"
                        style={{ background: '#7C9070', color: '#FFFFFF', fontFamily: 'var(--font-jakarta)' }}
                      >
                        核准
                      </button>
                      <button
                        onClick={() => handleAction(refund.id, 'rejected')}
                        disabled={processing === refund.id}
                        className="px-3 py-[5px] text-[11px] font-medium rounded-[6px] hover:bg-red-50 transition-colors disabled:opacity-50"
                        style={{ border: '1px solid #FFCDD2', color: '#E53935', fontFamily: 'var(--font-jakarta)' }}
                      >
                        拒絕
                      </button>
                    </>
                  )}
                  {refund.status !== 'pending' && (
                    <span
                      className="px-3 py-[5px] text-[11px] font-medium rounded-[6px]"
                      style={{ border: '1px solid #F0EFEC', color: '#6B6B6B', fontFamily: 'var(--font-jakarta)' }}
                    >
                      已處理
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
