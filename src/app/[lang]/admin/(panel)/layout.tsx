import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'

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

  return (
    <div className="min-h-screen bg-bg">
      <AdminSidebar lang={lang} />
      <div className="ml-60">
        <AdminHeader />
        <main className="p-6 pt-20">{children}</main>
      </div>
    </div>
  )
}
