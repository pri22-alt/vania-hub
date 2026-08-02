// Currency formatting utility - RM (Ringgit Malaysia)
export function formatRM(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('ms-MY', {
    style: 'currency',
    currency: 'MYR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)
}

// Get date ranges for filtering
export function getDateRanges() {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()

  return {
    // Year-to-date: Jan 1 to today
    ytd: {
      start: new Date(year, 0, 1),
      end: today,
      label: 'Year-to-Date',
    },
    // Month-to-date: 1st of month to today
    mtd: {
      start: new Date(year, month, 1),
      end: today,
      label: 'Month-to-Date',
    },
    // Current month
    currentMonth: {
      start: new Date(year, month, 1),
      end: new Date(year, month + 1, 0),
      label: `${today.toLocaleDateString('ms-MY', { month: 'long', year: 'numeric' })}`,
    },
    // Last month
    lastMonth: {
      start: new Date(year, month - 1, 1),
      end: new Date(year, month, 0),
      label: `${new Date(year, month - 1, 1).toLocaleDateString('ms-MY', { month: 'long', year: 'numeric' })}`,
    },
    // Last 30 days
    last30Days: {
      start: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
      end: today,
      label: 'Last 30 Days',
    },
    // Last 7 days
    last7Days: {
      start: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
      end: today,
      label: 'Last 7 Days',
    },
    // Today
    today: {
      start: new Date(year, month, today.getDate()),
      end: new Date(year, month, today.getDate(), 23, 59, 59),
      label: 'Today',
    },
  }
}

export function filterByDateRange<T extends { date: string | Date }>(
  items: T[],
  startDate: Date,
  endDate: Date
): T[] {
  return items.filter(item => {
    const itemDate = typeof item.date === 'string' ? new Date(item.date) : item.date
    return itemDate >= startDate && itemDate <= endDate
  })
}
