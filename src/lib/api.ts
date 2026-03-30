import type { ApiResponse, Product, AdminOrder, Category, Inventory, Promotion, Member, Discount, RefundRequest, Banner, Notification } from '../types'
import {
  mockFetchProducts,
  mockFetchProduct,
  mockFetchCategories,
  mockFetchOrders,
  mockFetchOrder,
  mockUpdateOrder,
  mockFetchMembers,
  mockFetchDiscounts,
  mockFetchRefunds,
  mockFetchBanners,
  mockFetchNotifications,
  mockFetchDashboardStats,
} from './mock-handlers'
import { mockDashboardStats } from './mock-data'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'
const API_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL ?? ''

async function request<T>(
  path: string,
  init?: RequestInit,
): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })
  return res.json() as Promise<ApiResponse<T>>
}

// --- Products ---
export async function fetchProducts(params?: {
  categoryId?: string
  q?: string
  status?: string
}): Promise<ApiResponse<Product[]>> {
  if (USE_MOCK) return mockFetchProducts(params)
  const query = new URLSearchParams()
  if (params?.categoryId) query.set('categoryId', params.categoryId)
  if (params?.q) query.set('q', params.q)
  if (params?.status) query.set('status', params.status)
  const qs = query.toString()
  return request(`/products${qs ? `?${qs}` : ''}`)
}

export async function fetchProduct(id: string): Promise<ApiResponse<Product>> {
  if (USE_MOCK) return mockFetchProduct(id)
  return request(`/products/${id}`)
}

export async function createProduct(data: {
  name: string
  description?: string
  price: number
  categoryId: string
  status?: 'active' | 'inactive'
  inventory?: { sku: string; quantity: number; lowStockThreshold?: number }
}): Promise<ApiResponse<Product>> {
  return request('/products', { method: 'POST', body: JSON.stringify(data) })
}

export async function updateProduct(
  id: string,
  data: Partial<{
    name: string
    description: string
    price: number
    categoryId: string
    status: 'active' | 'inactive'
  }>,
): Promise<ApiResponse<Product>> {
  return request(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
}

export async function deleteProduct(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
  return request(`/products/${id}`, { method: 'DELETE' })
}

// --- Categories ---
export async function fetchCategories(): Promise<ApiResponse<Category[]>> {
  if (USE_MOCK) return mockFetchCategories()
  return request('/categories')
}

// --- Orders ---
export async function fetchOrders(params?: {
  status?: string
  page?: number
  limit?: number
}): Promise<ApiResponse<{ orders: AdminOrder[]; total: number }>> {
  if (USE_MOCK) return mockFetchOrders(params)
  const query = new URLSearchParams()
  if (params?.status) query.set('status', params.status)
  if (params?.page) query.set('page', String(params.page))
  if (params?.limit) query.set('limit', String(params.limit))
  const qs = query.toString()
  return request(`/orders${qs ? `?${qs}` : ''}`)
}

export async function fetchOrder(id: string): Promise<ApiResponse<AdminOrder>> {
  if (USE_MOCK) return mockFetchOrder(id)
  return request(`/orders/${id}`)
}

export async function updateOrder(
  id: string,
  data: { status?: string; trackingNo?: string },
): Promise<ApiResponse<AdminOrder>> {
  if (USE_MOCK) return mockUpdateOrder(id, data)
  return request(`/orders/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
}

// --- Inventory ---
export async function fetchInventory(params?: {
  lowStock?: boolean
}): Promise<ApiResponse<Inventory[]>> {
  const query = new URLSearchParams()
  if (params?.lowStock) query.set('lowStock', 'true')
  const qs = query.toString()
  return request(`/inventory${qs ? `?${qs}` : ''}`)
}

// --- Promotions ---
export async function fetchPromotions(params?: {
  channel?: string
  status?: string
}): Promise<ApiResponse<{ promotions: Promotion[]; total: number }>> {
  const query = new URLSearchParams()
  if (params?.channel) query.set('channel', params.channel)
  if (params?.status) query.set('status', params.status)
  const qs = query.toString()
  return request(`/promotions${qs ? `?${qs}` : ''}`)
}

// --- Members ---
export async function fetchMembers(): Promise<ApiResponse<Member[]>> {
  if (USE_MOCK) return mockFetchMembers()
  return request('/members')
}

// --- Discounts ---
export async function fetchDiscounts(): Promise<ApiResponse<Discount[]>> {
  if (USE_MOCK) return mockFetchDiscounts()
  return request('/discounts')
}

// --- Refunds ---
export async function fetchRefunds(): Promise<ApiResponse<RefundRequest[]>> {
  if (USE_MOCK) return mockFetchRefunds()
  return request('/refunds')
}

// --- Banners ---
export async function fetchBanners(): Promise<ApiResponse<Banner[]>> {
  if (USE_MOCK) return mockFetchBanners()
  return request('/banners')
}

// --- Notifications ---
export async function fetchNotifications(): Promise<ApiResponse<Notification[]>> {
  if (USE_MOCK) return mockFetchNotifications()
  return request('/notifications')
}

// --- Dashboard ---
export async function fetchDashboardStats(): Promise<ApiResponse<typeof mockDashboardStats>> {
  if (USE_MOCK) return mockFetchDashboardStats()
  return request('/dashboard/stats')
}
