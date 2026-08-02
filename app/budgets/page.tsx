export const dynamic = 'force-dynamic'

import { getAllBudgetsStatus } from '@/app/actions/budgets'
import { BudgetForm } from '@/components/budget-form'
import { BudgetList } from '@/components/budget-list'
import { BudgetSummary } from '@/components/budget-summary'

export default async function BudgetsPage() {
  const budgetsWithStatus = await getAllBudgetsStatus()

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Budget Management</h1>
        <p className="text-muted-foreground text-sm mt-2">
          Set budgets, track spending, and get alerts when approaching limits
        </p>
      </div>

      {/* Summary Cards */}
      <BudgetSummary budgets={budgetsWithStatus} />

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Budget Form */}
        <div className="lg:col-span-1">
          <BudgetForm />
        </div>

        {/* Budgets List */}
        <div className="lg:col-span-2">
          <BudgetList budgets={budgetsWithStatus} />
        </div>
      </div>
    </div>
  )
}
