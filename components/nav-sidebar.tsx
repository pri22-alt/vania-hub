'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Dashboard', icon: '⊞' },
  { href: '/expenses', label: 'Expenses', icon: '↓' },
  { href: '/income', label: 'Income', icon: '↑' },
  { href: '/dues', label: 'Dues & Bills', icon: '⊙' },
  { href: '/maid', label: 'Maid', icon: '◈' },
  { href: '/virmanis', label: 'Virmanis United', icon: '◉' },
  { href: '/analytics', label: 'Analytics', icon: '◎' },
  { href: '/settings', label: 'Settings', icon: '⚙' },
]

export function NavSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 min-h-screen flex flex-col bg-sidebar shrink-0">
      <div className="px-5 py-6 border-b border-sidebar-border">
        <h1 className="text-xl font-bold text-sidebar-foreground tracking-tight">Vania Hub</h1>
        <p className="text-xs text-sidebar-foreground/50 mt-0.5">Family Finance Manager</p>
      </div>
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {navItems.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-sidebar-accent text-sidebar-foreground'
                  : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
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
  )
}
