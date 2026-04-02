'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ChevronDown, Upload } from 'lucide-react'
import { mockCategories } from '@/lib/mock-data'
import { fetchProduct, updateProduct } from '@/lib/api'

function FormGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-[6px]">
      <label
        className="text-[13px] font-semibold"
        style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}
      >
        {label}
      </label>
      {children}
    </div>
  )
}

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

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = params.id

  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [price, setPrice] = useState('')
  const [originalPrice, setOriginalPrice] = useState('')
  const [stock, setStock] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<'active' | 'inactive'>('active')
  const [hasVariants, setHasVariants] = useState(false)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const allCategories = [
    ...mockCategories,
    ...mockCategories.flatMap(c => c.children ?? []),
  ]

  useEffect(() => {
    fetchProduct(id).then(r => {
      if (r.error || !r.data) {
        setError('商品不存在')
        setLoading(false)
        return
      }
      const p = r.data
      setName(p.name)
      setPrice(String(p.price))
      setOriginalPrice(p.originalPrice != null ? String(p.originalPrice) : '')
      setCategoryId(p.categoryId ?? '')
      setDescription(p.description ?? '')
      setStatus(p.status)
      setHasVariants((p.variants?.length ?? 0) > 0)
      if (p.inventory) {
        setSku(p.inventory.sku)
        setStock(String(p.inventory.quantity))
      }
      setLoading(false)
    })
  }, [id])

  const handleSubmit = async () => {
    if (!name.trim()) { setError('請輸入商品名稱'); return }
    if (!price || Number(price) <= 0) { setError('請輸入有效售價'); return }
    if (!categoryId) { setError('請選擇商品分類'); return }

    setError(null)
    setSaving(true)

    try {
      const payload: Parameters<typeof updateProduct>[1] = {
        name: name.trim(),
        description: description.trim() || null,
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : null,
        categoryId,
        status,
      }
      if (!hasVariants) {
        payload.inventory = {
          sku: sku.trim(),
          quantity: Number(stock) || 0,
        }
      }

      const res = await updateProduct(id, payload)
      if (res.error) {
        setError(res.error.message)
        return
      }
      router.push('/products')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <span style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93', fontSize: 14 }}>
          載入中...
        </span>
      </div>
    )
  }

  return (
    <div className="p-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1
          className="text-[28px] font-medium tracking-[-0.5px]"
          style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2D2D' }}
        >
          編輯商品
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
            onClick={handleSubmit}
            disabled={saving}
            className="px-5 py-[10px] text-[13px] font-semibold rounded-[10px] transition-opacity hover:opacity-80 disabled:opacity-50"
            style={{ background: '#7C9070', color: '#FFFFFF', fontFamily: 'var(--font-jakarta)' }}
          >
            {saving ? '儲存中...' : '儲存商品'}
          </button>
        </div>
      </div>

      {error && (
        <div
          className="px-4 py-3 text-[13px] rounded-[10px]"
          style={{ background: '#FFF0EE', color: '#D4845E', fontFamily: 'var(--font-jakarta)', border: '1px solid #F4C5B4' }}
        >
          {error}
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* 主要資訊 */}
        <div
          className="col-span-2 flex flex-col gap-5 p-6"
          style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #F0EFEC' }}
        >
          <h2
            className="text-[16px] font-semibold"
            style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2D2D' }}
          >
            商品資訊
          </h2>

          <FormGroup label="商品名稱">
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="輸入商品名稱"
              style={inputStyle}
            />
          </FormGroup>

          <div className="grid grid-cols-2 gap-4">
            {!hasVariants && (
              <FormGroup label="SKU">
                <input
                  type="text"
                  value={sku}
                  onChange={e => setSku(e.target.value)}
                  placeholder="如：CRX-SNL-001"
                  style={inputStyle}
                />
              </FormGroup>
            )}
            <FormGroup label="商品分類">
              <div className="relative">
                <select
                  value={categoryId}
                  onChange={e => setCategoryId(e.target.value)}
                  className="appearance-none w-full outline-none"
                  style={{ ...inputStyle, paddingRight: 32 }}
                >
                  <option value="">選擇分類</option>
                  {allCategories.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.parentId ? `　${c.name}` : c.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} color="#8E8E93" className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </FormGroup>
          </div>

          <div className={`grid gap-4 ${hasVariants ? 'grid-cols-2' : 'grid-cols-3'}`}>
            <FormGroup label="售價 (NT$)">
              <input
                type="number"
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder="0"
                style={inputStyle}
              />
            </FormGroup>
            <FormGroup label="原價 (NT$)">
              <input
                type="number"
                value={originalPrice}
                onChange={e => setOriginalPrice(e.target.value)}
                placeholder="選填"
                style={inputStyle}
              />
            </FormGroup>
            {!hasVariants && (
              <FormGroup label="庫存數量">
                <input
                  type="number"
                  value={stock}
                  onChange={e => setStock(e.target.value)}
                  placeholder="0"
                  style={inputStyle}
                />
              </FormGroup>
            )}
          </div>

          <FormGroup label="商品描述">
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="輸入商品描述..."
              rows={4}
              className="resize-none outline-none px-3 py-2 text-[13px]"
              style={{
                background: '#F7F6F3',
                borderRadius: 8,
                border: '1px solid #F0EFEC',
                fontFamily: 'var(--font-jakarta)',
                color: '#2D2D2D',
                width: '100%',
              }}
            />
          </FormGroup>

          {/* 型號商品唯讀提示 */}
          {hasVariants && (
            <div
              className="px-4 py-3 text-[13px] rounded-[10px]"
              style={{ background: '#F7F6F3', color: '#6B6B6B', fontFamily: 'var(--font-jakarta)', border: '1px solid #F0EFEC' }}
            >
              此商品含有型號規格，型號資訊請透過型號管理調整。
            </div>
          )}
        </div>

        {/* 右側欄 */}
        <div className="flex flex-col gap-4">
          {/* 商品圖片 */}
          <div
            className="flex flex-col gap-4 p-5"
            style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #F0EFEC' }}
          >
            <h2
              className="text-[15px] font-semibold"
              style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2D2D' }}
            >
              商品圖片
            </h2>
            <div
              className="flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors hover:bg-gray-50"
              style={{
                border: '2px dashed #F0EFEC',
                borderRadius: 12,
                padding: '32px 16px',
              }}
            >
              <div
                className="flex items-center justify-center"
                style={{ width: 40, height: 40, borderRadius: 10, background: '#7C907015' }}
              >
                <Upload size={20} color="#7C9070" />
              </div>
              <span
                className="text-[13px] font-medium"
                style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}
              >
                點擊上傳圖片
              </span>
              <span
                className="text-[11px]"
                style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}
              >
                PNG, JPG 最大 5MB
              </span>
            </div>
          </div>

          {/* 上架狀態 */}
          <div
            className="flex flex-col gap-3 p-5"
            style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #F0EFEC' }}
          >
            <h2
              className="text-[15px] font-semibold"
              style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2D2D' }}
            >
              上架狀態
            </h2>
            <div className="flex flex-col gap-2">
              {(['active', 'inactive'] as const).map(s => (
                <label key={s} className="flex items-center gap-3 cursor-pointer">
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      border: `2px solid ${status === s ? '#7C9070' : '#D0D0D0'}`,
                      background: status === s ? '#7C9070' : 'transparent',
                    }}
                    onClick={() => setStatus(s)}
                  >
                    {status === s && (
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#FFFFFF' }} />
                    )}
                  </div>
                  <span
                    className="text-[13px]"
                    style={{
                      fontFamily: 'var(--font-jakarta)',
                      color: status === s ? '#2D2D2D' : '#6B6B6B',
                      fontWeight: status === s ? 600 : 400,
                    }}
                  >
                    {s === 'active' ? '立即上架' : '暫時下架'}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
