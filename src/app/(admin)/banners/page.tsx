'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Plus, Pencil, Trash2, GripVertical } from 'lucide-react'
import { fetchBanners } from '@/lib/api'
import type { Banner } from '@/types'

function StatusBadge({ status }: { status: string }) {
  if (status === 'active') {
    return (
      <span
        className="inline-flex items-center px-[8px] py-[3px] text-[11px] font-semibold rounded-[12px]"
        style={{ background: '#7C907025', color: '#7C9070' }}
      >
        顯示中
      </span>
    )
  }
  return (
    <span
      className="inline-flex items-center px-[8px] py-[3px] text-[11px] font-semibold rounded-[12px]"
      style={{ background: '#E5E4E1', color: '#8E8E93' }}
    >
      已隱藏
    </span>
  )
}

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])

  useEffect(() => {
    fetchBanners().then(r => { if (r.data) setBanners(r.data) })
  }, [])

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
          className="flex items-center gap-[6px] px-5 py-[10px] transition-opacity hover:opacity-80"
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
                <div className="w-8 flex items-center justify-center cursor-grab">
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
                  <StatusBadge status={banner.status} />
                </div>
                <div className="w-[100px] flex items-center gap-2">
                  <button className="flex items-center gap-1 px-2 py-[5px] rounded-[6px] hover:bg-gray-50 transition-colors" style={{ border: '1px solid #F0EFEC' }}>
                    <Pencil size={12} color="#616161" />
                  </button>
                  <button className="flex items-center gap-1 px-2 py-[5px] rounded-[6px] hover:bg-red-50 transition-colors" style={{ border: '1px solid #FFCDD2' }}>
                    <Trash2 size={12} color="#E53935" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
