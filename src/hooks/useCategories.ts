'use client'

import { useState, useEffect } from 'react'
import { fetchCategories } from '@/lib/api'
import type { Category } from '@/types'

/**
 * 載入所有分類（含子分類攤平），供表單下拉選單使用。
 */
export function useCategories(): Category[] {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    async function load() {
      const r = await fetchCategories()
      if (r.data) {
        const flat = r.data.flatMap(c => [c, ...(c.children ?? [])])
        setCategories(flat)
      }
    }
    load()
  }, [])

  return categories
}
