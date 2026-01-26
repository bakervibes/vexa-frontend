import type { PaymentProvider } from './models'

// Re-export PaymentProvider for convenience
export type { PaymentProvider } from './models'

// ============================================================================
// NEW FLOW: Session-based checkout
// ============================================================================

export interface PaymentSessionResponse {
  orderId: string
  redirectUrl: string | null
  provider: PaymentProvider
  totalAmount: number
}

export interface PaymentConfirmResponse {
  success: boolean
  orderId: string
  orderNumber: string
  alreadyProcessed?: boolean
  message?: string
}

// ============================================================================
// LEGACY TYPES
// ============================================================================

export interface PaymentIntentResponse {
  provider: PaymentProvider
  clientSecret?: string // Stripe
  paypalOrderId?: string // PayPal
  approvalLink?: string // PayPal
  checkoutUrl?: string // Moneroo
  orderId?: string // KKiaPay
  amount?: number
}

export interface VerifyPaymentResponse {
  success: boolean
  orderId: string
  provider: PaymentProvider
  status: string
}

// Gateway specific responses from backend
export interface StripeIntentData {
  clientSecret: string
  paymentIntentId: string
}

export interface PayPalOrderData {
  paypalOrderId: string
  approvalLink: string
}

export interface MonerooInitData {
  checkoutUrl: string
  paymentId: string
}
