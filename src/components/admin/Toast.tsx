'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, X } from 'lucide-react'

export type ToastType = 'success' | 'error'

interface ToastProps {
  message: string
  type?: ToastType
  duration?: number
  onClose: () => void
}

export function Toast({ message, type = 'success', duration = 3000, onClose }: ToastProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Trigger enter animation
    const enterTimer = setTimeout(() => setVisible(true), 10)
    // Auto-dismiss
    const exitTimer = setTimeout(() => {
      setVisible(false)
      setTimeout(onClose, 300)
    }, duration)
    return () => { clearTimeout(enterTimer); clearTimeout(exitTimer) }
  }, [duration, onClose])

  const isSuccess = type === 'success'

  return (
    <div
      style={{
        position: 'fixed',
        top: 24,
        right: 24,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '12px 16px',
        borderRadius: 12,
        background: '#FFFFFF',
        border: `1px solid ${isSuccess ? '#C8D4C2' : '#F4C5B4'}`,
        boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
        fontFamily: 'var(--font-jakarta)',
        fontSize: 13,
        color: '#2D2D2D',
        maxWidth: 320,
        transform: visible ? 'translateX(0)' : 'translateX(calc(100% + 24px))',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease',
      }}
    >
      {isSuccess
        ? <CheckCircle size={18} color="#7C9070" style={{ flexShrink: 0 }} />
        : <XCircle size={18} color="#D4845E" style={{ flexShrink: 0 }} />
      }
      <span style={{ flex: 1, fontWeight: 500 }}>{message}</span>
      <button
        onClick={() => { setVisible(false); setTimeout(onClose, 300) }}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, flexShrink: 0 }}
      >
        <X size={14} color="#8E8E93" />
      </button>
    </div>
  )
}
