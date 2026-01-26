import { env } from '@/env'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatNumber = (value: number) => {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
}

export const formatPrice = (price: number, currency: string = 'EUR') => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
  }).format(price)
}

export const convertCurrency = async (
  amount: number,
  fromCurrency: string,
  toCurrency: string,
): Promise<number> => {
  const url = `https://api.exchangerate.host/convert?access_key=${env.VITE_EXCHANGE_RATE_HOST_API_KEY}&from=${fromCurrency}&to=${toCurrency}&amount=${amount}`

  const res = await fetch(url)

  if (!res.ok) {
    throw new Error('Failed to fetch exchange rate')
  }

  const data = (await res.json()) as { result: number }

  return data.result
}

export const formatDate = (
  date: Date | string | null | undefined,
  includeTime: boolean = false,
) => {
  if (!date) return ''

  const dateObj = typeof date === 'string' ? new Date(date) : date

  // Check if the date is valid
  if (isNaN(dateObj.getTime())) return ''

  const options: Intl.DateTimeFormatOptions = includeTime
    ? {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }
    : {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }

  return new Intl.DateTimeFormat('en-US', options).format(dateObj)
}

export const formatRelativeTime = (
  date: Date | string | null | undefined,
): string => {
  if (!date) return ''

  const dateObj = typeof date === 'string' ? new Date(date) : date

  if (isNaN(dateObj.getTime())) return ''

  const now = new Date()
  const diffMs = now.getTime() - dateObj.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

  if (diffSeconds < 60) {
    return rtf.format(-diffSeconds, 'second')
  } else if (diffMinutes < 60) {
    return rtf.format(-diffMinutes, 'minute')
  } else if (diffHours < 24) {
    return rtf.format(-diffHours, 'hour')
  } else if (diffDays < 7) {
    return rtf.format(-diffDays, 'day')
  } else {
    return formatDate(dateObj, true)
  }
}
