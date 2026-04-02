'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, ChevronDown, Plus, Pencil, Trash2 } from 'lucide-react'
import { fetchProducts, deleteProduct } from '@/lib/api'
import type { Product } from '@/types'

function StatusBadge({ status }: { status: Product['status'] }) {
  if (status === 'active') {
    return (
      <span
        className="inline-flex items-center px-[8px] py-[3px] text-[11px] font-semibold rounded-[12px]"
        style={{ background: '#7C907025', color: '#7C9070' }}
      >
        上架中
      </span>
    )
  }
  return (
    <span
      className="inline-flex items-center px-[8px] py-[3px] text-[11px] font-semibold rounded-[12px]"
      style={{ background: '#E5E4E1', color: '#8E8E93' }}
    >
      已下架
    </span>
  )
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('全部分類')
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchProducts().then(r => { if (r.data) setProducts(r.data) })
  }, [])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    const res = await deleteProduct(deleteTarget.id)
    setDeleting(false)
    if (!res.error) {
      setProducts(prev => prev.filter(p => p.id !== deleteTarget.id))
    }
    setDeleteTarget(null)
  }

  const categories = ['全部分類', '美妝保養', '食品零食', '服飾配件', '生活家居']

  const filtered = products.filter(p => {
    const matchSearch = !search || p.name.includes(search) || (p.inventory?.sku ?? '').includes(search)
    const matchCat = categoryFilter === '全部分類' || p.category?.name === categoryFilter
    return matchSearch && matchCat
  })

  return (
    <div className="p-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1
          className="text-[28px] font-medium tracking-[-0.5px]"
          style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2D2D' }}
        >
          商品管理
        </h1>
        <Link
          href="/products/new"
          className="flex items-center gap-[6px] px-5 py-[10px] transition-opacity hover:opacity-80"
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
          新增商品
        </Link>
      </div>

      {/* 搜尋列 */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center gap-2 px-[14px] flex-1"
          style={{
            background: '#FFFFFF',
            borderRadius: 8,
            border: '1px solid #F0EFEC',
            height: 40,
          }}
        >
          <Search size={16} color="#8E8E93" className="shrink-0" />
          <input
            type="text"
            placeholder="搜尋商品名稱、SKU..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-[12px]"
            style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}
          />
        </div>
        <div className="relative">
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="appearance-none pl-4 pr-8 h-10 text-[12px] outline-none cursor-pointer"
            style={{
              background: '#FFFFFF',
              borderRadius: 8,
              border: '1px solid #F0EFEC',
              fontFamily: 'var(--font-jakarta)',
              color: '#2D2D2D',
            }}
          >
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <ChevronDown size={14} color="#8E8E93" className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* 商品表格 */}
      <div
        className="flex flex-col w-full overflow-hidden"
        style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #F0EFEC' }}
      >
        {/* 表頭 */}
        <div
          className="flex items-center px-5 py-[10px]"
          style={{ background: '#FAFAF8' }}
        >
          <span className="w-[280px] text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>商品</span>
          <span className="w-[100px] text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>分類</span>
          <span className="w-[100px] text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>價格</span>
          <span className="w-[80px] text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>庫存</span>
          <span className="flex-1 text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>狀態</span>
          <span className="w-16" />
        </div>

        {/* 商品列 */}
        {filtered.map(product => (
          <div
            key={product.id}
            className="flex items-center px-5 py-[10px]"
            style={{ borderTop: '1px solid #F0EFEC' }}
          >
            {/* 商品欄 */}
            <div className="w-[280px] flex items-center gap-3">
              <div
                className="relative shrink-0 overflow-hidden"
                style={{ width: 40, height: 40, borderRadius: 6 }}
              >
                <Image
                  src={product.images?.[0] ?? ''}
                  alt={product.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="flex flex-col gap-[2px]">
                <span
                  className="text-[13px] font-semibold leading-tight"
                  style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}
                >
                  {product.name}
                </span>
                <span
                  className="text-[10px]"
                  style={{ fontFamily: 'var(--font-space-mono)', color: '#8E8E93' }}
                >
                  {product.variants?.length
                    ? `${product.variants.length} 種型號`
                    : (product.inventory?.sku ?? '—')}
                </span>
              </div>
            </div>

            {/* 分類 */}
            <span
              className="w-[100px] text-[12px]"
              style={{ fontFamily: 'var(--font-jakarta)', color: '#6B6B6B' }}
            >
              {product.category?.name ?? '—'}
            </span>

            {/* 價格 */}
            <span
              className="w-[100px] text-[12px] font-semibold"
              style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}
            >
              NT$ {product.price.toLocaleString()}
            </span>

            {/* 庫存 */}
            {(() => {
              const hasVariants = (product.variants?.length ?? 0) > 0
              const totalQty = hasVariants
                ? product.variants!.reduce((sum, v) => sum + v.quantity, 0)
                : (product.inventory?.quantity ?? 0)
              const isLow = hasVariants
                ? product.variants!.some(v => v.quantity <= v.lowStockThreshold)
                : totalQty <= 5
              return (
                <span
                  className="w-[80px] text-[12px]"
                  style={{
                    fontFamily: 'var(--font-jakarta)',
                    color: isLow ? '#D4845E' : '#2D2D2D',
                    fontWeight: isLow ? 600 : 400,
                  }}
                >
                  {totalQty}
                </span>
              )
            })()}

            {/* 狀態 */}
            <div className="flex-1">
              <StatusBadge status={product.status} />
            </div>

            {/* 操作按鈕 */}
            <div className="flex items-center gap-1">
              <Link
                href={`/products/${product.id}/edit`}
                className="w-8 flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity"
              >
                <Pencil size={16} color="#8E8E93" />
              </Link>
              <button
                onClick={() => setDeleteTarget(product)}
                className="w-8 flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity"
              >
                <Trash2 size={16} color="#D4845E" />
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="flex items-center justify-center py-16">
            <span
              className="text-[14px]"
              style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}
            >
              沒有符合條件的商品
            </span>
          </div>
        )}
      </div>

      {/* 刪除確認 Modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.3)' }}
        >
          <div
            className="flex flex-col gap-5 p-6 w-[360px]"
            style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #F0EFEC' }}
          >
            <div className="flex flex-col gap-2">
              <p
                className="text-[16px] font-semibold"
                style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2D2D' }}
              >
                確認刪除商品
              </p>
              <p
                className="text-[13px]"
                style={{ fontFamily: 'var(--font-jakarta)', color: '#6B6B6B' }}
              >
                確定要刪除「{deleteTarget.name}」嗎？此操作無法復原。
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-5 py-[10px] text-[13px] font-medium rounded-[10px] transition-colors hover:bg-gray-50"
                style={{ border: '1px solid #F0EFEC', color: '#6B6B6B', fontFamily: 'var(--font-jakarta)' }}
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-5 py-[10px] text-[13px] font-semibold rounded-[10px] transition-opacity hover:opacity-80 disabled:opacity-50"
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
