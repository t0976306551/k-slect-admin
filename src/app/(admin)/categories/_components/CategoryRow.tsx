'use client'

import { ChevronDown, FolderOpen, Folder, Pencil, Trash2 } from 'lucide-react'
import { hoverBg, hoverOpacity } from './styles'
import type { Category } from '@/types'

export interface CategoryRowEditProps {
  editingId: string | null
  editingName: string
  onEditStart: (id: string, name: string) => void
  onEditNameChange: (name: string) => void
  onEditSave: (id: string) => void
  onEditCancel: () => void
  onDeleteClick: (id: string, name: string) => void
}

interface CategoryRowProps extends CategoryRowEditProps {
  category: Category
  isExpanded: boolean
  onToggle: () => void
  isTop: boolean
}

export function CategoryRow({
  category,
  isExpanded,
  onToggle,
  isTop,
  editingId,
  editingName,
  onEditStart,
  onEditNameChange,
  onEditSave,
  onEditCancel,
  onDeleteClick,
}: CategoryRowProps) {
  const isEditing = editingId === category.id
  const hasChildren = (category.children?.length ?? 0) > 0

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        height: 48,
        borderTop: '1px solid #F0EFEC',
        background: isTop ? '#FFFFFF' : '#FAFAFA',
        paddingLeft: isTop ? 20 : 44,
        paddingRight: 20,
        transition: 'background 0.15s ease',
      }}
    >
      {/* 名稱欄 */}
      <div style={{ width: 320, display: 'flex', alignItems: 'center', gap: 6 }}>
        <ExpandToggle isTop={isTop} hasChildren={hasChildren} isExpanded={isExpanded} onToggle={onToggle} />
        {isTop
          ? <FolderOpen size={16} color="#D4845E" style={{ flexShrink: 0 }} />
          : <Folder size={14} color="#9E9E9E" style={{ flexShrink: 0 }} />
        }
        {isEditing ? (
          <input
            type="text"
            value={editingName}
            onChange={e => onEditNameChange(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') onEditSave(category.id)
              if (e.key === 'Escape') onEditCancel()
            }}
            autoFocus
            style={{
              background: '#FFFFFF', borderRadius: 6,
              border: '1px solid #7C9070', height: 28, width: 140,
              fontFamily: 'var(--font-inter)', fontSize: 13,
              color: '#1A1A1A', padding: '0 8px', outline: 'none',
            }}
          />
        ) : (
          <span style={{
            fontFamily: 'var(--font-inter)', fontSize: 14,
            fontWeight: isTop ? 600 : 400, color: '#1A1A1A', lineHeight: 1,
          }}>
            {category.name}
          </span>
        )}
      </div>

      {/* 商品數量 */}
      <div style={{ width: 120 }}>
        <ProductCount count={category._count?.products ?? 0} isTop={isTop} />
      </div>

      {/* 操作按鈕 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
        {isEditing ? (
          <EditingActions
            onSave={() => onEditSave(category.id)}
            onCancel={onEditCancel}
          />
        ) : (
          <ReadonlyActions
            onEdit={() => onEditStart(category.id, category.name)}
            onDelete={() => onDeleteClick(category.id, category.name)}
          />
        )}
      </div>
    </div>
  )
}

/* ─── 子元件：展開/收合按鈕 ─── */

function ExpandToggle({
  isTop,
  hasChildren,
  isExpanded,
  onToggle,
}: {
  isTop: boolean
  hasChildren: boolean
  isExpanded: boolean
  onToggle: () => void
}) {
  if (!isTop || !hasChildren) {
    return <span style={{ width: 14, flexShrink: 0 }} />
  }

  return (
    <button
      onClick={onToggle}
      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0, display: 'flex' }}
    >
      <div style={{ transition: 'transform 0.2s ease', transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
        <ChevronDown size={14} color="#9E9E9E" />
      </div>
    </button>
  )
}

/* ─── 子元件：商品數量顯示 ─── */

function ProductCount({ count, isTop }: { count: number; isTop: boolean }) {
  if (isTop) {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center',
        padding: '3px 10px', borderRadius: 20,
        background: '#7C907025', color: '#7C9070',
        fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-inter)',
      }}>
        {count} 件
      </span>
    )
  }

  return (
    <span style={{ fontSize: 13, color: '#616161', fontFamily: 'var(--font-inter)' }}>
      {count} 件
    </span>
  )
}

/* ─── 子元件：編輯中操作 ─── */

function EditingActions({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) {
  return (
    <>
      <button
        onClick={onSave}
        style={{
          padding: '5px 12px', borderRadius: 6, border: 'none',
          background: '#7C9070', fontSize: 12, fontWeight: 600,
          color: '#FFFFFF', fontFamily: 'var(--font-inter)', cursor: 'pointer',
          transition: 'opacity 0.15s ease',
        }}
        {...hoverOpacity('0.8', '1')}
      >
        儲存
      </button>
      <button
        onClick={onCancel}
        style={{
          padding: '5px 12px', borderRadius: 6,
          border: '1px solid #F0EFEC', background: 'transparent',
          fontSize: 12, fontWeight: 500, color: '#616161',
          fontFamily: 'var(--font-inter)', cursor: 'pointer',
          transition: 'background 0.15s ease',
        }}
        {...hoverBg('#F5F5F5', 'transparent')}
      >
        取消
      </button>
    </>
  )
}

/* ─── 子元件：一般操作（編輯 / 刪除） ─── */

function ReadonlyActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <>
      <button
        onClick={onEdit}
        style={{
          display: 'flex', alignItems: 'center', gap: 4,
          padding: '5px 10px', borderRadius: 6,
          border: '1px solid #F0EFEC', background: 'transparent',
          cursor: 'pointer', transition: 'background 0.15s ease',
        }}
        {...hoverBg('#F5F5F5', 'transparent')}
      >
        <Pencil size={12} color="#616161" />
        <span style={{ fontSize: 12, color: '#616161', fontFamily: 'var(--font-inter)' }}>編輯</span>
      </button>
      <button
        onClick={onDelete}
        style={{
          display: 'flex', alignItems: 'center', gap: 4,
          padding: '5px 10px', borderRadius: 6,
          border: '1px solid #FFCDD2', background: 'transparent',
          cursor: 'pointer', transition: 'background 0.15s ease',
        }}
        {...hoverBg('#FFF5F5', 'transparent')}
      >
        <Trash2 size={12} color="#E53935" />
        <span style={{ fontSize: 12, color: '#E53935', fontFamily: 'var(--font-inter)' }}>刪除</span>
      </button>
    </>
  )
}
