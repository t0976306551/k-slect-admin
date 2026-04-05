// 統一核心型別 — 匹配 TypeORM entities（k-slect-backend Express 後端）

export type ApiResponse<T> =
  | { data: T; error: null }
  | { data: null; error: { code: string; message: string } }

// --- Category ---
export interface Category {
  id: string
  name: string
  slug: string
  parentId: string | null
  parent?: Pick<Category, 'id' | 'name' | 'slug'> | null
  children?: Category[]
  _count?: { products: number }
  createdAt: string
  updatedAt: string
}

// --- Inventory ---
export interface Inventory {
  id: string
  productId: string
  sku: string
  quantity: number
  lowStockThreshold: number
  createdAt: string
  updatedAt: string
}

// --- ProductOption / ProductVariant ---
// TypeORM 直接回傳 option value 物件（ManyToMany 無中介 model）
export interface ProductOptionValue {
  id: string
  optionId: string
  value: string
  position: number
  createdAt?: string
  updatedAt?: string
}

export interface ProductOption {
  id: string
  productId: string
  name: string
  position: number
  values: ProductOptionValue[]
  createdAt?: string
  updatedAt?: string
}

export interface ProductVariant {
  id: string
  sku: string
  price: number | null
  quantity: number
  lowStockThreshold: number
  status: 'active' | 'inactive'
  image: string | null
  // TypeORM ManyToMany 直接回傳陣列，非 Prisma join model
  optionValues?: ProductOptionValue[]
  createdAt?: string
  updatedAt?: string
}

// --- Product ---
export interface Product {
  id: string
  name: string
  slug: string | null
  description: string | null
  price: number           // 台幣，整數
  originalPrice: number | null
  status: 'active' | 'inactive'
  categoryId: string
  externalUrl: string | null
  origin: string | null
  category?: Pick<Category, 'id' | 'name' | 'slug'>
  inventory?: Pick<Inventory, 'sku' | 'quantity' | 'lowStockThreshold'>
  images: string[] // 商品圖片 URL 陣列
  options?: ProductOption[]
  variants?: ProductVariant[]
  createdAt: string
  updatedAt: string
}

// --- Variant Draft（後台 UI 用）---
export interface ProductOptionValueDraft {
  id: string
  value: string
  position: number
}

export interface ProductOptionDraft {
  id: string
  name: string
  position: number
  values: ProductOptionValueDraft[]
}

export interface ProductVariantRow {
  id?: string
  sku: string
  price: number | null
  quantity: number
  lowStockThreshold: number
  status: 'active' | 'inactive'
  image: string | null
  optionValueIds: string[]
  label: string  // 如 "紅色 / M"
}

// --- Customer ---
export interface Customer {
  id: string
  name: string
  email: string
  phone: string | null
  address: string | null
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

// --- OrderItem（TypeORM entity 結構：快照欄位）---
export interface OrderItem {
  id: string
  orderId: string
  productId: string | null
  productName: string    // 下單時商品名稱快照
  sku: string            // 下單時 SKU 快照
  quantity: number
  priceAtOrder: number   // 下單當下價格快照
  image: string | null
  createdAt: string
  updatedAt: string
}

// --- Order ---
export type OrderStatus =
  | 'pending_ship'
  | 'shipped'
  | 'completed'
  | 'cancelled'
  | 'refund_pending'
  | 'refunded'

export type PaymentMethod = 'seller_ship' | 'bank_transfer'
export type PaymentStatus = 'pending' | 'paid' | 'failed'

export interface Order {
  id: string
  customerId: string
  customer?: Customer
  status: OrderStatus
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  totalAmount: number     // 台幣，整數
  note: string | null
  items?: OrderItem[]
  createdAt: string
  updatedAt: string
}

// --- Promotion ---
export type PromotionChannel = 'LINE' | 'FB'
export type PromotionStatus = 'draft' | 'scheduled' | 'sent' | 'failed'

export interface Promotion {
  id: string
  channel: PromotionChannel
  platform: string
  // TypeORM ManyToMany 回傳 relation
  products: Pick<Product, 'id' | 'name'>[]
  message: string
  utmUrl: string | null
  status: PromotionStatus
  scheduledAt: string | null
  sentAt: string | null
  metadata: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
}

// ===== Admin 擴充型別 =====

// 後台 OrderItem 快照（RefundRequest 等 jsonb 欄位用）
export interface AdminOrderItem {
  productId: string
  productName: string    // 下單時商品名稱快照
  sku: string            // 下單時 SKU 快照
  quantity: number
  priceAtOrder: number   // 下單當下價格快照
  image?: string
}

// 後台 Order（含展開的顧客資訊與訂單編號）
export interface AdminOrder {
  id: string
  orderNo: string          // 訂單編號，如 ORD-20260318-001
  customerId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  shippingAddress: string
  trackingNo?: string
  cvsBrand?: string       // 超商品牌（如 7-11）
  cvsStoreCode?: string   // 超商門市代碼
  cvsPickupCode?: string  // 取件代碼（便利購 API 回傳）
  items: AdminOrderItem[]
  totalAmount: number
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  status: OrderStatus
  note?: string | null
  createdAt: string
  updatedAt: string
}

// 會員（Customer 的後台統計擴充）
export interface Member {
  id: string
  name: string
  email: string
  phone: string | null
  totalOrders: number
  totalSpent: number
  createdAt: string
  status: 'active' | 'inactive'
}

export interface Discount {
  id: string
  name: string
  code: string
  type: 'percentage' | 'fixed'
  value: number
  minAmount?: number
  usageLimit?: number
  usedCount: number
  startDate: string
  endDate: string
  status: 'active' | 'inactive' | 'expired'
  createdAt: string
  updatedAt: string
}

export interface RefundRequest {
  id: string
  orderId: string
  orderNo: string
  customerName: string
  amount: number
  reason: string
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  items: AdminOrderItem[]
  note?: string
  createdAt: string
  updatedAt: string
}

export interface Banner {
  id: string
  title: string
  imageUrl: string
  linkUrl?: string
  sort: number
  status: 'active' | 'inactive'
  startDate?: string
  endDate?: string
  createdAt: string
  updatedAt: string
}

export interface Notification {
  id: string
  title: string
  content: string
  type: 'promotion' | 'order' | 'system'
  targetAudience: 'all' | 'members'
  status: 'draft' | 'sent' | 'scheduled'
  sentAt?: string
  scheduledAt?: string
  createdAt: string
}

// --- Permission ---
export interface Permission {
  id: string
  slug: string
  resource: string
  action: string
  description: string | null
  createdAt: string
}

// --- Role ---
export interface Role {
  id: string
  name: string
  slug: string
  description: string | null
  isActive: boolean
  isSystemRole: boolean
  permissions: Permission[]
  createdAt: string
  updatedAt: string
}

// --- Setting ---
// 後端回傳 Record<string, string>（key-value 扁平結構）
export type Setting = Record<string, string>
