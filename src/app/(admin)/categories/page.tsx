'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, ChevronRight, FolderOpen, Folder, Plus, Pencil, Trash2 } from 'lucide-react'
import { fetchCategories } from '@/lib/api'
import type { Category } from '@/types'

function CategoryRow({
  category,
  isExpanded,
  onToggle,
  isTop,
}: {
  category: Category
  isExpanded: boolean
  onToggle: () => void
  isTop: boolean
}) {
  return (
    <div
      className="flex items-center h-12 px-5"
      style={{
        borderTop: '1px solid #F0EFEC',
        background: isTop ? '#FFFFFF' : '#FAFAFA',
        paddingLeft: isTop ? 20 : 44,
      }}
    >
      {/* 名稱欄 */}
      <div className="flex items-center gap-[6px]" style={{ width: 280 }}>
        {isTop && (category.children?.length ?? 0) > 0 ? (
          <button onClick={onToggle} className="shrink-0">
            {isExpanded
              ? <ChevronDown size={14} color="#9E9E9E" />
              : <ChevronRight size={14} color="#9E9E9E" />
            }
          </button>
        ) : (
          <span className="w-[14px] shrink-0" />
        )}
        {isTop
          ? <FolderOpen size={16} color="#D4845E" className="shrink-0" />
          : <Folder size={14} color="#9E9E9E" className="shrink-0" />
        }
        <span
          className="text-[14px] leading-none"
          style={{
            fontFamily: 'var(--font-inter)',
            fontWeight: isTop ? 600 : 400,
            color: '#1A1A1A',
          }}
        >
          {category.name}
        </span>
      </div>

      {/* 商品數量 */}
      <div className="w-[120px]">
        {isTop ? (
          <span
            className="inline-flex items-center px-[10px] py-[3px] text-[12px] font-semibold rounded-[20px]"
            style={{ background: '#7C907025', color: '#7C9070' }}
          >
            {category._count?.products ?? 0} 件
          </span>
        ) : (
          <span
            className="text-[13px]"
            style={{ fontFamily: 'var(--font-inter)', color: '#616161' }}
          >
            {category._count?.products ?? 0} 件
          </span>
        )}
      </div>

      {/* 上層分類 */}
      <div className="w-[160px]">
        <span
          className="text-[13px]"
          style={{ fontFamily: 'var(--font-inter)', color: isTop ? '#9E9E9E' : '#616161' }}
        >
          {isTop ? '頂層' : (category.parent?.name ?? '—')}
        </span>
      </div>

      {/* 排序 */}
      <div className="w-[80px]">
        <span
          className="text-[14px]"
          style={{ fontFamily: 'var(--font-inter)', color: isTop ? '#1A1A1A' : '#616161' }}
        >
          {'—'}
        </span>
      </div>

      {/* 操作 */}
      <div className="flex items-center gap-2 flex-1">
        <button
          className="flex items-center gap-[4px] px-3 py-[5px] rounded-[6px] transition-colors hover:bg-gray-50"
          style={{ border: '1px solid #F0EFEC' }}
        >
          <Pencil size={12} color="#616161" />
          <span
            className="text-[12px]"
            style={{ fontFamily: 'var(--font-inter)', color: '#616161' }}
          >
            編輯
          </span>
        </button>
        {isTop && (
          <button
            className="flex items-center gap-[4px] px-3 py-[5px] rounded-[6px] transition-colors hover:bg-red-50"
            style={{ border: '1px solid #FFCDD2' }}
          >
            <Trash2 size={12} color="#E53935" />
            <span
              className="text-[12px]"
              style={{ fontFamily: 'var(--font-inter)', color: '#E53935' }}
            >
              刪除
            </span>
          </button>
        )}
      </div>
    </div>
  )
}

