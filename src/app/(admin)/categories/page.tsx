'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, ChevronRight, FolderOpen, Folder, Plus, Pencil, Trash2, AlertTriangle } from 'lucide-react'
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '@/lib/api'
import { Toast } from '@/components/admin/Toast'
import { Dialog } from '@/components/admin/Dialog'
import type { Category } from '@/types'

/* ─── Segmented control: 頂層 / 子分類 ─── */
function TypeToggle({
  value,
  onChange,
}: {
  value: 'top' | 'sub'
  onChange: (v: 'top' | 'sub') => void
}) {
  const opts: { v: 'top' | 'sub'; label: string }[] = [
    { v: 'top', label: '頂層分類' },
    { v: 'sub', label: '子分類' },
  ]
  return (
    <div
      style={{
        display: 'inline-flex',
        background: '#F5F5F4',
        borderRadius: 10,
        padding: 3,
        gap: 2,
      }}
    >
      {opts.map(o => (
        <button
          key={o.v}
          onClick={() => onChange(o.v)}
          style={{
            padding: '6px 18px',
            borderRadius: 8,
            border: 'none',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: value === o.v ? 600 : 400,
            fontFamily: 'var(--font-inter)',
            color: value === o.v ? '#1A1A1A' : '#8E8E93',
            background: value === o.v ? '#FFFFFF' : 'transparent',
            boxShadow: value === o.v ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.18s ease',
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

/* ─── Add Category Dialog ─── */
function AddCategoryDialog({
  open,
  onClose,
  topLevelCategories,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  topLevelCategories: Category[]
  onSaved: (msg: string) => void
}) {
  const [type, setType] = useState<'top' | 'sub'>('top')
  const [name, setName] = useState('')
  const [parentId, setParentId] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /* Reset when dialog opens */
  useEffect(() => {
    if (open) {
      setType('top')
      setName('')
      setParentId('')
      setError(null)
    }
  }, [open])

  const handleSave = async () => {
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

  const inputStyle: React.CSSProperties = {
    width: '100%',
    height: 40,
    padding: '0 12px',
    borderRadius: 8,
    border: '1px solid #F0EFEC',
    background: '#F7F6F3',
    fontFamily: 'var(--font-inter)',
    fontSize: 13,
    color: '#1A1A1A',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s ease',
  }

  return (
    <Dialog open={open} onClose={onClose} title="新增分類">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Type toggle */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#616161', fontFamily: 'var(--font-inter)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            分類類型
          </span>
          <TypeToggle value={type} onChange={v => { setType(v); setParentId('') }} />
        </div>

        {/* Name input */}
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

        {/* Parent selector (sub only) */}
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

        {/* Error */}
        {error && (
          <div style={{
            padding: '10px 12px',
            borderRadius: 8,
            background: '#FFF0EE',
            border: '1px solid #F4C5B4',
            fontSize: 13,
            color: '#D4845E',
            fontFamily: 'var(--font-inter)',
          }}>
            {error}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 4 }}>
          <button
            onClick={onClose}
            style={{
              padding: '9px 20px',
              borderRadius: 8,
              border: '1px solid #F0EFEC',
              background: 'transparent',
              fontSize: 13,
              fontWeight: 500,
              color: '#616161',
              fontFamily: 'var(--font-inter)',
              cursor: 'pointer',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = '#F5F5F5')}
            onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = 'transparent')}
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '9px 20px',
              borderRadius: 8,
              border: 'none',
              background: '#7C9070',
              fontSize: 13,
              fontWeight: 600,
              color: '#FFFFFF',
              fontFamily: 'var(--font-inter)',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.6 : 1,
              transition: 'opacity 0.15s ease',
            }}
          >
            {saving ? '儲存中…' : '儲存分類'}
          </button>
        </div>
      </div>
    </Dialog>
  )
}

/* ─── Delete Confirm Dialog ─── */
function DeleteDialog({
  open,
  onClose,
  categoryName,
  onConfirm,
}: {
  open: boolean
  onClose: () => void
  categoryName: string
  onConfirm: () => Promise<void>
}) {
  const [deleting, setDeleting] = useState(false)

  const handleConfirm = async () => {
    setDeleting(true)
    await onConfirm()
    setDeleting(false)
  }

  return (
    <Dialog open={open} onClose={onClose} title="刪除分類" maxWidth={380}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: '#FFF0EE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <AlertTriangle size={18} color="#D4845E" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A', fontFamily: 'var(--font-inter)' }}>
              確認刪除「{categoryName}」？
            </span>
            <span style={{ fontSize: 13, color: '#8E8E93', fontFamily: 'var(--font-inter)', lineHeight: 1.5 }}>
              此操作無法復原。若分類下有商品或子分類，將無法刪除。
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '9px 20px', borderRadius: 8,
              border: '1px solid #F0EFEC', background: 'transparent',
              fontSize: 13, fontWeight: 500, color: '#616161',
              fontFamily: 'var(--font-inter)', cursor: 'pointer',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = '#F5F5F5')}
            onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = 'transparent')}
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            disabled={deleting}
            style={{
              padding: '9px 20px', borderRadius: 8, border: 'none',
              background: '#E53935', fontSize: 13, fontWeight: 600,
              color: '#FFFFFF', fontFamily: 'var(--font-inter)',
              cursor: deleting ? 'not-allowed' : 'pointer',
              opacity: deleting ? 0.6 : 1,
              transition: 'opacity 0.15s ease',
            }}
          >
            {deleting ? '刪除中…' : '確認刪除'}
          </button>
        </div>
      </div>
    </Dialog>
  )
}

