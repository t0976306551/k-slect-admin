import { useEffect } from 'react'

export function useBodyScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return

    const scrollY = window.scrollY
    const scrollX = window.scrollX

    // ⚠️ DO NOT set body.position = 'fixed' — it makes position:fixed children
    // use body as their containing block instead of the viewport.
    // Simple overflow:hidden is sufficient for an admin panel.
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'

    return () => {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
      // Restore scroll position (overflow:hidden preserves it in most browsers,
      // but some reset it on re-enable)
      window.scrollTo(scrollX, scrollY)
    }
  }, [active])
}
