export const dynamic = 'force-dynamic'

import { getVirmanisSales, getSalesStats } from '@/app/actions/virmanis'
import { VirmanisSalesForm } from '@/components/virmanis-form'
import { VirmanisList } from '@/components/virmanis-list'

function formatCurrency(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

export default async function VirmanisSalesPage() {
  const [sales, stats] = await Promise.all([getVirmanisSales(), getSalesStats()])
  const totalSales = Number(stats[0]?.totalSales || 0)
  const txCount = Number(stats[0]?.transactionCount || 0)

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Virmanis United</h2>
        <p className="text-muted-foreground text-sm mt-1">
          {txCount} sales this month &mdash; Total: <span className="font-semibold text-orange-600">{formatCurrency(totalSales)}</span>
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <VirmanisSalesForm />
        </div>
        <div className="lg:col-span-2">
          <VirmanisList sales={sales} />
        </div>
      </div>
    </div>
  )
}
