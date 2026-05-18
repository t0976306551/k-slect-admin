'use client'

import { useState } from 'react'
import { Plus, RefreshCw } from 'lucide-react'
import type { ProductOptionDraft, ProductVariantRow } from '@/types'
import { cartesianProduct } from '@/lib/variants'
import { OptionRow } from './OptionRow'
import { VariantTable } from './VariantTable'

function uid() {
  return `opt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

interface Props {
  options: ProductOptionDraft[]
  variants: ProductVariantRow[]
  onOptionsChange: (options: ProductOptionDraft[]) => void
  onVariantsChange: (variants: ProductVariantRow[]) => void
}

export function VariantBuilder({ options, variants, onOptionsChange, onVariantsChange }: Props) {
  const [isDirty, setIsDirty] = useState(false)

  const addOption = () => {
    if (options.length >= 3) return
    onOptionsChange([
      ...options,
      { id: uid(), name: '', position: options.length, values: [] },
    ])
    setIsDirty(true)
  }

  const updateOption = (index: number, updated: ProductOptionDraft) => {
    onOptionsChange(options.map((o, i) => (i === index ? updated : o)))
    setIsDirty(true)
  }

  const deleteOption = (index: number) => {
    onOptionsChange(
      options.filter((_, i) => i !== index).map((o, i) => ({ ...o, position: i })),
    )
    setIsDirty(true)
  }

  const validOptions = options.filter(o => o.name.trim() && o.values.length > 0)
  const canGenerate = validOptions.length > 0

  // 預覽組合數：如 "2×3 = 6 個型號"
  const validCounts = options.filter(o => o.values.length > 0).map(o => o.values.length)
  const totalCombos = validCounts.reduce((acc, n) => acc * n, 1)
  const previewText =
    validCounts.length > 0 ? `${validCounts.join('×')} = ${totalCombos} 個型號` : ''

  const handleGenerate = () => {
    if (variants.length > 0 && !confirm('重新產生型號將覆蓋現有資料，確定繼續？')) return
    onVariantsChange(cartesianProduct(validOptions))
    setIsDirty(false)
  }

  return (
    <div className="flex flex-col gap-4">
      {options.length > 0 && (
        <div className="flex flex-col gap-3">
          {options.map((option, i) => (
            <OptionRow
              key={option.id}
              option={option}
              onChange={updated => updateOption(i, updated)}
              onDelete={() => deleteOption(i)}
            />
          ))}
        </div>
      )}

      <div className="flex items-center gap-3 flex-wrap">
        {options.length < 3 && (
          <button
            type="button"
            onClick={addOption}
            className="flex items-center gap-1.5 px-4 py-[9px] text-[13px] font-medium rounded-[8px] transition-opacity hover:opacity-70"
            style={{
              border: '1px dashed #7C9070',
              color: '#7C9070',
              fontFamily: 'var(--font-jakarta)',
            }}
          >
            <Plus size={14} />
            新增維度
          </button>
        )}

        {canGenerate && (
          <button
            type="button"
            onClick={handleGenerate}
            className="flex items-center gap-1.5 px-4 py-[9px] text-[13px] font-semibold rounded-[8px] transition-all hover:opacity-80 active:scale-[0.96]"
            style={{
              background: isDirty ? '#7C9070' : '#F7F6F3',
              color: isDirty ? '#FFFFFF' : '#6B6B6B',
              border: '1px solid #F0EFEC',
              fontFamily: 'var(--font-jakarta)',
            }}
          >
            <RefreshCw size={14} />
            產生型號組合{previewText ? `（${previewText}）` : ''}
          </button>
        )}
      </div>

      {variants.length > 0 && (
        <div className="flex flex-col gap-2">
          <p
            className="text-[12px]"
            style={{ fontFamily: 'var(--font-jakarta)', color: '#6B6B6B' }}
          >
            共 {variants.length} 個型號，售價留空表示繼承商品售價
          </p>
          <VariantTable variants={variants} onChange={onVariantsChange} />
        </div>
      )}
    </div>
  )
}
