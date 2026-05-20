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
  let orderCount = 0
  let staffCount = 0
  let revenueTotal = 0
  let pendingOrderCount = 0
  let publishedArticleCount = 0
  let draftArticleCount = 0
  let recentOrders: Array<{ order_number: string; customer_name: string; total: string; status: string }> = []
  let recentArticles: Array<{ slug: string; status: string; updated_at: string }> = []

  try {
    const [members] = await connection.execute('SELECT COUNT(*) as c FROM users WHERE role = ?', ['member'])
    memberCount = (members as any[])[0].c

    const [articles] = await connection.execute('SELECT COUNT(*) as c FROM articles')
    articleCount = (articles as any[])[0].c
    const [articleStatusRows] = await connection.execute(
      "SELECT status, COUNT(*) as c FROM articles GROUP BY status",
    )
    for (const row of articleStatusRows as any[]) {
      if (row.status === 'published') publishedArticleCount = Number(row.c || 0)
      if (row.status === 'draft') draftArticleCount = Number(row.c || 0)
    }

    const [orders] = await connection.execute(
      "SELECT COUNT(*) as c, COALESCE(SUM(CASE WHEN status != 'cancelled' THEN total ELSE 0 END), 0) as revenue FROM orders",
    )
    orderCount = Number((orders as any[])[0].c || 0)
    revenueTotal = Number((orders as any[])[0].revenue || 0)
    const [pendingOrders] = await connection.execute(
      "SELECT COUNT(*) as c FROM orders WHERE status IN ('pending', 'confirmed', 'preparing')",
    )
    pendingOrderCount = Number((pendingOrders as any[])[0].c || 0)

    const [orderRows] = await connection.execute(
      `SELECT o.order_number, o.total, o.status, u.name as customer_name
       FROM orders o
       INNER JOIN users u ON u.id = o.user_id
       ORDER BY o.created_at DESC
       LIMIT 5`,
    )
    recentOrders = orderRows as typeof recentOrders

    const [articleRows] = await connection.execute(
      `SELECT slug, status, updated_at
       FROM articles
       ORDER BY updated_at DESC
       LIMIT 5`,
    )
    recentArticles = articleRows as typeof recentArticles

    const [staff] = await connection.execute(
      "SELECT COUNT(*) as c FROM users WHERE role IN ('staff', 'admin')",
    )
    staffCount = (staff as any[])[0].c
  } finally {
    connection.release()
  }

  const stats = [
    { label: 'Members', value: memberCount.toLocaleString(), sub: 'registered accounts', color: 'text-blue-600', accent: 'bg-blue-500' },
    { label: 'Orders', value: orderCount.toLocaleString(), sub: `${pendingOrderCount.toLocaleString()} need attention`, color: 'text-orange-600', accent: 'bg-orange-500' },
    { label: 'Articles', value: articleCount.toLocaleString(), sub: `${publishedArticleCount} published / ${draftArticleCount} draft`, color: 'text-green-600', accent: 'bg-green-500' },
    { label: 'Staff', value: staffCount.toLocaleString(), sub: 'admin team', color: 'text-purple-600', accent: 'bg-purple-500' },
  ]
  const maxStat = Math.max(memberCount, orderCount, articleCount, staffCount, 1)

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="apple-headline text-2xl text-text">Dashboard</h1>
          <p className="mt-2 text-sm text-text-secondary">Overview of your KHUA system</p>
        </div>
        <div className="rounded-2xl border border-gold/20 bg-gold/10 px-5 py-3 text-right">
          <p className="text-xs uppercase tracking-wide text-gold">Total revenue</p>
          <p className="apple-headline text-2xl text-text">฿{revenueTotal.toLocaleString()}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-text-secondary">{stat.label}</p>
                <p className={`apple-headline mt-2 text-4xl ${stat.color}`}>{stat.value}</p>
              </div>
              <span className={`mt-1 h-3 w-3 rounded-full ${stat.accent}`} />
            </div>
            <p className="mt-2 text-xs text-text-secondary">{stat.sub}</p>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-border/60">
              <div
                className={`h-full rounded-full ${stat.accent}`}
                style={{
                  width: `${Math.max(8, Math.min(100, (Number(String(stat.value).replace(/,/g, '')) / maxStat) * 100))}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="apple-headline text-lg text-text">Recent Orders</h2>
            <a href={`/${lang}/admin/orders`} className="text-sm font-medium text-gold">View all</a>
          </div>
          <div className="mt-4 space-y-3">
            {recentOrders.length === 0 ? (
              <p className="text-sm text-text-secondary">No orders yet</p>
            ) : recentOrders.map((order, index) => (
              <div key={order.order_number} className="flex items-center justify-between rounded-xl bg-white/65 px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gold/10 text-xs font-semibold text-gold">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-text">{order.order_number}</p>
                    <p className="text-xs text-text-secondary">{order.customer_name} · {order.status}</p>
                  </div>
                </div>
                <p className="font-semibold text-text">฿{Number(order.total).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="apple-headline text-lg text-text">Recent Articles</h2>
            <a href={`/${lang}/admin/articles`} className="text-sm font-medium text-gold">View all</a>
          </div>
          <div className="mt-4 space-y-3">
            {recentArticles.length === 0 ? (
              <p className="text-sm text-text-secondary">No articles yet</p>
            ) : recentArticles.map((article, index) => (
              <div key={article.slug} className="flex items-center gap-3 rounded-xl bg-white/65 px-4 py-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gold/10 text-xs font-semibold text-gold">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-text">{article.slug}</p>
                  <p className="text-xs text-text-secondary">
                    {article.status} · {new Date(article.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="apple-headline text-lg text-text">Quick Links</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
            href={`/${lang}/admin/orders`}
            className="rounded-2xl border border-border bg-surface p-5 shadow-sm transition-colors hover:border-gold/30"
          >
            <span className="text-2xl">▣</span>
            <h3 className="mt-3 font-semibold text-text">Manage Orders</h3>
            <p className="mt-1 text-sm text-text-secondary">
              Review payments, status, and tracking
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
          <a
            href={`/${lang}/admin/staff`}
            className="rounded-2xl border border-border bg-surface p-5 shadow-sm transition-colors hover:border-gold/30"
          >
            <span className="text-2xl">⚙</span>
            <h3 className="mt-3 font-semibold text-text">Manage Staff</h3>
            <p className="mt-1 text-sm text-text-secondary">
              Control staff access and permissions
            </p>
          </a>
        </div>
      </div>
    </div>
  )
}
