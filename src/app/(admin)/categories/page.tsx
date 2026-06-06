'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, ChevronRight, FolderOpen, X } from 'lucide-react'
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '@/lib/api'
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import type { Category } from '@/types'

interface FormState {
  name: string
  parentId: string
}

const EMPTY_FORM: FormState = { name: '', parentId: '' }

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const [modal, setModal] = useState<'create' | 'edit' | null>(null)
  const [editTarget, setEditTarget] = useState<Category | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useBodyScrollLock(!!(modal || deleteTarget))

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const res = await fetchCategories()
      if (res.data) {
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

  const roots = categories.filter(c => c.parentId === null)
  const childrenOf = (id: string) => categories.filter(c => c.parentId === id)

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
    setForm(EMPTY_FORM); setFormError(null); setEditTarget(null); setModal('create')
  }
  function openEdit(cat: Category) {
    setForm({ name: cat.name, parentId: cat.parentId ?? '' }); setFormError(null); setEditTarget(cat); setModal('edit')
  }
  function closeModal() {
    setModal(null); setEditTarget(null); setForm(EMPTY_FORM); setFormError(null)
  }

  async function handleSave() {
    if (!form.name.trim()) { setFormError('請輸入分類名稱'); return }
    setSaving(true); setFormError(null)
    const payload = { name: form.name.trim(), ...(form.parentId ? { parentId: form.parentId } : {}) }
    try {
      const res = modal === 'create'
        ? await createCategory(payload)
        : await updateCategory(editTarget!.id, { name: payload.name, parentId: form.parentId || null })
      if (res.error) { setFormError(res.error.message); return }
      closeModal(); load()
    } catch { setFormError('操作失敗，請稍後再試') }
    finally { setSaving(false) }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true); setDeleteError(null)
    try {
      const res = await deleteCategory(deleteTarget.id)
      if (res.error) { setDeleteError(res.error.message); return }
      setCategories(prev => prev.filter(c => c.id !== deleteTarget.id))
      setDeleteTarget(null); setDeleteError(null)
    } catch { setDeleteError('刪除失敗，請稍後再試') }
    finally { setDeleting(false) }
  }

  const options = parentOptions(editTarget?.id)

  // ── Desktop: 遞迴渲染表格列 ──────────────────────────────────────────────
  function renderRow(cat: Category, depth = 0): React.ReactNode[] {
    const children = childrenOf(cat.id)
    return [
      <div
        key={cat.id}
        className="flex items-center px-5 py-[10px] transition-colors duration-150 hover:bg-[#FAFAF8]"
        style={{ borderTop: '1px solid #F0EFEC' }}
      >
        <div className="flex items-center gap-2 flex-1" style={{ paddingLeft: depth * 20 }}>
          {depth > 0 && <ChevronRight size={14} color="#C7C7CC" className="shrink-0" />}
          <FolderOpen size={16} color={depth === 0 ? '#7C9070' : '#8E8E93'} className="shrink-0" />
          <span className="text-[13px]" style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D', fontWeight: depth === 0 ? 600 : 400 }}>
            {cat.name}
          </span>
        </div>
        <span className="w-[160px] text-[12px]" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>
          {cat.parent?.name ?? '—'}
        </span>
        <span className="w-[80px] text-[12px]" style={{ fontFamily: 'var(--font-jakarta)', color: '#6B6B6B' }}>
          {cat._count?.products ?? 0} 件
        </span>
        <span className="w-[80px] text-[12px]" style={{ fontFamily: 'var(--font-jakarta)', color: '#6B6B6B' }}>
          {children.length} 個
        </span>
        <div className="flex items-center gap-1">
          <button onClick={() => openEdit(cat)} className="w-8 h-8 flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity rounded-[6px] hover:bg-[#F0EFEC]">
            <Pencil size={15} color="#8E8E93" />
          </button>
          <button onClick={() => setDeleteTarget(cat)} className="w-8 h-8 flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity rounded-[6px] hover:bg-[#FEF2F2]">
            <Trash2 size={15} color="#D4845E" />
          </button>
        </div>
      </div>,
      ...children.flatMap(child => renderRow(child, depth + 1)),
    ]
  }

  // ── Mobile: 卡片清單 ─────────────────────────────────────────────────────
  function renderCard(cat: Category, depth = 0): React.ReactNode[] {
    const children = childrenOf(cat.id)
    return [
      <div
        key={cat.id}
        className="bg-white rounded-[14px] border border-[#F0EFEC] p-4 flex items-center gap-3"
        style={{ marginLeft: depth * 16, animation: `fade-up 0.3s cubic-bezier(0.25,1,0.5,1) both`, animationDelay: `${depth * 40}ms` }}
      >
        {/* Icon */}
        <div
          className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0"
          style={{ background: depth === 0 ? '#7C907018' : '#F7F6F3' }}
        >
          <FolderOpen size={18} color={depth === 0 ? '#7C9070' : '#8E8E93'} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            {depth > 0 && <ChevronRight size={12} color="#C7C7CC" />}
            <p className="text-[14px] truncate" style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D', fontWeight: depth === 0 ? 600 : 500 }}>
              {cat.name}
            </p>
          </div>
          <p className="text-[11px] mt-0.5" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>
            {cat.parent ? `上層：${cat.parent.name}　` : ''}{cat._count?.products ?? 0} 件商品　{children.length > 0 ? `${children.length} 子分類` : ''}
          </p>
        </div>

        {/* Actions — 44px touch targets */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => openEdit(cat)}
            className="w-11 h-11 flex items-center justify-center rounded-[10px] transition-colors active:scale-95"
            style={{ background: '#F7F6F3' }}
          >
            <Pencil size={16} color="#7C9070" />
          </button>
          <button
            onClick={() => setDeleteTarget(cat)}
            className="w-11 h-11 flex items-center justify-center rounded-[10px] transition-colors active:scale-95"
            style={{ background: '#FEF2F2' }}
          >
            <Trash2 size={16} color="#D4845E" />
          </button>
        </div>
      </div>,
      ...children.flatMap(child => renderCard(child, depth + 1)),
    ]
  }

  return (
    <div className="p-4 md:p-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-[26px] md:text-[28px] font-medium tracking-[-0.5px]" style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2D2D' }}>
          商品分類
        </h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-[6px] px-5 py-[10px] transition-all hover:opacity-80 active:scale-[0.96]"
          style={{ background: '#7C9070', borderRadius: 10, fontFamily: 'var(--font-jakarta)', fontSize: 13, fontWeight: 600, color: '#FFFFFF' }}
        >
          <Plus size={16} color="#FFFFFF" />
          新增分類
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <span className="text-[14px]" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>載入中...</span>
        </div>
      ) : roots.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-14 h-14 rounded-full bg-[#F0EFEC] flex items-center justify-center">
            <FolderOpen size={24} color="#C7C7CC" />
          </div>
          <p className="text-[14px]" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>尚無分類，點擊「新增分類」開始建立</p>
        </div>
      ) : (
        <>
          {/* ── Mobile 卡片清單（md 以下） ─────────────────── */}
          <div className="flex flex-col gap-2.5 md:hidden">
            {roots.flatMap(cat => renderCard(cat))}
          </div>

          {/* ── Desktop 表格（md 以上） ────────────────────── */}
          <div className="hidden md:block overflow-x-auto rounded-[16px]" style={{ border: '1px solid #F0EFEC' }}>
            <div className="flex flex-col min-w-[560px]" style={{ background: '#FFFFFF' }}>
              <div className="flex items-center px-5 py-[10px]" style={{ background: '#FAFAF8' }}>
                <span className="flex-1 text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>分類名稱</span>
                <span className="w-[160px] text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>上層分類</span>
                <span className="w-[80px] text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>商品數</span>
                <span className="w-[80px] text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>子分類</span>
                <span className="w-16" />
              </div>
              {roots.flatMap(cat => renderRow(cat))}
            </div>
          </div>
        </>
      )}

      {/* ── 新增 / 編輯 Modal ────────────────────────────────────────────── */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(2px)', animation: 'fade-in 0.18s ease both' }}
        >
          <div
            className="w-full md:max-w-[400px] flex flex-col gap-5 p-6"
            style={{
              background: '#FFFFFF',
              borderRadius: '20px 20px 0 0',
              maxHeight: '85dvh',
              overflowY: 'auto',
              borderTop: '1px solid #F0EFEC',
              animation: 'slide-up 0.28s cubic-bezier(0.34,1.3,0.64,1) both',
              paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Handle bar (mobile) */}
            <div className="flex items-center justify-between md:hidden -mt-1 mb-1">
              <div className="w-10 h-1 rounded-full bg-[#E0DDD8] mx-auto" />
            </div>

            <div className="flex items-center justify-between">
              <p className="text-[17px] font-semibold" style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2D2D' }}>
                {modal === 'create' ? '新增分類' : '編輯分類'}
              </p>
              <button
                onClick={closeModal}
                className="w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:bg-[#F0EFEC]"
              >
                <X size={16} color="#8E8E93" />
              </button>
            </div>

            {/* 分類名稱 */}
            <div className="flex flex-col gap-[6px]">
              <label className="text-[13px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}>
                分類名稱
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                onKeyDown={e => { if (e.key === 'Enter') handleSave() }}
                placeholder="輸入分類名稱"
                autoFocus
                className="px-[14px] outline-none text-[14px] transition-all admin-input"
                style={{
                  height: 48,
                  borderRadius: 10,
                  border: formError && !form.name.trim() ? '1.5px solid #EF4444' : '1.5px solid #F0EFEC',
                  background: '#F7F6F3',
                  fontFamily: 'var(--font-jakarta)',
                  color: '#2D2D2D',
                }}
              />
            </div>

            {/* 上層分類 */}
            <div className="flex flex-col gap-[6px]">
              <label className="text-[13px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}>
                上層分類（選填）
              </label>
              <select
                value={form.parentId}
                onChange={e => setForm(f => ({ ...f, parentId: e.target.value }))}
                className="px-[14px] outline-none text-[14px] cursor-pointer"
                style={{
                  height: 48,
                  borderRadius: 10,
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

            {formError && (
              <p className="text-[13px]" style={{ color: '#EF4444', fontFamily: 'var(--font-jakarta)' }}>{formError}</p>
            )}

            {/* 按鈕 */}
            <div className="flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 h-12 text-[14px] font-medium rounded-[12px] transition-all active:scale-[0.97] hover:bg-[#F7F6F3]"
                style={{ border: '1.5px solid #F0EFEC', color: '#6B6B6B', fontFamily: 'var(--font-jakarta)' }}
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 h-12 text-[14px] font-semibold rounded-[12px] transition-all hover:opacity-85 active:scale-[0.97] disabled:opacity-50"
                style={{ background: '#7C9070', color: '#FFFFFF', fontFamily: 'var(--font-jakarta)' }}
              >
                {saving ? '儲存中...' : '儲存'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 刪除確認 Modal ───────────────────────────────────────────────── */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(2px)', animation: 'fade-in 0.18s ease both' }}
        >
          <div
            className="w-full md:max-w-[380px] flex flex-col gap-5 p-6"
            style={{
              background: '#FFFFFF',
              borderRadius: '20px 20px 0 0',
              maxHeight: '85dvh',
              overflowY: 'auto',
              borderTop: '1px solid #F0EFEC',
              animation: 'slide-up 0.28s cubic-bezier(0.34,1.3,0.64,1) both',
              paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <p className="text-[17px] font-semibold" style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2D2D' }}>確認刪除分類</p>
              <button
                onClick={() => { setDeleteTarget(null); setDeleteError(null) }}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F0EFEC] transition-colors"
              >
                <X size={16} color="#8E8E93" />
              </button>
            </div>

            <p className="text-[14px] leading-relaxed" style={{ fontFamily: 'var(--font-jakarta)', color: '#6B6B6B' }}>
              確定要刪除「<strong style={{ color: '#2D2D2D' }}>{deleteTarget.name}</strong>」嗎？此操作無法復原，該分類下的商品將失去分類歸屬。
            </p>

            {deleteError && (
              <p className="text-[13px]" style={{ color: '#EF4444', fontFamily: 'var(--font-jakarta)' }}>{deleteError}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { setDeleteTarget(null); setDeleteError(null) }}
                className="flex-1 h-12 text-[14px] font-medium rounded-[12px] transition-all active:scale-[0.97] hover:bg-[#F7F6F3]"
                style={{ border: '1.5px solid #F0EFEC', color: '#6B6B6B', fontFamily: 'var(--font-jakarta)' }}
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 h-12 text-[14px] font-semibold rounded-[12px] transition-all hover:opacity-85 active:scale-[0.97] disabled:opacity-50"
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
