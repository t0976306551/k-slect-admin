/**
 * 響應式表格容器 wrapper
 * - 小螢幕：水平滾動
 * - 大螢幕：正常顯示
 */
export function ResponsiveTable({
  children,
  minWidth = '600px',
  className = '',
  style,
}: {
  children: React.ReactNode
  minWidth?: string
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <div className={`overflow-x-auto rounded-[16px] ${className}`} style={style}>
      <div style={{ minWidth }}>
        {children}
      </div>
    </div>
  )
}
