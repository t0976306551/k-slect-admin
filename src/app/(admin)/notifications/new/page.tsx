'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import { createNotification } from '@/lib/api'
import { inputStyle } from '@/lib/styles'

export default function NewNotificationPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [type, setType] = useState<'promotion' | 'order' | 'system'>('promotion')
  const [targetAudience, setTargetAudience] = useState<'all' | 'members'>('all')
  const [status, setStatus] = useState<'draft' | 'sent' | 'scheduled'>('draft')
  const [scheduledAt, setScheduledAt] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!title || !content) return
    setLoading(true)
    try {
      const res = await createNotification({
        title,
        content,
        type,
        targetAudience,
        status,
        scheduledAt: status === 'scheduled' && scheduledAt ? scheduledAt : undefined,
      })
      if (res.error) return
      router.push('/notifications')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1
          className="text-[28px] font-medium tracking-[-0.5px]"
          style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2D2D' }}
        >
          新增推播通知
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="px-5 py-[10px] text-[13px] font-medium rounded-[10px] transition-colors hover:bg-gray-50"
            style={{ border: '1px solid #F0EFEC', color: '#6B6B6B', fontFamily: 'var(--font-jakarta)' }}
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !title || !content}
            className="px-5 py-[10px] text-[13px] font-semibold rounded-[10px] transition-all hover:opacity-80 active:scale-[0.96] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: '#7C9070', color: '#FFFFFF', fontFamily: 'var(--font-jakarta)' }}
          >
            {loading ? '送出中…' : '送出推播'}
          </button>
        </div>
      </div>

      <div className="max-w-2xl">
        <div
          className="flex flex-col gap-5 p-6"
          style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #F0EFEC' }}
        >
          <div className="flex flex-col gap-[6px]">
            <label className="text-[13px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}>標題</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="推播標題"
              className="admin-input"
              style={inputStyle}
            />
          </div>

          <div className="flex flex-col gap-[6px]">
            <label className="text-[13px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}>內容</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="推播內容"
              rows={4}
              className="admin-input resize-none"
              style={{
                ...inputStyle,
                height: 'auto',
                paddingTop: 10,
                paddingBottom: 10,
                resize: 'vertical',
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-[6px]">
              <label className="text-[13px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}>類型</label>
              <div className="relative">
                <select
                  value={type}
                  onChange={e => setType(e.target.value as typeof type)}
                  className="appearance-none w-full admin-input"
                  style={{ ...inputStyle, paddingRight: 32 }}
                >
                  <option value="promotion">促銷</option>
                  <option value="order">訂單</option>
                  <option value="system">系統</option>
                </select>
                <ChevronDown size={14} color="#8E8E93" className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            <div className="flex flex-col gap-[6px]">
              <label className="text-[13px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}>推播對象</label>
              <div className="relative">
                <select
                  value={targetAudience}
                  onChange={e => setTargetAudience(e.target.value as typeof targetAudience)}
                  className="appearance-none w-full admin-input"
                  style={{ ...inputStyle, paddingRight: 32 }}
                >
                  <option value="all">全部用戶</option>
                  <option value="members">會員</option>
                </select>
                <ChevronDown size={14} color="#8E8E93" className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-[6px]">
              <label className="text-[13px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}>狀態</label>
              <div className="relative">
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as typeof status)}
                  className="appearance-none w-full admin-input"
                  style={{ ...inputStyle, paddingRight: 32 }}
                >
                  <option value="draft">草稿</option>
                  <option value="sent">立即送出</option>
                  <option value="scheduled">排程</option>
                </select>
                <ChevronDown size={14} color="#8E8E93" className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            {status === 'scheduled' && (
              <div className="flex flex-col gap-[6px]">
                <label className="text-[13px] font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}>排程時間</label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={e => setScheduledAt(e.target.value)}
                  className="admin-input"
                  style={inputStyle}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
