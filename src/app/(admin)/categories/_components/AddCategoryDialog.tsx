'use client'

import { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { createCategory } from '@/lib/api'
import { Dialog } from '@/components/admin/Dialog'
import { TypeToggle } from './TypeToggle'
import { inputStyle, cancelBtnStyle, primaryBtnStyle, hoverBg } from './styles'
import type { CategoryType } from './TypeToggle'
import type { Category } from '@/types'

interface AddCategoryDialogProps {
  open: boolean
  onClose: () => void
  topLevelCategories: Category[]
  onSaved: (msg: string) => void
}

export function AddCategoryDialog({
  open,
  onClose,
  topLevelCategories,
  onSaved,
}: AddCategoryDialogProps) {
  const [type, setType] = useState<CategoryType>('top')
  const [name, setName] = useState('')
  const [parentId, setParentId] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setType('top')
      setName('')
      setParentId('')
      setError(null)
    }
  }, [open])

  async function handleSave(): Promise<void> {
    if (!name.trim()) { setError('請輸入分類名稱'); return }
    if (type === 'sub' && !parentId) { setError('請選擇父分類'); return }
    setError(null)
    setSaving(true)
    try {
      const res = await createCategory({
        name: name.trim(),
        parentId: type === 'sub' ? parentId : undefined,
      })
      if (res.error) { setError(res.error.message); return }
      onSaved(type === 'top' ? '頂層分類已新增' : '子分類已新增')
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title="新增分類">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* 分類類型 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{
            fontSize: 12, fontWeight: 600, color: '#616161',
            fontFamily: 'var(--font-inter)', textTransform: 'uppercase', letterSpacing: '0.5px',
          }}>
            分類類型
          </span>
          <TypeToggle value={type} onChange={v => { setType(v); setParentId('') }} />
        </div>

        {/* 分類名稱 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#2D2D2D', fontFamily: 'var(--font-inter)' }}>
            分類名稱
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            placeholder={type === 'top' ? '例：美妝保養' : '例：保濕護膚'}
            autoFocus
            style={inputStyle}
            onFocus={e => (e.currentTarget.style.borderColor = '#7C9070')}
            onBlur={e => (e.currentTarget.style.borderColor = '#F0EFEC')}
          />
        </div>

        {/* 父分類選擇（僅子分類） */}
        {type === 'sub' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#2D2D2D', fontFamily: 'var(--font-inter)' }}>
              父分類
            </label>
            <div style={{ position: 'relative' }}>
              <select
                value={parentId}
                onChange={e => setParentId(e.target.value)}
                style={{ ...inputStyle, paddingRight: 32, appearance: 'none', cursor: 'pointer' }}
              >
                <option value="">選擇父分類</option>
                {topLevelCategories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <ChevronDown
                size={14}
                color="#8E8E93"
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
              />
            </div>
          </div>
        )}

        {/* 錯誤訊息 */}
        {error && (
          <div style={{
            padding: '10px 12px', borderRadius: 8,
            background: '#FFF0EE', border: '1px solid #F4C5B4',
            fontSize: 13, color: '#D4845E', fontFamily: 'var(--font-inter)',
          }}>
            {error}
          </div>
        )}

        {/* 操作按鈕 */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 4 }}>
          <button onClick={onClose} style={cancelBtnStyle} {...hoverBg('#F5F5F5', 'transparent')}>
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              ...primaryBtnStyle,
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? '儲存中…' : '儲存分類'}
          </button>
        </div>
      </div>
    </Dialog>
  )
}
