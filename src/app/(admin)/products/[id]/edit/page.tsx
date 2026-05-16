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
import { VariantTable } from '@/components/admin/VariantTable'
import type { ProductVariantRow, ProductVariant } from '@/types'

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
  const [variants, setVariants] = useState<ProductVariantRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const handleFormChange = useCallback(
    <K extends keyof ProductFormValues>(field: K, value: ProductFormValues[K]) => {
      setForm(prev => ({ ...prev, [field]: value }))
    },
    [],
  )

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
    if (!form.name.trim()) { setError('請輸入商品名稱'); return }
    if (!form.price || Number(form.price) <= 0) { setError('請輸入有效售價'); return }
    if (!form.categoryId) { setError('請選擇商品分類'); return }

    setError(null)
    setSaving(true)

    try {
      const payload: Parameters<typeof updateProduct>[1] = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
        categoryId: form.categoryId,
        status,
        images: imageUpload.images.length > 0 ? imageUpload.images : null,
      }
      if (!hasVariants) {
        payload.inventory = {
          sku: form.sku.trim(),
          quantity: Number(form.stock) || 0,
        }
      } else if (variants.length > 0) {
        payload.variants = variants
          .filter(v => v.id)
          .map(v => ({
            id: v.id!,
            sku: v.sku,
            price: v.price,
            quantity: v.quantity,
            status: v.status,
          }))
      }

      const res = await updateProduct(id, payload)
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
    <div className="p-8 flex flex-col gap-6">
      {toast && (
        <Toast message={toast} type="success" onClose={() => setToast(null)} />
      )}

      <PageHeader
        title="編輯商品"
        saving={saving}
        saveLabel="儲存商品"
        onCancel={() => router.back()}
        onSave={handleSubmit}
      />

      {error && <ErrorBanner message={error} />}

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

          <ProductFormFields
            values={form}
            hasVariants={hasVariants}
            categories={categories}
            onChange={handleFormChange}
          />

          {hasVariants && variants.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-[13px] font-semibold" style={{ color: '#2D2D2D', fontFamily: 'var(--font-jakarta)' }}>
                型號規格
              </span>
              <VariantTable variants={variants} onChange={setVariants} />
            </div>
          )}
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
