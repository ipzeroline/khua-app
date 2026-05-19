'use client'

import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

interface Order {
  id: number
  order_number: string
  status: string
  total: string
  shipping_fee: string
  payment_status: string
  payment_slip_url?: string | null
  shipping_carrier?: string | null
  tracking_number?: string | null
  points_awarded: number
  points_awarded_at?: string | null
  created_at: string
  customer_name: string
  customer_email: string
  items: Array<{
    product_name: string
    unit_price: string
    quantity: number
    line_total: string
  }>
}

const statuses = ['pending', 'confirmed', 'preparing', 'shipped', 'completed', 'cancelled']

export default function OrderTable() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const lang = pathname.split('/')[1] || 'th'
  const [orders, setOrders] = useState<Order[]>([])
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [status, setStatus] = useState(searchParams.get('status') || '')
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<number | null>(null)
  const userId = searchParams.get('userId') || ''

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (userId) params.set('userId', userId)
      if (search) params.set('search', search)
      if (status) params.set('status', status)
      const query = params.toString()
      const res = await fetch(`/api/admin/orders${query ? `?${query}` : ''}`)
      const data = await res.json()
      setOrders(data.orders || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [userId, search, status])

  const updateOrder = async (order: Order, patch: Partial<Order>) => {
    setSavingId(order.id)
    try {
      await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: patch.status ?? order.status,
          shipping_carrier: patch.shipping_carrier ?? order.shipping_carrier ?? '',
          tracking_number: patch.tracking_number ?? order.tracking_number ?? '',
        }),
      })
      await fetchOrders()
    } finally {
      setSavingId(null)
    }
  }

  if (loading) {
    return <p className="text-sm text-text-secondary">Loading orders...</p>
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 rounded-2xl border border-border bg-surface p-4 sm:grid-cols-[1fr_180px_auto]">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search order, customer, email..."
          className="rounded-xl border border-border bg-white/70 px-4 py-2.5 text-sm outline-none focus:border-gold/50"
        />
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="rounded-xl border border-border bg-white/70 px-4 py-2.5 text-sm outline-none focus:border-gold/50"
        >
          <option value="">All statuses</option>
          {statuses.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        {userId && (
          <a
            href={`/${lang}/admin/orders`}
            className="rounded-xl border border-border px-4 py-2.5 text-center text-sm text-text-secondary transition-colors hover:border-gold/40 hover:text-gold"
          >
            Clear member
          </a>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface p-8 text-center text-sm text-text-secondary">
          No orders yet
        </div>
      ) : (
        orders.map((order) => (
          <div
            key={order.id}
            className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border bg-white/60 p-5">
              <div>
                <p className="text-xs uppercase tracking-wide text-gold">{order.order_number}</p>
                <h2 className="mt-1 font-semibold text-text">{order.customer_name}</h2>
                <p className="text-sm text-text-secondary">{order.customer_email}</p>
              </div>
              <div className="text-right">
                <p className="apple-headline text-2xl text-text">
                  ฿{Number(order.total).toLocaleString()}
                </p>
                <p className="text-xs text-text-secondary">
                  Points: {Number(order.points_awarded || 0).toLocaleString()}
                  {order.points_awarded_at ? ' awarded' : ' pending'}
                </p>
              </div>
            </div>

            <div className="grid gap-5 p-5 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div
                    key={`${order.id}-${item.product_name}`}
                    className="flex items-center justify-between rounded-xl bg-bg px-4 py-3 text-sm"
                  >
                    <div>
                      <p className="font-medium text-text">{item.product_name}</p>
                      <p className="text-xs text-text-secondary">
                        ฿{Number(item.unit_price).toLocaleString()} x {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold text-text">
                      ฿{Number(item.line_total).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-medium text-text-secondary">
                  Order status
                  <select
                    value={order.status}
                    onChange={(event) => updateOrder(order, { status: event.target.value })}
                    className="mt-1 w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-text outline-none"
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>
                <input
                  defaultValue={order.shipping_carrier || ''}
                  placeholder="Shipping carrier"
                  onBlur={(event) => updateOrder(order, { shipping_carrier: event.target.value })}
                  className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm outline-none"
                />
                <input
                  defaultValue={order.tracking_number || ''}
                  placeholder="Tracking number"
                  onBlur={(event) => updateOrder(order, { tracking_number: event.target.value })}
                  className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm outline-none"
                />
                <div className="flex items-center justify-between rounded-xl bg-gold/10 px-4 py-3 text-sm">
                  <span className="text-text-secondary">Payment</span>
                  <span className="font-semibold text-gold">{order.payment_status}</span>
                </div>
                {order.payment_slip_url && (
                  <a
                    href={order.payment_slip_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-xl border border-border px-4 py-3 text-center text-sm text-text-secondary transition-colors hover:border-gold/40 hover:text-gold"
                  >
                    View payment slip
                  </a>
                )}
                {savingId === order.id && (
                  <p className="text-xs text-text-secondary">Saving...</p>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
