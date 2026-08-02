export const dynamic = 'force-dynamic'

import { getFinancialOverview, getExpensesByCategory, getPaymentMethodBreakdown } from '@/app/actions/analytics'
import { AnalyticsClient } from '@/components/analytics-client'

export default async function AnalyticsPage() {
  const now = new Date()
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

  const [overview, categoryData, methodData] = await Promise.all([
    getFinancialOverview(startDate, endDate),
    getExpensesByCategory(startDate, endDate),
    getPaymentMethodBreakdown(startDate, endDate),
  ])

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Analytics</h2>
        <p className="text-muted-foreground text-sm mt-1">
          {now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} &mdash; select a filter to change the period
        </p>
      </div>
      <AnalyticsClient
        initialOverview={overview}
        initialCategoryData={categoryData}
        initialMethodData={methodData}
        initialStartDate={startDate}
        initialEndDate={endDate}
      />
    </div>
  )
}
