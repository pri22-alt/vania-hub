export const dynamic = 'force-dynamic'

import { getDues } from '@/app/actions/dues'
import { getRecurringBills } from '@/app/actions/recurring-bills'
import { DuesForm } from '@/components/dues-form'
import { DuesList } from '@/components/dues-list'
import { RecurringBillsForm } from '@/components/recurring-bills-form'
import { RecurringBillsList } from '@/components/recurring-bills-list'
import { formatRM } from '@/lib/utils/currency'

export default async function DuesPage() {
  const [duesList, recurringBillsList] = await Promise.all([
    getDues(),
    getRecurringBills(),
  ])
  const pending = duesList.filter(d => d.status === 'pending')
  const pendingTotal = pending.reduce((sum, d) => sum + Number(d.amount), 0)
  const activeBillsTotal = recurringBillsList
    .filter(b => b.isActive)
    .reduce((sum, b) => sum + Number(b.amount), 0)

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground">Dues & Bills</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
          <div>
            <p className="text-xs text-muted-foreground">One-time bills pending</p>
            <p className="text-lg font-semibold text-amber-600">{pending.length} records • {formatRM(pendingTotal)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Monthly recurring bills</p>
            <p className="text-lg font-semibold text-blue-600">{recurringBillsList.filter(b => b.isActive).length} active • {formatRM(activeBillsTotal)}</p>
          </div>
        </div>
      </div>

      {/* Recurring Bills Section */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-foreground mb-4">Recurring Bills Setup</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <RecurringBillsForm />
          </div>
          <div className="lg:col-span-2">
            <RecurringBillsList bills={recurringBillsList} />
          </div>
        </div>
      </div>

      {/* One-time Bills Section */}
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-4">One-Time Bills</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <DuesForm />
          </div>
          <div className="lg:col-span-2">
            <DuesList duesList={duesList} />
          </div>
        </div>
      </div>
    </div>
  )
}
