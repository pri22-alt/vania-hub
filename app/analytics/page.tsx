export const dynamic = 'force-dynamic'

import { getFinancialOverview, getExpensesByCategory, getPaymentMethodBreakdown } from '@/app/actions/analytics'
import { formatRM } from '@/lib/utils/currency'

export default async function AnalyticsPage() {
  const [overview, categoryData, methodData] = await Promise.all([
    getFinancialOverview(),
    getExpensesByCategory(),
    getPaymentMethodBreakdown(),
  ])
  const net = overview.totalIncome + overview.totalSales - overview.totalExpenses

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Analytics</h2>
        <p className="text-muted-foreground text-sm mt-1">
          {new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Total Income', value: overview.totalIncome, color: 'text-emerald-600' },
          { label: 'Total Expenses', value: overview.totalExpenses, color: 'text-rose-600' },
          { label: 'Cheese Sales', value: overview.totalSales, color: 'text-orange-600' },
          { label: 'Net Balance', value: net, color: net >= 0 ? 'text-emerald-600' : 'text-rose-600' },
        ].map(item => (
          <div key={item.label} className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
            <p className={`text-lg font-bold ${item.color}`}>{formatRM(item.value)}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Expenses by Category */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4">Expenses by Category</h3>
          {categoryData.length === 0 ? (
            <p className="text-sm text-muted-foreground">No expense data this month.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {categoryData.map((item) => {
                const pct = overview.totalExpenses > 0
                  ? Math.round((Number(item.total) / overview.totalExpenses) * 100) : 0
                return (
                  <div key={item.category}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-foreground">{item.category}</span>
                      <span className="font-medium">{formatRM(Number(item.total))}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Payment Methods */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4">Payment Methods</h3>
          {methodData.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payment data this month.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {methodData.map((item) => (
                <div key={item.method} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium capitalize text-foreground">{item.method}</p>
                    <p className="text-xs text-muted-foreground">{item.count} transactions</p>
                  </div>
                  <p className="text-sm font-semibold">{formatRM(Number(item.total))}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {overview.pendingDues > 0 && (
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
          <p className="text-sm font-medium text-amber-800">Total Pending Dues</p>
          <p className="text-lg font-bold text-amber-700">{formatRM(overview.pendingDues)}</p>
        </div>
      )}
    </div>
  )
}
