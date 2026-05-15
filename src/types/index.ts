// 統一核心型別 — 匹配 TypeORM entities（k-slect-backend Express 後端）

export type ApiResponse<T> =
  | { data: T; error: null }
  | { data: null; error: { code: string; message: string } }

// --- Shipping / Logistics ---
export type ShippingMethod = 'cvs_pickup' | 'home_delivery'
export type ShippingProvider = 'seven_eleven' | 'family_mart' | 'black_cat'

// --- Bank Transfer ---
export interface BankTransferSnapshot {
  bankName: string
  bankCode: string
  branchName: string
  accountName: string
  accountNumber: string
  paymentDeadlineHours: number
}

export interface BankTransferReport {
  orderId: string
  last5: string
  transferredAt: string | null
  note: string | null
  reportedAt: string
}

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
  productId: string   // TypeORM Entity FK，API 回傳時一定存在
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
  images: string[] | null // 商品圖片 URL 陣列（Entity jsonb nullable）
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
export type CustomerStatus = 'active' | 'inactive' | 'blacklisted' | 'vip'

export interface Customer {
  id: string
  name: string
  email: string
  phone: string | null
  address: string | null
  tags: string[]
  note: string | null
  status: CustomerStatus
  _count?: { orders: number }  // TypeORM 聚合，API 回傳時可能包含
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
  variantSnapshot: Record<string, string> | null  // {"顏色":"紅色","尺寸":"M"}
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
  orderNo: string
  customerId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  shippingAddress: string
  trackingNo: string | null
  customer?: Customer
  status: OrderStatus
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  totalAmount: number     // 台幣，整數
  note: string | null
  items?: OrderItem[]
  // 物流
  shippingMethod: ShippingMethod | null
  shippingProvider: ShippingProvider | null
  cvsStoreCode: string | null
  cvsStoreName: string | null
  cvsStoreAddress: string | null
  cvsBrand: string | null
  cvsPickupCode: string | null
  // 付款
  bankTransferInfoSnapshot: BankTransferSnapshot | null
  bankTransferReport: BankTransferReport | null
  paymentDueAt: string | null
  paidAt: string | null
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
  productId: string | null  // Entity nullable（商品刪除後為 null）
  productName: string       // 下單時商品名稱快照
  sku: string               // 下單時 SKU 快照
  quantity: number
  priceAtOrder: number      // 下單當下價格快照
  image: string | null
}

// 後台 Order（完整訂單，items 為必填）
export type AdminOrder = Omit<Order, 'items'> & { items: OrderItem[] }

// 會員（Customer 的後台統計擴充）
export interface Member {
  id: string
  name: string
  email: string
  phone: string | null
  totalOrders: number
  totalSpent: number
  createdAt: string
  status: CustomerStatus
}

export interface Discount {
  id: string
  name: string
  code: string
  type: 'percentage' | 'fixed'
  value: number
  minAmount: number | null    // Entity nullable
  usageLimit: number | null   // Entity nullable
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
  updatedAt: string
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
