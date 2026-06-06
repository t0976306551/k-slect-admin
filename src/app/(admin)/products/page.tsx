'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, ChevronDown, Plus, Pencil, Trash2, X, ShoppingBag } from 'lucide-react'
import { fetchProducts, deleteProduct } from '@/lib/api'
import { StatusBadge, PRODUCT_STATUS_MAP } from '@/components/admin/StatusBadge'
import { SkeletonTable } from '@/components/admin/SkeletonTable'
import { useToast } from '@/contexts/ToastContext'
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import type { Product } from '@/types'

export default function ProductsPage() {
  const { showToast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('全部分類')
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
  const [deleting, setDeleting] = useState(false)
  useBodyScrollLock(!!deleteTarget)

  useEffect(() => {
    async function load() {
      const r = await fetchProducts()
      if (r.data) setProducts(r.data)
      setLoading(false)
    }
    load()
  }, [])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    const res = await deleteProduct(deleteTarget.id)
    setDeleting(false)
    if (!res.error) {
      setProducts(prev => prev.filter(p => p.id !== deleteTarget.id))
      showToast('商品已刪除')
    }
    setDeleteTarget(null)
  }

  const categories = ['全部分類', '美妝保養', '食品零食', '服飾配件', '生活家居']

  const filtered = products.filter(p => {
    const matchSearch = !search || p.name.includes(search) || (p.inventory?.sku ?? '').includes(search)
    const matchCat = categoryFilter === '全部分類' || p.category?.name === categoryFilter
    return matchSearch && matchCat
  })

  function getStock(p: Product) {
    const hasVariants = (p.variants?.length ?? 0) > 0
    const qty = hasVariants
      ? p.variants!.reduce((s, v) => s + v.quantity, 0)
      : (p.inventory?.quantity ?? 0)
    const isLow = hasVariants
      ? p.variants!.some(v => v.quantity <= v.lowStockThreshold)
      : qty <= 5
    return { qty, isLow }
  }

  return (
    <div className="p-4 md:p-8 flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1
          className="text-[26px] md:text-[28px] font-medium tracking-[-0.5px]"
          style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2D2D' }}
        >
          商品管理
        </h1>
        <Link
          href="/products/new"
          className="flex items-center gap-[6px] px-5 py-[10px] transition-all hover:opacity-80 active:scale-[0.96]"
          style={{ background: '#7C9070', borderRadius: 10, fontFamily: 'var(--font-jakarta)', fontSize: 13, fontWeight: 600, color: '#FFFFFF' }}
        >
          <Plus size={16} color="#FFFFFF" />
          新增商品
        </Link>
      </div>

      {/* 搜尋列 */}
      <div className="flex items-center gap-2 flex-wrap">
        <div
          className="flex items-center gap-2 px-[14px] flex-1 min-w-0"
          style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #F0EFEC', height: 40 }}
        >
          <Search size={16} color="#8E8E93" className="shrink-0" />
          <input
            type="text"
            placeholder="搜尋商品名稱、SKU..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-[12px] min-w-0"
            style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}
          />
          {search && (
            <button onClick={() => setSearch('')} className="shrink-0 text-[#8E8E93] hover:text-[#2D2D2D] transition-colors">
              <X size={14} />
            </button>
          )}
        </div>
        <div className="relative shrink-0">
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="appearance-none pl-4 pr-8 h-10 text-[12px] outline-none cursor-pointer"
            style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #F0EFEC', fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}
          >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <ChevronDown size={14} color="#8E8E93" className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {loading ? <SkeletonTable rows={8} /> : (
        <>
          {/* ── Mobile 卡片清單（md 以下） ──────────────────────── */}
          <div className="flex flex-col gap-2.5 md:hidden">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center py-20 gap-3">
                <div className="w-14 h-14 rounded-full bg-[#F0EFEC] flex items-center justify-center">
                  <ShoppingBag size={22} color="#C7C7CC" />
                </div>
                <p className="text-[14px]" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>沒有符合條件的商品</p>
              </div>
            ) : filtered.map((p, i) => {
              const { qty, isLow } = getStock(p)
              return (
                <div
                  key={p.id}
                  className="bg-white rounded-[14px] border border-[#F0EFEC] p-3.5 flex items-center gap-3"
                  style={{ animation: 'fade-up 0.3s cubic-bezier(0.25,1,0.5,1) both', animationDelay: `${Math.min(i * 40, 280)}ms` }}
                >
                  {/* 圖片 */}
                  <div className="w-14 h-14 rounded-[10px] bg-[#F7F6F3] overflow-hidden shrink-0">
                    {p.images?.[0] ? (
                      <Image src={p.images[0]} alt={p.name} width={56} height={56} className="w-full h-full object-cover" unoptimized />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag size={18} color="#D8D5D0" />
                      </div>
                    )}
                  </div>

                  {/* 資訊 */}
                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <p className="text-[13px] font-semibold leading-tight truncate" style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}>
                      {p.name}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[12px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#7C9070' }}>
                        NT$ {p.price.toLocaleString()}
                      </span>
                      <span className="text-[11px]" style={{ fontFamily: 'var(--font-jakarta)', color: isLow ? '#D4845E' : '#8E8E93', fontWeight: isLow ? 600 : 400 }}>
                        庫存 {qty}
                      </span>
                      <StatusBadge status={p.status} map={PRODUCT_STATUS_MAP} />
                    </div>
                    {p.category?.name && (
                      <p className="text-[11px]" style={{ fontFamily: 'var(--font-jakarta)', color: '#AEAAA4' }}>{p.category.name}</p>
                    )}
                  </div>

                  {/* 操作 — 44px touch targets */}
                  <div className="flex flex-col gap-1 shrink-0">
                    <Link
                      href={`/products/${p.id}/edit`}
                      className="w-11 h-11 flex items-center justify-center rounded-[10px] transition-colors active:scale-95"
                      style={{ background: '#7C907015' }}
                    >
                      <Pencil size={16} color="#7C9070" />
                    </Link>
                    <button
                      onClick={() => setDeleteTarget(p)}
                      className="w-11 h-11 flex items-center justify-center rounded-[10px] transition-colors active:scale-95"
                      style={{ background: '#FEF2F2' }}
                    >
                      <Trash2 size={16} color="#D4845E" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* ── Desktop 表格（md 以上） ─────────────────────────── */}
          <div className="hidden md:block overflow-x-auto rounded-[16px]" style={{ border: '1px solid #F0EFEC' }}>
            <div className="flex flex-col min-w-[600px]" style={{ background: '#FFFFFF' }}>
              {/* 表頭 */}
              <div className="flex items-center px-5 py-[10px]" style={{ background: '#FAFAF8' }}>
                <span className="w-[280px] text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>商品</span>
                <span className="w-[100px] text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>分類</span>
                <span className="w-[100px] text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>價格</span>
                <span className="w-[80px] text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>庫存</span>
                <span className="flex-1 text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>狀態</span>
                <span className="w-16" />
              </div>

              {filtered.map(product => {
                const { qty, isLow } = getStock(product)
                return (
                  <div
                    key={product.id}
                    className="flex items-center px-5 py-[10px] transition-colors duration-150 hover:bg-[#FAFAF8]"
                    style={{ borderTop: '1px solid #F0EFEC' }}
                  >
                    <div className="w-[280px] flex items-center gap-3">
                      <div className="relative shrink-0 overflow-hidden" style={{ width: 40, height: 40, borderRadius: 6 }}>
                        <Image src={product.images?.[0] ?? ''} alt={product.name} fill className="object-cover" unoptimized />
                      </div>
                      <div className="flex flex-col gap-[2px]">
                        <span className="text-[13px] font-semibold leading-tight" style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}>
                          {product.name}
                        </span>
                        <span className="text-[10px]" style={{ fontFamily: 'var(--font-space-mono)', color: '#8E8E93' }}>
                          {product.variants?.length ? `${product.variants.length} 種型號` : (product.inventory?.sku ?? '—')}
                        </span>
                      </div>
                    </div>
                    <span className="w-[100px] text-[12px]" style={{ fontFamily: 'var(--font-jakarta)', color: '#6B6B6B' }}>
                      {product.category?.name ?? '—'}
                    </span>
                    <span className="w-[100px] text-[12px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}>
                      NT$ {product.price.toLocaleString()}
                    </span>
                    <span className="w-[80px] text-[12px]" style={{ fontFamily: 'var(--font-jakarta)', color: isLow ? '#D4845E' : '#2D2D2D', fontWeight: isLow ? 600 : 400 }}>
                      {qty}
                    </span>
                    <div className="flex-1">
                      <StatusBadge status={product.status} map={PRODUCT_STATUS_MAP} />
                    </div>
                    <div className="flex items-center gap-1">
                      <Link href={`/products/${product.id}/edit`} className="w-8 h-8 flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity rounded-[6px] hover:bg-[#F0EFEC]">
                        <Pencil size={15} color="#8E8E93" />
                      </Link>
                      <button onClick={() => setDeleteTarget(product)} className="w-8 h-8 flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity rounded-[6px] hover:bg-[#FEF2F2]">
                        <Trash2 size={15} color="#D4845E" />
                      </button>
                    </div>
                  </div>
                )
              })}

              {filtered.length === 0 && (
                <div className="flex items-center justify-center py-16">
                  <span className="text-[14px]" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>沒有符合條件的商品</span>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── 刪除確認 Modal ───────────────────────────────────────────────── */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(2px)', animation: 'fade-in 0.18s ease both' }}
        >
          <div
            className="w-full md:max-w-[380px] max-h-[85dvh] overflow-y-auto flex flex-col gap-5 p-6"
            style={{
              background: '#FFFFFF',
              borderRadius: '20px 20px 0 0',
              borderTop: '1px solid #F0EFEC',
              animation: 'slide-up 0.28s cubic-bezier(0.34,1.3,0.64,1) both',
              paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <p className="text-[17px] font-semibold" style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2D2D' }}>確認刪除商品</p>
              <button onClick={() => setDeleteTarget(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F0EFEC] transition-colors">
                <X size={16} color="#8E8E93" />
              </button>
            </div>

            <p className="text-[14px] leading-relaxed" style={{ fontFamily: 'var(--font-jakarta)', color: '#6B6B6B' }}>
              確定要刪除「<strong style={{ color: '#2D2D2D' }}>{deleteTarget.name}</strong>」嗎？此操作無法復原。
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
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
