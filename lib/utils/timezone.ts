// Malaysia Standard Time (MYT) - UTC+8
export const MALAYSIA_TIMEZONE = 'Asia/Kuala_Lumpur'
export const MALAYSIA_OFFSET = 8 * 60 * 60 * 1000 // 8 hours in milliseconds

/**
 * Get current date/time in Malaysia timezone
 */
export function getMalaysiaTime(): Date {
  const now = new Date()
  // Adjust UTC time to Malaysia time (UTC+8)
  return new Date(now.getTime() + (now.getTimezoneOffset() * 60 * 1000) + MALAYSIA_OFFSET)
}

/**
 * Format date to Malaysia locale (ms-MY)
 */
export function formatMalaysiaDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('ms-MY', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  })
}

/**
 * Format date and time to Malaysia locale
 */
export function formatMalaysiaDateTime(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('ms-MY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  })
}

/**
 * Convert a date string to Malaysia timezone date
 */
export function toMalaysiaDate(dateString: string): Date {
  const date = new Date(dateString)
  // Ensure we're working with UTC time, then convert to Malaysia time
  return new Date(date.getTime() + (date.getTimezoneOffset() * 60 * 1000) + MALAYSIA_OFFSET)
}

/**
 * Get Malaysia date range for a specific month
 */
export function getMalaysiaMonthRange(year: number, month: number) {
  const startDate = new Date(year, month, 1)
  const endDate = new Date(year, month + 1, 0, 23, 59, 59)
  
  return {
    start: startDate,
    end: endDate,
    startString: startDate.toISOString().split('T')[0],
    endString: endDate.toISOString().split('T')[0],
  }
}

/**
 * Get Malaysia date for today
 */
export function getMalaysiaToday(): Date {
  const today = getMalaysiaTime()
  return new Date(today.getFullYear(), today.getMonth(), today.getDate())
}

/**
 * Check if date is today (Malaysia timezone)
 */
export function isMalaysiaTodayDate(date: Date | string): boolean {
  const checkDate = typeof date === 'string' ? new Date(date) : date
  const today = getMalaysiaToday()
  return checkDate.toDateString() === today.toDateString()
}
