import type { ApiResponse, Product, AdminOrder, Category, Inventory, Promotion, Member, Discount, RefundRequest, Banner, Notification, Role, Setting } from '../types'
import {
  mockCreateProduct,
  mockFetchProducts,
  mockFetchProduct,
  mockFetchCategories,
  mockFetchOrders,
  mockFetchOrder,
  mockUpdateOrder,
  mockUpdateProduct,
  mockDeleteProduct,
  mockFetchMembers,
  mockFetchDiscounts,
  mockCreateDiscount,
  mockFetchRefunds,
  mockFetchNotifications,
  mockCreateNotification,
  mockFetchDashboardStats,
  mockCreateCategory,
} from './mock-handlers'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'
const API_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL ?? ''

/** 從非 httpOnly cookie `admin_jwt` 讀取後端 JWT（client-side only） */
function getAuthToken(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(/(?:^|;\s*)admin_jwt=([^;]*)/)
  return match ? decodeURIComponent(match[1]) : null
}

async function request<T>(
  path: string,
  init?: RequestInit,
): Promise<ApiResponse<T>> {
  const token = getAuthToken()
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      try {
        await fetch('/api/auth/logout', { method: 'POST' })
      } catch (err) {
        console.error('登出請求失敗', err)
      }
      window.location.href = '/login'
    }
    return { data: null, error: { code: 'UNAUTHORIZED', message: '登入已過期，請重新登入' } }
  }
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
  const res = await request<{ products: Product[]; total: number }>(`/products${qs ? `?${qs}` : ''}`)
  if (res.error) return { data: null, error: res.error }
  return { data: res.data?.products ?? [], error: null }
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
  images?: string[]
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
    optionValueIndices: number[]
  }>
}): Promise<ApiResponse<Product>> {
  if (USE_MOCK) return mockCreateProduct(data)
  return request('/products', { method: 'POST', body: JSON.stringify(data) })
}

