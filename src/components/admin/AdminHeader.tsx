'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

interface StaffUser {
  id: number
  name: string
  email: string
  role: string
}

export default function AdminHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<StaffUser | null>(null)
  const lang = pathname.split('/')[1] || 'th'

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user)
      })
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    router.replace(`/${lang}/admin/login`)
    router.refresh()
  }

  return (
    <header className="fixed left-60 right-0 top-0 z-[90] flex h-14 items-center justify-end gap-4 border-b border-border bg-surface/95 px-6 backdrop-blur-xl">
      {user && (
        <div className="flex items-center gap-3 text-sm">
          <span className="text-text-secondary">{user.name}</span>
          <span className="rounded-full bg-gold/10 px-2.5 py-0.5 text-xs font-medium text-gold">
            {user.role}
          </span>
          <button
            onClick={handleLogout}
            className="rounded-full border border-red-200 bg-red-50 px-4 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
          >
            ออกจากระบบ
          </button>
        </div>
      )}
    </header>
  )
}
