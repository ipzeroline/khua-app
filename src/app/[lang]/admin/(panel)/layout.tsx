import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'
import pool from '@/lib/db'

async function getAdminCounts() {
  const connection = await pool.getConnection()

  try {
    const [members] = await connection.execute('SELECT COUNT(*) as c FROM users WHERE role = ?', ['member'])
    const [orders] = await connection.execute('SELECT COUNT(*) as c FROM orders')
    const [articles] = await connection.execute('SELECT COUNT(*) as c FROM articles')
    const [staff] = await connection.execute("SELECT COUNT(*) as c FROM users WHERE role IN ('staff', 'admin')")

    return {
      members: Number((members as any[])[0]?.c || 0),
      orders: Number((orders as any[])[0]?.c || 0),
      articles: Number((articles as any[])[0]?.c || 0),
      staff: Number((staff as any[])[0]?.c || 0),
    }
  } finally {
    connection.release()
  }
}

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const user = await getSession()

  if (!user) {
    redirect(`/${lang}/admin/login`)
  }

  if (user.role !== 'staff' && user.role !== 'admin') {
    redirect(`/${lang}/account`)
  }

  const counts = await getAdminCounts()

  return (
    <div className="min-h-screen bg-bg">
      <AdminSidebar lang={lang} counts={counts} />
      <div className="ml-60">
        <AdminHeader />
        <main className="p-6 pt-20">{children}</main>
      </div>
    </div>
  )
}
