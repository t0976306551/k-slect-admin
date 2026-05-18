'use client'

import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import { Toast, type ToastType } from '@/components/admin/Toast'

type ToastState = { message: string; type: ToastType }

const ToastContext = createContext<{
  showToast: (message: string, type?: ToastType) => void
} | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    clearTimeout(timerRef.current)
    setToast(null)
    // Tiny delay so re-triggering the same message still re-mounts Toast
    timerRef.current = setTimeout(() => setToast({ message, type }), 20)
  }, [])

  useEffect(() => () => clearTimeout(timerRef.current), [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
