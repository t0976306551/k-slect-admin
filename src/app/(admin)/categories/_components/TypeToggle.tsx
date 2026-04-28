'use client'

const OPTIONS = [
  { value: 'top', label: '頂層分類' },
  { value: 'sub', label: '子分類' },
] as const

export type CategoryType = 'top' | 'sub'

interface TypeToggleProps {
  value: CategoryType
  onChange: (v: CategoryType) => void
}

export function TypeToggle({ value, onChange }: TypeToggleProps) {
  return (
    <div
      style={{
        display: 'inline-flex',
        background: '#F5F5F4',
        borderRadius: 10,
        padding: 3,
        gap: 2,
      }}
    >
      {OPTIONS.map(o => {
        const isActive = value === o.value
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            style={{
              padding: '6px 18px',
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: isActive ? 600 : 400,
              fontFamily: 'var(--font-inter)',
              color: isActive ? '#1A1A1A' : '#8E8E93',
              background: isActive ? '#FFFFFF' : 'transparent',
              boxShadow: isActive ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.18s ease',
            }}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
