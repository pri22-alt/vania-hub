'use client'

import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export interface CheeseStats {
  totalSales?: number
  totalQuantity?: number
  transactionCount?: number
  avgTransactionValue?: number
}

export interface CustomerSales {
  customerName: string
  totalAmount: number | string
  totalQuantity: number | string
  transactionCount: number | string
}

export interface ProductSales {
  productName: string
  totalAmount: number | string
  totalQuantity: number | string
  transactionCount: number | string
}

interface SaleRecord {
  date: string | Date
  totalAmount: string | number
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export function CheeseSalesDashboard({
  stats,
  customerSales,
  productSales,
  recentSales,
}: {
  stats: CheeseStats[]
  customerSales: CustomerSales[]
  productSales: ProductSales[]
  recentSales: SaleRecord[]
}) {
  const [exportFormat, setExportFormat] = useState<'excel' | 'pdf' | null>(null)

  const currentStats = stats[0] || {}

  const formatCurrency = (amount: number | string | undefined) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Number(amount || 0))
  }

  // Prepare data for charts
  const chartCustomerData = customerSales.map(cs => ({
    name: cs.customerName,
    value: Number(cs.totalAmount),
  }))

  const chartProductData = productSales.map(ps => ({
    name: ps.productName,
    value: Number(ps.totalAmount),
  }))

  const chartTrendData = recentSales
    .slice(-30)
    .map(sale => ({
      date: new Date(sale.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      amount: Number(sale.totalAmount),
    }))

  const handleExport = (format: 'excel' | 'pdf') => {
    setExportFormat(format)
    // Placeholder for actual export logic
    alert(`Export as ${format.toUpperCase()} - Coming soon!`)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Sales</p>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(currentStats.totalSales)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Quantity</p>
          <p className="text-2xl font-bold text-green-600">{Number(currentStats.totalQuantity || 0).toFixed(2)} kg</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Transactions</p>
          <p className="text-2xl font-bold text-purple-600">{currentStats.transactionCount || 0}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Avg. Transaction</p>
          <p className="text-2xl font-bold text-orange-600">{formatCurrency(currentStats.avgTransactionValue)}</p>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Sales Trend (Last 30 Days)</h3>
          {chartTrendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-center py-8">No sales data available</p>
          )}
        </Card>

        {/* Top Customers */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Top Customers</h3>
          {chartCustomerData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartCustomerData.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="value" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-center py-8">No customer data available</p>
          )}
        </Card>

        {/* Sales by Product */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Sales by Product</h3>
          {chartProductData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartProductData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartProductData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-center py-8">No product data available</p>
          )}
        </Card>

        {/* Customer Details */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Customer Details</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-2 font-semibold">Customer</th>
                  <th className="text-right py-2 px-2 font-semibold">Total</th>
                  <th className="text-right py-2 px-2 font-semibold">Qty</th>
                </tr>
              </thead>
              <tbody>
                {customerSales.slice(0, 5).map((cs, idx) => (
                  <tr key={idx} className="border-b border-border text-sm">
                    <td className="py-2 px-2">{cs.customerName}</td>
                    <td className="text-right py-2 px-2 font-medium">{formatCurrency(cs.totalAmount)}</td>
                    <td className="text-right py-2 px-2">{Number(cs.totalQuantity).toFixed(1)} kg</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Export Options */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Export Reports</h3>
        <div className="flex gap-4">
          <Button
            onClick={() => handleExport('excel')}
            variant="outline"
          >
            Export as Excel
          </Button>
          <Button
            onClick={() => handleExport('pdf')}
            variant="outline"
          >
            Export as PDF
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Download sales reports for further analysis
        </p>
      </Card>
    </div>
  )
}
