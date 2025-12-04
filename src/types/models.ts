import type { OrderItemData } from './orders'

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentProvider {
  STRIPE = 'STRIPE',
  PAYPAL = 'PAYPAL',
  MANUAL = 'MANUAL',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum CouponType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED',
}

export enum ReviewLike {
  LIKE = 'LIKE',
  DISLIKE = 'DISLIKE',
}

export interface User {
  id: string
  name: string
  email: string
  password: string | null
  phone: string | null
  emailVerified: Date | null
  image: string | null
  role: Role
  isActive: boolean
  provider: string | null
  providerId: string | null
  createdAt: Date
  updatedAt: Date
}

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

export interface PasswordReset {
  id: string
  email: string
  token: string
  expiresAt: Date
  createdAt: Date
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
  name: string
  slug: string
  attributeId: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image: string
  position: {
    x: number
    y: number
  }
  parentId: string | null
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
  sku: string
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
  sku: string
  basePrice: number
  price: number | null
  expiresAt: Date | null
  stock: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ProductVariantOption {
  id: string
  variantId: string
  optionId: string
  createdAt: Date
  updatedAt: Date
}

export interface Review {
  id: string
  productId: string
  userId: string
  rating: number
  comment: string | null
  isApproved: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ReviewLikeModel {
  id: string
  reviewId: string
  userId: string
  type: ReviewLike
  createdAt: Date
  updatedAt: Date
}

export interface Cart {
  id: string
  userId: string | null
  sessionId: string | null
  createdAt: Date
  updatedAt: Date
}

export interface CartItem {
  id: string
  cartId: string
  productId: string
  variantId: string | null
  quantity: number
  createdAt: Date
  updatedAt: Date
}

export interface Wishlist {
  id: string
  userId: string | null
  sessionId: string | null
  createdAt: Date
  updatedAt: Date
}

export interface WishlistItem {
  id: string
  wishlistId: string
  productId: string
  variantId: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Coupon {
  id: string
  code: string
  value: number
  type: CouponType
  usageLimit: number | null
  expiresAt: Date | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Order {
  id: string
  userId: string
  addressId: string
  couponId: string | null
  orderNumber: string
  status: OrderStatus
  totalAmount: number
  shippingCost: number
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {
  id: string
  orderId: string
  data: OrderItemData
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
  metadata: Record<string, string> | null
  createdAt: Date
  updatedAt: Date
}
