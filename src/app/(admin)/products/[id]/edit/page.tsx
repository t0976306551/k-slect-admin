'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { fetchProduct, updateProduct } from '@/lib/api'
import { useCategories } from '@/hooks/useCategories'
import { useImageUpload } from '@/hooks/useImageUpload'
import { PageHeader } from '@/components/admin/PageHeader'
import { ErrorBanner } from '@/components/admin/ErrorBanner'
import { ImageUploader } from '@/components/admin/ImageUploader'
import { StatusPicker } from '@/components/admin/StatusPicker'
import { ProductFormFields } from '@/components/admin/ProductFormFields'
import type { ProductFormValues } from '@/components/admin/ProductFormFields'
import { Toast } from '@/components/admin/Toast'
import { Dialog } from '@/components/admin/Dialog'
import { VariantToggle } from '@/components/admin/VariantToggle'
import { VariantBuilder } from '@/components/admin/VariantBuilder'
import { VariantTable } from '@/components/admin/VariantTable'
import type { ProductOptionDraft, ProductVariantRow, ProductVariant } from '@/types'

function variantsToRows(variants: ProductVariant[]): ProductVariantRow[] {
  return variants.map(v => ({
    id: v.id,
    sku: v.sku,
    price: v.price,
    quantity: v.quantity,
    lowStockThreshold: v.lowStockThreshold,
    status: v.status,
    image: v.image,
    optionValueIds: (v.optionValues ?? []).map(ov => ov.id),
    label: (v.optionValues ?? []).map(ov => ov.value).join(' / '),
  }))
}

