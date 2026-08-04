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

// In-memory savings goals and detailed records
interface SavingsRecord {
  id: string
  amount: number
  date: string
  location: 'cash' | 'bank'
  notes?: string
}

const savingsGoals: { [month: string]: number } = {}
const savingsRecords: { [month: string]: SavingsRecord[] } = {}

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
      const records = savingsRecords[month] || []
      const saved = records.reduce((sum, r) => sum + r.amount, 0)

      return {
        month,
        totalIncome: data.income,
        totalExpenses: data.expenses,
        netIncome,
        savingsGoal: goal,
        savingsAmount: saved,
        savingsPercentage: data.income > 0 ? (saved / data.income) * 100 : 0,
        records,
      }
    })

  return results
}

export async function setSavingsGoal(month: string, amount: number) {
  savingsGoals[month] = amount
}

export async function recordSavings(month: string, amount: number, date: string, location: 'cash' | 'bank', notes?: string) {
  if (!savingsRecords[month]) {
    savingsRecords[month] = []
  }
  
  const record: SavingsRecord = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    amount,
    date,
    location,
    notes,
  }
  
  savingsRecords[month].push(record)
  return record
}

export async function getSavingsRecords(month: string): Promise<SavingsRecord[]> {
  return savingsRecords[month] || []
}

export async function updateSavingsRecord(month: string, recordId: string, updates: Partial<SavingsRecord>) {
  if (!savingsRecords[month]) return
  
  const index = savingsRecords[month].findIndex(r => r.id === recordId)
  if (index === -1) return
  
  savingsRecords[month][index] = {
    ...savingsRecords[month][index],
    ...updates,
  }
  return savingsRecords[month][index]
}

export async function deleteSavingsRecord(month: string, recordId: string) {
  if (!savingsRecords[month]) return
  
  savingsRecords[month] = savingsRecords[month].filter(r => r.id !== recordId)
}

export async function getSavingsOverview() {
  const monthlySavings = await calculateMonthlySavings()
  
  const totalSavings = monthlySavings.reduce((sum, m) => sum + m.savingsAmount, 0)
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
