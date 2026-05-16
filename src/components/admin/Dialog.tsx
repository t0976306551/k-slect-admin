'use client'

import { useEffect, useState, useCallback } from 'react'
import { X } from 'lucide-react'

interface DialogProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  maxWidth?: number
}

export function Dialog({ open, onClose, title, children, maxWidth = 440 }: DialogProps) {
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (open) {
      const t = requestAnimationFrame(() => {
        setMounted(true)
        requestAnimationFrame(() => setVisible(true))
      })
      return () => cancelAnimationFrame(t)
    } else {
      const rafId = requestAnimationFrame(() => setVisible(false))
      const timeoutId = setTimeout(() => setMounted(false), 260)
      return () => {
        cancelAnimationFrame(rafId)
        clearTimeout(timeoutId)
      }
    }
  }, [open])

  const handleEsc = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleEsc)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = ''
    }
  }, [open, handleEsc])

  if (!mounted) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        backgroundColor: visible ? 'rgba(0,0,0,0.32)' : 'rgba(0,0,0,0)',
        backdropFilter: visible ? 'blur(2px)' : 'blur(0px)',
        transition: 'background-color 0.22s ease, backdrop-filter 0.22s ease',
      }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        style={{
          background: '#FFFFFF',
          borderRadius: 16,
          border: '1px solid #F0EFEC',
          boxShadow: '0 24px 64px rgba(0,0,0,0.13)',
          width: '100%',
          maxWidth,
          padding: '28px 28px 24px',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(14px) scale(0.97)',
          transition: visible
            ? 'opacity 0.24s ease-out, transform 0.28s cubic-bezier(0.34,1.3,0.64,1)'
            : 'opacity 0.18s ease-in, transform 0.18s ease-in',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <span
            style={{
              fontFamily: 'var(--font-fraunces)',
              fontSize: 17,
              fontWeight: 600,
              color: '#1A1A1A',
              letterSpacing: '-0.2px',
            }}
          >
            {title}
          </span>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 6,
              borderRadius: 8,
              color: '#9E9E9E',
              display: 'flex',
              alignItems: 'center',
              transition: 'background 0.15s ease, color 0.15s ease',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = '#F5F5F5'
              ;(e.currentTarget as HTMLButtonElement).style.color = '#1A1A1A'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'none'
              ;(e.currentTarget as HTMLButtonElement).style.color = '#9E9E9E'
            }}
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
