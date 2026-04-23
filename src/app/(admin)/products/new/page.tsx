'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, Upload, ToggleLeft, ToggleRight } from 'lucide-react'
import { createProduct, fetchCategories, uploadFile } from '@/lib/api'
import { VariantBuilder } from '@/components/admin/VariantBuilder'
import type { ProductOptionDraft, ProductVariantRow, Category } from '@/types'

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

export default function NewProductPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [price, setPrice] = useState('')
  const [originalPrice, setOriginalPrice] = useState('')
  const [stock, setStock] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<'active' | 'inactive'>('active')

  // 型號相關
  const [hasVariants, setHasVariants] = useState(false)
  const [options, setOptions] = useState<ProductOptionDraft[]>([])
  const [variants, setVariants] = useState<ProductVariantRow[]>([])

  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [allCategories, setAllCategories] = useState<Category[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchCategories().then(r => {
      if (r.data) {
        const flat = r.data.flatMap(c => [c, ...(c.children ?? [])])
        setAllCategories(flat)
      }
    })
  }, [])

  const handleSubmit = async () => {
    if (!name.trim()) { setError('請輸入商品名稱'); return }
    if (!price || Number(price) <= 0) { setError('請輸入有效售價'); return }
    if (!categoryId) { setError('請選擇商品分類'); return }

    if (hasVariants) {
      if (variants.length === 0) { setError('請先產生型號組合'); return }
      const missingSku = variants.some(v => !v.sku.trim())
      if (missingSku) { setError('請填寫所有型號的 SKU'); return }
    } else {
      if (!sku.trim()) { setError('請輸入 SKU'); return }
    }

    setError(null)
    setSaving(true)

    try {
      const payload = hasVariants
        ? {
            name: name.trim(),
            description: description.trim() || undefined,
            price: Number(price),
            categoryId,
            status,
            images: images.length > 0 ? images : undefined,
            options: options.filter(o => o.name.trim() && o.values.length > 0).map((o, i) => ({
              ...o,
              position: i,
            })),
            variants: variants.map(v => {
              // 先把所有有效 option values 攤平成索引陣列，以對應後端 optionValueIndices
              const allValues = options
                .filter(o => o.name.trim() && o.values.length > 0)
                .flatMap(o => o.values)
              const optionValueIndices = allValues
                .map((val, idx) => (v.optionValueIds.includes(val.id) ? idx : -1))
                .filter(idx => idx >= 0)
              return {
                sku: v.sku.trim(),
                price: v.price,
                quantity: v.quantity,
                lowStockThreshold: v.lowStockThreshold,
                status: v.status,
                image: v.image,
                optionValueIndices,
              }
            }),
          }
        : {
            name: name.trim(),
            description: description.trim() || undefined,
            price: Number(price),
            categoryId,
            status,
            images: images.length > 0 ? images : undefined,
            inventory: {
              sku: sku.trim(),
              quantity: Number(stock) || 0,
              lowStockThreshold: 5,
            },
          }

      const res = await createProduct(payload)
      if (res.error) {
        setError(res.error.message)
        return
      }
      router.push('/products')
    } finally {
      setSaving(false)
    }
  }

  const toggleVariants = () => {
    setHasVariants(v => !v)
    // 切換時清除另一模式的資料
    if (!hasVariants) {
      setSku('')
      setStock('')
    } else {
      setOptions([])
      setVariants([])
    }
  }

  return (
    <div className="p-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1
          className="text-[28px] font-medium tracking-[-0.5px]"
          style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2D2D' }}
        >
          新增商品
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

          {/* 型號區塊 */}
          <div
            className="flex flex-col gap-4 pt-4"
            style={{ borderTop: '1px solid #F0EFEC' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="text-[14px] font-semibold"
                  style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}
                >
                  商品型號
                </p>
                <p
                  className="text-[12px] mt-0.5"
                  style={{ fontFamily: 'var(--font-jakarta)', color: '#6B6B6B' }}
                >
                  啟用後可設定顏色、尺寸等規格，每個規格獨立管理庫存
                </p>
              </div>
              <button
                type="button"
                onClick={toggleVariants}
                className="flex items-center gap-1.5 text-[13px] font-medium transition-opacity hover:opacity-70"
                style={{ fontFamily: 'var(--font-jakarta)', color: hasVariants ? '#7C9070' : '#8E8E93' }}
              >
                {hasVariants ? (
                  <ToggleRight size={28} strokeWidth={1.5} />
                ) : (
                  <ToggleLeft size={28} strokeWidth={1.5} />
                )}
                {hasVariants ? '已啟用' : '未啟用'}
              </button>
            </div>

            {hasVariants && (
              <VariantBuilder
                options={options}
                variants={variants}
                onOptionsChange={setOptions}
                onVariantsChange={setVariants}
              />
            )}
          </div>
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

            {/* 已上傳圖片 */}
            {images.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {images.map((url, i) => (
                  <div
                    key={i}
                    className="relative overflow-hidden"
                    style={{ width: 80, height: 80, borderRadius: 8, border: '1px solid #F0EFEC' }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`商品圖片 ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    <button
                      type="button"
                      onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                    >
                      <span style={{ color: '#fff', fontSize: 10, lineHeight: 1 }}>✕</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="hidden"
              onChange={async e => {
                const file = e.target.files?.[0]
                if (!file) return
                setUploading(true)
                const res = await uploadFile(file)
                setUploading(false)
                if (res.data) {
                  const backendBase = (process.env.NEXT_PUBLIC_ADMIN_API_URL ?? '').replace('/api', '')
                  const imageUrl = backendBase && res.data.url.startsWith(backendBase)
                    ? res.data.url.slice(backendBase.length)
                    : res.data.url
                  setImages(prev => [...prev, imageUrl])
                }
                e.target.value = ''
              }}
            />
            <div
              onClick={() => !uploading && fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-2 transition-colors hover:bg-gray-50"
              style={{
                border: '2px dashed #F0EFEC',
                borderRadius: 12,
                padding: '32px 16px',
                cursor: uploading ? 'wait' : 'pointer',
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
                {uploading ? '上傳中...' : '點擊上傳圖片'}
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
