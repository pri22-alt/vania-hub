export const dynamic = 'force-dynamic'

import { getVirmanisSales, getSalesStats } from '@/app/actions/virmanis'
import { VirmanisList } from '@/components/virmanis-list'
import { formatRM } from '@/lib/utils/currency'

export default async function VirmanisSalesPage() {
  const [sales, stats] = await Promise.all([getVirmanisSales(), getSalesStats()])
  const totalSales = Number(stats[0]?.totalSales || 0)
  const txCount = Number(stats[0]?.transactionCount || 0)

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground">Virmanis United</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Sales revenue tracking — {txCount} records this month &mdash; Total: <span className="font-semibold text-orange-600">{formatRM(totalSales)}</span>
        </p>
        <p className="text-xs text-muted-foreground mt-3 bg-blue-50 border border-blue-200 rounded p-3">
          💡 To record a new sale, go to <strong>Income</strong> and select <strong>"Virmanis United"</strong> as the category. Sales will automatically appear here.
        </p>
      </div>
      <div className="w-full">
        <VirmanisList sales={sales} />
      </div>
    </div>
  )
}
