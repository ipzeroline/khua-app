'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface NavItem {
  href: string
  label: string
  icon: string
}

export default function AdminSidebar({ lang }: { lang: string }) {
  const pathname = usePathname()

  const navItems: NavItem[] = [
    { href: `/${lang}/admin`, label: 'Dashboard', icon: '◉' },
    { href: `/${lang}/admin/members`, label: 'Members', icon: '👤' },
    { href: `/${lang}/admin/orders`, label: 'Orders', icon: '▣' },
    { href: `/${lang}/admin/articles`, label: 'Articles', icon: '📄' },
    { href: `/${lang}/admin/staff`, label: 'Staff', icon: '⚙' },
  ]

  return (
    <aside className="fixed left-0 top-0 z-[90] h-screen w-60 border-r border-border bg-surface/95 backdrop-blur-xl">
      <div className="flex h-14 items-center gap-3 border-b border-border px-5">
        <span className="text-lg font-bold text-gold">KHUA</span>
        <span className="text-xs text-text-secondary">Admin</span>
      </div>
      <nav className="mt-4 space-y-0.5 px-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-gold/10 text-gold'
                  : 'text-text-secondary hover:bg-border/50 hover:text-text',
              )}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="absolute bottom-4 left-3 right-3">
        <Link
          href={`/${lang}`}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-text-secondary transition-colors hover:bg-border/50 hover:text-text"
        >
          ← Back to site
        </Link>
      </div>
    </aside>
  )
}
