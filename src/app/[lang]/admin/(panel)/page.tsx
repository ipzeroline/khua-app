import pool from '@/lib/db'

export default async function AdminDashboard({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const connection = await pool.getConnection()
  let memberCount = 0
  let articleCount = 0
  let staffCount = 0

  try {
    const [members] = await connection.execute('SELECT COUNT(*) as c FROM users WHERE role = ?', ['member'])
    memberCount = (members as any[])[0].c

    const [articles] = await connection.execute('SELECT COUNT(*) as c FROM articles')
    articleCount = (articles as any[])[0].c

    const [staff] = await connection.execute(
      "SELECT COUNT(*) as c FROM users WHERE role IN ('staff', 'admin')",
    )
    staffCount = (staff as any[])[0].c
  } finally {
    connection.release()
  }

  const stats = [
    { label: 'Members', value: memberCount, color: 'text-blue-600' },
    { label: 'Articles', value: articleCount, color: 'text-green-600' },
    { label: 'Staff', value: staffCount, color: 'text-purple-600' },
  ]

  return (
    <div>
      <h1 className="apple-headline text-2xl text-text">Dashboard</h1>
      <p className="mt-2 text-sm text-text-secondary">Overview of your KHUA system</p>

      <div className="mt-8 grid gap-5 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-border bg-surface p-6 shadow-sm"
          >
            <p className="text-sm text-text-secondary">{stat.label}</p>
            <p className={`apple-headline mt-2 text-4xl ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <h2 className="apple-headline text-lg text-text">Quick Links</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <a
            href={`/${lang}/admin/articles`}
            className="rounded-2xl border border-border bg-surface p-5 shadow-sm transition-colors hover:border-gold/30"
          >
            <span className="text-2xl">📄</span>
            <h3 className="mt-3 font-semibold text-text">Manage Articles</h3>
            <p className="mt-1 text-sm text-text-secondary">
              Create, edit, and publish articles in all languages
            </p>
          </a>
          <a
            href={`/${lang}/admin/members`}
            className="rounded-2xl border border-border bg-surface p-5 shadow-sm transition-colors hover:border-gold/30"
          >
            <span className="text-2xl">👤</span>
            <h3 className="mt-3 font-semibold text-text">Manage Members</h3>
            <p className="mt-1 text-sm text-text-secondary">
              View and manage registered members
            </p>
          </a>
        </div>
      </div>
    </div>
  )
}
