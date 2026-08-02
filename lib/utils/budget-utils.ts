// In-memory budget adjustments per month (carry-forward and extra funds)
export const budgetAdjustments: { [key: string]: { carryForward: number; extraFunds: number } } = {}

export function updateBudgetAdjustmentSync(budgetId: number, month: string, carryForward: number, extraFunds: number) {
  const key = `${budgetId}-${month}`
  budgetAdjustments[key] = { carryForward, extraFunds }
}

export function getBudgetAdjustment(budgetId: number, month: string) {
  const key = `${budgetId}-${month}`
  return budgetAdjustments[key] || { carryForward: 0, extraFunds: 0 }
}
