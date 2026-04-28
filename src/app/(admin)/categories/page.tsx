'use client'

import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { fetchCategories, updateCategory, deleteCategory } from '@/lib/api'
import { Toast } from '@/components/admin/Toast'
import { AddCategoryDialog, DeleteDialog, CategoryRow } from './_components'
import { hoverOpacity } from './_components/styles'
import type { Category } from '@/types'
import type { CategoryRowEditProps } from './_components'

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  const [showAddDialog, setShowAddDialog] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  async function refresh(): Promise<void> {
    const r = await fetchCategories()
    if (r.data) setCategories(r.data)
  }

  useEffect(() => {
    async function load() {
      const r = await fetchCategories()
      if (r.data) {
        setCategories(r.data)
        const init: Record<string, boolean> = {}
        for (const c of r.data) {
          if ((c.children?.length ?? 0) > 0) init[c.id] = true
        }
        setExpanded(init)
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleEditSave(id: string): Promise<void> {
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

  async function handleDeleteConfirm(): Promise<void> {
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

  const editProps: CategoryRowEditProps = {
    editingId,
    editingName,
    onEditStart: (id, name) => { setEditingId(id); setEditingName(name) },
    onEditNameChange: setEditingName,
    onEditSave: handleEditSave,
    onEditCancel: () => { setEditingId(null); setEditingName('') },
    onDeleteClick: (id, name) => setDeleteTarget({ id, name }),
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
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

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

      {/* 頁面標題 */}
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
          {...hoverOpacity('0.85', '1')}
        >
          <Plus size={16} color="#FFFFFF" />
          新增分類
        </button>
      </div>

      {/* 分類表格 */}
      <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid #F0EFEC' }}>
        <div style={{ minWidth: 600, background: '#FFFFFF' }}>
          <div style={{
            display: 'flex', alignItems: 'center',
            padding: '0 20px', height: 44,
            background: '#F5F5F5', borderBottom: '1px solid #F0EFEC',
          }}>
            <span style={{ width: 320, fontSize: 12, fontWeight: 600, color: '#616161' }}>分類名稱</span>
            <span style={{ width: 120, fontSize: 12, fontWeight: 600, color: '#616161' }}>商品數量</span>
            <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: '#616161' }}>操作</span>
          </div>

          {categories.length === 0 && (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <p style={{ fontSize: 14, color: '#9E9E9E', fontFamily: 'var(--font-inter)', margin: 0 }}>
                尚無分類，點擊「新增分類」開始建立
              </p>
            </div>
          )}

          {categories.map(cat => (
            <div key={cat.id}>
              <CategoryRow
                category={cat}
                isExpanded={!!expanded[cat.id]}
                onToggle={() => setExpanded(prev => ({ ...prev, [cat.id]: !prev[cat.id] }))}
                isTop
                {...editProps}
              />
              {expanded[cat.id] && cat.children?.map(child => (
                <CategoryRow
                  key={child.id}
                  category={child}
                  isExpanded={false}
                  onToggle={() => {}}
                  isTop={false}
                  {...editProps}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
