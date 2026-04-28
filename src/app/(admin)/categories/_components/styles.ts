import type { CSSProperties } from 'react'

/* ─── 共用 inline style 常數 ─── */

export const inputStyle: CSSProperties = {
  width: '100%',
  height: 40,
  padding: '0 12px',
  borderRadius: 8,
  border: '1px solid #F0EFEC',
  background: '#F7F6F3',
  fontFamily: 'var(--font-inter)',
  fontSize: 13,
  color: '#1A1A1A',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s ease',
}

export const cancelBtnStyle: CSSProperties = {
  padding: '9px 20px',
  borderRadius: 8,
  border: '1px solid #F0EFEC',
  background: 'transparent',
  fontSize: 13,
  fontWeight: 500,
  color: '#616161',
  fontFamily: 'var(--font-inter)',
  cursor: 'pointer',
  transition: 'background 0.15s ease',
}

export const primaryBtnStyle: CSSProperties = {
  padding: '9px 20px',
  borderRadius: 8,
  border: 'none',
  background: '#7C9070',
  fontSize: 13,
  fontWeight: 600,
  color: '#FFFFFF',
  fontFamily: 'var(--font-inter)',
  cursor: 'pointer',
  transition: 'opacity 0.15s ease',
}

export const dangerBtnStyle: CSSProperties = {
  ...primaryBtnStyle,
  background: '#E53935',
}

/** 通用 hover handlers：背景切換 */
export function hoverBg(enter: string, leave: string) {
  return {
    onMouseEnter: (e: React.MouseEvent<HTMLButtonElement>) => {
      e.currentTarget.style.background = enter
    },
    onMouseLeave: (e: React.MouseEvent<HTMLButtonElement>) => {
      e.currentTarget.style.background = leave
    },
  } as const
}

/** 通用 hover handlers：opacity 切換 */
export function hoverOpacity(enter: string, leave: string) {
  return {
    onMouseEnter: (e: React.MouseEvent<HTMLButtonElement>) => {
      e.currentTarget.style.opacity = enter
    },
    onMouseLeave: (e: React.MouseEvent<HTMLButtonElement>) => {
      e.currentTarget.style.opacity = leave
    },
  } as const
}
