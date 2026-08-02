export const dynamic = 'force-dynamic'

import { getExpenses } from '@/app/actions/expenses'
import { ExpenseForm } from '@/components/expense-form'
import { ExpenseList } from '@/components/expense-list'
import { formatRM } from '@/lib/utils/currency'

export default async function ExpensesPage() {
  const expenseList = await getExpenses()
  const total = expenseList.reduce((sum, e) => sum + Number(e.amount), 0)

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Expenses</h2>
        <p className="text-muted-foreground text-sm mt-1">
          {expenseList.length} records &mdash; Total: <span className="font-semibold text-rose-600">{formatRM(total)}</span>
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ExpenseForm />
        </div>
        <div className="lg:col-span-2">
          <ExpenseList expenses={expenseList} />
        </div>
      </div>
    </div>
  )
}
