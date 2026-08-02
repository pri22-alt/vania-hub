export const dynamic = 'force-dynamic'

import { getSalesStats, getSalesByCustomer, getSalesByProduct, getVirmanisSales } from '@/app/actions/virmanis'
import { getVirmaisClients, checkAndInactivateStaleClients } from '@/app/actions/virmanis-clients'
import { getExpenses } from '@/app/actions/expenses'
import { getCompanySettings, getInvoices } from '@/app/actions/invoices'
import { VirmaisClientsForm } from '@/components/virmanis-clients-form'
import { VirmaisClientsList } from '@/components/virmanis-clients-list'
import { CompanySettingsForm } from '@/components/company-settings-form'
import { InvoiceGenerator } from '@/components/invoice-generator'
import { InvoiceList } from '@/components/invoice-list'
import { VirmanisSalesForm } from '@/components/virmanis-form'
import { VirmanisAnalytics } from '@/components/virmanis-analytics'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { formatRM } from '@/lib/utils/currency'

export default async function VirmanisSalesPage() {
  const staleClients = await checkAndInactivateStaleClients()

  const now = new Date()
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

  const [sales, stats, customerSales, productSales, clients, expenses, companySettings, invoices] = await Promise.all([
    getVirmanisSales(startDate, endDate),
    getSalesStats(startDate, endDate),
    getSalesByCustomer(startDate, endDate),
    getSalesByProduct(startDate, endDate),
    getVirmaisClients(),
    getExpenses(startDate, endDate),
    getCompanySettings(),
    getInvoices(),
  ])

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground">Virmanis United</h2>
        <p className="text-muted-foreground text-sm mt-2">Cheese business dashboard and client management</p>
      </div>

      {staleClients && staleClients.length > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
            {staleClients.length} client{staleClients.length > 1 ? 's' : ''} marked as inactive
          </p>
          <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
            No sales in the last 2 months: {staleClients.map((c) => c.clientName).join(', ')}
          </p>
          <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
            You can reactivate them in the Clients Directory if they become active again.
          </p>
        </div>
      )}

      {/* Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <a href="#analytics" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors text-center">
          Analytics
        </a>
        <a href="#clients" className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors text-center">
          Clients
        </a>
        <a href="#invoices" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors text-center">
          Invoices
        </a>
        <a href="#settings" className="px-4 py-2 bg-muted text-muted-foreground rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors text-center">
          Settings
        </a>
      </div>

      <Accordion type="single" collapsible defaultValue="analytics" className="w-full space-y-3">
        {/* Analytics + Sales (filterable) */}
        <AccordionItem value="analytics" className="border border-border rounded-lg" id="analytics">
          <AccordionTrigger className="px-4 hover:no-underline hover:bg-muted/50">
            <span className="text-lg font-semibold text-foreground">Analytics &amp; Sales Records</span>
          </AccordionTrigger>
          <AccordionContent className="px-4 pt-4 pb-6">
            <VirmanisAnalytics
              initialStats={stats}
              initialCustomerSales={customerSales}
              initialProductSales={productSales}
              initialSales={sales as any}
              initialExpenses={expenses}
              initialStartDate={startDate}
              initialEndDate={endDate}
            />
          </AccordionContent>
        </AccordionItem>

        {/* Add Sale */}
        <AccordionItem value="add-sale" className="border border-border rounded-lg">
          <AccordionTrigger className="px-4 hover:no-underline hover:bg-muted/50">
            <span className="text-lg font-semibold text-foreground">Add Sale</span>
          </AccordionTrigger>
          <AccordionContent className="px-4 pt-4 pb-6">
            <VirmanisSalesForm />
          </AccordionContent>
        </AccordionItem>

        {/* Clients Directory */}
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

        {/* Invoices */}
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

        {/* Company Settings */}
        <AccordionItem value="settings" className="border border-border rounded-lg" id="settings">
          <AccordionTrigger className="px-4 hover:no-underline hover:bg-muted/50">
            <span className="text-lg font-semibold text-foreground">Company Settings</span>
          </AccordionTrigger>
          <AccordionContent className="px-4 pt-4 pb-6">
            <CompanySettingsForm settings={companySettings} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
