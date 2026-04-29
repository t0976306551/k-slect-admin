'use client'

import { useState, useRef, useCallback } from 'react'
import { uploadFile } from '@/lib/api'

interface UseImageUploadReturn {
  readonly images: string[]
  readonly uploading: boolean
  readonly fileInputRef: React.RefObject<HTMLInputElement | null>
  setImages: React.Dispatch<React.SetStateAction<string[]>>
  triggerUpload: () => void
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  removeImage: (index: number) => void
}

/**
 * 商品圖片上傳邏輯。
 * 處理檔案選取、上傳、移除，以及後端 URL 轉換。
 */
export function useImageUpload(initialImages: string[] = []): UseImageUploadReturn {
  const [images, setImages] = useState<string[]>(initialImages)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const triggerUpload = useCallback(() => {
    if (!uploading) {
      fileInputRef.current?.click()
    }
  }, [uploading])

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const res = await uploadFile(file)
      if (res.data) {
        const backendBase = (process.env.NEXT_PUBLIC_ADMIN_API_URL ?? '').replace('/api', '')
        const imageUrl = backendBase && res.data.url.startsWith(backendBase)
          ? res.data.url.slice(backendBase.length)
          : res.data.url
        setImages(prev => [...prev, imageUrl])
      }
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }, [])

  const removeImage = useCallback((index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }, [])

  return {
    images,
    uploading,
    fileInputRef,
    setImages,
    triggerUpload,
    handleFileChange,
    removeImage,
  }
}
