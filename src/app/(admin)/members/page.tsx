'use client'

import { useState, useEffect } from 'react'
import { fetchMembers } from '@/lib/api'
import { StatusBadge, MEMBER_STATUS_MAP } from '@/components/admin/StatusBadge'
import type { Member } from '@/types'

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([])

  useEffect(() => {
    async function load() {
      const r = await fetchMembers()
      if (r.data) setMembers(r.data)
    }
    load()
  }, [])

  return (
    <div className="p-8 flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h1
          className="text-[28px] font-medium tracking-[-0.5px]"
          style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2D2D' }}
        >
          會員管理
        </h1>
      </div>

      <div
        className="flex flex-col overflow-hidden"
        style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #F0EFEC' }}
      >
        <div className="overflow-x-auto">
          <div className="min-w-[860px]">
            <div className="flex items-center px-5 py-[10px]" style={{ background: '#FAFAF8' }}>
              <span className="w-[140px] text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>姓名</span>
              <span className="w-[200px] text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>Email</span>
              <span className="w-[140px] text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>電話</span>
              <span className="w-[90px] text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>訂單數</span>
              <span className="w-[110px] text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>消費總額</span>
              <span className="w-[80px] text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>狀態</span>
              <span className="flex-1 text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>加入日期</span>
            </div>

            {members.map(member => (
              <div
                key={member.id}
                className="flex items-center px-5 py-3"
                style={{ borderTop: '1px solid #F0EFEC' }}
              >
                <span className="w-[140px] text-[13px] font-medium" style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}>{member.name}</span>
                <span className="w-[200px] text-[12px]" style={{ fontFamily: 'var(--font-jakarta)', color: '#6B6B6B' }}>{member.email}</span>
                <span className="w-[140px] text-[12px]" style={{ fontFamily: 'var(--font-jakarta)', color: '#6B6B6B' }}>{member.phone}</span>
                <span className="w-[90px] text-[12px] font-medium" style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}>{member.totalOrders}</span>
                <span className="w-[110px] text-[12px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#7C9070' }}>NT$ {member.totalSpent.toLocaleString()}</span>
                <div className="w-[80px]">
                  <StatusBadge status={member.status} map={MEMBER_STATUS_MAP} />
                </div>
                <span className="flex-1 text-[12px]" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>
                  {new Date(member.createdAt).toLocaleDateString('zh-TW')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
