type ProductStatus = 'active' | 'inactive'

interface StatusPickerProps {
  readonly value: ProductStatus
  readonly onChange: (status: ProductStatus) => void
}

const STATUS_OPTIONS = [
  { value: 'active' as const, label: '立即上架' },
  { value: 'inactive' as const, label: '暫時下架' },
]

export function StatusPicker({ value, onChange }: StatusPickerProps) {
  return (
    <div
      className="flex flex-col gap-3 p-5"
      style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #F0EFEC' }}
    >
      <h2
        className="text-[15px] font-semibold"
        style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2D2D' }}
      >
        上架狀態
      </h2>
      <div className="flex flex-col gap-2">
        {STATUS_OPTIONS.map(option => {
          const isSelected = value === option.value
          return (
            <label key={option.value} className="flex items-center gap-3 cursor-pointer">
              <div
                className="flex items-center justify-center"
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  border: `2px solid ${isSelected ? '#7C9070' : '#D0D0D0'}`,
                  background: isSelected ? '#7C9070' : 'transparent',
                }}
                onClick={() => onChange(option.value)}
              >
                {isSelected && (
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#FFFFFF' }} />
                )}
              </div>
              <span
                className="text-[13px]"
                style={{
                  fontFamily: 'var(--font-jakarta)',
                  color: isSelected ? '#2D2D2D' : '#6B6B6B',
                  fontWeight: isSelected ? 600 : 400,
                }}
              >
                {option.label}
              </span>
            </label>
          )
        })}
      </div>
    </div>
  )
}
