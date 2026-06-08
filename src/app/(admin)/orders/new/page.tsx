'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Search, Plus, Trash2, X, User, Package, ShoppingBag } from 'lucide-react'
import { createOrder, searchCustomers, fetchProducts, fetchProduct } from '@/lib/api'
import { PageHeader } from '@/components/admin/PageHeader'
import { ErrorBanner } from '@/components/admin/ErrorBanner'
import type { Customer, Product, ProductVariant } from '@/types'

interface OrderItemDraft {
  _id: string
  productId: string | null
  productName: string
  sku: string
  quantity: number
  priceAtOrder: number
  image: string | null
  variantSnapshot: Record<string, string> | null
  variantLabel: string
}

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

export default function NewOrderPage() {
  const router = useRouter()

  // --- Customer ---
  const [customerQuery, setCustomerQuery] = useState('')
  const [customerResults, setCustomerResults] = useState<Customer[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showCustomerDrop, setShowCustomerDrop] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const customerTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // --- Product search ---
  const [productQuery, setProductQuery] = useState('')
  const [productResults, setProductResults] = useState<Product[]>([])
  const [showProductDrop, setShowProductDrop] = useState(false)
  const [variantProduct, setVariantProduct] = useState<Product | null>(null)
  const [variantLoading, setVariantLoading] = useState(false)
  const productTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // --- Items ---
  const [items, setItems] = useState<OrderItemDraft[]>([])

  // --- Shipping ---
  const [shippingMethod, setShippingMethod] = useState<'home_delivery' | 'cvs_pickup'>('home_delivery')
  const [shippingAddress, setShippingAddress] = useState('')
  const [cvsStoreName, setCvsStoreName] = useState('')
  const [cvsStoreAddress, setCvsStoreAddress] = useState('')
  const [shippingFee, setShippingFee] = useState(0)

  // --- Payment ---
  const [paymentMethod, setPaymentMethod] = useState<'seller_ship' | 'bank_transfer'>('seller_ship')
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid' | 'failed'>('pending')
  const [depositPaid, setDepositPaid] = useState(false)
  const [depositAmount, setDepositAmount] = useState(0)

  // --- Notes / form state ---
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Computed totals
  const itemsTotal = items.reduce((sum, i) => sum + i.priceAtOrder * i.quantity, 0)
  const grossTotal = itemsTotal + shippingFee
  const balanceDue = grossTotal - (depositPaid ? depositAmount : 0)

  // ── Customer search ──────────────────────────────────────────────────────────

  const handleCustomerQueryChange = useCallback((q: string) => {
    setCustomerQuery(q)
    if (customerTimer.current) clearTimeout(customerTimer.current)
    if (!q.trim()) { setCustomerResults([]); setShowCustomerDrop(false); return }
    customerTimer.current = setTimeout(async () => {
      const res = await searchCustomers(q)
      if (res.error) { console.error('[customer search]', res.error.message); return }
      if (res.data) { setCustomerResults(res.data); setShowCustomerDrop(true) }
    }, 300)
  }, [])

  function selectCustomer(c: Customer) {
    setSelectedCustomer(c)
    setCustomerName(c.name)
    setCustomerPhone(c.phone ?? '')
    setCustomerEmail(c.email ?? '')
    setShowCustomerDrop(false)
    setCustomerQuery('')
    setCustomerResults([])
  }

  function clearCustomer() {
    setSelectedCustomer(null)
    setCustomerName('')
    setCustomerPhone('')
    setCustomerEmail('')
  }

  // ── Product search ───────────────────────────────────────────────────────────

  const handleProductQueryChange = useCallback((q: string) => {
    setProductQuery(q)
    if (productTimer.current) clearTimeout(productTimer.current)
    if (!q.trim()) { setProductResults([]); setShowProductDrop(false); return }
    productTimer.current = setTimeout(async () => {
      const res = await fetchProducts({ q, status: 'active' })
      if (res.data) { setProductResults(res.data); setShowProductDrop(true) }
    }, 300)
  }, [])

  async function handleSelectProduct(product: Product) {
    setShowProductDrop(false)
    setProductQuery('')
    setProductResults([])
    if ((product.variants?.length ?? 0) > 0) {
      setVariantLoading(true)
      try {
        // Fetch full product to ensure variants.optionValues are loaded
        const res = await fetchProduct(product.id)
        setVariantProduct(res.data ?? product)
      } finally {
        setVariantLoading(false)
      }
    } else {
      appendItem(product, undefined)
    }
  }

  function appendItem(product: Product, variant: ProductVariant | undefined) {
    const price = variant?.price ?? product.price
    const ovs = variant?.optionValues ?? []
    const variantLabel = ovs.length > 0
      ? ovs.map(ov => {
          const opt = product.options?.find(o => o.id === ov.optionId)
          return opt ? `${opt.name}：${ov.value}` : ov.value
        }).join(' / ')
      : (variant?.sku ? `SKU: ${variant.sku}` : '')
    const variantSnapshot = ovs.length > 0
      ? ovs.reduce((acc, ov) => {
          const opt = product.options?.find(o => o.id === ov.optionId)
          if (opt) acc[opt.name] = ov.value
          return acc
        }, {} as Record<string, string>)
      : null

    setItems(prev => [...prev, {
      _id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      productId: product.id,
      productName: product.name,
      sku: variant?.sku ?? '',
      quantity: 1,
      priceAtOrder: price,
      image: variant?.image ?? (product.images?.[0] ?? null),
      variantSnapshot,
      variantLabel,
    }])
    setVariantProduct(null)
  }

  function addManualItem() {
    setItems(prev => [...prev, {
      _id: `manual-${Date.now()}`,
      productId: null,
      productName: '',
      sku: '',
      quantity: 1,
      priceAtOrder: 0,
      image: null,
      variantSnapshot: null,
      variantLabel: '',
    }])
  }

  function updateItem(id: string, updates: Partial<OrderItemDraft>) {
    setItems(prev => prev.map(item => item._id === id ? { ...item, ...updates } : item))
  }

  function removeItem(id: string) {
    setItems(prev => prev.filter(item => item._id !== id))
  }

  // ── Submit ───────────────────────────────────────────────────────────────────

  async function handleSubmit() {
    if (!customerName.trim()) { setError('請填寫客戶姓名'); return }
    if (!customerPhone.trim()) { setError('請填寫客戶手機'); return }
    if (items.length === 0) { setError('請至少新增一項商品'); return }
    if (items.some(i => !i.productName.trim())) { setError('請填寫所有商品名稱'); return }

    setError(null)
    setSaving(true)
    try {
      const res = await createOrder({
        customerId: selectedCustomer?.id,
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
        depositPaid,
        depositAmount: depositPaid ? depositAmount : 0,
        note: note.trim() || undefined,
        items: items.map(item => ({
          productId: item.productId ?? undefined,
          productName: item.productName.trim(),
          sku: item.sku || undefined,
          quantity: item.quantity,
          priceAtOrder: item.priceAtOrder,
          image: item.image ?? undefined,
          variantSnapshot: item.variantSnapshot ?? undefined,
        })),
      })

      if (res.error) { setError(res.error.message || '建立訂單失敗'); return }
      router.push('/orders')
    } finally {
      setSaving(false)
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="p-4 md:p-8 flex flex-col gap-6">
      <PageHeader
        title="新增訂單"
        saving={saving}
        saveLabel="建立訂單"
        onCancel={() => router.back()}
        onSave={handleSubmit}
      />

      {error && <ErrorBanner message={error} />}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ── Left: form sections ───────────────────────────── */}
        <div className="md:col-span-2 flex flex-col gap-5">

          {/* ── 客戶資訊 ── */}
          <div style={CARD_STYLE}>
            <h2 className="text-[16px] font-semibold" style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2D2D' }}>
              客戶資訊
            </h2>

            {selectedCustomer ? (
              <div
                className="flex items-center gap-3 p-3.5 rounded-[10px]"
                style={{ background: '#F0F4EE', border: '1.5px solid #7C9070' }}
              >
                <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: '#7C907025' }}>
                  <User size={17} color="#7C9070" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold truncate" style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}>
                    {selectedCustomer.name}
                  </p>
                  <p className="text-[11px]" style={{ fontFamily: 'var(--font-jakarta)', color: '#6B6B6B' }}>
                    {selectedCustomer.phone}
                    {selectedCustomer.email ? ` · ${selectedCustomer.email}` : ''}
                  </p>
                </div>
                <button
                  onClick={clearCustomer}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white transition-colors"
                >
                  <X size={14} color="#8E8E93" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <span style={LABEL_STYLE}>搜尋既有客戶（姓名或手機）</span>
                <div className="flex items-center gap-2 px-3" style={{ ...INPUT_STYLE, padding: undefined, display: 'flex', alignItems: 'center' }}>
                  <Search size={14} color="#8E8E93" className="shrink-0" />
                  <input
                    value={customerQuery}
                    onChange={e => handleCustomerQueryChange(e.target.value)}
                    onFocus={() => customerResults.length > 0 && setShowCustomerDrop(true)}
                    onBlur={() => setTimeout(() => setShowCustomerDrop(false), 150)}
                    placeholder="輸入姓名或手機..."
                    className="flex-1 bg-transparent outline-none text-[13px] py-2.5"
                    style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}
                  />
                </div>
                {showCustomerDrop && customerResults.length > 0 && (
                  <div
                    className="absolute top-full left-0 right-0 z-20 mt-1 overflow-hidden"
                    style={{ background: '#FFFFFF', border: '1px solid #F0EFEC', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
                  >
                    {customerResults.map(c => (
                      <button
                        key={c.id}
                        onMouseDown={() => selectCustomer(c)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#FAFAF8] transition-colors text-left"
                      >
                        <User size={14} color="#AEAAA4" className="shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold truncate" style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}>{c.name}</p>
                          <p className="text-[11px]" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>{c.phone ?? '無手機'}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" style={{ borderTop: '1px solid #F0EFEC', paddingTop: 16 }}>
              <div>
                <span style={LABEL_STYLE}>姓名 *</span>
                <input
                  value={customerName}
                  onChange={e => { setCustomerName(e.target.value); setSelectedCustomer(null) }}
                  placeholder="王小明"
                  style={INPUT_STYLE}
                />
              </div>
              <div>
                <span style={LABEL_STYLE}>手機 *</span>
                <input
                  value={customerPhone}
                  onChange={e => { setCustomerPhone(e.target.value); setSelectedCustomer(null) }}
                  placeholder="0912345678"
                  style={INPUT_STYLE}
                />
              </div>
              <div>
                <span style={LABEL_STYLE}>Email（選填）</span>
                <input
                  value={customerEmail}
                  onChange={e => setCustomerEmail(e.target.value)}
                  placeholder="example@email.com"
                  style={INPUT_STYLE}
                />
              </div>
            </div>
          </div>

          {/* ── 商品明細 ── */}
          <div style={CARD_STYLE}>
            <h2 className="text-[16px] font-semibold" style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2D2D' }}>
              商品明細
            </h2>

            {/* Product search */}
            <div className="relative">
              <span style={LABEL_STYLE}>搜尋商品</span>
              <div className="flex items-center gap-2 px-3" style={{ ...INPUT_STYLE, padding: undefined, display: 'flex', alignItems: 'center' }}>
                <Search size={14} color="#8E8E93" className="shrink-0" />
                <input
                  value={productQuery}
                  onChange={e => handleProductQueryChange(e.target.value)}
                  onFocus={() => productResults.length > 0 && setShowProductDrop(true)}
                  onBlur={() => setTimeout(() => setShowProductDrop(false), 150)}
                  placeholder="輸入商品名稱搜尋..."
                  className="flex-1 bg-transparent outline-none text-[13px] py-2.5"
                  style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}
                />
              </div>
              {showProductDrop && productResults.length > 0 && (
                <div
                  className="absolute top-full left-0 right-0 z-20 mt-1 overflow-hidden"
                  style={{ background: '#FFFFFF', border: '1px solid #F0EFEC', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.1)', maxHeight: 260, overflowY: 'auto' }}
                >
                  {productResults.map(p => (
                    <button
                      key={p.id}
                      onMouseDown={() => handleSelectProduct(p)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#FAFAF8] transition-colors text-left"
                    >
                      <div className="w-10 h-10 rounded-[8px] bg-[#F7F6F3] overflow-hidden shrink-0 flex items-center justify-center">
                        {p.images?.[0] ? (
                          <Image src={p.images[0]} alt={p.name} width={40} height={40} className="w-full h-full object-cover" unoptimized />
                        ) : (
                          <ShoppingBag size={14} color="#D8D5D0" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold truncate" style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}>{p.name}</p>
                        <p className="text-[11px]" style={{ fontFamily: 'var(--font-jakarta)', color: '#7C9070' }}>
                          NT$ {p.price.toLocaleString()}
                          {(p.variants?.length ?? 0) > 0 && <span style={{ color: '#AEAAA4' }}> · {p.variants!.length} 個規格</span>}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Variant loading spinner */}
            {variantLoading && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-[12px]" style={{ background: '#F7F6F3' }}>
                <div className="w-4 h-4 rounded-full border-2 border-[#7C9070] border-t-transparent animate-spin shrink-0" />
                <span className="text-[12px]" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>載入規格中...</span>
              </div>
            )}

            {/* Variant picker */}
            {variantProduct && !variantLoading && (
              <div
                className="flex flex-col gap-3 p-4 rounded-[12px]"
                style={{ background: '#F0F4EE', border: '1.5px solid #C8D9C2', animation: 'fade-up 0.2s ease both' }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[12px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#7C9070' }}>
                      選擇規格
                    </p>
                    <p className="text-[13px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}>
                      {variantProduct.name}
                    </p>
                  </div>
                  <button
                    onClick={() => setVariantProduct(null)}
                    className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white transition-colors"
                  >
                    <X size={14} color="#8E8E93" />
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  {variantProduct.variants?.filter(v => v.status === 'active').map(v => {
                    // Sort optionValues by option position
                    const sortedOvs = [...(v.optionValues ?? [])].sort((a, b) => {
                      const optA = variantProduct.options?.find(o => o.id === a.optionId)
                      const optB = variantProduct.options?.find(o => o.id === b.optionId)
                      return (optA?.position ?? 0) - (optB?.position ?? 0)
                    })
                    const parts = sortedOvs.map(ov => {
                      const opt = variantProduct.options?.find(o => o.id === ov.optionId)
                      return opt ? `${opt.name}：${ov.value}` : ov.value
                    })
                    const label = parts.length > 0 ? parts.join('　') : (v.sku || '預設規格')
                    const displayPrice = v.price ?? variantProduct.price

                    return (
                      <button
                        key={v.id}
                        onClick={() => appendItem(variantProduct, v)}
                        className="flex items-center justify-between px-4 py-3 rounded-[10px] text-left transition-all hover:border-[#7C9070] active:scale-[0.98]"
                        style={{ background: '#FFFFFF', border: '1px solid #E0DDD8', fontFamily: 'var(--font-jakarta)' }}
                      >
                        <span className="text-[13px] font-medium" style={{ color: '#2D2D2D' }}>
                          {label}
                        </span>
                        <span className="text-[13px] font-semibold ml-3 shrink-0" style={{ color: '#7C9070' }}>
                          NT$ {displayPrice.toLocaleString()}
                        </span>
                      </button>
                    )
                  })}
                  {(variantProduct.variants?.filter(v => v.status === 'active').length ?? 0) === 0 && (
                    <p className="text-[12px] text-center py-2" style={{ fontFamily: 'var(--font-jakarta)', color: '#AEAAA4' }}>
                      此商品目前沒有可選規格
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Items table */}
            {items.length > 0 && (
              <div className="flex flex-col gap-2">
                {/* Table header (desktop only) */}
                <div className="hidden sm:grid sm:grid-cols-[1fr_80px_100px_80px_32px] gap-2 px-1">
                  {['商品名稱', '數量', '單價', '小計', ''].map(h => (
                    <span key={h} className="text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>{h}</span>
                  ))}
                </div>

                {items.map((item, idx) => (
                  <div
                    key={item._id}
                    className="grid grid-cols-1 sm:grid-cols-[1fr_80px_100px_80px_32px] gap-2 items-center p-3 rounded-[10px]"
                    style={{
                      background: '#FAFAF8',
                      border: '1px solid #F0EFEC',
                      animation: 'fade-up 0.2s ease both',
                      animationDelay: `${idx * 30}ms`,
                    }}
                  >
                    {/* Name */}
                    <div className="flex flex-col gap-0.5">
                      <input
                        value={item.productName}
                        onChange={e => updateItem(item._id, { productName: e.target.value })}
                        placeholder="商品名稱"
                        className="bg-transparent outline-none text-[13px] font-semibold"
                        style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}
                        readOnly={!!item.productId}
                      />
                      {item.variantLabel && (
                        <span className="text-[11px]" style={{ fontFamily: 'var(--font-jakarta)', color: '#AEAAA4' }}>{item.variantLabel}</span>
                      )}
                    </div>

                    {/* Qty stepper */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateItem(item._id, { quantity: Math.max(1, item.quantity - 1) })}
                        className="w-7 h-7 rounded-full border flex items-center justify-center hover:border-[#7C9070] hover:text-[#7C9070] transition-colors select-none"
                        style={{ border: '1px solid #E0DDD8', color: '#2D2D2D', fontFamily: 'system-ui', fontSize: 18, lineHeight: '28px' }}
                      >−</button>
                      <span className="w-6 text-center text-[13px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}>{item.quantity}</span>
                      <button
                        onClick={() => updateItem(item._id, { quantity: item.quantity + 1 })}
                        className="w-7 h-7 rounded-full border flex items-center justify-center hover:border-[#7C9070] hover:text-[#7C9070] transition-colors select-none"
                        style={{ border: '1px solid #E0DDD8', color: '#2D2D2D', fontFamily: 'system-ui', fontSize: 18, lineHeight: '28px' }}
                      >+</button>
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-1">
                      <span className="text-[12px] shrink-0" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>NT$</span>
                      <input
                        type="number"
                        min="0"
                        value={item.priceAtOrder}
                        onChange={e => updateItem(item._id, { priceAtOrder: Number(e.target.value) || 0 })}
                        className="w-full bg-transparent outline-none text-[13px] font-semibold tabular-nums"
                        style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}
                      />
                    </div>

                    {/* Subtotal */}
                    <span className="text-[13px] font-semibold tabular-nums" style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}>
                      NT$ {(item.priceAtOrder * item.quantity).toLocaleString()}
                    </span>

                    {/* Delete */}
                    <button
                      onClick={() => removeItem(item._id)}
                      className="w-8 h-8 flex items-center justify-center rounded-[8px] transition-colors hover:bg-[#FEF2F2] active:scale-90"
                    >
                      <Trash2 size={14} color="#D4845E" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {items.length === 0 && (
              <div className="flex flex-col items-center py-10 gap-2" style={{ borderTop: '1px solid #F0EFEC' }}>
                <Package size={28} color="#D8D5D0" />
                <p className="text-[13px]" style={{ fontFamily: 'var(--font-jakarta)', color: '#AEAAA4' }}>尚未新增商品</p>
              </div>
            )}

            <button
              onClick={addManualItem}
              className="flex items-center gap-2 text-[12px] font-semibold transition-colors hover:opacity-70 active:scale-95"
              style={{ fontFamily: 'var(--font-jakarta)', color: '#7C9070' }}
            >
              <Plus size={14} />
              手動新增商品
            </button>
          </div>

          {/* ── 運送方式 ── */}
          <div style={CARD_STYLE}>
            <h2 className="text-[16px] font-semibold" style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2D2D' }}>
              運送方式
            </h2>

            {/* Method toggle */}
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
                <input
                  value={shippingAddress}
                  onChange={e => setShippingAddress(e.target.value)}
                  placeholder="台北市中山區民生東路一段 100 號"
                  style={INPUT_STYLE}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span style={LABEL_STYLE}>門市名稱</span>
                  <input
                    value={cvsStoreName}
                    onChange={e => setCvsStoreName(e.target.value)}
                    placeholder="7-11 民生門市"
                    style={INPUT_STYLE}
                  />
                </div>
                <div>
                  <span style={LABEL_STYLE}>門市地址</span>
                  <input
                    value={cvsStoreAddress}
                    onChange={e => setCvsStoreAddress(e.target.value)}
                    placeholder="台北市中山區民生東路一段 100 號"
                    style={INPUT_STYLE}
                  />
                </div>
              </div>
            )}

            <div style={{ width: 180 }}>
              <span style={LABEL_STYLE}>運費（元）</span>
              <div className="flex items-center gap-2 px-3" style={{ ...INPUT_STYLE, padding: undefined, display: 'flex', alignItems: 'center' }}>
                <span className="text-[12px] shrink-0" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>NT$</span>
                <input
                  type="number"
                  min="0"
                  value={shippingFee}
                  onChange={e => setShippingFee(Number(e.target.value) || 0)}
                  className="flex-1 bg-transparent outline-none text-[13px] py-2.5"
                  style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}
                />
              </div>
            </div>
          </div>

          {/* ── 付款資訊 ── */}
          <div style={CARD_STYLE}>
            <h2 className="text-[16px] font-semibold" style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2D2D' }}>
              付款資訊
            </h2>

            {/* Payment method */}
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

            {/* Payment status */}
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

            {/* Deposit */}
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
                      type="number"
                      min="0"
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

          {/* ── 備註 ── */}
          <div style={CARD_STYLE}>
            <h2 className="text-[16px] font-semibold" style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2D2D' }}>
              備註
            </h2>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="訂單備註、特殊需求..."
              rows={4}
              className="resize-none"
              style={{ ...INPUT_STYLE, padding: '12px 14px' }}
            />
          </div>

        </div>

        {/* ── Right: summary card ──────────────────────────── */}
        <div className="flex flex-col gap-4">
          <div
            className="md:sticky md:top-[72px] flex flex-col gap-4 p-6 rounded-[16px]"
            style={{ background: '#FFFFFF', border: '1px solid #F0EFEC' }}
          >
            <h2 className="text-[16px] font-semibold" style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2D2D' }}>
              訂單摘要
            </h2>

            <div className="flex flex-col gap-2.5">
              <div className="flex justify-between items-center">
                <span className="text-[12px]" style={{ fontFamily: 'var(--font-jakarta)', color: '#6B6B6B' }}>
                  商品 {items.length} 件
                </span>
                <span className="text-[13px] font-semibold tabular-nums" style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}>
                  NT$ {itemsTotal.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[12px]" style={{ fontFamily: 'var(--font-jakarta)', color: '#6B6B6B' }}>運費</span>
                <span className="text-[13px] tabular-nums" style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}>
                  {shippingFee > 0 ? `NT$ ${shippingFee.toLocaleString()}` : '免運'}
                </span>
              </div>

              {depositPaid && depositAmount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-[12px]" style={{ fontFamily: 'var(--font-jakarta)', color: '#6B6B6B' }}>已收訂金</span>
                  <span className="text-[13px] tabular-nums" style={{ fontFamily: 'var(--font-jakarta)', color: '#D4845E' }}>
                    − NT$ {depositAmount.toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            <div
              className="flex justify-between items-center pt-3"
              style={{ borderTop: '2px solid #F0EFEC' }}
            >
              <span className="text-[14px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}>
                應收尾款
              </span>
              <span
                className="text-[22px] font-semibold tabular-nums"
                style={{ fontFamily: 'var(--font-jakarta)', color: balanceDue >= 0 ? '#2D2D2D' : '#D4845E' }}
              >
                NT$ {balanceDue.toLocaleString()}
              </span>
            </div>

            {/* Info pills */}
            <div className="flex flex-col gap-1.5 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px]" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>運送</span>
                <span className="text-[11px] font-medium" style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}>
                  {shippingMethod === 'home_delivery' ? '宅配' : '超商取貨'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px]" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>付款</span>
                <span className="text-[11px] font-medium" style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}>
                  {paymentMethod === 'seller_ship' ? '貨到付款' : '匯款'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px]" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>付款狀態</span>
                <span
                  className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    fontFamily: 'var(--font-jakarta)',
                    background: paymentStatus === 'paid' ? '#7C907018' : paymentStatus === 'failed' ? '#D4845E18' : '#F0EFEC',
                    color: paymentStatus === 'paid' ? '#7C9070' : paymentStatus === 'failed' ? '#D4845E' : '#6B6B6B',
                  }}
                >
                  {paymentStatus === 'paid' ? '已付款' : paymentStatus === 'failed' ? '付款失敗' : '待付款'}
                </span>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={saving}
              className="w-full py-3 rounded-[12px] text-[14px] font-semibold transition-all hover:opacity-80 active:scale-[0.97] disabled:opacity-50 mt-1"
              style={{ background: '#7C9070', color: '#FFFFFF', fontFamily: 'var(--font-jakarta)' }}
            >
              {saving ? '建立中...' : '建立訂單'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
