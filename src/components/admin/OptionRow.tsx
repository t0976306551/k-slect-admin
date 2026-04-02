import { Trash2 } from 'lucide-react'
import type { ProductOptionDraft } from '@/types'
import { ValueTagInput } from './ValueTagInput'

interface Props {
  option: ProductOptionDraft
  onChange: (option: ProductOptionDraft) => void
  onDelete: () => void
}

export function OptionRow({ option, onChange, onDelete }: Props) {
  return (
    <div className="flex items-start gap-3">
      <input
        type="text"
        value={option.name}
        onChange={e => onChange({ ...option, name: e.target.value })}
        placeholder="維度（如：顏色）"
        className="outline-none text-[13px] shrink-0"
        style={{
          background: '#F7F6F3',
          borderRadius: 8,
          border: '1px solid #F0EFEC',
          height: 40,
          fontFamily: 'var(--font-jakarta)',
          color: '#2D2D2D',
          paddingLeft: 12,
          paddingRight: 12,
          width: 140,
        }}
      />
      <div className="flex-1">
        <ValueTagInput
          values={option.values}
          onChange={values => onChange({ ...option, values })}
        />
      </div>
      <button
        type="button"
        onClick={onDelete}
        className="flex items-center justify-center hover:opacity-70 transition-opacity shrink-0 mt-1"
        style={{ width: 30, height: 30, borderRadius: 8, background: '#FFF0EE' }}
      >
        <Trash2 size={14} color="#D4845E" />
      </button>
    </div>
  )
}
