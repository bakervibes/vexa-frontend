import type {
  PaymentConfirmResponse,
  PaymentProvider,
  PaymentSessionResponse,
  VerifyPaymentResponse,
} from '@/types'
import { api } from '@/utils/api'

export const paymentService = {
  /**
   * Create a payment session for an existing PENDING order
   * Returns redirectUrl for Stripe/PayPal/Moneroo, or session info for Kkiapay widget
   */
  async createPaymentSession(orderId: string, provider: PaymentProvider) {
    return api<PaymentSessionResponse>('/payments/create-session', 'POST', {
      orderId,
      provider,
    })
  },

  /**
   * Confirm payment (fallback if webhook hasn't processed yet)
   */
  async confirmPayment(orderId: string) {
    return api<PaymentConfirmResponse>(
      `/payments/confirm?orderId=${orderId}`,
      'GET',
    )
  },

  /**
   * Verify Kkiapay payment token manually (used after widget success)
   */
  async verifyKkiapay(orderId: string, transactionId: string) {
    return api<VerifyPaymentResponse>('/payments/kkiapay/verify', 'POST', {
      orderId,
      transactionId,
    })
  },
}
