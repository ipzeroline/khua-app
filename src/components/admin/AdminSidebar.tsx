'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface NavItem {
  href: string
  label: string
  icon: string
  count?: number
}

interface AdminSidebarProps {
  lang: string
  counts?: {
    members: number
    orders: number
    articles: number
    staff: number
  }
}

export default function AdminSidebar({ lang, counts }: AdminSidebarProps) {
  const pathname = usePathname()

  const navItems: NavItem[] = [
    { href: `/${lang}/admin`, label: 'Dashboard', icon: '◉' },
    { href: `/${lang}/admin/members`, label: 'Members', icon: '👤', count: counts?.members },
    { href: `/${lang}/admin/orders`, label: 'Orders', icon: '▣', count: counts?.orders },
    { href: `/${lang}/admin/articles`, label: 'Articles', icon: '📄', count: counts?.articles },
    { href: `/${lang}/admin/staff`, label: 'Staff', icon: '⚙', count: counts?.staff },
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
              <span className="flex-1">{item.label}</span>
              {typeof item.count === 'number' ? (
                <span
                  className={cn(
                    'min-w-7 rounded-full px-2 py-0.5 text-center text-[11px] font-semibold',
                    isActive ? 'bg-gold text-white' : 'bg-border/70 text-text-secondary',
                  )}
                >
                  {item.count.toLocaleString()}
                </span>
              ) : null}
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
