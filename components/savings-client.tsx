'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatRM } from '@/lib/utils/currency'
import { setSavingsGoal, recordSavings, getSavingsRecords } from '@/app/actions/savings'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export function SavingsClient({ initialData }: any) {
  const [data, setData] = useState(initialData)
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7))
  const [goalAmount, setGoalAmount] = useState('')
  const [recordForm, setRecordForm] = useState({
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    location: 'bank' as 'cash' | 'bank',
    notes: '',
  })
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showRecordForm, setShowRecordForm] = useState(false)

  const currentMonthData = data.monthlySavings?.[0]

  const handleSetGoal = async () => {
    if (!selectedMonth || !goalAmount) return
    setLoading(true)
    try {
      await setSavingsGoal(selectedMonth, parseFloat(goalAmount))
      setGoalAmount('')
      const newData = await import('@/app/actions/savings').then((m) => m.getSavingsOverview())
      setData(newData)
    } finally {
      setLoading(false)
    }
  }

  const handleRecordSavings = async () => {
    if (!selectedMonth || !recordForm.amount || !recordForm.date) return
    setLoading(true)
    try {
      await recordSavings(selectedMonth, parseFloat(recordForm.amount), recordForm.date, recordForm.location, recordForm.notes)
      setRecordForm({ amount: '', date: new Date().toISOString().slice(0, 10), location: 'bank', notes: '' })
      setShowRecordForm(false)
      
      // Refresh records and overview
      const newRecords = await import('@/app/actions/savings').then((m) => m.getSavingsRecords(selectedMonth))
      setRecords(newRecords)
      const newData = await import('@/app/actions/savings').then((m) => m.getSavingsOverview())
      setData(newData)
    } finally {
      setLoading(false)
    }
  }

  const handleMonthChange = async (month: string) => {
    setSelectedMonth(month)
    const newRecords = await import('@/app/actions/savings').then((m) => m.getSavingsRecords(month))
    setRecords(newRecords)
  }

  const monthlyGoal = data.monthlySavings?.find((m: any) => m.month === selectedMonth)?.savingsGoal || 0
  const monthlyAmount = records.reduce((sum: number, r: any) => sum + r.amount, 0)
  const goalProgress = monthlyGoal > 0 ? (monthlyAmount / monthlyGoal) * 100 : 0
  const isGoalMet = monthlyAmount >= monthlyGoal

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Savings Tracker</h1>
        <p className="text-muted-foreground mt-2">Set monthly goals and track your savings progress</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-6 bg-emerald-50 border-emerald-200">
          <p className="text-sm text-emerald-700 font-medium">Total Savings</p>
          <p className="text-2xl font-bold text-emerald-900 mt-2">{formatRM(data.totalSavings)}</p>
        </Card>
        <Card className="p-6 bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-700 font-medium">Total Goals</p>
          <p className="text-2xl font-bold text-blue-900 mt-2">{formatRM(data.totalGoals)}</p>
        </Card>
        <Card className="p-6 bg-purple-50 border-purple-200">
          <p className="text-sm text-purple-700 font-medium">Avg. Savings Rate</p>
          <p className="text-2xl font-bold text-purple-900 mt-2">{data.averageSavingsRate.toFixed(1)}%</p>
        </Card>
        <Card className="p-6 bg-amber-50 border-amber-200">
          <p className="text-sm text-amber-700 font-medium">This Month Saved</p>
          <p className="text-2xl font-bold text-amber-900 mt-2">
            {currentMonthData ? formatRM(currentMonthData.savingsAmount) : formatRM(0)}
          </p>
        </Card>
      </div>

      {/* Monthly Goal & Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Set Goal */}
        <Card className="p-6 lg:col-span-1">
          <h3 className="text-lg font-semibold text-foreground mb-4">Set Monthly Goal</h3>
          
          <div className="flex flex-col gap-3 mb-4">
            <div>
              <Label htmlFor="month" className="text-sm">Month</Label>
              <select
                id="month"
                value={selectedMonth}
                onChange={(e) => handleMonthChange(e.target.value)}
                className="w-full border border-input rounded-md px-3 py-2 text-sm mt-1 bg-background"
              >
                {data.monthlySavings?.map((m: any) => (
                  <option key={m.month} value={m.month}>
                    {new Date(`${m.month}-01`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="goalAmount" className="text-sm">Goal Amount (RM)</Label>
              <Input
                id="goalAmount"
                type="number"
                step="0.01"
                placeholder="e.g., 1000"
                value={goalAmount}
                onChange={(e) => setGoalAmount(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <Button onClick={handleSetGoal} disabled={loading || !goalAmount} className="w-full">
            {loading ? 'Setting...' : 'Set Goal'}
          </Button>

          {monthlyGoal > 0 && (
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Monthly Goal: {formatRM(monthlyGoal)}</p>
              <div className="w-full bg-background rounded-full h-3 overflow-hidden mb-2">
                <div
                  className={`h-full transition-all ${isGoalMet ? 'bg-emerald-500' : 'bg-blue-500'}`}
                  style={{ width: `${Math.min(100, goalProgress)}%` }}
                />
              </div>
              <p className="text-sm font-medium">
                {formatRM(monthlyAmount)} / {formatRM(monthlyGoal)} ({goalProgress.toFixed(0)}%)
              </p>
            </div>
          )}
        </Card>

        {/* Record Savings */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Record Savings</h3>
            <Button
              size="sm"
              variant={showRecordForm ? 'default' : 'outline'}
              onClick={() => setShowRecordForm(!showRecordForm)}
            >
              {showRecordForm ? 'Close' : '+ Add Savings'}
            </Button>
          </div>

          {showRecordForm && (
            <div className="bg-muted/30 p-4 rounded-lg mb-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="recordAmount" className="text-sm">Amount (RM)</Label>
                  <Input
                    id="recordAmount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={recordForm.amount}
                    onChange={(e) => setRecordForm({ ...recordForm, amount: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="recordDate" className="text-sm">Date</Label>
                  <Input
                    id="recordDate"
                    type="date"
                    value={recordForm.date}
                    onChange={(e) => setRecordForm({ ...recordForm, date: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location" className="text-sm">Location</Label>
                <select
                  id="location"
                  value={recordForm.location}
                  onChange={(e) => setRecordForm({ ...recordForm, location: e.target.value as 'cash' | 'bank' })}
                  className="w-full border border-input rounded-md px-3 py-2 text-sm mt-1 bg-background"
                >
                  <option value="bank">Bank</option>
                  <option value="cash">Cash</option>
                </select>
              </div>

              <div>
                <Label htmlFor="notes" className="text-sm">Notes (Optional)</Label>
                <Input
                  id="notes"
                  type="text"
                  placeholder="e.g., Bonus from work"
                  value={recordForm.notes}
                  onChange={(e) => setRecordForm({ ...recordForm, notes: e.target.value })}
                  className="mt-1"
                />
              </div>

              <Button onClick={handleRecordSavings} disabled={loading || !recordForm.amount} className="w-full">
                {loading ? 'Recording...' : 'Record Savings'}
              </Button>
            </div>
          )}

          {/* Savings Records Table */}
          {records.length > 0 && (
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium">Date</th>
                    <th className="px-4 py-2 text-left font-medium">Amount</th>
                    <th className="px-4 py-2 text-left font-medium">Location</th>
                    <th className="px-4 py-2 text-left font-medium">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record: any) => (
                    <tr key={record.id} className="border-t border-border hover:bg-muted/30">
                      <td className="px-4 py-3">
                        {new Date(`${record.date}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-4 py-3 font-semibold text-emerald-600">{formatRM(record.amount)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          record.location === 'bank' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {record.location === 'bank' ? '🏦 Bank' : '💵 Cash'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{record.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {records.length === 0 && !showRecordForm && (
            <p className="text-center text-muted-foreground py-4">No savings recorded for this month yet</p>
          )}
        </Card>
      </div>

      {/* Chart */}
      {data.monthlySavings?.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Monthly Savings vs Goals</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.monthlySavings}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis 
                dataKey="month" 
                stroke="var(--muted-foreground)"
                tickFormatter={(month) => new Date(`${month}-01`).toLocaleDateString('en-US', { month: 'short' })}
              />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip 
                formatter={(value) => formatRM(Number(value))}
                contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }}
              />
              <Legend />
              <Bar dataKey="savingsGoal" fill="var(--chart-1)" name="Goal" />
              <Bar dataKey="savingsAmount" fill="var(--chart-2)" name="Saved" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  )
}
