import type {
  ApiResponse,
  Product,
  Category,
  AdminOrder,
  Member,
  Discount,
  RefundRequest,
  Banner,
  Notification,
} from '../types'
import {
  mockProducts,
  mockCategories,
  mockOrders,
  mockMembers,
  mockDiscounts,
  mockRefunds,
  mockBanners,
  mockNotifications,
  mockDashboardStats,
} from './mock-data'

export async function mockFetchProducts(params?: {
  categoryId?: string
  q?: string
  status?: string
}): Promise<ApiResponse<Product[]>> {
  let results = [...mockProducts]
  if (params?.categoryId) results = results.filter(p => p.categoryId === params.categoryId)
  if (params?.q) results = results.filter(p => p.name.includes(params.q!) || (p.inventory?.sku ?? '').includes(params.q!))
  if (params?.status) results = results.filter(p => p.status === (params.status as Product['status']))
  return { data: results, error: null }
}

export async function mockFetchProduct(id: string): Promise<ApiResponse<Product>> {
  const product = mockProducts.find(p => p.id === id)
  if (!product) return { data: null, error: { code: 'NOT_FOUND', message: 'Product not found' } }
  return { data: product, error: null }
}

export async function mockFetchCategories(): Promise<ApiResponse<Category[]>> {
  return { data: mockCategories, error: null }
}

export async function mockFetchOrders(params?: {
  status?: string
  page?: number
  limit?: number
}): Promise<ApiResponse<{ orders: AdminOrder[]; total: number }>> {
  let results = [...mockOrders]
  if (params?.status) results = results.filter(o => o.status === params.status)
  const total = results.length
  if (params?.limit) results = results.slice(0, params.limit)
  return { data: { orders: results, total }, error: null }
}

export async function mockFetchOrder(id: string): Promise<ApiResponse<AdminOrder>> {
  const order = mockOrders.find(o => o.id === id)
  if (!order) return { data: null, error: { code: 'NOT_FOUND', message: 'Order not found' } }
  return { data: order, error: null }
}

export async function mockUpdateOrder(
  id: string,
  data: { status?: string; trackingNo?: string },
): Promise<ApiResponse<AdminOrder>> {
  const order = mockOrders.find(o => o.id === id)
  if (!order) return { data: null, error: { code: 'NOT_FOUND', message: 'Order not found' } }
  return { data: { ...order, ...data } as AdminOrder, error: null }
}

export async function mockFetchMembers(): Promise<ApiResponse<Member[]>> {
  return { data: mockMembers, error: null }
}

export async function mockFetchDiscounts(): Promise<ApiResponse<Discount[]>> {
  return { data: mockDiscounts, error: null }
}

export async function mockFetchRefunds(): Promise<ApiResponse<RefundRequest[]>> {
  return { data: mockRefunds, error: null }
}

export async function mockFetchBanners(): Promise<ApiResponse<Banner[]>> {
  return { data: mockBanners, error: null }
}

export async function mockFetchNotifications(): Promise<ApiResponse<Notification[]>> {
  return { data: mockNotifications, error: null }
}

export async function mockFetchDashboardStats(): Promise<ApiResponse<typeof mockDashboardStats>> {
  return { data: mockDashboardStats, error: null }
}
