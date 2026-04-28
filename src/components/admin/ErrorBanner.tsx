interface ErrorBannerProps {
  readonly message: string
}

export function ErrorBanner({ message }: ErrorBannerProps) {
  return (
    <div
      className="px-4 py-3 text-[13px] rounded-[10px]"
      style={{
        background: '#FFF0EE',
        color: '#D4845E',
        fontFamily: 'var(--font-jakarta)',
        border: '1px solid #F4C5B4',
      }}
    >
      {message}
    </div>
  )
}
