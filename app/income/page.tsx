export const dynamic = 'force-dynamic'

import { getIncome } from '@/app/actions/income'
import { IncomeForm } from '@/components/income-form'
import { IncomeList } from '@/components/income-list'
import { IncomeExportButton } from '@/components/income-export-button'
import { formatRM } from '@/lib/utils/currency'

export default async function IncomePage() {
  const incomeList = await getIncome()
  const total = incomeList.reduce((sum, i) => sum + Number(i.amount), 0)

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Income</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {incomeList.length} records &mdash; Total: <span className="font-semibold text-emerald-600">{formatRM(total)}</span>
          </p>
        </div>
        <IncomeExportButton income={incomeList} />
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
