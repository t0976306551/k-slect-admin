interface InfoRowProps {
  label: string
  value: string
  mono?: boolean
  valueColor?: string
}

export function InfoRow({ label, value, mono, valueColor }: InfoRowProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span
        className="text-[12px] shrink-0"
        style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}
      >
        {label}
      </span>
      <span
        className="text-[12px] text-right"
        style={{
          fontFamily: mono ? 'var(--font-space-mono)' : 'var(--font-jakarta)',
          color: valueColor ?? '#2D2D2D',
        }}
      >
        {value}
      </span>
    </div>
  )
}
