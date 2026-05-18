'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Send, Clock, FileText } from 'lucide-react'
import { fetchNotifications } from '@/lib/api'
import type { Notification } from '@/types'

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string; icon: typeof Send }> = {
    sent: { label: '已送出', bg: '#7C907025', color: '#7C9070', icon: Send },
    scheduled: { label: '已排程', bg: '#5B9BD515', color: '#5B9BD5', icon: Clock },
    draft: { label: '草稿', bg: '#E5E4E1', color: '#8E8E93', icon: FileText },
  }
  const s = map[status] ?? { label: status, bg: '#F5F5F5', color: '#9E9E9E', icon: FileText }
  const Icon = s.icon
  return (
    <span
      className="inline-flex items-center gap-1 px-[8px] py-[3px] text-[11px] font-semibold rounded-[12px]"
      style={{ background: s.bg, color: s.color }}
    >
      <Icon size={10} />
      {s.label}
    </span>
  )
}

function TypeBadge({ type }: { type: string }) {
  const map: Record<string, { label: string; color: string }> = {
    promotion: { label: '促銷', color: '#D4845E' },
    order: { label: '訂單', color: '#5B9BD5' },
    system: { label: '系統', color: '#8E8E93' },
  }
  const t = map[type] ?? { label: type, color: '#8E8E93' }
  return (
    <span
      className="text-[11px] font-medium px-[8px] py-[2px] rounded-[6px]"
      style={{ background: `${t.color}20`, color: t.color, fontFamily: 'var(--font-jakarta)' }}
    >
      {t.label}
    </span>
  )
}

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    async function load() {
      const r = await fetchNotifications()
      if (r.data) setNotifications(r.data)
    }
    load()
  }, [])

  return (
    <div className="p-8 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1
          className="text-[28px] font-medium tracking-[-0.5px]"
          style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2D2D' }}
        >
          通知推播
        </h1>
        <button
          onClick={() => router.push('/notifications/new')}
          className="flex items-center gap-[6px] px-5 py-[10px] transition-all hover:opacity-80 active:scale-[0.96]"
          style={{ background: '#7C9070', borderRadius: 10, fontSize: 13, fontWeight: 600, color: '#FFFFFF', fontFamily: 'var(--font-jakarta)' }}
        >
          <Plus size={16} color="#FFFFFF" />
          新增推播
        </button>
      </div>

      <div
        className="flex flex-col overflow-hidden"
        style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #F0EFEC' }}
      >
        <div className="flex items-center px-5 py-[10px]" style={{ background: '#FAFAF8' }}>
          <span className="w-[60px] text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>類型</span>
          <span className="w-[200px] text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>標題</span>
          <span className="flex-1 text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>內容</span>
          <span className="w-[100px] text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>對象</span>
          <span className="w-[80px] text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>狀態</span>
          <span className="w-[120px] text-[11px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}>時間</span>
        </div>

        {notifications.map(notif => (
          <div
            key={notif.id}
            className="flex items-center px-5 py-3"
            style={{ borderTop: '1px solid #F0EFEC' }}
          >
            <div className="w-[60px]">
              <TypeBadge type={notif.type} />
            </div>
            <span className="w-[200px] text-[13px] font-medium" style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}>{notif.title}</span>
            <span className="flex-1 text-[12px] line-clamp-1" style={{ fontFamily: 'var(--font-jakarta)', color: '#6B6B6B' }}>{notif.content}</span>
            <span className="w-[100px] text-[12px]" style={{ fontFamily: 'var(--font-jakarta)', color: '#6B6B6B' }}>
              {notif.targetAudience === 'all' ? '全部用戶' : '會員'}
            </span>
            <div className="w-[80px]">
              <StatusBadge status={notif.status} />
            </div>
            <span className="w-[120px] text-[11px]" style={{ fontFamily: 'var(--font-space-mono)', color: '#8E8E93' }}>
              {(notif.sentAt ?? notif.scheduledAt ?? notif.createdAt).slice(0, 10)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
