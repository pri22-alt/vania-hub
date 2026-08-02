export const dynamic = 'force-dynamic'

import { getVirmanisSales, getSalesStats } from '@/app/actions/virmanis'
import { getVirmaisClients, checkAndInactivateStaleClients } from '@/app/actions/virmanis-clients'
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
  // Check for and inactivate clients with no sales in 2 months
  const staleClients = await checkAndInactivateStaleClients()

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

      {/* Stale Clients Notification */}
      {staleClients && staleClients.length > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
            {staleClients.length} client{staleClients.length > 1 ? 's' : ''} marked as inactive
          </p>
          <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
            No sales in the last 2 months: {staleClients.map(c => c.clientName).join(', ')}
          </p>
          <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
            You can reactivate them in the Clients Directory if they become active again.
          </p>
        </div>
      )}

      {/* Quick Stats - Analytics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <p className="text-xs text-green-700 dark:text-green-300 font-medium">Total Sales</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">{formatRM(totalSales)}</p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">{txCount} transactions</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-xs text-red-700 dark:text-red-300 font-medium">Business Expenses</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-2">{formatRM(totalBusinessExpenses)}</p>
        </div>
        <div className={`bg-gradient-to-br ${netProfit >= 0 ? 'from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900' : 'from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900'} border ${netProfit >= 0 ? 'border-emerald-200 dark:border-emerald-800' : 'border-orange-200 dark:border-orange-800'} rounded-lg p-4`}>
          <p className={`text-xs ${netProfit >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-orange-700 dark:text-orange-300'} font-medium`}>Net Profit</p>
          <p className={`text-2xl font-bold mt-2 ${netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-orange-600 dark:text-orange-400'}`}>
            {formatRM(netProfit)}
          </p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">Total Clients</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">{clients.length}</p>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <a href="#clients" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors text-center">
          View Clients
        </a>
        <a href="#sales" className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors text-center">
          Sales Records
        </a>
        <a href="#invoices" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors text-center">
          Generate Invoice
        </a>
        <a href="#settings" className="px-4 py-2 bg-muted text-muted-foreground rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors text-center">
          Settings
        </a>
      </div>

      {/* Accordion Sections */}
      <Accordion type="single" collapsible defaultValue="analytics" className="w-full space-y-3">
        {/* Analytics Section */}
        <AccordionItem value="analytics" className="border border-border rounded-lg">
          <AccordionTrigger className="px-4 hover:no-underline hover:bg-muted/50">
            <span className="text-lg font-semibold text-foreground">Analytics & Overview</span>
          </AccordionTrigger>
          <AccordionContent className="px-4 pt-4 pb-6">
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
          </AccordionContent>
        </AccordionItem>

        {/* Clients Section */}
        <AccordionItem value="clients" className="border border-border rounded-lg" id="clients">
          <AccordionTrigger className="px-4 hover:no-underline hover:bg-muted/50">
            <span className="text-lg font-semibold text-foreground">Clients Directory</span>
          </AccordionTrigger>
          <AccordionContent className="px-4 pt-4 pb-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <VirmaisClientsForm />
              </div>
              <div className="lg:col-span-2">
                <VirmaisClientsList clients={clients} />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Sales Records Section */}
        <AccordionItem value="sales" className="border border-border rounded-lg" id="sales">
          <AccordionTrigger className="px-4 hover:no-underline hover:bg-muted/50">
            <span className="text-lg font-semibold text-foreground">Sales Records</span>
          </AccordionTrigger>
          <AccordionContent className="px-4 pt-4 pb-6">
            <VirmanisList sales={sales} />
          </AccordionContent>
        </AccordionItem>

        {/* Business Spending Section */}
        <AccordionItem value="spending" className="border border-border rounded-lg">
          <AccordionTrigger className="px-4 hover:no-underline hover:bg-muted/50">
            <span className="text-lg font-semibold text-foreground">Business Spending</span>
          </AccordionTrigger>
          <AccordionContent className="px-4 pt-4 pb-6">
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
          </AccordionContent>
        </AccordionItem>

        {/* Company Settings Section */}
        <AccordionItem value="settings" className="border border-border rounded-lg" id="settings">
          <AccordionTrigger className="px-4 hover:no-underline hover:bg-muted/50">
            <span className="text-lg font-semibold text-foreground">Company Settings</span>
          </AccordionTrigger>
          <AccordionContent className="px-4 pt-4 pb-6">
            <CompanySettingsForm settings={companySettings} />
          </AccordionContent>
        </AccordionItem>

        {/* Invoice Generation Section */}
        <AccordionItem value="invoices" className="border border-border rounded-lg" id="invoices">
          <AccordionTrigger className="px-4 hover:no-underline hover:bg-muted/50">
            <span className="text-lg font-semibold text-foreground">Generate Invoices</span>
          </AccordionTrigger>
          <AccordionContent className="px-4 pt-4 pb-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <InvoiceGenerator clients={clients} settings={companySettings} />
              </div>
              <div className="lg:col-span-2">
                <InvoiceList invoices={invoices} companySettings={companySettings} />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
