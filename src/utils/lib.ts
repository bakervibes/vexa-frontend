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
