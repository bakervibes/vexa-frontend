import type { Payment, PaymentIntentResponse } from '@/types'
import { api } from '@/utils/api'
import type { CreatePaymentIntentInput } from '@/validators/payments.validator'

export const paymentService = {
  async createPaymentIntent(data: CreatePaymentIntentInput) {
    return api<PaymentIntentResponse>('/payments/create-intent', 'POST', data)
  },

  async getPaymentStatus(orderId: string) {
    return api<Payment[]>(`/payments/status/${orderId}`, 'GET')
  },
}
