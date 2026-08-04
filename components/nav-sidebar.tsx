'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Dashboard', icon: '⊞' },
  { href: '/calendar', label: 'Calendar', icon: '📅' },
  { href: '/expenses', label: 'Expenses', icon: '↓' },
  { href: '/income', label: 'Income', icon: '↑' },
  { href: '/dues', label: 'Dues & Bills', icon: '⊙' },
  { href: '/budgets', label: 'Budgets', icon: '💰' },
  { href: '/savings', label: 'Savings', icon: '🏦' },
  { href: '/inventory', label: 'Inventory', icon: '📦' },
  { href: '/products', label: 'Products', icon: '🛍️' },
  { href: '/maid', label: 'Maid', icon: '◈' },
  { href: '/virmanis', label: 'Virmanis United', icon: '◉' },
  { href: '/analytics', label: 'Analytics', icon: '◎' },
  { href: '/settings', label: 'Settings', icon: '⚙' },
]

export function NavSidebar() {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-56 md:min-h-screen md:flex-col md:bg-sidebar md:shrink-0 md:fixed md:left-0 md:top-0">
        <div className="px-5 py-6 border-b border-sidebar-border">
          <h1 className="text-xl font-bold text-sidebar-foreground tracking-tight">Vania Hub</h1>
          <p className="text-xs text-sidebar-foreground/50 mt-0.5">Family Finance Manager</p>
        </div>
        <nav className="flex-1 px-3 py-4 flex flex-col gap-2 overflow-y-auto">
          {navItems.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                  active
                    ? 'bg-sidebar-accent text-sidebar-foreground shadow-md'
                    : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground hover:shadow-sm'
                )}
              >
                <span className="text-base leading-none">{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="px-5 py-4 border-t border-sidebar-border">
          <p className="text-xs text-sidebar-foreground/40">Vania Family &copy; {new Date().getFullYear()}</p>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 flex items-center justify-around bg-sidebar border-t border-sidebar-border px-2 py-3 gap-1 overflow-x-auto z-50 shadow-lg">
        {navItems.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0',
                active
                  ? 'bg-sidebar-accent text-sidebar-foreground shadow-md scale-105'
                  : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground hover:shadow-sm hover:scale-110'
              )}
              title={item.label}
            >
              <span className="text-lg leading-none">{item.icon}</span>
              <span className="text-xs">{item.label.split(' ')[0]}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
