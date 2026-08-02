export const dynamic = 'force-dynamic'

import { getCheesSales, getSalesStats } from '@/app/actions/cheese-sales'
import { CheeseSalesForm } from '@/components/cheese-sales-form'
import { CheeseSalesList } from '@/components/cheese-sales-list'

function formatCurrency(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

export default async function CheeseSalesPage() {
  const [sales, stats] = await Promise.all([getCheesSales(), getSalesStats()])
  const totalSales = Number(stats[0]?.totalSales || 0)
  const txCount = Number(stats[0]?.transactionCount || 0)

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Cheese Sales</h2>
        <p className="text-muted-foreground text-sm mt-1">
          {txCount} sales this month &mdash; Total: <span className="font-semibold text-orange-600">{formatCurrency(totalSales)}</span>
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <CheeseSalesForm />
        </div>
        <div className="lg:col-span-2">
          <CheeseSalesList sales={sales} />
        </div>
      </div>
    </div>
  )
}
