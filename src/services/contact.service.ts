/**
 * Contact Service
 * Handles contact form submissions via WhatsApp API
 */

import { env } from '@/env'
import { api } from '@/utils/api'

interface SendWhatsAppMessageInput {
  name: string
  phone: string
  message: string
}

interface WhatsAppInfoResponse {
  phone: string
  isConfigured: boolean
}

interface SendMessageResponse {
  messageId: string
}

/**
 * Get WhatsApp business info (phone number for wa.me redirect)
 */
export const getWhatsAppInfo = async () => {
  return api<WhatsAppInfoResponse>('/contact/whatsapp', 'GET')
}

/**
 * Send contact form via WhatsApp Cloud API
 */
export const sendWhatsAppMessage = async (input: SendWhatsAppMessageInput) => {
  return api<SendMessageResponse>('/contact/whatsapp', 'POST', input)
}

/**
 * Get the WhatsApp phone number from environment for frontend fallback
 */
export const getWhatsAppPhone = (): string => {
  return env.VITE_WHATSAPP_BUSINESS_PHONE || '+2290166386436'
}

/**
 * Open WhatsApp chat in a new tab (no pre-filled message)
 */
export const openWhatsAppChat = (phone?: string): void => {
  const phoneNumber = phone || getWhatsAppPhone()
  const cleanPhone = phoneNumber.replace(/[^0-9]/g, '')
  window.open(`https://wa.me/${cleanPhone}`, '_blank')
}
