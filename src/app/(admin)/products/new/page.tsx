'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createProduct } from '@/lib/api'
import { useCategories } from '@/hooks/useCategories'
import { useImageUpload } from '@/hooks/useImageUpload'
import { PageHeader } from '@/components/admin/PageHeader'
import { ErrorBanner } from '@/components/admin/ErrorBanner'
import { ImageUploader } from '@/components/admin/ImageUploader'
import { StatusPicker } from '@/components/admin/StatusPicker'
import { ProductFormFields } from '@/components/admin/ProductFormFields'
import type { ProductFormValues } from '@/components/admin/ProductFormFields'
import { VariantToggle } from '@/components/admin/VariantToggle'
import { VariantBuilder } from '@/components/admin/VariantBuilder'
import type { ProductOptionDraft, ProductVariantRow } from '@/types'

export default function NewProductPage() {
  const router = useRouter()
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
  const [options, setOptions] = useState<ProductOptionDraft[]>([])
  const [variants, setVariants] = useState<ProductVariantRow[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFormChange = useCallback(
    <K extends keyof ProductFormValues>(field: K, value: ProductFormValues[K]) => {
      setForm(prev => ({ ...prev, [field]: value }))
    },
    [],
  )

  const toggleVariants = useCallback(() => {
    setHasVariants(prev => {
      if (!prev) {
        setForm(f => ({ ...f, sku: '', stock: '' }))
      } else {
        setOptions([])
        setVariants([])
      }
      return !prev
    })
  }, [])

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError('請輸入商品名稱'); return }
    if (!form.price || Number(form.price) <= 0) { setError('請輸入有效售價'); return }
    if (!form.categoryId) { setError('請選擇商品分類'); return }

    if (hasVariants) {
      if (variants.length === 0) { setError('請先產生型號組合'); return }
      if (variants.some(v => !v.sku.trim())) { setError('請填寫所有型號的 SKU'); return }
    } else {
      if (!form.sku.trim()) { setError('請輸入 SKU'); return }
    }

    setError(null)
    setSaving(true)

    try {
      const basePayload = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        price: Number(form.price),
        categoryId: form.categoryId,
        status,
        images: imageUpload.images.length > 0 ? imageUpload.images : undefined,
      }

      const payload = hasVariants
        ? {
            ...basePayload,
            options: options
              .filter(o => o.name.trim() && o.values.length > 0)
              .map((o, i) => ({ ...o, position: i })),
            variants: variants.map(v => {
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
            ...basePayload,
            inventory: {
              sku: form.sku.trim(),
              quantity: Number(form.stock) || 0,
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

  return (
    <div className="p-8 flex flex-col gap-6">
      <PageHeader
        title="新增商品"
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

          {/* 型號區塊 */}
          <div
            className="flex flex-col gap-4 pt-4"
            style={{ borderTop: '1px solid #F0EFEC' }}
          >
            <VariantToggle enabled={hasVariants} onToggle={toggleVariants} />
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
