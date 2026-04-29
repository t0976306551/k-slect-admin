interface PageHeaderProps {
  readonly title: string
  readonly saving: boolean
  readonly saveLabel?: string
  readonly onCancel: () => void
  readonly onSave: () => void
}

export function PageHeader({ title, saving, saveLabel = '儲存', onCancel, onSave }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h1
        className="text-[28px] font-medium tracking-[-0.5px]"
        style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2D2D' }}
      >
        {title}
      </h1>
      <div className="flex items-center gap-3">
        <button
          onClick={onCancel}
          className="px-5 py-[10px] text-[13px] font-medium rounded-[10px] transition-colors hover:bg-gray-50"
          style={{ border: '1px solid #F0EFEC', color: '#6B6B6B', fontFamily: 'var(--font-jakarta)' }}
        >
          取消
        </button>
        <button
          onClick={onSave}
          disabled={saving}
          className="px-5 py-[10px] text-[13px] font-semibold rounded-[10px] transition-opacity hover:opacity-80 disabled:opacity-50"
          style={{ background: '#7C9070', color: '#FFFFFF', fontFamily: 'var(--font-jakarta)' }}
        >
          {saving ? '儲存中...' : saveLabel}
        </button>
      </div>
    </div>
  )
}
