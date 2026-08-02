'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatRM } from '@/lib/utils/currency'
import { setSavingsGoal, recordSavings } from '@/app/actions/savings'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'

export function SavingsClient({ initialData }: any) {
  const [data, setData] = useState(initialData)
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null)
  const [goalAmount, setGoalAmount] = useState('')
  const [savedAmount, setSavedAmount] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSetGoal = async () => {
    if (!selectedMonth || !goalAmount) return
    setLoading(true)
    try {
      await setSavingsGoal(selectedMonth, parseFloat(goalAmount))
      setGoalAmount('')
      setSelectedMonth(null)
      // Refresh data
      const newData = await import('@/app/actions/savings').then((m) => m.getSavingsOverview())
      setData(newData)
    } finally {
      setLoading(false)
    }
  }

  const handleRecordSavings = async () => {
    if (!selectedMonth || !savedAmount) return
    setLoading(true)
    try {
      await recordSavings(selectedMonth, parseFloat(savedAmount))
      setSavedAmount('')
      setSelectedMonth(null)
      const newData = await import('@/app/actions/savings').then((m) => m.getSavingsOverview())
      setData(newData)
    } finally {
      setLoading(false)
    }
  }

  const currentMonth = new Date().toISOString().slice(0, 7)
  const currentMonthData = data.monthlySavings?.[0]

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Savings Tracker</h1>
        <p className="text-muted-foreground mt-2">Track your savings goals and achievements each month</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-6 bg-emerald-50 border-emerald-200">
          <p className="text-sm text-emerald-700 font-medium">Total Savings</p>
          <p className="text-2xl font-bold text-emerald-900 mt-2">{formatRM(data.totalSavings)}</p>
        </Card>
        <Card className="p-6 bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-700 font-medium">Total Savings Goals</p>
          <p className="text-2xl font-bold text-blue-900 mt-2">{formatRM(data.totalGoals)}</p>
        </Card>
        <Card className="p-6 bg-purple-50 border-purple-200">
          <p className="text-sm text-purple-700 font-medium">Avg. Savings Rate</p>
          <p className="text-2xl font-bold text-purple-900 mt-2">{data.averageSavingsRate.toFixed(1)}%</p>
        </Card>
        <Card className="p-6 bg-amber-50 border-amber-200">
          <p className="text-sm text-amber-700 font-medium">This Month</p>
          <p className="text-2xl font-bold text-amber-900 mt-2">
            {currentMonthData ? formatRM(currentMonthData.savingsAmount) : formatRM(0)}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Charts */}
        <Card className="p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold mb-6">Monthly Savings Breakdown</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={data.monthlySavings.slice().reverse()}
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value: any) => formatRM(value)}
                labelFormatter={(label) => `Month: ${label}`}
              />
              <Legend />
              <Bar dataKey="savingsGoal" fill="#3b82f6" name="Goal" />
              <Bar dataKey="savingsAmount" fill="#10b981" name="Actual" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>

          <div className="space-y-4">
            <div>
              <Label htmlFor="month">Select Month</Label>
              <input
                id="month"
                type="month"
                value={selectedMonth || ''}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full border border-input rounded px-3 py-2 text-sm mt-1"
              />
            </div>

            {selectedMonth && (
              <>
                <div>
                  <Label htmlFor="goal">Set Savings Goal (RM)</Label>
                  <Input
                    id="goal"
                    type="number"
                    step="0.01"
                    placeholder="Goal amount"
                    value={goalAmount}
                    onChange={(e) => setGoalAmount(e.target.value)}
                    className="mt-1"
                  />
                  <Button
                    type="button"
                    onClick={handleSetGoal}
                    disabled={loading || !goalAmount}
                    className="w-full mt-2 text-sm"
                    size="sm"
                  >
                    {loading ? 'Setting...' : 'Set Goal'}
                  </Button>
                </div>

                <div className="border-t border-border pt-4">
                  <Label htmlFor="saved">Record Savings (RM)</Label>
                  <Input
                    id="saved"
                    type="number"
                    step="0.01"
                    placeholder="Amount saved"
                    value={savedAmount}
                    onChange={(e) => setSavedAmount(e.target.value)}
                    className="mt-1"
                  />
                  <Button
                    type="button"
                    onClick={handleRecordSavings}
                    disabled={loading || !savedAmount}
                    className="w-full mt-2 text-sm"
                    size="sm"
                  >
                    {loading ? 'Recording...' : 'Record Savings'}
                  </Button>
                </div>
              </>
            )}

            {!selectedMonth && (
              <p className="text-sm text-muted-foreground text-center py-4">Select a month to add goals or record savings</p>
            )}
          </div>
        </Card>
      </div>

      {/* Monthly Details Table */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-6">Monthly Details</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 font-medium">Month</th>
                <th className="text-right py-3 px-2 font-medium">Income</th>
                <th className="text-right py-3 px-2 font-medium">Expenses</th>
                <th className="text-right py-3 px-2 font-medium">Net</th>
                <th className="text-right py-3 px-2 font-medium">Goal</th>
                <th className="text-right py-3 px-2 font-medium">Saved</th>
                <th className="text-right py-3 px-2 font-medium">Rate</th>
              </tr>
            </thead>
            <tbody>
              {data.monthlySavings.map((month: any) => {
                const goalMet = month.savingsAmount >= month.savingsGoal
                return (
                  <tr key={month.month} className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-2 font-medium">{month.month}</td>
                    <td className="text-right py-3 px-2 text-emerald-600">{formatRM(month.totalIncome)}</td>
                    <td className="text-right py-3 px-2 text-rose-600">{formatRM(month.totalExpenses)}</td>
                    <td className="text-right py-3 px-2 font-semibold">{formatRM(month.netIncome)}</td>
                    <td className="text-right py-3 px-2">{formatRM(month.savingsGoal)}</td>
                    <td className={`text-right py-3 px-2 font-medium ${goalMet ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {formatRM(month.savingsAmount)}
                    </td>
                    <td className="text-right py-3 px-2">{month.savingsPercentage.toFixed(1)}%</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
