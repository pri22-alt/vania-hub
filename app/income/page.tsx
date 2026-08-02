export const dynamic = 'force-dynamic'

import { getIncome } from '@/app/actions/income'
import { IncomeForm } from '@/components/income-form'
import { IncomeList } from '@/components/income-list'

function formatCurrency(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

export default async function IncomePage() {
  const incomeList = await getIncome()
  const total = incomeList.reduce((sum, i) => sum + Number(i.amount), 0)

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Income</h2>
        <p className="text-muted-foreground text-sm mt-1">
          {incomeList.length} records &mdash; Total: <span className="font-semibold text-emerald-600">{formatCurrency(total)}</span>
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <IncomeForm />
        </div>
        <div className="lg:col-span-2">
          <IncomeList incomeList={incomeList} />
        </div>
      </div>
    </div>
  )
}
