export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { getFinancialOverview } from '@/app/actions/analytics'
import { getDues } from '@/app/actions/dues'

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)
}

const navCards = [
  { href: '/expenses', label: 'Expenses', desc: 'Track daily spending', color: 'bg-rose-50 border-rose-200', text: 'text-rose-700' },
  { href: '/income', label: 'Income', desc: 'Record earnings', color: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700' },
  { href: '/dues', label: 'Dues & Bills', desc: 'Manage payments', color: 'bg-amber-50 border-amber-200', text: 'text-amber-700' },
  { href: '/maid', label: 'Maid Attendance', desc: 'Clock in / out', color: 'bg-sky-50 border-sky-200', text: 'text-sky-700' },
  { href: '/virmanis', label: 'Virmanis United', desc: 'Business revenue', color: 'bg-orange-50 border-orange-200', text: 'text-orange-700' },
  { href: '/analytics', label: 'Analytics', desc: 'Reports & insights', color: 'bg-violet-50 border-violet-200', text: 'text-violet-700' },
]

export default async function DashboardPage() {
  const [overview, allDues] = await Promise.all([
    getFinancialOverview(),
    getDues(),
  ])

  const pending = allDues.filter(d => d.status === 'pending')
  const net = overview.totalIncome + overview.totalSales - overview.totalExpenses

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">This Month Income</p>
          <p className="text-lg font-bold text-emerald-600">{formatCurrency(overview.totalIncome)}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">This Month Expenses</p>
          <p className="text-lg font-bold text-rose-600">{formatCurrency(overview.totalExpenses)}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Cheese Sales</p>
          <p className="text-lg font-bold text-orange-600">{formatCurrency(overview.totalSales)}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Net Balance</p>
          <p className={`text-lg font-bold ${net >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{formatCurrency(net)}</p>
        </div>
      </div>

      {/* Nav Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        {navCards.map((card) => (
          <Link key={card.href} href={card.href}
            className={`rounded-xl border p-4 ${card.color} hover:shadow-md transition-all hover:-translate-y-0.5`}>
            <p className={`font-semibold text-sm ${card.text}`}>{card.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{card.desc}</p>
          </Link>
        ))}
      </div>

      {/* Pending Dues */}
      {pending.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-amber-800 text-sm">{pending.length} Pending Due{pending.length > 1 ? 's' : ''}</p>
            <Link href="/dues" className="text-xs text-amber-600 hover:underline">View all</Link>
          </div>
          <div className="flex flex-col gap-2">
            {pending.slice(0, 4).map(due => (
              <div key={due.id} className="flex items-center justify-between text-sm">
                <span className="text-amber-700 truncate">{due.description}</span>
                <span className="font-semibold text-amber-800 ml-2 shrink-0">{formatCurrency(Number(due.amount))}</span>
              </div>
            ))}
          </div>
          {pending.length > 4 && (
            <p className="text-xs text-amber-600 mt-2">+{pending.length - 4} more</p>
          )}
        </div>
      )}
    </div>
  )
}
