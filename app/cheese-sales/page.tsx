'use server'

import { auth } from '@/lib/auth'
import { getCheesSales, getSalesStats, getSalesByCustomer, getSalesByProduct } from '@/app/actions/cheese-sales'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { CheeseSalesForm } from '@/components/cheese-sales-form'
import { CheeseSalesList } from '@/components/cheese-sales-list'
import { CheeseSalesDashboard } from '@/components/cheese-sales-dashboard'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function CheeseSalesPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) {
    redirect('/sign-in')
  }

  const sales = await getCheesSales()
  const stats = await getSalesStats()
  const customerSales = await getSalesByCustomer()
  const productSales = await getSalesByProduct()

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/">
                <h1 className="text-3xl font-bold text-foreground hover:opacity-80">Vania Hub</h1>
              </Link>
              <p className="text-muted-foreground">Cheese Sales & Analytics</p>
            </div>
            <Link href="/">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Dashboard */}
        <div className="mb-12">
          <CheeseSalesDashboard
            stats={stats}
            customerSales={customerSales}
            productSales={productSales}
            recentSales={sales}
          />
        </div>

        {/* Add Form and List */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Form */}
          <div className="lg:col-span-1">
            <CheeseSalesForm />
          </div>

          {/* Sales List */}
          <div className="lg:col-span-3">
            <CheeseSalesList sales={sales} />
          </div>
        </div>
      </div>
    </main>
  )
}
