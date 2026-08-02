import { getFinancialOverview, getExpensesByCategory, getPaymentMethodBreakdown } from '@/app/actions/analytics'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function AnalyticsPage() {
  const overview = await getFinancialOverview()
  const expensesByCategory = await getExpensesByCategory()
  const paymentMethods = await getPaymentMethodBreakdown()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const netIncome = overview.totalIncome + overview.totalSales - overview.totalExpenses
  const categoryData = expensesByCategory.map(c => ({
    name: c.category,
    value: Number(c.total),
  }))
  const methodData = paymentMethods.map(m => ({
    name: m.method.charAt(0).toUpperCase() + m.method.slice(1),
    value: Number(m.total),
  }))

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/">
                <h1 className="text-3xl font-bold text-foreground hover:opacity-80">Vania Hub</h1>
              </Link>
              <p className="text-muted-foreground">Financial Analytics</p>
            </div>
            <Link href="/">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Income</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(overview.totalIncome)}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Sales</p>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(overview.totalSales)}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Expenses</p>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(overview.totalExpenses)}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Net Income</p>
            <p className={`text-2xl font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(netIncome)}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Pending Dues</p>
            <p className="text-2xl font-bold text-yellow-600">{formatCurrency(overview.pendingDues)}</p>
          </Card>
        </div>

        {/* Payment Methods Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {methodData.map((method, idx) => (
            <Card key={idx} className="p-4">
              <p className="text-sm text-muted-foreground mb-1">{method.name}</p>
              <p className="text-xl font-bold">{formatCurrency(Number(method.value))}</p>
            </Card>
          ))}
        </div>

        {/* Category Breakdown Table */}
        <Card className="p-6 mt-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Category Breakdown</h3>
          {expensesByCategory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold">Category</th>
                    <th className="text-right py-3 px-4 font-semibold">Total</th>
                    <th className="text-right py-3 px-4 font-semibold">Transactions</th>
                    <th className="text-right py-3 px-4 font-semibold">% of Total</th>
                  </tr>
                </thead>
                <tbody>
                  {expensesByCategory.map((cat, idx) => {
                    const percentage = (Number(cat.total) / overview.totalExpenses * 100).toFixed(1)
                    return (
                      <tr key={idx} className="border-b border-border">
                        <td className="py-3 px-4">{cat.category}</td>
                        <td className="text-right py-3 px-4 font-medium">{formatCurrency(Number(cat.total))}</td>
                        <td className="text-right py-3 px-4">{cat.count}</td>
                        <td className="text-right py-3 px-4">{percentage}%</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No category data available</p>
          )}
        </Card>
      </div>
    </main>
  )
}
