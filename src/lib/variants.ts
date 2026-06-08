import type { ProductOptionDraft, ProductOptionValueDraft, ProductVariantRow } from '../types'

/**
 * 對 options 做笛卡兒積，產生所有型號組合
 * 例：顏色[紅,藍] × 尺寸[S,M] → [紅/S, 紅/M, 藍/S, 藍/M]
 */
export function cartesianProduct(options: ProductOptionDraft[]): ProductVariantRow[] {
  const validOptions = options.filter(o => o.name.trim() && o.values.length > 0)
  if (validOptions.length === 0) return []

  const combos = validOptions.reduce<ProductOptionValueDraft[][]>(
    (acc, option) => {
      if (acc.length === 0) return option.values.map(v => [v])
      return acc.flatMap(combo => option.values.map(v => [...combo, v]))
    },
    [],
  )

  return combos.map(combo => ({
    sku: '',
    price: null,
    quantity: 0,
    lowStockThreshold: 5,
    status: 'active' as const,
    image: null,
    optionValueIds: combo.map(v => v.id),
    label: combo.map(v => v.value).join(' / '),
  }))
}

/**
 * 自動產生 SKU，例："韓系帆布" + [卡其, S] → "KAF-卡其-S"
 */
function generateSku(productName: string, combo: ProductOptionValueDraft[]): string {
  const prefix = productName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w.slice(0, 3).toUpperCase())
    .join('-')
  const suffix = combo.map(v => v.value).join('-')
  return `${prefix}-${suffix}`
}
