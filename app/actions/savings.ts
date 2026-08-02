'use server'

import { getIncome } from './income'
import { getExpenses } from './expenses'
import { formatRM } from '@/lib/utils/currency'

interface MonthlySavings {
  month: string
  totalIncome: number
  totalExpenses: number
  netIncome: number
  savingsGoal: number
  savingsAmount: number
  savingsPercentage: number
}

// In-memory savings goals and records
const savingsGoals: { [month: string]: number } = {}
const savingsRecords: { [month: string]: number } = {}

export async function calculateMonthlySavings(): Promise<MonthlySavings[]> {
  const allIncome = await getIncome()
  const allExpenses = await getExpenses()

  // Group by month
  const monthlyData: { [key: string]: { income: number; expenses: number } } = {}

  allIncome.forEach((item: any) => {
    const month = item.date?.substring(0, 7) || new Date().toISOString().substring(0, 7)
    if (!monthlyData[month]) {
      monthlyData[month] = { income: 0, expenses: 0 }
    }
    monthlyData[month].income += Number(item.amount || 0)
  })

  allExpenses.forEach((item: any) => {
    const month = item.date?.substring(0, 7) || new Date().toISOString().substring(0, 7)
    if (!monthlyData[month]) {
      monthlyData[month] = { income: 0, expenses: 0 }
    }
    monthlyData[month].expenses += Number(item.amount || 0)
  })

  // Convert to array and sort by month
  const results = Object.entries(monthlyData)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, 12) // Last 12 months
    .map(([month, data]) => {
      const netIncome = data.income - data.expenses
      const goal = savingsGoals[month] || Math.max(netIncome * 0.1, 0) // Default 10% or actual surplus
      const saved = savingsRecords[month] || 0

      return {
        month,
        totalIncome: data.income,
        totalExpenses: data.expenses,
        netIncome,
        savingsGoal: goal,
        savingsAmount: saved,
        savingsPercentage: data.income > 0 ? (saved / data.income) * 100 : 0,
      }
    })

  return results
}

export async function setSavingsGoal(month: string, amount: number) {
  savingsGoals[month] = amount
}

export async function recordSavings(month: string, amount: number) {
  savingsRecords[month] = amount
}

export async function getSavingsOverview() {
  const monthlySavings = await calculateMonthlySavings()
  
  const totalSavings = Object.values(savingsRecords).reduce((sum, amt) => sum + amt, 0)
  const totalGoals = Object.values(savingsGoals).reduce((sum, amt) => sum + amt, 0)
  const averageSavingsRate =
    monthlySavings.length > 0
      ? monthlySavings.reduce((sum, m) => sum + m.savingsPercentage, 0) / monthlySavings.length
      : 0

  return {
    totalSavings,
    totalGoals,
    averageSavingsRate,
    monthlySavings,
  }
}
