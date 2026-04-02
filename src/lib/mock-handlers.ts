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

export async function mockCreateProduct(data: {
  name: string
  description?: string
  price: number
  categoryId: string
  status?: 'active' | 'inactive'
  inventory?: { sku: string; quantity: number; lowStockThreshold?: number }
  options?: Array<{
    name: string
    position: number
    values: Array<{ value: string; position: number }>
  }>
  variants?: Array<{
    sku: string
    price?: number | null
    quantity: number
    lowStockThreshold: number
    status: 'active' | 'inactive'
    image?: string | null
    optionValues: string[]
  }>
}): Promise<ApiResponse<Product>> {
  const now = new Date().toISOString()
  const product: Product = {
    id: `prod-mock-${Date.now()}`,
    name: data.name,
    slug: data.name.toLowerCase().replace(/\s+/g, '-'),
    description: data.description ?? null,
    price: data.price,
    status: data.status ?? 'active',
    categoryId: data.categoryId,
    category: mockCategories
      .flatMap(c => [c, ...(c.children ?? [])])
      .find(c => c.id === data.categoryId)
      ? { id: data.categoryId, name: '', slug: '' }
      : undefined,
    inventory: data.inventory
      ? { sku: data.inventory.sku, quantity: data.inventory.quantity, lowStockThreshold: data.inventory.lowStockThreshold ?? 5 }
      : undefined,
    createdAt: now,
    updatedAt: now,
  }
  return { data: product, error: null }
}

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
  data: {
    status?: string
    paymentStatus?: string
  },
): Promise<ApiResponse<AdminOrder>> {
  const idx = mockOrders.findIndex(o => o.id === id)
  if (idx === -1) return { data: null, error: { code: 'NOT_FOUND', message: 'Order not found' } }
  mockOrders[idx] = { ...mockOrders[idx], ...data } as AdminOrder
  return { data: mockOrders[idx], error: null }
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

export async function mockUpdateProduct(
  id: string,
  data: Partial<{
    name: string
    description: string | null
    price: number
    originalPrice: number | null
    categoryId: string
    status: 'active' | 'inactive'
    inventory: { sku?: string; quantity?: number }
  }>,
): Promise<ApiResponse<Product>> {
  const idx = mockProducts.findIndex(p => p.id === id)
  if (idx === -1) return { data: null, error: { code: 'NOT_FOUND', message: 'Product not found' } }
  const { inventory, originalPrice, description, ...rest } = data
  const updated: Product = {
    ...mockProducts[idx],
    ...rest,
    ...(description !== undefined ? { description } : {}),
    ...(originalPrice !== undefined ? { originalPrice: originalPrice ?? undefined } : {}),
    inventory: inventory
      ? { ...mockProducts[idx].inventory!, ...inventory }
      : mockProducts[idx].inventory,
    updatedAt: new Date().toISOString(),
  }
  mockProducts[idx] = updated
  return { data: updated, error: null }
}

export async function mockDeleteProduct(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
  const idx = mockProducts.findIndex(p => p.id === id)
  if (idx === -1) return { data: null, error: { code: 'NOT_FOUND', message: 'Product not found' } }
  mockProducts.splice(idx, 1)
  return { data: { deleted: true }, error: null }
}
