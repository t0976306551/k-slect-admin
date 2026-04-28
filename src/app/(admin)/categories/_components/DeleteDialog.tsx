'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Dialog } from '@/components/admin/Dialog'
import { cancelBtnStyle, dangerBtnStyle, hoverBg } from './styles'

interface DeleteDialogProps {
  open: boolean
  onClose: () => void
  categoryName: string
  onConfirm: () => Promise<void>
}

export function DeleteDialog({ open, onClose, categoryName, onConfirm }: DeleteDialogProps) {
  const [deleting, setDeleting] = useState(false)

  async function handleConfirm(): Promise<void> {
    setDeleting(true)
    await onConfirm()
    setDeleting(false)
  }

  return (
    <Dialog open={open} onClose={onClose} title="刪除分類" maxWidth={380}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: '#FFF0EE', display: 'flex',
            alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <AlertTriangle size={18} color="#D4845E" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A', fontFamily: 'var(--font-inter)' }}>
              確認刪除「{categoryName}」？
            </span>
            <span style={{ fontSize: 13, color: '#8E8E93', fontFamily: 'var(--font-inter)', lineHeight: 1.5 }}>
              此操作無法復原。若分類下有商品或子分類，將無法刪除。
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={cancelBtnStyle} {...hoverBg('#F5F5F5', 'transparent')}>
            取消
          </button>
          <button
            onClick={handleConfirm}
            disabled={deleting}
            style={{
              ...dangerBtnStyle,
              cursor: deleting ? 'not-allowed' : 'pointer',
              opacity: deleting ? 0.6 : 1,
            }}
          >
            {deleting ? '刪除中…' : '確認刪除'}
          </button>
        </div>
      </div>
    </Dialog>
  )
}
