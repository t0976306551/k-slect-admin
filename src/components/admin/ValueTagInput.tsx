'use client'

import { useState, type KeyboardEvent } from 'react'
import { X } from 'lucide-react'
import type { ProductOptionValueDraft } from '@/types'

interface Props {
  values: ProductOptionValueDraft[]
  onChange: (values: ProductOptionValueDraft[]) => void
  placeholder?: string
}

export function ValueTagInput({ values, onChange, placeholder = '輸入值，Enter 確認' }: Props) {
  const [input, setInput] = useState('')

  const addValue = () => {
    const trimmed = input.trim()
    if (!trimmed || values.some(v => v.value === trimmed)) {
      setInput('')
      return
    }
    onChange([
      ...values,
      {
        id: `val-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        value: trimmed,
        position: values.length,
      },
    ])
    setInput('')
  }

  const removeValue = (id: string) => {
    onChange(
      values
        .filter(v => v.id !== id)
        .map((v, i) => ({ ...v, position: i })),
    )
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addValue()
    } else if (e.key === 'Backspace' && !input && values.length > 0) {
      removeValue(values[values.length - 1].id)
    }
  }

  return (
    <div
      className="flex flex-wrap gap-1.5 p-2 min-h-[40px] cursor-text"
      style={{ background: '#F7F6F3', borderRadius: 8, border: '1px solid #F0EFEC' }}
    >
      {values.map(v => (
        <span
          key={v.id}
          className="flex items-center gap-1 px-2 py-0.5 text-[12px] font-medium"
          style={{ background: '#7C907020', color: '#7C9070', borderRadius: 6 }}
        >
          {v.value}
          <button type="button" onClick={() => removeValue(v.id)} className="hover:opacity-60 transition-opacity">
            <X size={10} />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addValue}
        placeholder={values.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[120px] outline-none bg-transparent text-[13px]"
        style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}
      />
    </div>
  )
}