/* ─── Category Row ─── */
function CategoryRow({
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
}: {
  category: Category
  isExpanded: boolean
  onToggle: () => void
  isTop: boolean
  editingId: string | null
  editingName: string
  onEditStart: (id: string, name: string) => void
  onEditNameChange: (name: string) => void
  onEditSave: (id: string) => void
  onEditCancel: () => void
  onDeleteClick: (id: string, name: string) => void
}) {
  const isEditing = editingId === category.id

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
        {isTop && (category.children?.length ?? 0) > 0 ? (
          <button
            onClick={onToggle}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0, display: 'flex' }}
          >
            <div style={{ transition: 'transform 0.2s ease', transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
              <ChevronDown size={14} color="#9E9E9E" />
            </div>
          </button>
        ) : (
          <span style={{ width: 14, flexShrink: 0 }} />
        )}
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
              background: '#FFFFFF',
              borderRadius: 6,
              border: '1px solid #7C9070',
              height: 28,
              width: 140,
              fontFamily: 'var(--font-inter)',
              fontSize: 13,
              color: '#1A1A1A',
              padding: '0 8px',
              outline: 'none',
            }}
          />
        ) : (
          <span style={{
            fontFamily: 'var(--font-inter)',
            fontSize: 14,
            fontWeight: isTop ? 600 : 400,
            color: '#1A1A1A',
            lineHeight: 1,
          }}>
            {category.name}
          </span>
        )}
      </div>

      {/* 商品數量 */}
      <div style={{ width: 120 }}>
        {isTop ? (
          <span style={{
            display: 'inline-flex', alignItems: 'center',
            padding: '3px 10px', borderRadius: 20,
            background: '#7C907025', color: '#7C9070',
            fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-inter)',
          }}>
            {category._count?.products ?? 0} 件
          </span>
        ) : (
          <span style={{ fontSize: 13, color: '#616161', fontFamily: 'var(--font-inter)' }}>
            {category._count?.products ?? 0} 件
          </span>
        )}
      </div>

      {/* 操作 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
        {isEditing ? (
          <>
            <button
              onClick={() => onEditSave(category.id)}
              style={{
                padding: '5px 12px', borderRadius: 6, border: 'none',
                background: '#7C9070', fontSize: 12, fontWeight: 600,
                color: '#FFFFFF', fontFamily: 'var(--font-inter)', cursor: 'pointer',
                transition: 'opacity 0.15s ease',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.8')}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}
            >
              儲存
            </button>
            <button
              onClick={onEditCancel}
              style={{
                padding: '5px 12px', borderRadius: 6,
                border: '1px solid #F0EFEC', background: 'transparent',
                fontSize: 12, fontWeight: 500, color: '#616161',
                fontFamily: 'var(--font-inter)', cursor: 'pointer',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = '#F5F5F5')}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = 'transparent')}
            >
              取消
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => onEditStart(category.id, category.name)}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '5px 10px', borderRadius: 6,
                border: '1px solid #F0EFEC', background: 'transparent',
                cursor: 'pointer', transition: 'background 0.15s ease',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = '#F5F5F5')}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = 'transparent')}
            >
              <Pencil size={12} color="#616161" />
              <span style={{ fontSize: 12, color: '#616161', fontFamily: 'var(--font-inter)' }}>編輯</span>
            </button>
            <button
              onClick={() => onDeleteClick(category.id, category.name)}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '5px 10px', borderRadius: 6,
                border: '1px solid #FFCDD2', background: 'transparent',
                cursor: 'pointer', transition: 'background 0.15s ease',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = '#FFF5F5')}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = 'transparent')}
            >
              <Trash2 size={12} color="#E53935" />
              <span style={{ fontSize: 12, color: '#E53935', fontFamily: 'var(--font-inter)' }}>刪除</span>
            </button>
          </>
        )}
      </div>
    </div>
  )
}

/* ─── Main Page ─── */
export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  const [showAddDialog, setShowAddDialog] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const refresh = async () => {
    const r = await fetchCategories()
    if (r.data) setCategories(r.data)
  }

  useEffect(() => {
    fetchCategories().then(r => {
      if (r.data) {
        setCategories(r.data)
        const init: Record<string, boolean> = {}
        r.data.forEach(c => { if ((c.children?.length ?? 0) > 0) init[c.id] = true })
        setExpanded(init)
      }
      setLoading(false)
    })
  }, [])

  const handleEditStart = (id: string, name: string) => {
    setEditingId(id)
    setEditingName(name)
  }

  const handleEditCancel = () => {
    setEditingId(null)
    setEditingName('')
  }

  const handleEditSave = async (id: string) => {
    if (!editingName.trim()) return
    const res = await updateCategory(id, { name: editingName.trim() })
    if (res.error) {
      setToast({ message: res.error.message, type: 'error' })
      return
    }
    await refresh()
    setEditingId(null)
    setEditingName('')
    setToast({ message: '分類名稱已更新', type: 'success' })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    const res = await deleteCategory(deleteTarget.id)
    if (res.error) {
      setToast({ message: res.error.message, type: 'error' })
      setDeleteTarget(null)
      return
    }
    await refresh()
    setDeleteTarget(null)
    setToast({ message: '分類已刪除', type: 'success' })
  }

  const topLevelCategories = categories.filter(c => !c.parentId)

  const sharedRowProps = {
    editingId,
    editingName,
    onEditStart: handleEditStart,
    onEditNameChange: setEditingName,
    onEditSave: handleEditSave,
    onEditCancel: handleEditCancel,
    onDeleteClick: (id: string, name: string) => setDeleteTarget({ id, name }),
  }

  if (loading) {
    return (
      <div style={{ padding: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: 'var(--font-inter)', color: '#8E8E93', fontSize: 14 }}>載入中…</span>
      </div>
    )
  }

  return (
    <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 20, fontFamily: 'var(--font-inter)' }}>
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <AddCategoryDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        topLevelCategories={topLevelCategories}
        onSaved={msg => { refresh(); setToast({ message: msg, type: 'success' }) }}
      />

      <DeleteDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        categoryName={deleteTarget?.name ?? ''}
        onConfirm={handleDeleteConfirm}
      />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>商品分類管理</h1>
          <p style={{ fontSize: 14, color: '#616161', margin: 0 }}>管理商品分類架構，設定父子分類關係</p>
        </div>
        <button
          onClick={() => setShowAddDialog(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', borderRadius: 10,
            border: 'none', background: '#7C9070',
            fontSize: 14, fontWeight: 600, color: '#FFFFFF',
            cursor: 'pointer', transition: 'opacity 0.15s ease',
          }}
          onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.85')}
          onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}
        >
          <Plus size={16} color="#FFFFFF" />
          新增分類
        </button>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid #F0EFEC' }}>
        <div style={{ minWidth: 600, background: '#FFFFFF' }}>
          {/* Header row */}
          <div style={{
            display: 'flex', alignItems: 'center',
            padding: '0 20px', height: 44,
            background: '#F5F5F5', borderBottom: '1px solid #F0EFEC',
          }}>
            <span style={{ width: 320, fontSize: 12, fontWeight: 600, color: '#616161' }}>分類名稱</span>
            <span style={{ width: 120, fontSize: 12, fontWeight: 600, color: '#616161' }}>商品數量</span>
            <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: '#616161' }}>操作</span>
          </div>

          {/* Empty state */}
          {categories.length === 0 && (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <p style={{ fontSize: 14, color: '#9E9E9E', fontFamily: 'var(--font-inter)', margin: 0 }}>
                尚無分類，點擊「新增分類」開始建立
              </p>
            </div>
          )}

          {/* Rows */}
          {categories.map(cat => (
            <div key={cat.id}>
              <CategoryRow
                category={cat}
                isExpanded={!!expanded[cat.id]}
                onToggle={() => setExpanded(prev => ({ ...prev, [cat.id]: !prev[cat.id] }))}
                isTop
                {...sharedRowProps}
              />
              {expanded[cat.id] && cat.children?.map(child => (
                <CategoryRow
                  key={child.id}
                  category={child}
                  isExpanded={false}
                  onToggle={() => {}}
                  isTop={false}
                  {...sharedRowProps}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