function InlineAddRow({ categories, onCancel }: { categories: Category[]; onCancel: () => void }) {
  const [name, setName] = useState('')
  const [parent, setParent] = useState('')

  return (
    <div
      className="flex items-center gap-4 px-5 py-3"
      style={{
        background: '#F0F5F0',
        borderTop: '1px solid #F0EFEC',
        paddingLeft: 44,
      }}
    >
      <span
        className="text-[13px] shrink-0"
        style={{ fontFamily: 'var(--font-inter)', color: '#1A1A1A' }}
      >
        分類名稱：
      </span>
      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="輸入分類名稱"
        className="outline-none text-[13px] px-3"
        style={{
          background: '#FFFFFF',
          borderRadius: 8,
          border: '1px solid #F0EFEC',
          height: 36,
          width: 180,
          fontFamily: 'var(--font-inter)',
          color: '#1A1A1A',
        }}
      />
      <span
        className="text-[13px] shrink-0"
        style={{ fontFamily: 'var(--font-inter)', color: '#1A1A1A' }}
      >
        父分類：
      </span>
      <select
        value={parent}
        onChange={e => setParent(e.target.value)}
        className="outline-none text-[13px] px-3"
        style={{
          background: '#FFFFFF',
          borderRadius: 8,
          border: '1px solid #F0EFEC',
          height: 36,
          width: 140,
          fontFamily: 'var(--font-inter)',
          color: '#1A1A1A',
        }}
      >
        <option value="">選擇父分類</option>
        {categories.map(c => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
      <button
        className="px-[14px] py-[6px] text-[13px] font-medium text-white rounded-[8px]"
        style={{ background: '#7C9070', fontFamily: 'var(--font-inter)' }}
      >
        儲存
      </button>
      <button
        onClick={onCancel}
        className="px-[14px] py-[6px] text-[13px] font-medium rounded-[8px]"
        style={{
          border: '1px solid #F0EFEC',
          fontFamily: 'var(--font-inter)',
          color: '#616161',
        }}
      >
        取消
      </button>
    </div>
  )
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ 'cat-1': true })
  const [showAddRow, setShowAddRow] = useState(false)

  useEffect(() => {
    fetchCategories().then(r => { if (r.data) setCategories(r.data) })
  }, [])

  const toggleExpand = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="p-8 flex flex-col gap-5" style={{ fontFamily: 'var(--font-inter)' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1
            className="text-[22px] font-bold"
            style={{ color: '#1A1A1A' }}
          >
            商品分類管理
          </h1>
          <p className="text-[14px]" style={{ color: '#616161' }}>
            管理商品分類架構，設定父子分類關係
          </p>
        </div>
        <button
          onClick={() => setShowAddRow(true)}
          className="flex items-center gap-2 px-5 py-[10px] transition-opacity hover:opacity-80"
          style={{
            background: '#7C9070',
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 600,
            color: '#FFFFFF',
          }}
        >
          <Plus size={16} color="#FFFFFF" />
          新增分類
        </button>
      </div>

      {/* 分類表格 */}
      <div
        className="w-full overflow-hidden"
        style={{ background: '#FFFFFF', borderRadius: 12, border: '1px solid #F0EFEC' }}
      >
        {/* 表頭 */}
        <div
          className="flex items-center px-5 h-11"
          style={{ background: '#F5F5F5', borderBottom: '1px solid #F0EFEC' }}
        >
          <span className="w-[280px] text-[12px] font-semibold" style={{ color: '#616161' }}>分類名稱</span>
          <span className="w-[120px] text-[12px] font-semibold" style={{ color: '#616161' }}>商品數量</span>
          <span className="w-[160px] text-[12px] font-semibold" style={{ color: '#616161' }}>上層分類</span>
          <span className="w-[80px] text-[12px] font-semibold" style={{ color: '#616161' }}>排序</span>
          <span className="flex-1 text-[12px] font-semibold" style={{ color: '#616161' }}>操作</span>
        </div>

        {/* 分類資料 */}
        {categories.map(cat => (
          <div key={cat.id}>
            <CategoryRow
              category={cat}
              isExpanded={!!expanded[cat.id]}
              onToggle={() => toggleExpand(cat.id)}
              isTop
            />
            {expanded[cat.id] && cat.children?.map(child => (
              <div key={child.id}>
                <CategoryRow
                  category={child}
                  isExpanded={false}
                  onToggle={() => {}}
                  isTop={false}
                />
              </div>
            ))}
            {expanded[cat.id] && showAddRow && (
              <InlineAddRow categories={categories} onCancel={() => setShowAddRow(false)} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
