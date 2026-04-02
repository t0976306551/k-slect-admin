import type { ProductVariantRow } from '@/types'

const cellInput = {
  background: '#F7F6F3',
  borderRadius: 6,
  border: '1px solid #F0EFEC',
  height: 32,
  fontFamily: 'var(--font-jakarta)',
  color: '#2D2D2D',
  fontSize: 12,
  paddingLeft: 8,
  paddingRight: 8,
  outline: 'none',
  width: '100%',
}

interface Props {
  variants: ProductVariantRow[]
  onChange: (variants: ProductVariantRow[]) => void
}

export function VariantTable({ variants, onChange }: Props) {
  const update = (index: number, partial: Partial<ProductVariantRow>) => {
    onChange(variants.map((v, i) => (i === index ? { ...v, ...partial } : v)))
  }

  if (variants.length === 0) return null

  return (
    <div className="overflow-x-auto rounded-[10px]" style={{ border: '1px solid #F0EFEC' }}>
      <table className="w-full text-[12px]" style={{ fontFamily: 'var(--font-jakarta)' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #F0EFEC', background: '#F7F6F3' }}>
            <th className="text-left py-2.5 px-3 font-semibold" style={{ color: '#6B6B6B', width: '22%' }}>
              型號
            </th>
            <th className="text-left py-2.5 px-3 font-semibold" style={{ color: '#6B6B6B', width: '22%' }}>
              SKU
            </th>
            <th className="text-left py-2.5 px-3 font-semibold" style={{ color: '#6B6B6B', width: '18%' }}>
              售價 (NT$)
            </th>
            <th className="text-left py-2.5 px-3 font-semibold" style={{ color: '#6B6B6B', width: '18%' }}>
              庫存
            </th>
            <th className="text-left py-2.5 px-3 font-semibold" style={{ color: '#6B6B6B', width: '20%' }}>
              狀態
            </th>
          </tr>
        </thead>
        <tbody>
          {variants.map((v, i) => (
            <tr
              key={v.optionValueIds.join('-') || i}
              style={{ borderBottom: i < variants.length - 1 ? '1px solid #F0EFEC' : undefined }}
            >
              <td className="py-2 px-3">
                <span className="font-medium" style={{ color: '#2D2D2D' }}>
                  {v.label}
                </span>
              </td>
              <td className="py-2 px-3">
                <input
                  type="text"
                  value={v.sku}
                  onChange={e => update(i, { sku: e.target.value })}
                  placeholder="輸入 SKU"
                  style={cellInput}
                />
              </td>
              <td className="py-2 px-3">
                <input
                  type="number"
                  value={v.price ?? ''}
                  onChange={e =>
                    update(i, { price: e.target.value === '' ? null : Number(e.target.value) })
                  }
                  placeholder="繼承商品價"
                  style={cellInput}
                />
              </td>
              <td className="py-2 px-3">
                <input
                  type="number"
                  value={v.quantity}
                  onChange={e => update(i, { quantity: Number(e.target.value) })}
                  placeholder="0"
                  min={0}
                  style={cellInput}
                />
              </td>
              <td className="py-2 px-3">
                <select
                  value={v.status}
                  onChange={e => update(i, { status: e.target.value as 'active' | 'inactive' })}
                  className="appearance-none"
                  style={{ ...cellInput, paddingRight: 8 }}
                >
                  <option value="active">上架</option>
                  <option value="inactive">下架</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
