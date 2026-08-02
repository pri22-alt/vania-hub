export const dynamic = 'force-dynamic'

import { getDues } from '@/app/actions/dues'
import { DuesForm } from '@/components/dues-form'
import { DuesList } from '@/components/dues-list'

function formatCurrency(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

export default async function DuesPage() {
  const duesList = await getDues()
  const pending = duesList.filter(d => d.status === 'pending')
  const pendingTotal = pending.reduce((sum, d) => sum + Number(d.amount), 0)

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Dues & Bills</h2>
        <p className="text-muted-foreground text-sm mt-1">
          {pending.length} pending &mdash; Total owed: <span className="font-semibold text-amber-600">{formatCurrency(pendingTotal)}</span>
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <DuesForm />
        </div>
        <div className="lg:col-span-2">
          <DuesList duesList={duesList} />
        </div>
      </div>
    </div>
  )
}
