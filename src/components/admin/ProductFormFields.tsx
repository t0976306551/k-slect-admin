import { ChevronDown } from 'lucide-react'
import { inputStyle } from '@/lib/styles'
import { FormGroup } from '@/components/admin/FormGroup'
import type { Category } from '@/types'

export interface ProductFormValues {
  name: string
  sku: string
  price: string
  originalPrice: string
  stock: string
  categoryId: string
  description: string
}

interface ProductFormFieldsProps {
  readonly values: ProductFormValues
  readonly hasVariants: boolean
  readonly categories: Category[]
  readonly onChange: <K extends keyof ProductFormValues>(field: K, value: ProductFormValues[K]) => void
}

const textareaStyle: React.CSSProperties = {
  background: '#F7F6F3',
  borderRadius: 8,
  border: '1px solid #F0EFEC',
  fontFamily: 'var(--font-jakarta)',
  color: '#2D2D2D',
  width: '100%',
}

export function ProductFormFields({
  values,
  hasVariants,
  categories,
  onChange,
}: ProductFormFieldsProps) {
  return (
    <>
      <FormGroup label="商品名稱">
        <input
          type="text"
          value={values.name}
          onChange={e => onChange('name', e.target.value)}
          placeholder="輸入商品名稱"
          style={inputStyle}
        />
      </FormGroup>

      <div className="grid grid-cols-2 gap-4">
        {!hasVariants && (
          <FormGroup label="SKU">
            <input
              type="text"
              value={values.sku}
              onChange={e => onChange('sku', e.target.value)}
              placeholder="如：CRX-SNL-001"
              style={inputStyle}
            />
          </FormGroup>
        )}
        <FormGroup label="商品分類">
          <div className="relative">
            <select
              value={values.categoryId}
              onChange={e => onChange('categoryId', e.target.value)}
              className="appearance-none w-full outline-none"
              style={{ ...inputStyle, paddingRight: 32 }}
            >
              <option value="">選擇分類</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.parentId ? `　${c.name}` : c.name}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              color="#8E8E93"
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
            />
          </div>
        </FormGroup>
      </div>

      <div className={`grid gap-4 ${hasVariants ? 'grid-cols-2' : 'grid-cols-3'}`}>
        <FormGroup label="售價 (NT$)">
          <input
            type="number"
            value={values.price}
            onChange={e => onChange('price', e.target.value)}
            placeholder="0"
            style={inputStyle}
          />
        </FormGroup>
        <FormGroup label="原價 (NT$)">
          <input
            type="number"
            value={values.originalPrice}
            onChange={e => onChange('originalPrice', e.target.value)}
            placeholder="選填"
            style={inputStyle}
          />
        </FormGroup>
        {!hasVariants && (
          <FormGroup label="庫存數量">
            <input
              type="number"
              value={values.stock}
              onChange={e => onChange('stock', e.target.value)}
              placeholder="0"
              style={inputStyle}
            />
          </FormGroup>
        )}
      </div>

      <FormGroup label="商品描述">
        <textarea
          value={values.description}
          onChange={e => onChange('description', e.target.value)}
          placeholder="輸入商品描述..."
          rows={4}
          className="resize-none outline-none px-3 py-2 text-[13px]"
          style={textareaStyle}
        />
      </FormGroup>
    </>
  )
}