export async function updateProduct(
  id: string,
  data: Partial<{
    name: string
    description: string | null
    price: number
    originalPrice: number | null
    categoryId: string
    status: 'active' | 'inactive'
    images: string[] | null
    // 切換為無型號：傳 inventory → 後端清除 variants/options，建立 inventory
    inventory: { sku: string; quantity: number; lowStockThreshold?: number }
    // 切換為有型號：傳 options + variants（無 id）→ 後端重建
    options: Array<{
      name: string
      position: number
      values: Array<{ value: string; position: number }>
    }>
    variants: Array<{
      id?: string          // 有 id = 更新既有；無 id = 新建（搭配 options）
      sku: string
      price?: number | null
      quantity?: number
      lowStockThreshold?: number
      status?: 'active' | 'inactive'
      optionValueIndices?: number[]
    }>
  }>,
): Promise<ApiResponse<Product>> {
  if (USE_MOCK) return mockUpdateProduct(id, data)
  return request(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
}

export async function deleteProduct(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
  if (USE_MOCK) return mockDeleteProduct(id)
  return request(`/products/${id}`, { method: 'DELETE' })
}

// --- Categories ---
export async function fetchCategories(): Promise<ApiResponse<Category[]>> {
  if (USE_MOCK) return mockFetchCategories()
  return request('/categories')
}

export async function createCategory(data: {
  name: string
  parentId?: string
}): Promise<ApiResponse<Category>> {
  if (USE_MOCK) return mockCreateCategory(data)
  return request('/categories', { method: 'POST', body: JSON.stringify(data) })
}

export async function updateCategory(
  id: string,
  data: Partial<{ name: string; parentId: string | null }>,
): Promise<ApiResponse<Category>> {
  return request(`/categories/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
}

export async function deleteCategory(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
  return request(`/categories/${id}`, { method: 'DELETE' })
}

// --- Orders ---
export async function fetchOrders(params?: {
  status?: string
  page?: number
  limit?: number
}): Promise<ApiResponse<{ orders: AdminOrder[]; total: number; page: number; limit: number }>> {
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
  data: {
    status?: string
    paymentStatus?: string
  },
): Promise<ApiResponse<AdminOrder>> {
  if (USE_MOCK) return mockUpdateOrder(id, data)
  return request(`/orders/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
}

export async function editOrder(
  id: string,
  data: {
    customerName?: string
    customerPhone?: string
    customerEmail?: string
    shippingMethod?: 'home_delivery' | 'cvs_pickup'
    shippingAddress?: string
    cvsStoreName?: string
    cvsStoreAddress?: string
    shippingFee?: number
    paymentMethod?: 'seller_ship' | 'bank_transfer'
    paymentStatus?: 'pending' | 'paid' | 'failed'
    trackingNo?: string
    depositPaid?: boolean
    depositAmount?: number
    note?: string
    status?: string
  },
): Promise<ApiResponse<AdminOrder>> {
  return request(`/orders/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
}

export async function createOrder(data: {
  customerId?: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  shippingAddress?: string
  shippingMethod?: 'home_delivery' | 'cvs_pickup'
  shippingProvider?: string
  cvsStoreName?: string
  cvsStoreAddress?: string
  shippingFee?: number
  paymentMethod: 'seller_ship' | 'bank_transfer'
  paymentStatus: 'pending' | 'paid' | 'failed'
  depositPaid?: boolean
  depositAmount?: number
  items: Array<{
    productId?: string
    productName: string
    sku?: string
    quantity: number
    priceAtOrder: number
    image?: string
    variantSnapshot?: Record<string, string>
  }>
  note?: string
}): Promise<ApiResponse<AdminOrder>> {
  return request('/orders', { method: 'POST', body: JSON.stringify(data) })
}

export async function deleteOrder(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
  return request(`/orders/${id}`, { method: 'DELETE' })
}

export async function searchCustomers(q: string): Promise<ApiResponse<import('../types').Customer[]>> {
  return request(`/members?q=${encodeURIComponent(q)}`)
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

export async function createDiscount(data: {
  name: string
  code: string
  type: 'percentage' | 'fixed'
  value: number
  minAmount?: number
  usageLimit?: number
  startDate: string
  endDate: string
}): Promise<ApiResponse<Discount>> {
  if (USE_MOCK) return mockCreateDiscount(data)
  return request('/discounts', { method: 'POST', body: JSON.stringify(data) })
}

export async function updateDiscount(
  id: string,
  data: Partial<{
    name: string
    code: string
    type: 'percentage' | 'fixed'
    value: number
    minAmount: number
    usageLimit: number
    startDate: string
    endDate: string
    status: 'active' | 'inactive' | 'expired'
  }>,
): Promise<ApiResponse<Discount>> {
  return request(`/discounts/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
}

export async function deleteDiscount(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
  return request(`/discounts/${id}`, { method: 'DELETE' })
}

// --- Refunds ---
export async function fetchRefunds(): Promise<ApiResponse<RefundRequest[]>> {
  if (USE_MOCK) return mockFetchRefunds()
  return request('/refunds')
}

export async function updateRefund(
  id: string,
  data: { status: 'approved' | 'rejected' | 'completed'; note?: string },
): Promise<ApiResponse<RefundRequest>> {
  return request(`/refunds/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
}

// --- Banners ---
export async function fetchBanners(): Promise<ApiResponse<Banner[]>> {
  return request('/banners')
}

export async function createBanner(data: {
  title: string
  imageUrl: string
  linkUrl?: string
  sort?: number
  status?: 'active' | 'inactive'
  startDate?: string
  endDate?: string
}): Promise<ApiResponse<Banner>> {
  return request('/banners', { method: 'POST', body: JSON.stringify(data) })
}

export async function updateBanner(
  id: string,
  data: Partial<{
    title: string
    imageUrl: string
    linkUrl: string
    sort: number
    status: 'active' | 'inactive'
    startDate: string
    endDate: string
  }>,
): Promise<ApiResponse<Banner>> {
  return request(`/banners/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
}

export async function reorderBanners(
  items: Array<{ id: string; sort: number }>,
): Promise<ApiResponse<{ reordered: boolean }>> {
  return request('/banners/reorder', { method: 'PATCH', body: JSON.stringify({ items }) })
}

export async function deleteBanner(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
  return request(`/banners/${id}`, { method: 'DELETE' })
}

// --- Notifications ---
export async function fetchNotifications(): Promise<ApiResponse<Notification[]>> {
  if (USE_MOCK) return mockFetchNotifications()
  return request('/notifications')
}

export async function createNotification(data: {
  title: string
  content: string
  type: 'promotion' | 'order' | 'system'
  targetAudience: 'all' | 'members'
  status: 'draft' | 'sent' | 'scheduled'
  scheduledAt?: string
}): Promise<ApiResponse<Notification>> {
  if (USE_MOCK) return mockCreateNotification(data)
  return request('/notifications', { method: 'POST', body: JSON.stringify(data) })
}

// --- Dashboard ---
export async function fetchDashboardStats(): Promise<ApiResponse<{
  todayOrders: number
  todayOrdersChange: number
  todayRevenue: number
  todayRevenueChange: number
  pendingShip: number
}>> {
  if (USE_MOCK) return mockFetchDashboardStats()
  return request('/dashboard/stats')
}

// --- Roles ---
export async function fetchRoles(): Promise<ApiResponse<Role[]>> {
  return request('/roles')
}

export async function fetchRoleById(id: string): Promise<ApiResponse<Role>> {
  return request(`/roles/${id}`)
}

export async function createRole(data: {
  name: string
  slug: string
  description?: string
}): Promise<ApiResponse<Role>> {
  return request('/roles', { method: 'POST', body: JSON.stringify(data) })
}

export async function updateRole(
  id: string,
  data: Partial<{ name: string; description: string; isActive: boolean }>,
): Promise<ApiResponse<Role>> {
  return request(`/roles/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
}

export async function deleteRole(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
  return request(`/roles/${id}`, { method: 'DELETE' })
}

export async function fetchRolePermissions(id: string): Promise<ApiResponse<string[]>> {
  return request(`/roles/${id}/permissions`)
}

export async function setRolePermissions(
  id: string,
  permissions: string[],
): Promise<ApiResponse<Role>> {
  return request(`/roles/${id}/permissions`, { method: 'PUT', body: JSON.stringify({ permissions }) })
}

export async function fetchAllPermissions(): Promise<ApiResponse<string[]>> {
  return request('/roles/permissions')
}

// --- Settings ---
export async function fetchSettings(): Promise<ApiResponse<Setting>> {
  return request('/settings')
}

export async function updateSettings(
  data: Partial<{ storeName: string; contactEmail: string; contactPhone: string }>,
): Promise<ApiResponse<Setting>> {
  return request('/settings', { method: 'PATCH', body: JSON.stringify(data) })
}

// --- Auth ---
export async function changePassword(data: {
  currentPassword: string
  newPassword: string
}): Promise<ApiResponse<{ message: string }>> {
  return request('/auth/change-password', { method: 'POST', body: JSON.stringify(data) })
}

// --- Upload ---
export async function uploadFile(file: File): Promise<ApiResponse<{ url: string; filename: string; size: number; id: string }>> {
  const token = getAuthToken()
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  })
  return res.json() as Promise<ApiResponse<{ url: string; filename: string; size: number; id: string }>>
}
