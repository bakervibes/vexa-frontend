// ============================================================================
// ENUMS
// ============================================================================

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUND_REQUESTED = 'REFUND_REQUESTED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentProvider {
  STRIPE = 'STRIPE',
  PAYPAL = 'PAYPAL',
  KKIAPAY = 'KKIAPAY',
  MONEROO = 'MONEROO',
  COD = 'COD',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum ShippingType {
  STANDARD = 'STANDARD',
  EXPRESS = 'EXPRESS',
  PICKUP = 'PICKUP',
}

export enum CouponType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED',
}

export enum ReviewLike {
  LIKE = 'LIKE',
  DISLIKE = 'DISLIKE',
}

export enum StockMovementType {
  ADDITION = 'ADDITION',
  DEDUCTION = 'DEDUCTION',
  ADJUSTMENT = 'ADJUSTMENT',
  RESERVATION = 'RESERVATION',
  RELEASE = 'RELEASE',
  SALE = 'SALE',
  RETURN = 'RETURN',
  DAMAGED = 'DAMAGED',
  TRANSFER = 'TRANSFER',
}

export enum StockMovementReason {
  INITIAL_STOCK = 'INITIAL_STOCK',
  PURCHASE_ORDER = 'PURCHASE_ORDER',
  CART_RESERVATION = 'CART_RESERVATION',
  CART_RELEASE = 'CART_RELEASE',
  ORDER_COMPLETED = 'ORDER_COMPLETED',
  ORDER_CANCELLED = 'ORDER_CANCELLED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  MANUAL_ADJUSTMENT = 'MANUAL_ADJUSTMENT',
  INVENTORY_COUNT = 'INVENTORY_COUNT',
  DAMAGED_GOODS = 'DAMAGED_GOODS',
  RETURN_REFUND = 'RETURN_REFUND',
  OTHER = 'OTHER',
}

export enum NotificationType {
  ORDER_PLACED = 'ORDER_PLACED',
  ORDER_CONFIRMED = 'ORDER_CONFIRMED',
  ORDER_SHIPPED = 'ORDER_SHIPPED',
  ORDER_DELIVERED = 'ORDER_DELIVERED',
  ORDER_CANCELLED = 'ORDER_CANCELLED',
  ORDER_REFUNDED = 'ORDER_REFUNDED',
  LOW_STOCK_ALERT = 'LOW_STOCK_ALERT',
  OUT_OF_STOCK_ALERT = 'OUT_OF_STOCK_ALERT',
  STOCK_REPLENISHED = 'STOCK_REPLENISHED',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  NEW_REVIEW = 'NEW_REVIEW',
  REVIEW_RESPONSE = 'REVIEW_RESPONSE',
  SYSTEM_ANNOUNCEMENT = 'SYSTEM_ANNOUNCEMENT',
  ACCOUNT_UPDATE = 'ACCOUNT_UPDATE',
  WELCOME = 'WELCOME',
}

// ============================================================================
// AUTHENTICATION (Better-Auth)
// ============================================================================

export interface User {
  id: string
  name: string
  email: string
  emailVerified: boolean
  phone: string | null
  image: string | null
  role: UserRole
  isActive: boolean
  deletedAt: Date | null
  twoFactorEnabled: boolean
  twoFactorSecret: string | null
  backupCodes: string[]
  createdAt: Date
  updatedAt: Date
}

export interface Session {
  id: string
  userId: string
  expiresAt: Date
  ipAddress: string | null
  userAgent: string | null
  token: string
  createdAt: Date
  updatedAt: Date
}

