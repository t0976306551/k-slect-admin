'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, ChevronRight, FolderOpen } from 'lucide-react'
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '@/lib/api'
import type { Category } from '@/types'

interface FormState {
  name: string
  parentId: string
}

const EMPTY_FORM: FormState = { name: '', parentId: '' }

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  // modal 狀態
  const [modal, setModal] = useState<'create' | 'edit' | null>(null)
  const [editTarget, setEditTarget] = useState<Category | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // 刪除確認
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    try {
      const res = await fetchCategories()
      if (res.data) {
        // 後端回傳 nested tree，攤平為 flat array 讓 childrenOf() 正常運作
        const flatten = (nodes: Category[]): Category[] =>
          nodes.flatMap(n => [n, ...flatten(n.children ?? [])])
        setCategories(flatten(res.data))
      }
    } catch (err) {
      console.error('載入分類失敗', err)
    } finally {
      setLoading(false)
    }
  }

  // 頂層分類（parentId === null）
  const roots = categories.filter(c => c.parentId === null)
  // 取得某分類的子分類
  const childrenOf = (id: string) => categories.filter(c => c.parentId === id)

  // 可選的父分類（編輯時排除自己與其子孫）
  function parentOptions(excludeId?: string): Category[] {
    if (!excludeId) return categories
    const descendants = new Set<string>()
    const collect = (id: string) => {
      descendants.add(id)
      childrenOf(id).forEach(c => collect(c.id))
    }
    collect(excludeId)
    return categories.filter(c => !descendants.has(c.id))
  }

  function openCreate() {
    setForm(EMPTY_FORM)
    setFormError(null)
    setEditTarget(null)
    setModal('create')
  }

  function openEdit(cat: Category) {
    setForm({ name: cat.name, parentId: cat.parentId ?? '' })
    setFormError(null)
    setEditTarget(cat)
    setModal('edit')
  }

  function closeModal() {
    setModal(null)
    setEditTarget(null)
    setForm(EMPTY_FORM)
    setFormError(null)
  }

  async function handleSave() {
    if (!form.name.trim()) {
      setFormError('請輸入分類名稱')
      return
    }
    setSaving(true)
    setFormError(null)

    const payload = {
      name: form.name.trim(),
      ...(form.parentId ? { parentId: form.parentId } : {}),
    }

    try {
      let res
      if (modal === 'create') {
        res = await createCategory(payload)
      } else {
        res = await updateCategory(editTarget!.id, {
          name: payload.name,
          parentId: form.parentId || null,
        })
      }

      if (res.error) {
        setFormError(res.error.message)
        return
      }
      closeModal()
      load()
    } catch (err) {
      setFormError('操作失敗，請稍後再試')
      console.error('儲存分類失敗', err)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    setDeleteError(null)
    try {
      const res = await deleteCategory(deleteTarget.id)
      if (res.error) {
        setDeleteError(res.error.message)
        return
      }
      setCategories(prev => prev.filter(c => c.id !== deleteTarget.id))
      setDeleteTarget(null)
      setDeleteError(null)
    } catch (err) {
      setDeleteError('刪除失敗，請稍後再試')
      console.error('刪除分類失敗', err)
    } finally {
      setDeleting(false)
    }
  }

  // 遞迴渲染分類列
  function renderRow(cat: Category, depth = 0): React.ReactNode[] {
    const children = childrenOf(cat.id)
    return [
      <div
        key={cat.id}
        className="flex items-center px-5 py-[10px]"
        style={{ borderTop: '1px solid #F0EFEC' }}
      >
        {/* 縮排 + 圖示 */}
        <div
          className="flex items-center gap-2 flex-1"
          style={{ paddingLeft: depth * 20 }}
        >
          {depth > 0 && (
            <ChevronRight size={14} color="#C7C7CC" className="shrink-0" />
          )}
          <FolderOpen
            size={16}
            color={depth === 0 ? '#7C9070' : '#8E8E93'}
            className="shrink-0"
          />
          <span
            className="text-[13px]"
            style={{
              fontFamily: 'var(--font-jakarta)',
              color: '#2D2D2D',
              fontWeight: depth === 0 ? 600 : 400,
            }}
          >
            {cat.name}
          </span>
        </div>

        {/* 上層分類 */}
        <span
          className="w-[160px] text-[12px]"
          style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}
        >
          {cat.parent?.name ?? '—'}
        </span>

        {/* 商品數 */}
        <span
          className="w-[80px] text-[12px]"
          style={{ fontFamily: 'var(--font-jakarta)', color: '#6B6B6B' }}
        >
          {cat._count?.products ?? 0} 件
        </span>

        {/* 子分類數 */}
        <span
          className="w-[80px] text-[12px]"
          style={{ fontFamily: 'var(--font-jakarta)', color: '#6B6B6B' }}
        >
          {children.length} 個
        </span>

        {/* 操作 */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => openEdit(cat)}
            className="w-8 flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity"
          >
            <Pencil size={16} color="#8E8E93" />
          </button>
          <button
            onClick={() => setDeleteTarget(cat)}
            className="w-8 flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity"
          >
            <Trash2 size={16} color="#D4845E" />
          </button>
        </div>
      </div>,
      ...children.flatMap(child => renderRow(child, depth + 1)),
    ]
  }

  const options = parentOptions(editTarget?.id)

  return (
    <div className="p-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1
          className="text-[28px] font-medium tracking-[-0.5px]"
          style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2D2D' }}
        >
          商品分類
        </h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-[6px] px-5 py-[10px] transition-all hover:opacity-80 active:scale-[0.96]"
          style={{
            background: '#7C9070',
            borderRadius: 10,
            fontFamily: 'var(--font-jakarta)',
            fontSize: 13,
            fontWeight: 600,
            color: '#FFFFFF',
          }}
        >
          <Plus size={16} color="#FFFFFF" />
          新增分類
        </button>
      </div>

      {/* 分類表格 */}
      <div className="overflow-x-auto rounded-[16px]" style={{ border: '1px solid #F0EFEC' }}>
        <div className="flex flex-col min-w-[560px]" style={{ background: '#FFFFFF' }}>
          {/* 表頭 */}
          <div
            className="flex items-center px-5 py-[10px]"
            style={{ background: '#FAFAF8' }}
          >
            <span className="flex-1 text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>分類名稱</span>
            <span className="w-[160px] text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>上層分類</span>
            <span className="w-[80px] text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>商品數</span>
            <span className="w-[80px] text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>子分類</span>
            <span className="w-16" />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <span className="text-[14px]" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>
                載入中...
              </span>
            </div>
          ) : roots.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <span className="text-[14px]" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>
                尚無分類，點擊「新增分類」開始建立
              </span>
            </div>
          ) : (
            roots.flatMap(cat => renderRow(cat))
          )}
        </div>
      </div>

      {/* 新增 / 編輯 Modal */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.3)' }}
          onClick={e => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div
            className="flex flex-col gap-5 p-6 w-[90vw] max-w-[400px]"
            style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #F0EFEC' }}
          >
            <p
              className="text-[16px] font-semibold"
              style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2D2D' }}
            >
              {modal === 'create' ? '新增分類' : '編輯分類'}
            </p>

            {/* 分類名稱 */}
            <div className="flex flex-col gap-[6px]">
              <label
                className="text-[12px] font-semibold"
                style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}
              >
                分類名稱
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="輸入分類名稱"
                className="px-[14px] outline-none text-[13px]"
                style={{
                  height: 42,
                  borderRadius: 8,
                  border: formError && !form.name.trim() ? '1.5px solid #EF4444' : '1.5px solid #F0EFEC',
                  background: '#F7F6F3',
                  fontFamily: 'var(--font-jakarta)',
                  color: '#2D2D2D',
                }}
              />
            </div>

            {/* 上層分類 */}
            <div className="flex flex-col gap-[6px]">
              <label
                className="text-[12px] font-semibold"
                style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}
              >
                上層分類（選填）
              </label>
              <select
                value={form.parentId}
                onChange={e => setForm(f => ({ ...f, parentId: e.target.value }))}
                className="px-[14px] outline-none text-[13px] cursor-pointer"
                style={{
                  height: 42,
                  borderRadius: 8,
                  border: '1.5px solid #F0EFEC',
                  background: '#F7F6F3',
                  fontFamily: 'var(--font-jakarta)',
                  color: form.parentId ? '#2D2D2D' : '#8E8E93',
                  appearance: 'none',
                }}
              >
                <option value="">無（頂層分類）</option>
                {options.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.parentId ? `　${c.name}` : c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 錯誤訊息 */}
            {formError && (
              <p className="text-[12px]" style={{ color: '#EF4444', fontFamily: 'var(--font-jakarta)' }}>
                {formError}
              </p>
            )}

            {/* 操作按鈕 */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={closeModal}
                className="px-5 py-[10px] text-[13px] font-medium rounded-[10px] transition-colors hover:bg-gray-50"
                style={{ border: '1px solid #F0EFEC', color: '#6B6B6B', fontFamily: 'var(--font-jakarta)' }}
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-[10px] text-[13px] font-semibold rounded-[10px] transition-all hover:opacity-80 active:scale-[0.96] disabled:opacity-50"
                style={{ background: '#7C9070', color: '#FFFFFF', fontFamily: 'var(--font-jakarta)' }}
              >
                {saving ? '儲存中...' : '儲存'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 刪除確認 Modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.3)' }}
        >
          <div
            className="flex flex-col gap-5 p-6 w-[90vw] max-w-[360px]"
            style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #F0EFEC' }}
          >
            <div className="flex flex-col gap-2">
              <p
                className="text-[16px] font-semibold"
                style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2D2D' }}
              >
                確認刪除分類
              </p>
              <p
                className="text-[13px]"
                style={{ fontFamily: 'var(--font-jakarta)', color: '#6B6B6B' }}
              >
                確定要刪除「{deleteTarget.name}」嗎？此操作無法復原，該分類下的商品將失去分類歸屬。
              </p>
              {deleteError && (
                <p className="text-[12px]" style={{ color: '#EF4444', fontFamily: 'var(--font-jakarta)' }}>
                  {deleteError}
                </p>
              )}
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setDeleteTarget(null); setDeleteError(null) }}
                className="px-5 py-[10px] text-[13px] font-medium rounded-[10px] transition-colors hover:bg-gray-50"
                style={{ border: '1px solid #F0EFEC', color: '#6B6B6B', fontFamily: 'var(--font-jakarta)' }}
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-5 py-[10px] text-[13px] font-semibold rounded-[10px] transition-all hover:opacity-80 active:scale-[0.96] disabled:opacity-50"
                style={{ background: '#D4845E', color: '#FFFFFF', fontFamily: 'var(--font-jakarta)' }}
              >
                {deleting ? '刪除中...' : '確認刪除'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
