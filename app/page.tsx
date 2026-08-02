import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) {
    redirect('/sign-in')
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Vania Hub</h1>
              <p className="text-muted-foreground">Home & Business Finance Manager</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Welcome,</p>
              <p className="font-semibold text-foreground">{session.user.name}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Expenses */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">Expenses</h2>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Track daily expenses with payment method and categories
            </p>
            <Link href="/expenses">
              <Button className="w-full">Manage Expenses</Button>
            </Link>
          </Card>

          {/* Income */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">Income</h2>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📈</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Record daily income from cash or bank transfers
            </p>
            <Link href="/income">
              <Button className="w-full">Log Income</Button>
            </Link>
          </Card>

          {/* Dues */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">Dues & Bills</h2>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📋</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Track bills and dues with calendar view
            </p>
            <Link href="/dues">
              <Button className="w-full">View Dues</Button>
            </Link>
          </Card>

          {/* Maid Attendance */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">Maid Attendance</h2>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⏱️</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Track maid attendance with QR code check-in
            </p>
            <Link href="/maid">
              <Button className="w-full">Manage Attendance</Button>
            </Link>
          </Card>

          {/* Cheese Sales */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">Cheese Sales</h2>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🧀</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Manage sales, track customers, generate reports
            </p>
            <Link href="/cheese-sales">
              <Button className="w-full">View Sales</Button>
            </Link>
          </Card>

          {/* Budget & Analytics */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">Analytics</h2>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              View financial insights and budget status
            </p>
            <Link href="/analytics">
              <Button className="w-full">View Analytics</Button>
            </Link>
          </Card>
        </div>
      </div>
    </main>
  )
}
