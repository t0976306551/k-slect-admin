'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Plus, Pencil, Trash2, GripVertical, X } from 'lucide-react'
import { fetchBanners, createBanner, updateBanner, deleteBanner } from '@/lib/api'
import { inputStyle } from '@/lib/styles'
import { StatusBadge, BANNER_STATUS_MAP } from '@/components/admin/StatusBadge'
import type { Banner } from '@/types'

type BannerForm = {
  title: string
  imageUrl: string
  linkUrl: string
  sort: string
  status: 'active' | 'inactive'
}

const emptyForm: BannerForm = { title: '', imageUrl: '', linkUrl: '', sort: '0', status: 'active' }

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [modal, setModal] = useState<{ open: boolean; editing: Banner | null }>({ open: false, editing: null })
  const [form, setForm] = useState<BannerForm>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Banner | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const r = await fetchBanners()
      if (r.data) setBanners(r.data)
    }
    load()
  }, [])

  const openCreate = () => {
    setForm(emptyForm)
    setError(null)
    setModal({ open: true, editing: null })
  }

  const openEdit = (banner: Banner) => {
    setForm({
      title: banner.title,
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl ?? '',
      sort: String(banner.sort),
      status: banner.status as 'active' | 'inactive',
    })
    setError(null)
    setModal({ open: true, editing: banner })
  }

  const closeModal = () => setModal({ open: false, editing: null })

  const handleSave = async () => {
    if (!form.title.trim()) { setError('請輸入標題'); return }
    if (!form.imageUrl.trim()) { setError('請輸入圖片網址'); return }
    setSaving(true)
    setError(null)
    const payload = {
      title: form.title.trim(),
      imageUrl: form.imageUrl.trim(),
      linkUrl: form.linkUrl.trim() || undefined,
      sort: Number(form.sort) || 0,
      status: form.status,
    }
    const res = modal.editing
      ? await updateBanner(modal.editing.id, payload)
      : await createBanner(payload)
    setSaving(false)
    if (res.error) { setError(res.error.message); return }
    if (res.data) {
      if (modal.editing) {
        setBanners(prev => prev.map(b => b.id === modal.editing!.id ? res.data! : b))
      } else {
        setBanners(prev => [...prev, res.data!])
      }
    }
    closeModal()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    const res = await deleteBanner(deleteTarget.id)
    setDeleting(false)
    if (!res.error) {
      setBanners(prev => prev.filter(b => b.id !== deleteTarget.id))
    }
    setDeleteTarget(null)
  }

  return (
    <div className="p-4 sm:p-8 flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1
          className="text-[28px] font-medium tracking-[-0.5px]"
          style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2D2D' }}
        >
          Banner 管理
        </h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-[6px] px-5 py-[10px] transition-all hover:opacity-80 active:scale-[0.96]"
          style={{ background: '#7C9070', borderRadius: 10, fontSize: 13, fontWeight: 600, color: '#FFFFFF', fontFamily: 'var(--font-jakarta)' }}
        >
          <Plus size={16} color="#FFFFFF" />
          新增 Banner
        </button>
      </div>

      <div
        className="flex flex-col overflow-hidden"
        style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #F0EFEC' }}
      >
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            <div className="flex items-center px-5 py-[10px]" style={{ background: '#FAFAF8' }}>
              <span className="w-8" />
              <span className="w-[200px] text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>預覽</span>
              <span className="flex-1 text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>標題</span>
              <span className="w-[60px] text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>排序</span>
              <span className="w-[80px] text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>狀態</span>
              <span className="w-[100px] text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>操作</span>
            </div>

            {banners.map(banner => (
              <div
                key={banner.id}
                className="flex items-center px-5 py-3"
                style={{ borderTop: '1px solid #F0EFEC' }}
              >
                <div className="w-8 flex items-center justify-center">
                  <GripVertical size={16} color="#C0C0C0" />
                </div>
                <div
                  className="w-[200px] relative overflow-hidden mr-4 shrink-0"
                  style={{ height: 60, borderRadius: 8 }}
                >
                  <Image
                    src={banner.imageUrl}
                    alt={banner.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <span className="flex-1 text-[13px] font-medium" style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}>{banner.title}</span>
                <span className="w-[60px] text-[12px]" style={{ fontFamily: 'var(--font-jakarta)', color: '#6B6B6B' }}>{banner.sort}</span>
                <div className="w-[80px]">
                  <StatusBadge status={banner.status} map={BANNER_STATUS_MAP} />
                </div>
                <div className="w-[100px] flex items-center gap-2">
                  <button
                    onClick={() => openEdit(banner)}
                    className="flex items-center gap-1 px-2 py-[5px] rounded-[6px] hover:bg-gray-50 transition-colors"
                    style={{ border: '1px solid #F0EFEC' }}
                  >
                    <Pencil size={12} color="#616161" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(banner)}
                    className="flex items-center gap-1 px-2 py-[5px] rounded-[6px] hover:bg-red-50 transition-colors"
                    style={{ border: '1px solid #FFCDD2' }}
                  >
                    <Trash2 size={12} color="#E53935" />
                  </button>
                </div>
              </div>
            ))}

            {banners.length === 0 && (
              <div className="px-5 py-10 text-center text-[13px]" style={{ color: '#8E8E93', fontFamily: 'var(--font-jakarta)' }}>
                尚無 Banner，點擊右上角新增
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 新增/編輯 Modal */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div
            className="w-full max-w-md flex flex-col gap-5 p-6 mx-4"
            style={{ background: '#FFFFFF', borderRadius: 20, border: '1px solid #F0EFEC' }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-[18px] font-semibold" style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2D2D' }}>
                {modal.editing ? '編輯 Banner' : '新增 Banner'}
              </h2>
              <button onClick={closeModal} className="p-1 hover:opacity-60 transition-opacity">
                <X size={18} color="#8E8E93" />
              </button>
            </div>

            {error && (
              <div className="px-4 py-3 text-[13px] rounded-[10px]" style={{ background: '#FFF0EE', color: '#D4845E', fontFamily: 'var(--font-jakarta)', border: '1px solid #F4C5B4' }}>
                {error}
              </div>
            )}

            <div className="flex flex-col gap-4">
              {[
                { label: '標題', key: 'title', placeholder: '輸入 Banner 標題' },
                { label: '圖片網址', key: 'imageUrl', placeholder: 'https://...' },
                { label: '連結網址（選填）', key: 'linkUrl', placeholder: 'https://...' },
              ].map(({ label, key, placeholder }) => (
                <div key={key} className="flex flex-col gap-[6px]">
                  <label className="text-[13px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}>{label}</label>
                  <input
                    type="text"
                    value={form[key as keyof BannerForm]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    style={inputStyle}
                  />
                </div>
              ))}

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-[6px]">
                  <label className="text-[13px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}>排序</label>
                  <input
                    type="number"
                    value={form.sort}
                    onChange={e => setForm(f => ({ ...f, sort: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
                <div className="flex flex-col gap-[6px]">
                  <label className="text-[13px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}>狀態</label>
                  <select
                    value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value as 'active' | 'inactive' }))}
                    className="appearance-none outline-none"
                    style={inputStyle}
                  >
                    <option value="active">顯示中</option>
                    <option value="inactive">已隱藏</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={closeModal}
                className="px-5 py-[10px] text-[13px] font-medium rounded-[10px] hover:bg-gray-50 transition-colors"
                style={{ border: '1px solid #F0EFEC', color: '#6B6B6B', fontFamily: 'var(--font-jakarta)' }}
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-[10px] text-[13px] font-semibold rounded-[10px] hover:opacity-80 transition-opacity disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div
            className="w-full max-w-sm flex flex-col gap-5 p-6 mx-4"
            style={{ background: '#FFFFFF', borderRadius: 20, border: '1px solid #F0EFEC' }}
          >
            <h2 className="text-[16px] font-semibold" style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2D2D' }}>確認刪除</h2>
            <p className="text-[13px]" style={{ fontFamily: 'var(--font-jakarta)', color: '#6B6B6B' }}>
              確定要刪除「{deleteTarget.title}」嗎？此操作無法復原。
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-5 py-[10px] text-[13px] font-medium rounded-[10px] hover:bg-gray-50"
                style={{ border: '1px solid #F0EFEC', color: '#6B6B6B', fontFamily: 'var(--font-jakarta)' }}
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-5 py-[10px] text-[13px] font-semibold rounded-[10px] hover:opacity-80 disabled:opacity-50"
                style={{ background: '#E53935', color: '#FFFFFF', fontFamily: 'var(--font-jakarta)' }}
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
