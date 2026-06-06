'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Package } from 'lucide-react'
import { fetchOrder, editOrder } from '@/lib/api'
import { PageHeader } from '@/components/admin/PageHeader'
import { ErrorBanner } from '@/components/admin/ErrorBanner'
import { ORDER_STATUS_MAP, StatusBadge } from '@/components/admin/StatusBadge'
import type { AdminOrder } from '@/types'

const INPUT_STYLE = {
  background: '#FAFAF8',
  border: '1px solid #F0EFEC',
  borderRadius: 8,
  fontFamily: 'var(--font-jakarta)',
  color: '#2D2D2D',
  fontSize: 13,
  outline: 'none',
  width: '100%',
  padding: '10px 14px',
  display: 'block',
} as const

const LABEL_STYLE = {
  fontFamily: 'var(--font-jakarta)',
  fontSize: 11,
  fontWeight: 600,
  color: '#8E8E93',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  marginBottom: 6,
  display: 'block',
}

const CARD_STYLE = {
  background: '#FFFFFF',
  borderRadius: 16,
  border: '1px solid #F0EFEC',
  padding: 24,
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 20,
}

export default function EditOrderPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [order, setOrder] = useState<AdminOrder | null>(null)
  const [loading, setLoading] = useState(true)

  // Form state
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [shippingMethod, setShippingMethod] = useState<'home_delivery' | 'cvs_pickup'>('home_delivery')
  const [shippingAddress, setShippingAddress] = useState('')
  const [cvsStoreName, setCvsStoreName] = useState('')
  const [cvsStoreAddress, setCvsStoreAddress] = useState('')
  const [shippingFee, setShippingFee] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState<'seller_ship' | 'bank_transfer'>('seller_ship')
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid' | 'failed'>('pending')
  const [trackingNo, setTrackingNo] = useState('')
  const [depositPaid, setDepositPaid] = useState(false)
  const [depositAmount, setDepositAmount] = useState(0)
  const [note, setNote] = useState('')

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const res = await fetchOrder(id)
      if (res.error) { setError(res.error.message); setLoading(false); return }
      if (!res.data) { setLoading(false); return }
      const o = res.data
      setOrder(o)
      setCustomerName(o.customerName)
      setCustomerPhone(o.customerPhone)
      setCustomerEmail(o.customerEmail ?? '')
      setShippingMethod((o.shippingMethod as 'home_delivery' | 'cvs_pickup') ?? 'home_delivery')
      setShippingAddress(o.shippingAddress ?? '')
      setCvsStoreName(o.cvsStoreName ?? '')
      setCvsStoreAddress(o.cvsStoreAddress ?? '')
      setShippingFee(o.shippingFee ?? 0)
      setPaymentMethod((o.paymentMethod as 'seller_ship' | 'bank_transfer') ?? 'seller_ship')
      setPaymentStatus(o.paymentStatus as 'pending' | 'paid' | 'failed')
      setTrackingNo(o.trackingNo ?? '')
      setDepositPaid(o.depositPaid ?? false)
      setDepositAmount(o.depositAmount ?? 0)
      setNote(o.note ?? '')
      setLoading(false)
    }
    load()
  }, [id])

  const itemsTotal = order?.items.reduce((s, i) => s + i.priceAtOrder * i.quantity, 0) ?? 0
  const grossTotal = itemsTotal + shippingFee
  const balanceDue = grossTotal - (depositPaid ? depositAmount : 0)

  async function handleSubmit() {
    if (!customerName.trim()) { setError('請填寫客戶姓名'); return }
    if (!customerPhone.trim()) { setError('請填寫客戶手機'); return }
    setError(null)
    setSaving(true)
    try {
      const res = await editOrder(id, {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        shippingMethod,
        shippingAddress: shippingMethod === 'home_delivery' ? (shippingAddress.trim() || undefined) : undefined,
        cvsStoreName: shippingMethod === 'cvs_pickup' ? (cvsStoreName.trim() || undefined) : undefined,
        cvsStoreAddress: shippingMethod === 'cvs_pickup' ? (cvsStoreAddress.trim() || undefined) : undefined,
        shippingFee,
        paymentMethod,
        paymentStatus,
        trackingNo: trackingNo.trim() || undefined,
        depositPaid,
        depositAmount: depositPaid ? depositAmount : 0,
        note: note.trim() || undefined,
      })
      if (res.error) { setError(res.error.message || '儲存失敗'); return }
      router.push('/orders')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-4 md:p-8 flex items-center justify-center py-32">
        <div className="w-8 h-8 rounded-full border-2 border-[#7C9070] border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="p-4 md:p-8 flex flex-col items-center gap-3 py-32">
        <Package size={32} color="#D8D5D0" />
        <p style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93', fontSize: 14 }}>找不到此訂單</p>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 flex flex-col gap-6">
      <div className="flex items-center gap-3 flex-wrap">
        <PageHeader
          title={`編輯訂單`}
          saving={saving}
          saveLabel="儲存變更"
          onCancel={() => router.back()}
          onSave={handleSubmit}
        />
      </div>

      {/* Order no + status badge */}
      <div className="flex items-center gap-3">
        <span style={{ fontFamily: 'var(--font-space-mono)', fontSize: 13, color: '#8E8E93' }}>
          {order.orderNo}
        </span>
        <StatusBadge status={order.status} map={ORDER_STATUS_MAP} />
      </div>

      {error && <ErrorBanner message={error} />}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ── Left ── */}
        <div className="md:col-span-2 flex flex-col gap-5">

          {/* 客戶資訊 */}
          <div style={CARD_STYLE}>
            <h2 className="text-[16px] font-semibold" style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2D2D' }}>
              客戶資訊
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span style={LABEL_STYLE}>姓名 *</span>
                <input value={customerName} onChange={e => setCustomerName(e.target.value)} style={INPUT_STYLE} />
              </div>
              <div>
                <span style={LABEL_STYLE}>手機 *</span>
                <input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} style={INPUT_STYLE} />
              </div>
              <div>
                <span style={LABEL_STYLE}>Email（選填）</span>
                <input value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} style={INPUT_STYLE} />
              </div>
            </div>
          </div>

          {/* 商品明細（唯讀） */}
          <div style={CARD_STYLE}>
            <h2 className="text-[16px] font-semibold" style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2D2D' }}>
              商品明細
              <span className="text-[11px] font-normal ml-2" style={{ color: '#AEAAA4' }}>（建立後不可修改）</span>
            </h2>
            <div className="flex flex-col gap-2">
              {order.items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-3 py-3"
                  style={{ borderBottom: i < order.items.length - 1 ? '1px solid #F0EFEC' : 'none' }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium" style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}>
                      {item.productName}
                    </p>
                    {item.variantSnapshot && (
                      <p className="text-[11px]" style={{ fontFamily: 'var(--font-jakarta)', color: '#AEAAA4' }}>
                        {Object.entries(item.variantSnapshot).map(([k, v]) => `${k}: ${v}`).join(' / ')}
                      </p>
                    )}
                  </div>
                  <span className="text-[12px] shrink-0" style={{ fontFamily: 'var(--font-jakarta)', color: '#6B6B6B' }}>
                    × {item.quantity}
                  </span>
                  <span className="text-[13px] font-semibold tabular-nums shrink-0" style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}>
                    NT$ {(item.priceAtOrder * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 運送方式 */}
          <div style={CARD_STYLE}>
            <h2 className="text-[16px] font-semibold" style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2D2D' }}>
              運送方式
            </h2>

            <div className="flex gap-3">
              {([
                { value: 'home_delivery', label: '宅配' },
                { value: 'cvs_pickup', label: '超商取貨' },
              ] as const).map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setShippingMethod(opt.value)}
                  className="flex-1 py-2.5 rounded-[10px] text-[13px] font-medium transition-all active:scale-[0.97]"
                  style={{
                    fontFamily: 'var(--font-jakarta)',
                    background: shippingMethod === opt.value ? '#7C9070' : '#F7F6F3',
                    color: shippingMethod === opt.value ? '#FFFFFF' : '#6B6B6B',
                    border: shippingMethod === opt.value ? '1.5px solid #7C9070' : '1.5px solid #F0EFEC',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {shippingMethod === 'home_delivery' ? (
              <div>
                <span style={LABEL_STYLE}>收件地址</span>
                <input value={shippingAddress} onChange={e => setShippingAddress(e.target.value)} placeholder="台北市中山區..." style={INPUT_STYLE} />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span style={LABEL_STYLE}>門市名稱</span>
                  <input value={cvsStoreName} onChange={e => setCvsStoreName(e.target.value)} placeholder="7-11 民生門市" style={INPUT_STYLE} />
                </div>
                <div>
                  <span style={LABEL_STYLE}>門市地址</span>
                  <input value={cvsStoreAddress} onChange={e => setCvsStoreAddress(e.target.value)} placeholder="台北市..." style={INPUT_STYLE} />
                </div>
              </div>
            )}

            <div>
              <span style={LABEL_STYLE}>追蹤號碼（出貨後填寫）</span>
              <input value={trackingNo} onChange={e => setTrackingNo(e.target.value)} placeholder="物流追蹤號碼" style={INPUT_STYLE} />
            </div>

            <div style={{ width: 180 }}>
              <span style={LABEL_STYLE}>運費（元）</span>
              <div className="flex items-center gap-2 px-3" style={{ ...INPUT_STYLE, padding: undefined, display: 'flex', alignItems: 'center' }}>
                <span className="text-[12px] shrink-0" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>NT$</span>
                <input
                  type="number" min="0"
                  value={shippingFee}
                  onChange={e => setShippingFee(Number(e.target.value) || 0)}
                  className="flex-1 bg-transparent outline-none text-[13px] py-2.5"
                  style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}
                />
              </div>
            </div>
          </div>

          {/* 付款資訊 */}
          <div style={CARD_STYLE}>
            <h2 className="text-[16px] font-semibold" style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2D2D' }}>
              付款資訊
            </h2>

            <div>
              <span style={LABEL_STYLE}>付款方式</span>
              <div className="flex gap-3">
                {([
                  { value: 'seller_ship', label: '貨到付款' },
                  { value: 'bank_transfer', label: '匯款' },
                ] as const).map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setPaymentMethod(opt.value)}
                    className="flex-1 py-2.5 rounded-[10px] text-[13px] font-medium transition-all active:scale-[0.97]"
                    style={{
                      fontFamily: 'var(--font-jakarta)',
                      background: paymentMethod === opt.value ? '#2D2D2D' : '#F7F6F3',
                      color: paymentMethod === opt.value ? '#FFFFFF' : '#6B6B6B',
                      border: paymentMethod === opt.value ? '1.5px solid #2D2D2D' : '1.5px solid #F0EFEC',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span style={LABEL_STYLE}>付款狀態</span>
              <div className="flex gap-3">
                {([
                  { value: 'pending', label: '待付款' },
                  { value: 'paid', label: '已付款' },
                  { value: 'failed', label: '付款失敗' },
                ] as const).map(opt => {
                  const active = paymentStatus === opt.value
                  const bg = active
                    ? opt.value === 'paid' ? '#7C9070' : opt.value === 'failed' ? '#D4845E' : '#6B6B6B'
                    : '#F7F6F3'
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setPaymentStatus(opt.value)}
                      className="flex-1 py-2.5 rounded-[10px] text-[13px] font-medium transition-all active:scale-[0.97]"
                      style={{
                        fontFamily: 'var(--font-jakarta)',
                        background: bg,
                        color: active ? '#FFFFFF' : '#6B6B6B',
                        border: `1.5px solid ${active ? bg : '#F0EFEC'}`,
                      }}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={depositPaid}
                  onChange={e => setDepositPaid(e.target.checked)}
                  className="w-4 h-4 rounded accent-[#7C9070]"
                />
                <span className="text-[13px] font-medium" style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}>
                  已收訂金
                </span>
              </label>
              {depositPaid && (
                <div style={{ width: 220 }}>
                  <span style={LABEL_STYLE}>訂金金額（元）</span>
                  <div className="flex items-center gap-2 px-3" style={{ ...INPUT_STYLE, padding: undefined, display: 'flex', alignItems: 'center' }}>
                    <span className="text-[12px] shrink-0" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>NT$</span>
                    <input
                      type="number" min="0"
                      value={depositAmount}
                      onChange={e => setDepositAmount(Number(e.target.value) || 0)}
                      className="flex-1 bg-transparent outline-none text-[13px] py-2.5"
                      style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 備註 */}
          <div style={CARD_STYLE}>
            <h2 className="text-[16px] font-semibold" style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2D2D' }}>
              備註
            </h2>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="訂單備註..."
              rows={4}
              className="resize-none"
              style={{ ...INPUT_STYLE, padding: '12px 14px' }}
            />
          </div>

        </div>

        {/* ── Right: summary ── */}
        <div className="flex flex-col gap-4">
          <div className="md:sticky md:top-[72px] flex flex-col gap-4 p-6 rounded-[16px]" style={{ background: '#FFFFFF', border: '1px solid #F0EFEC' }}>
            <h2 className="text-[16px] font-semibold" style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2D2D' }}>訂單金額</h2>

            <div className="flex flex-col gap-2.5">
              <div className="flex justify-between">
                <span className="text-[12px]" style={{ fontFamily: 'var(--font-jakarta)', color: '#6B6B6B' }}>商品小計</span>
                <span className="text-[13px] font-semibold tabular-nums" style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}>NT$ {itemsTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[12px]" style={{ fontFamily: 'var(--font-jakarta)', color: '#6B6B6B' }}>運費</span>
                <span className="text-[13px] tabular-nums" style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}>{shippingFee > 0 ? `NT$ ${shippingFee.toLocaleString()}` : '免運'}</span>
              </div>
              {depositPaid && depositAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-[12px]" style={{ fontFamily: 'var(--font-jakarta)', color: '#6B6B6B' }}>已收訂金</span>
                  <span className="text-[13px] tabular-nums" style={{ fontFamily: 'var(--font-jakarta)', color: '#D4845E' }}>− NT$ {depositAmount.toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-3" style={{ borderTop: '2px solid #F0EFEC' }}>
              <span className="text-[14px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}>應收尾款</span>
              <span className="text-[22px] font-semibold tabular-nums" style={{ fontFamily: 'var(--font-jakarta)', color: balanceDue >= 0 ? '#2D2D2D' : '#D4845E' }}>
                NT$ {balanceDue.toLocaleString()}
              </span>
            </div>

            <button
              onClick={handleSubmit}
              disabled={saving}
              className="w-full py-3 rounded-[12px] text-[14px] font-semibold transition-all hover:opacity-80 active:scale-[0.97] disabled:opacity-50 mt-1"
              style={{ background: '#7C9070', color: '#FFFFFF', fontFamily: 'var(--font-jakarta)' }}
            >
              {saving ? '儲存中...' : '儲存變更'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
