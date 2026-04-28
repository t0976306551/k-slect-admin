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
      imageUpload.setImages(p.images ?? [])
      setLoading(false)
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
