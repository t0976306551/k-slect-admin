export function SkeletonOrderTable({ rows = 6 }: { rows?: number }) {
  return (
    <div className="overflow-x-auto rounded-[16px]" style={{ border: '1px solid #F0EFEC' }}>
      <div className="flex flex-col min-w-[700px]" style={{ background: '#FFFFFF' }}>
        <div className="flex items-center px-5 py-[10px]" style={{ background: '#FAFAF8' }}>
          <div className="w-[160px] h-3 rounded bg-[#F0EFEC]" />
          <div className="w-[100px] h-3 rounded bg-[#F0EFEC] ml-1" />
          <div className="w-[160px] h-3 rounded bg-[#F0EFEC] ml-1" />
          <div className="w-[90px] h-3 rounded bg-[#F0EFEC] ml-1" />
          <div className="w-[80px] h-3 rounded bg-[#F0EFEC] ml-1" />
          <div className="w-[80px]" />
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="flex items-center px-5 py-[14px] animate-pulse"
            style={{ borderTop: '1px solid #F0EFEC', animationDelay: `${i * 40}ms` }}
          >
            <div className="w-[160px]"><div className="w-24 h-3 rounded bg-[#F0EFEC]" /></div>
            <div className="w-[100px]"><div className="w-16 h-3 rounded bg-[#F0EFEC]" /></div>
            <div className="w-[160px]"><div className="w-20 h-3 rounded bg-[#F0EFEC]" /></div>
            <div className="w-[90px]"><div className="w-14 h-5 rounded-full bg-[#F0EFEC]" /></div>
            <div className="w-[80px]"><div className="w-16 h-3 rounded bg-[#F0EFEC]" /></div>
            <div className="w-[80px] flex gap-2 justify-end">
              <div className="w-16 h-7 rounded-[8px] bg-[#F0EFEC]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function SkeletonTable({ rows = 6 }: { rows?: number }) {
  return (
    <div className="overflow-x-auto rounded-[16px]" style={{ border: '1px solid #F0EFEC' }}>
      <div className="flex flex-col min-w-[600px]" style={{ background: '#FFFFFF' }}>
        {/* Header */}
        <div className="flex items-center px-5 py-[10px]" style={{ background: '#FAFAF8' }}>
          <div className="w-[280px] h-3 rounded bg-[#F0EFEC]" />
          <div className="w-[100px] h-3 rounded bg-[#F0EFEC] ml-1" />
          <div className="w-[100px] h-3 rounded bg-[#F0EFEC] ml-1" />
          <div className="w-[80px] h-3 rounded bg-[#F0EFEC] ml-1" />
          <div className="flex-1 h-3 rounded bg-[#F0EFEC] ml-1" />
          <div className="w-16" />
        </div>

        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="flex items-center px-5 py-4 animate-pulse"
            style={{ borderTop: '1px solid #F0EFEC', animationDelay: `${i * 40}ms` }}
          >
            {/* Product column: image + text */}
            <div className="w-[280px] flex items-center gap-3">
              <div className="w-10 h-10 rounded-[8px] bg-[#F0EFEC] shrink-0" />
              <div className="flex flex-col gap-1.5">
                <div className="w-28 h-3 rounded bg-[#F0EFEC]" />
                <div className="w-16 h-2.5 rounded bg-[#F0EFEC]" />
              </div>
            </div>
            {/* Category */}
            <div className="w-[100px]">
              <div className="w-14 h-3 rounded bg-[#F0EFEC]" />
            </div>
            {/* Price */}
            <div className="w-[100px]">
              <div className="w-16 h-3 rounded bg-[#F0EFEC]" />
            </div>
            {/* Stock */}
            <div className="w-[80px]">
              <div className="w-8 h-3 rounded bg-[#F0EFEC]" />
            </div>
            {/* Status */}
            <div className="flex-1">
              <div className="w-12 h-5 rounded-full bg-[#F0EFEC]" />
            </div>
            {/* Actions */}
            <div className="w-16 flex gap-2 justify-end">
              <div className="w-6 h-6 rounded bg-[#F0EFEC]" />
              <div className="w-6 h-6 rounded bg-[#F0EFEC]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