function hydrateForm(p: {
  name: string
  price: number
  originalPrice: number | null
  categoryId: string
  description: string | null
  inventory?: { sku: string; quantity: number } | null
}): ProductFormValues {
  return {
    name: p.name,
    sku: p.inventory?.sku ?? '',
    price: String(p.price),
    originalPrice: p.originalPrice != null ? String(p.originalPrice) : '',
    stock: p.inventory ? String(p.inventory.quantity) : '',
    categoryId: p.categoryId ?? '',
    description: p.description ?? '',
  }
}

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = params.id
  const categories = useCategories()
  const imageUpload = useImageUpload()

  const [form, setForm] = useState<ProductFormValues>({
    name: '',
    sku: '',
    price: '',
    originalPrice: '',
    stock: '',
    categoryId: '',
    description: '',
  })
  const [status, setStatus] = useState<'active' | 'inactive'>('active')
  const [hasVariants, setHasVariants] = useState(false)
  // true = 本次 session 剛從「無型號」切換為「有型號」，顯示 VariantBuilder
  const [isAddingVariants, setIsAddingVariants] = useState(false)
  const [options, setOptions] = useState<ProductOptionDraft[]>([])
  const [variants, setVariants] = useState<ProductVariantRow[]>([])
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof ProductFormValues, string>>>({})
  const [toast, setToast] = useState<string | null>(null)

  const handleFormChange = useCallback(
    <K extends keyof ProductFormValues>(field: K, value: ProductFormValues[K]) => {
      setForm(prev => ({ ...prev, [field]: value }))
      setFieldErrors(prev => { const n = { ...prev }; delete n[field]; return n })
    },
    [],
  )

  const confirmClearVariants = useCallback(() => {
    setShowClearConfirm(false)
    setHasVariants(false)
    setIsAddingVariants(false)
    setOptions([])
    setVariants([])
    setForm(f => ({ ...f, sku: '', stock: '' }))
  }, [])

  const toggleVariants = useCallback(() => {
    setHasVariants(prev => {
      if (prev) {
        // 有型號 → 開啟確認 dialog，實際切換在 confirmClearVariants
        setShowClearConfirm(true)
        return prev
      } else {
        // 無型號 → 直接切換為有型號
        setIsAddingVariants(true)
        setOptions([])
        setVariants([])
        return true
      }
    })
  }, [])

  useEffect(() => {
    async function loadProduct() {
      try {
        const r = await fetchProduct(id)
        if (r.error || !r.data) {
          setError('商品不存在')
          setLoading(false)
          return
        }
        const p = r.data
        setForm(hydrateForm(p))
        setStatus(p.status)
        setHasVariants((p.variants?.length ?? 0) > 0)
        setIsAddingVariants(false)
        setOptions([])
        setVariants(variantsToRows(p.variants ?? []))
        imageUpload.setImages(p.images ?? [])
        setLoading(false)
      } catch {
        setError('載入失敗，請重試')
        setLoading(false)
      }
    }
    loadProduct()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const handleSubmit = async () => {
    const errs: Partial<Record<keyof ProductFormValues, string>> = {}
    if (!form.name.trim()) errs.name = '請輸入商品名稱'
    if (!form.price || Number(form.price) <= 0) errs.price = '請輸入有效售價'
    if (!form.categoryId) errs.categoryId = '請選擇商品分類'

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs)
      setError(null)
      return
    }

    if (hasVariants && isAddingVariants) {
      if (variants.length === 0) { setError('請先產生型號組合'); return }
    }

    setFieldErrors({})
    setError(null)
    setSaving(true)

    try {
      const base: Parameters<typeof updateProduct>[1] = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
        categoryId: form.categoryId,
        status,
        images: imageUpload.images.length > 0 ? imageUpload.images : null,
      }

      if (!hasVariants) {
        // Case A：無型號 → 傳 inventory，後端清除 variants/options
        base.inventory = {
          sku: form.sku.trim(),
          quantity: Number(form.stock) || 0,
        }
      } else if (isAddingVariants) {
        // Case B：新增型號（原本無型號）→ 傳 options + 新 variants
        const validOptions = options.filter(o => o.name.trim() && o.values.length > 0)
        const allValues = validOptions.flatMap(o => o.values)
        base.options = validOptions.map((o, i) => ({
          name: o.name,
          position: i,
          values: o.values.map((v, vi) => ({ value: v.value, position: vi })),
        }))
        base.variants = variants.map(v => {
          const optionValueIndices = allValues
            .map((val, idx) => (v.optionValueIds.includes(val.id) ? idx : -1))
            .filter(idx => idx >= 0)
          return {
            sku: v.sku.trim(),
            price: v.price,
            quantity: v.quantity,
            lowStockThreshold: v.lowStockThreshold,
            status: v.status,
            optionValueIndices,
          }
        })
      } else {
        // Case C：編輯既有型號 → 傳 variants with id
        base.variants = variants
          .filter(v => v.id)
          .map(v => ({
            id: v.id!,
            sku: v.sku,
            price: v.price,
            quantity: v.quantity,
            status: v.status,
          }))
      }

      const res = await updateProduct(id, base)
      if (res.error) {
        setError(res.error.message)
        return
      }

      const refreshed = await fetchProduct(id)
      if (refreshed.data) {
        const p = refreshed.data
        setForm(hydrateForm(p))
        setStatus(p.status)
        setHasVariants((p.variants?.length ?? 0) > 0)
        setIsAddingVariants(false)
        setOptions([])
        setVariants(variantsToRows(p.variants ?? []))
        imageUpload.setImages(p.images ?? [])
      }

      setToast('商品已儲存')
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
    <div className="p-4 md:p-8 flex flex-col gap-6">
      {toast && (
        <Toast message={toast} type="success" onClose={() => setToast(null)} />
      )}

      <Dialog
        open={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        title="清除型號規格"
        maxWidth={400}
      >
        <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: 14, color: '#6B6B6B', lineHeight: 1.6, marginBottom: 24 }}>
          切換後將清除所有型號規格，此操作儲存後無法復原。確定繼續？
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setShowClearConfirm(false)}
            style={{
              flex: 1, padding: '10px 0', borderRadius: 10, fontSize: 13, fontWeight: 500,
              border: '1px solid #F0EFEC', color: '#6B6B6B', background: 'none',
              fontFamily: 'var(--font-jakarta)', cursor: 'pointer',
            }}
          >
            取消
          </button>
          <button
            onClick={confirmClearVariants}
            style={{
              flex: 1, padding: '10px 0', borderRadius: 10, fontSize: 13, fontWeight: 600,
              background: '#C62828', color: '#FFFFFF', border: 'none',
              fontFamily: 'var(--font-jakarta)', cursor: 'pointer',
            }}
          >
            確認清除
          </button>
        </div>
      </Dialog>

      <PageHeader
        title="編輯商品"
        saving={saving}
        saveLabel="儲存商品"
        onCancel={() => router.back()}
        onSave={handleSubmit}
      />

      {error && <ErrorBanner message={error} />}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 主要資訊 */}
        <div
          className="md:col-span-2 flex flex-col gap-5 p-6"
          style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #F0EFEC' }}
        >
          <h2
            className="text-[16px] font-semibold"
            style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2D2D' }}
          >
            商品資訊
          </h2>

          <ProductFormFields
            values={form}
            hasVariants={hasVariants}
            categories={categories}
            onChange={handleFormChange}
            errors={fieldErrors}
          />

          {/* 型號區塊 */}
          <div className="flex flex-col gap-4 pt-4" style={{ borderTop: '1px solid #F0EFEC' }}>
            <VariantToggle enabled={hasVariants} onToggle={toggleVariants} />

            {hasVariants && isAddingVariants && (
              // Case B：原本無型號，正在新增型號 → 顯示 VariantBuilder
              <VariantBuilder
                options={options}
                variants={variants}
                onOptionsChange={setOptions}
                onVariantsChange={setVariants}
              />
            )}

            {hasVariants && !isAddingVariants && variants.length > 0 && (
              // Case C：原本有型號，編輯既有型號 → 顯示 VariantTable
              <div className="flex flex-col gap-2">
                <p className="text-[12px]" style={{ fontFamily: 'var(--font-jakarta)', color: '#6B6B6B' }}>
                  共 {variants.length} 個型號，售價留空表示繼承商品售價
                </p>
                <VariantTable variants={variants} onChange={setVariants} />
              </div>
            )}
          </div>
        </div>

        {/* 右側欄 */}
        <div className="flex flex-col gap-4">
          <ImageUploader
            images={imageUpload.images}
            uploading={imageUpload.uploading}
            fileInputRef={imageUpload.fileInputRef}
            onTriggerUpload={imageUpload.triggerUpload}
            onFileChange={imageUpload.handleFileChange}
            onRemove={imageUpload.removeImage}
          />
          <StatusPicker value={status} onChange={setStatus} />
        </div>
      </div>
    </div>
  )
}