export interface Account {
  id: string
  userId: string
  accountId: string
  providerId: string
  accessToken: string | null
  refreshToken: string | null
  idToken: string | null
  expiresAt: Date | null
  password: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Verification {
  id: string
  identifier: string
  value: string
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// E-COMMERCE: PRODUCTS & CATEGORIES
// ============================================================================

export interface Category {
  id: string
  parentCategoryId: string | null
  name: string
  slug: string
  description: string | null
  image: string | null
  position: {
    x: number
    y: number
  }
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Product {
  id: string
  categoryId: string | null
  name: string
  slug: string
  description: string | null
  basePrice: number | null
  price: number | null
  stock: number
  expiresAt: Date | null
  images: string[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ProductVariant {
  id: string
  productId: string
  basePrice: number
  price: number | null
  expiresAt: Date | null
  stock: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Attribute {
  id: string
  name: string
  slug: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Option {
  id: string
  attributeId: string
  name: string
  slug: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ProductVariantOption {
  id: string
  productVariantId: string
  optionId: string
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// E-COMMERCE: REVIEWS
// ============================================================================

export interface ProductReview {
  id: string
  productId: string
  userId: string
  rating: number
  comment: string | null
  isApproved: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ProductReviewLike {
  id: string
  productReviewId: string
  userId: string
  type: ReviewLike
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// E-COMMERCE: CART & WISHLIST
// ============================================================================

export interface Cart {
  id: string
  userId: string | null
  sessionId: string | null
  shareToken: string | null
  shareExpiresAt: Date | null
  lastActivityAt: Date
  createdAt: Date
  updatedAt: Date
}

export interface CartItem {
  id: string
  cartId: string
  productId: string
  productVariantId: string | null
  quantity: number
  createdAt: Date
  updatedAt: Date
}

export interface Wishlist {
  id: string
  userId: string | null
  sessionId: string | null
  shareToken: string | null
  shareExpiresAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface WishlistItem {
  id: string
  wishlistId: string
  productId: string
  productVariantId: string | null
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// E-COMMERCE: ORDERS & PAYMENTS
// ============================================================================

export interface Order {
  id: string
  userId: string
  payerId: string
  addressId: string
  couponId: string | null
  shippingType: ShippingType
  orderNumber: string
  status: OrderStatus
  subtotalAmount: number
  shippingCost: number
  discountAmount: number
  totalAmount: number
  notes: string | null
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  productVariantId: string | null
  name: string
  price: number
  quantity: number
  image: string | null
  options: { attribute: string; option: string }[] | null
  createdAt: Date
  updatedAt: Date
}

export interface Payment {
  id: string
  orderId: string
  provider: PaymentProvider
  transactionId: string | null
  amount: number
  status: PaymentStatus
  metadata: Record<string, unknown> | null
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// E-COMMERCE: ADDRESSES
// ============================================================================

export interface Address {
  id: string
  userId: string
  name: string
  email: string
  phone: string
  street: string
  city: string
  country: string
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// E-COMMERCE: SHIPPING
// ============================================================================

export interface ShippingZone {
  id: string
  name: string
  description: string | null
  countries: string[]
  cities: string[]
  isDefault: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ShippingOption {
  id: string
  shippingZoneId: string
  name: string
  description: string | null
  type: ShippingType
  price: number
  freeThreshold: number | null
  minOrderAmount: number | null
  delayMinDays: number
  delayMaxDays: number
  codAllowed: boolean
  isActive: boolean
  position: number
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// E-COMMERCE: COUPONS
// ============================================================================

export interface Coupon {
  id: string
  code: string
  description: string | null
  value: number
  type: CouponType
  usageLimit: number | null
  usageCount: number
  minOrderAmount: number | null
  expiresAt: Date | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// E-COMMERCE: STOCK MANAGEMENT
// ============================================================================

export interface StockMovement {
  id: string
  userId: string
  productId: string
  productVariantId: string | null
  type: StockMovementType
  quantity: number
  reason: StockMovementReason
  reference: string | null
  note: string | null
  previousStock: number
  newStock: number
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// E-COMMERCE: NOTIFICATIONS
// ============================================================================

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  data: Record<string, unknown> | null
  isRead: boolean
  readAt: Date | null
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// E-COMMERCE: NEWSLETTER
// ============================================================================

export interface NewsletterSubscriber {
  id: string
  email: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
