import { Upload } from 'lucide-react'

interface ImageUploaderProps {
  readonly images: string[]
  readonly uploading: boolean
  readonly fileInputRef: React.RefObject<HTMLInputElement | null>
  readonly onTriggerUpload: () => void
  readonly onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  readonly onRemove: (index: number) => void
}

export function ImageUploader({
  images,
  uploading,
  fileInputRef,
  onTriggerUpload,
  onFileChange,
  onRemove,
}: ImageUploaderProps) {
  return (
    <div
      className="flex flex-col gap-4 p-5"
      style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #F0EFEC' }}
    >
      <h2
        className="text-[15px] font-semibold"
        style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2D2D' }}
      >
        商品圖片
      </h2>

      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((url, i) => (
            <div
              key={i}
              className="relative overflow-hidden"
              style={{ width: 80, height: 80, borderRadius: 8, border: '1px solid #F0EFEC' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`商品圖片 ${i + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
              >
                <span style={{ color: '#fff', fontSize: 10, lineHeight: 1 }}>✕</span>
              </button>
            </div>
          ))}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={onFileChange}
      />
      <div
        onClick={onTriggerUpload}
        className="flex flex-col items-center justify-center gap-2 transition-colors hover:bg-gray-50"
        style={{
          border: '2px dashed #F0EFEC',
          borderRadius: 12,
          padding: '32px 16px',
          cursor: uploading ? 'wait' : 'pointer',
        }}
      >
        <div
          className="flex items-center justify-center"
          style={{ width: 40, height: 40, borderRadius: 10, background: '#7C907015' }}
        >
          <Upload size={20} color="#7C9070" />
        </div>
        <span
          className="text-[13px] font-medium"
          style={{ fontFamily: 'var(--font-jakarta)', color: '#2D2D2D' }}
        >
          {uploading ? '上傳中...' : '點擊上傳圖片'}
        </span>
        <span
          className="text-[11px]"
          style={{ fontFamily: 'var(--font-jakarta)', color: '#8E8E93' }}
        >
          PNG, JPG 最大 5MB
        </span>
      </div>
    </div>
  )
}
