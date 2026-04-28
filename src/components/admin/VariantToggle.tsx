import { ToggleLeft, ToggleRight } from 'lucide-react'

interface VariantToggleProps {
  readonly enabled: boolean
  readonly onToggle: () => void
}

export function VariantToggle({ enabled, onToggle }: VariantToggleProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p
          className="text-[14px] font-semibold"
          style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}
        >
          商品型號
        </p>
        <p
          className="text-[12px] mt-0.5"
          style={{ fontFamily: 'var(--font-jakarta)', color: '#6B6B6B' }}
        >
          啟用後可設定顏色、尺寸等規格，每個規格獨立管理庫存
        </p>
      </div>
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center gap-1.5 text-[13px] font-medium transition-opacity hover:opacity-70"
        style={{ fontFamily: 'var(--font-jakarta)', color: enabled ? '#7C9070' : '#8E8E93' }}
      >
        {enabled
          ? <ToggleRight size={28} strokeWidth={1.5} />
          : <ToggleLeft size={28} strokeWidth={1.5} />}
        {enabled ? '已啟用' : '未啟用'}
      </button>
    </div>
  )
}
