export const dynamic = 'force-dynamic'

import { getVirmanisSales, getSalesStats } from '@/app/actions/virmanis'
import { getVirmaisClients } from '@/app/actions/virmanis-clients'
import { getExpenses } from '@/app/actions/expenses'
import { getCompanySettings, getInvoices } from '@/app/actions/invoices'
import { VirmanisList } from '@/components/virmanis-list'
import { VirmaisClientsForm } from '@/components/virmanis-clients-form'
import { VirmaisClientsList } from '@/components/virmanis-clients-list'
import { CompanySettingsForm } from '@/components/company-settings-form'
import { InvoiceGenerator } from '@/components/invoice-generator'
import { InvoiceList } from '@/components/invoice-list'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { formatRM } from '@/lib/utils/currency'

export default async function VirmanisSalesPage() {
  const [sales, stats, clients, expenses, companySettings, invoices] = await Promise.all([
    getVirmanisSales(),
    getSalesStats(),
    getVirmaisClients(),
    getExpenses(),
    getCompanySettings(),
    getInvoices(),
  ])
  
  const totalSales = Number(stats[0]?.totalSales || 0)
  const txCount = Number(stats[0]?.transactionCount || 0)
  const businessExpenses = expenses.filter(e => e.categoryType === 'business')
  const totalBusinessExpenses = businessExpenses.reduce((sum, e) => sum + Number(e.amount), 0)
  const netProfit = totalSales - totalBusinessExpenses

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground">Virmanis United</h2>
        <p className="text-muted-foreground text-sm mt-2">Cheese business dashboard and client management</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground">Total Sales</p>
          <p className="text-2xl font-bold text-green-600">{formatRM(totalSales)}</p>
          <p className="text-xs text-muted-foreground mt-1">{txCount} transactions</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground">Business Expenses</p>
          <p className="text-2xl font-bold text-rose-600">{formatRM(totalBusinessExpenses)}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground">Net Profit</p>
          <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {formatRM(netProfit)}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground">Total Clients</p>
          <p className="text-2xl font-bold text-blue-600">{clients.length}</p>
        </div>
      </div>

      {/* Section 1: Clients Rolodex */}
      <div className="mb-12">
        <h3 className="text-2xl font-bold text-foreground mb-6">1. Clients Directory</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <VirmaisClientsForm />
          </div>
          <div className="lg:col-span-2">
            <VirmaisClientsList clients={clients} />
          </div>
        </div>
      </div>

      {/* Section 2: Sales by Clients */}
      <div className="mb-12">
        <h3 className="text-2xl font-bold text-foreground mb-6">2. Sales Records</h3>
        <VirmanisList sales={sales} />
      </div>

      {/* Section 3: Business Spending */}
      <div className="mb-12">
        <h3 className="text-2xl font-bold text-foreground mb-6">3. Business Spending</h3>
        <div className="bg-card border border-border rounded-lg p-6">
          {businessExpenses.length === 0 ? (
            <p className="text-muted-foreground text-sm">No business expenses recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {businessExpenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between border-b border-border pb-3 last:border-b-0">
                  <div>
                    <p className="font-medium text-foreground">{expense.description}</p>
                    <p className="text-xs text-muted-foreground">{expense.date} • {expense.category}</p>
                  </div>
                  <p className="font-semibold text-rose-600">{formatRM(Number(expense.amount))}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Section 4: Analytics */}
      <div className="mb-12">
        <h3 className="text-2xl font-bold text-foreground mb-6">4. Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <h4 className="font-semibold text-foreground mb-4">Top Clients by Spending</h4>
            {clients.length === 0 ? (
              <p className="text-muted-foreground text-sm">No client data yet.</p>
            ) : (
              <div className="space-y-2">
                {clients
                  .sort((a, b) => Number(b.totalSpent) - Number(a.totalSpent))
                  .slice(0, 5)
                  .map((client) => (
                    <div key={client.id} className="flex items-center justify-between">
                      <span className="text-sm text-foreground">{client.clientName}</span>
                      <span className="font-semibold text-green-600">{formatRM(Number(client.totalSpent))}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h4 className="font-semibold text-foreground mb-4">Financial Summary</h4>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-lg font-bold text-green-600">{formatRM(totalSales)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-lg font-bold text-rose-600">{formatRM(totalBusinessExpenses)}</p>
              </div>
              <div className="border-t border-border pt-3">
                <p className="text-sm text-muted-foreground">Net Profit</p>
                <p className={`text-lg font-bold ${netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {formatRM(netProfit)}
                </p>
                {totalSales > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Margin: {(((netProfit) / totalSales) * 100).toFixed(1)}%
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 5: Company Settings */}
      <div className="mb-12">
        <h3 className="text-2xl font-bold text-foreground mb-6">5. Company Settings (Invoicing)</h3>
        <CompanySettingsForm settings={companySettings} />
      </div>

      {/* Section 6: Invoice Generation */}
      <div className="mb-12">
        <h3 className="text-2xl font-bold text-foreground mb-6">6. Generate Invoices</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <InvoiceGenerator clients={clients} settings={companySettings} />
          </div>
          <div className="lg:col-span-2">
            <InvoiceList invoices={invoices} companySettings={companySettings} />
          </div>
        </div>
      </div>
    </div>
  )
}
