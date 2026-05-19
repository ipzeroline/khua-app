'use client'

import { FormEvent, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Dictionary } from '@/i18n'

interface UserData {
  id: number
  email: string
  name: string
  phone?: string | null
  role: string
  points_balance?: number
  created_at?: string
}

interface AddressData {
  id?: number
  recipient_name: string
  phone: string
  address_line1: string
  address_line2: string
  subdistrict: string
  district: string
  province: string
  postal_code: string
  country: string
  is_default: boolean
}

interface OrderData {
  id: number
  order_number: string
  status: string
  subtotal: string
  shipping_fee: string
  total: string
  currency: string
  shipping_carrier?: string | null
  tracking_number?: string | null
  created_at: string
  items: Array<{
    product_name: string
    unit_price: string
    quantity: number
    line_total: string
  }>
}

interface AccountContentProps {
  dict: Dictionary
}

const emptyAddress: AddressData = {
  recipient_name: '',
  phone: '',
  address_line1: '',
  address_line2: '',
  subdistrict: '',
  district: '',
  province: '',
  postal_code: '',
  country: 'Thailand',
  is_default: false,
}

export default function AccountContent({ dict }: AccountContentProps) {
  const [user, setUser] = useState<UserData | null>(null)
  const [addresses, setAddresses] = useState<AddressData[]>([])
  const [orders, setOrders] = useState<OrderData[]>([])
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState<'signin' | 'register'>('register')
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'orders'>('profile')
  const [authForm, setAuthForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [profileForm, setProfileForm] = useState({ name: '', phone: '' })
  const [addressForm, setAddressForm] = useState<AddressData>(emptyAddress)
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadMemberData = async () => {
    const [profileRes, addressesRes, ordersRes] = await Promise.all([
      fetch('/api/account/profile'),
      fetch('/api/account/addresses'),
      fetch('/api/account/orders'),
    ])

    if (profileRes.ok) {
      const data = await profileRes.json()
      setUser(data.user)
      setProfileForm({ name: data.user.name || '', phone: data.user.phone || '' })
    }

    if (addressesRes.ok) {
      const data = await addressesRes.json()
      setAddresses(data.addresses || [])
    }

    if (ordersRes.ok) {
      const data = await ordersRes.json()
      setOrders(data.orders || [])
    }
  }

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : { user: null }))
      .then(async (data) => {
        if (data.user) {
          await loadMemberData()
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const handleAuthSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setMessage('')
    setSubmitting(true)

    try {
      const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login'
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong')
        return
      }

      await loadMemberData()
      setAuthForm({ name: '', email: '', phone: '', password: '' })
    } catch {
      setError('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setMessage('')
    setSubmitting(true)

    try {
      const res = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Save failed')
      setUser(data.user)
      setMessage(dict.account.save)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSubmitting(false)
    }
  }

  const saveAddress = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setMessage('')
    setSubmitting(true)

    try {
      const url = editingAddressId
        ? `/api/account/addresses/${editingAddressId}`
        : '/api/account/addresses'
      const res = await fetch(url, {
        method: editingAddressId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addressForm),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Save failed')

      setAddressForm(emptyAddress)
      setEditingAddressId(null)
      setMessage(dict.account.save)
      await loadMemberData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSubmitting(false)
    }
  }

  const editAddress = (address: AddressData) => {
    setEditingAddressId(address.id || null)
    setAddressForm({ ...address, is_default: Boolean(address.is_default) })
    setActiveTab('addresses')
  }

  const deleteAddress = async (id: number) => {
    setError('')
    setMessage('')
    const res = await fetch(`/api/account/addresses/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Delete failed')
      return
    }
    await loadMemberData()
  }

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    setAddresses([])
    setOrders([])
  }

  const statusLabel = (status: string) =>
    dict.account[status as keyof typeof dict.account] || status

  if (loading) {
    return (
      <div className="px-6 pb-24 pt-32 text-center">
        <p className="text-text-secondary">Loading...</p>
      </div>
    )
  }

  return (
    <div className="px-6 pb-24 pt-32">
      <section className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="apple-eyebrow mb-4 text-xs uppercase text-gold/70">
            {dict.account.label}
          </p>
          <h1 className="apple-headline text-4xl text-text sm:text-5xl">
            {dict.account.title}
          </h1>
          <p className="apple-subheadline mx-auto mt-4 max-w-2xl text-base text-text-secondary sm:text-lg">
            {dict.account.subtitle}
          </p>
        </motion.div>

        <div className="mt-14 grid gap-8 lg:grid-cols-[1fr_1fr]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="premium-card rounded-2xl border border-white/70 bg-surface p-6 sm:p-8"
          >
            {user ? (
              <div>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="apple-eyebrow text-xs uppercase text-gold/70">
                      {dict.account.welcome}
                    </p>
                    <h2 className="apple-headline mt-2 text-3xl text-text">{user.name}</h2>
                    <p className="mt-2 text-sm text-text-secondary">{user.email}</p>
                    <div className="mt-4 inline-flex items-center gap-3 rounded-full border border-gold/20 bg-gold/10 px-4 py-2">
                      <span className="text-xs font-medium uppercase text-gold">
                        {dict.account.pointsBalance}
                      </span>
                      <span className="apple-headline text-xl text-text">
                        {Number(user.points_balance || 0).toLocaleString(dict.locale)}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={logout}
                    className="rounded-full border border-red-200 px-5 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
                  >
                    {dict.account.logout}
                  </button>
                </div>

                {(user.role === 'staff' || user.role === 'admin') && (
                  <a
                    href={`/${dict.locale}/admin`}
                    className="mt-5 inline-block rounded-full border border-gold/30 px-6 py-2.5 text-sm font-medium text-gold transition-colors hover:bg-gold/5"
                  >
                    Admin Panel
                  </a>
                )}

                <div className="mt-8 flex flex-wrap gap-2 border-b border-border">
                  {[
                    ['profile', dict.account.profileTitle],
                    ['addresses', dict.account.addressesTitle],
                    ['orders', dict.account.ordersTitle],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setActiveTab(value as typeof activeTab)}
                      className={`rounded-t-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                        activeTab === value
                          ? 'border-b-2 border-gold text-gold'
                          : 'text-text-secondary hover:text-text'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {error && (
                  <div className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}
                {message && (
                  <div className="mt-5 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
                    {message}
                  </div>
                )}

                {activeTab === 'profile' && (
                  <form onSubmit={saveProfile} className="mt-6 space-y-4">
                    <input
                      required
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      placeholder={dict.account.name}
                      className="w-full rounded-2xl border border-border bg-white/70 px-4 py-3 text-sm outline-none transition-colors focus:border-gold/50"
                    />
                    <input
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      placeholder={dict.account.phone}
                      className="w-full rounded-2xl border border-border bg-white/70 px-4 py-3 text-sm outline-none transition-colors focus:border-gold/50"
                    />
                    <p className="text-sm text-text-secondary">
                      {dict.account.memberSince}:{' '}
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString(dict.locale)
                        : '-'}
                    </p>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="premium-button rounded-full bg-gold px-8 py-3 text-sm font-medium text-white disabled:opacity-50"
                    >
                      {dict.account.save}
                    </button>
                  </form>
                )}

                {activeTab === 'addresses' && (
                  <div className="mt-6 space-y-6">
                    <form onSubmit={saveAddress} className="grid gap-3 sm:grid-cols-2">
                      {[
                        ['recipient_name', dict.account.recipientName],
                        ['phone', dict.account.phone],
                        ['address_line1', dict.account.addressLine1],
                        ['address_line2', dict.account.addressLine2],
                        ['subdistrict', dict.account.subdistrict],
                        ['district', dict.account.district],
                        ['province', dict.account.province],
                        ['postal_code', dict.account.postalCode],
                        ['country', dict.account.country],
                      ].map(([field, label]) => (
                        <input
                          key={field}
                          required={!['address_line2', 'subdistrict', 'country'].includes(field)}
                          value={String(addressForm[field as keyof AddressData] || '')}
                          onChange={(e) =>
                            setAddressForm({ ...addressForm, [field]: e.target.value })
                          }
                          placeholder={label}
                          className="rounded-2xl border border-border bg-white/70 px-4 py-3 text-sm outline-none transition-colors focus:border-gold/50"
                        />
                      ))}
                      <label className="flex items-center gap-2 text-sm text-text-secondary sm:col-span-2">
                        <input
                          type="checkbox"
                          checked={addressForm.is_default}
                          onChange={(e) =>
                            setAddressForm({ ...addressForm, is_default: e.target.checked })
                          }
                        />
                        {dict.account.defaultAddress}
                      </label>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="premium-button rounded-full bg-gold px-8 py-3 text-sm font-medium text-white disabled:opacity-50 sm:col-span-2"
                      >
                        {editingAddressId ? dict.account.editAddress : dict.account.addAddress}
                      </button>
                    </form>

                    {addresses.length === 0 ? (
                      <p className="text-sm text-text-secondary">{dict.account.noAddresses}</p>
                    ) : (
                      <div className="space-y-3">
                        {addresses.map((address) => (
                          <div
                            key={address.id}
                            className="rounded-2xl border border-border bg-white/70 p-4"
                          >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <p className="font-medium text-text">
                                  {address.recipient_name}
                                  {address.is_default && (
                                    <span className="ml-2 rounded-full bg-gold/10 px-2 py-0.5 text-xs text-gold">
                                      {dict.account.defaultAddress}
                                    </span>
                                  )}
                                </p>
                                <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                                  {address.phone}
                                  <br />
                                  {address.address_line1} {address.address_line2}
                                  <br />
                                  {address.subdistrict} {address.district} {address.province}{' '}
                                  {address.postal_code}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => editAddress(address)}
                                  className="rounded-full border border-border px-3 py-1.5 text-xs text-text-secondary"
                                >
                                  {dict.account.editAddress}
                                </button>
                                {address.id && (
                                  <button
                                    type="button"
                                    onClick={() => deleteAddress(address.id!)}
                                    className="rounded-full border border-red-200 px-3 py-1.5 text-xs text-red-500"
                                  >
                                    {dict.account.deleteAddress}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'orders' && (
                  <div className="mt-6 space-y-5">
                    {orders.length === 0 ? (
                      <p className="text-sm text-text-secondary">{dict.account.noOrders}</p>
                    ) : (
                      orders.map((order) => (
                        <div
                          key={order.id}
                          className="overflow-hidden rounded-[1.6rem] border border-gold/15 bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(249,240,226,0.78))] shadow-[0_24px_80px_rgba(82,52,32,0.10)]"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gold/10 px-5 py-5">
                            <div>
                              <p className="apple-eyebrow text-xs uppercase text-gold/70">
                                {dict.account.orderNumber}
                              </p>
                              <p className="mt-1 font-semibold text-text">{order.order_number}</p>
                              <p className="mt-2 text-xs text-text-secondary">
                                {new Date(order.created_at).toLocaleDateString(dict.locale)}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="inline-flex rounded-full bg-gold/10 px-3 py-1 text-xs font-semibold text-gold">
                                {statusLabel(order.status)}
                              </span>
                              <p className="apple-headline mt-2 text-2xl text-text">
                                {dict.cart.currency}
                                {Number(order.total).toLocaleString(dict.locale)}
                              </p>
                            </div>
                          </div>

                          <div className="grid gap-4 px-5 py-5 lg:grid-cols-[1.35fr_0.65fr]">
                            <div className="space-y-3">
                              {order.items.map((item) => (
                                <div
                                  key={`${order.id}-${item.product_name}`}
                                  className="grid grid-cols-[1fr_auto] gap-3 rounded-2xl border border-white/70 bg-white/70 p-4"
                                >
                                  <div>
                                    <p className="font-medium text-text">{item.product_name}</p>
                                    <p className="mt-1 text-xs text-text-secondary">
                                      {dict.cart.currency}
                                      {Number(item.unit_price).toLocaleString(dict.locale)} / {dict.cart.items}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm text-text-secondary">
                                      x {item.quantity}
                                    </p>
                                    <p className="mt-1 font-semibold text-text">
                                      {dict.cart.currency}
                                      {Number(item.line_total).toLocaleString(dict.locale)}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="rounded-2xl border border-gold/10 bg-[#21150f] p-4 text-white shadow-[0_16px_50px_rgba(33,21,15,0.18)]">
                              <div className="space-y-3 text-sm">
                                <div className="flex justify-between gap-4">
                                  <span className="text-white/62">{dict.cart.subtotal}</span>
                                  <span>
                                    {dict.cart.currency}
                                    {Number(order.subtotal).toLocaleString(dict.locale)}
                                  </span>
                                </div>
                                <div className="flex justify-between gap-4">
                                  <span className="text-white/62">{dict.cart.shipping}</span>
                                  <span>
                                    {dict.cart.currency}
                                    {Number(order.shipping_fee).toLocaleString(dict.locale)}
                                  </span>
                                </div>
                                <div className="flex justify-between gap-4 border-t border-white/12 pt-3">
                                  <span className="text-white/62">{dict.account.orderTotal}</span>
                                  <span className="font-semibold text-gold-light">
                                    {dict.cart.currency}
                                    {Number(order.total).toLocaleString(dict.locale)}
                                  </span>
                                </div>
                              </div>

                              <div className="mt-5 space-y-3 rounded-2xl bg-white/8 p-4 text-sm">
                                <div>
                                  <p className="text-white/55">{dict.account.orderStatus}</p>
                                  <p className="mt-1 font-medium">{statusLabel(order.status)}</p>
                                </div>
                                <div>
                                  <p className="text-white/55">{dict.account.shippingCarrier}</p>
                                  <p className="mt-1 font-medium">
                                    {order.shipping_carrier || '-'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-white/55">{dict.account.trackingNumber}</p>
                                  <p className="mt-1 break-all font-medium">
                                    {order.tracking_number || '-'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleAuthSubmit}>
                <div className="mb-6 flex rounded-full border border-border bg-bg p-1">
                  <button
                    type="button"
                    onClick={() => setMode('register')}
                    className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      mode === 'register' ? 'bg-surface text-text shadow-sm' : 'text-text-secondary'
                    }`}
                  >
                    {dict.account.register}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('signin')}
                    className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      mode === 'signin' ? 'bg-surface text-text shadow-sm' : 'text-text-secondary'
                    }`}
                  >
                    {dict.account.signIn}
                  </button>
                </div>

                {error && (
                  <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  {mode === 'register' && (
                    <input
                      required
                      value={authForm.name}
                      onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                      placeholder={dict.account.name}
                      className="w-full rounded-2xl border border-border bg-white/70 px-4 py-3 text-sm outline-none transition-colors focus:border-gold/50"
                    />
                  )}
                  <input
                    type="email"
                    required
                    value={authForm.email}
                    onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                    placeholder={dict.account.email}
                    className="w-full rounded-2xl border border-border bg-white/70 px-4 py-3 text-sm outline-none transition-colors focus:border-gold/50"
                  />
                  {mode === 'register' && (
                    <input
                      value={authForm.phone}
                      onChange={(e) => setAuthForm({ ...authForm, phone: e.target.value })}
                      placeholder={dict.account.phone}
                      className="w-full rounded-2xl border border-border bg-white/70 px-4 py-3 text-sm outline-none transition-colors focus:border-gold/50"
                    />
                  )}
                  <input
                    type="password"
                    required
                    value={authForm.password}
                    onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                    placeholder={dict.account.password}
                    className="w-full rounded-2xl border border-border bg-white/70 px-4 py-3 text-sm outline-none transition-colors focus:border-gold/50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="premium-button mt-6 w-full rounded-full bg-gold px-8 py-4 text-sm font-medium text-white disabled:opacity-50"
                >
                  {submitting ? '...' : mode === 'register' ? dict.account.register : dict.account.signIn}
                </button>
              </form>
            )}
          </motion.div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
              className="rounded-2xl border border-border bg-surface/80 p-6"
            >
              <h2 className="apple-headline text-xl text-text">{dict.account.benefitsTitle}</h2>
              <ul className="mt-5 space-y-4">
                {dict.account.benefits.map((benefit) => (
                  <li key={benefit} className="flex gap-3 text-sm leading-relaxed text-text-secondary">
                    <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gold" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="rounded-2xl border border-border bg-surface/80 p-6"
            >
              <h2 className="apple-headline text-xl text-text">{dict.account.ordersTitle}</h2>
              <p className="mt-4 text-sm leading-relaxed text-text-secondary">
                {user && orders.length > 0
                  ? `${orders.length} ${dict.cart.items}`
                  : dict.account.noOrders}
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
