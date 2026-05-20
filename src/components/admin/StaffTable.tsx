'use client'

import { useEffect, useState } from 'react'
import { PERMISSIONS } from '@/lib/permissions'

interface StaffMember {
  id: number
  email: string
  name: string
  role: string
  status: string
  permissions: string[]
  created_at: string
}

const PERM_LABELS: Record<string, string> = {
  manage_articles: 'Articles',
  manage_members: 'Members',
  manage_staff: 'Staff',
  manage_products: 'Products',
}

export default function StaffTable() {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    email: '', password: '', name: '', phone: '', permissions: [] as string[],
  })

  const fetchStaff = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/staff')
      const data = await res.json()
      setStaff(data.staff)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchStaff() }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/admin/staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setShowForm(false)
      setForm({ email: '', password: '', name: '', phone: '', permissions: [] })
      fetchStaff()
    }
  }

  const togglePerm = (perm: string) => {
    setForm((f) => ({
      ...f,
      permissions: f.permissions.includes(perm)
        ? f.permissions.filter((p) => p !== perm)
        : [...f.permissions, perm],
    }))
  }

  const handleStatusChange = async (id: number, status: string) => {
    await fetch(`/api/admin/staff/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    fetchStaff()
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="rounded-full bg-gold/10 px-4 py-2 text-sm font-medium text-gold">
          {staff.length.toLocaleString()} staff
        </p>
        <button
          onClick={() => setShowForm(!showForm)}
          className="premium-button rounded-full bg-gold px-5 py-2.5 text-sm font-medium text-white"
        >
          {showForm ? 'Cancel' : '+ Add Staff'}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mb-6 rounded-2xl border border-border bg-surface p-6"
        >
          <h3 className="mb-4 font-semibold text-text">New Staff Account</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Name"
              className="rounded-xl border border-border bg-white/70 px-4 py-2.5 text-sm outline-none focus:border-gold/50"
            />
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Email"
              className="rounded-xl border border-border bg-white/70 px-4 py-2.5 text-sm outline-none focus:border-gold/50"
            />
            <input
              required
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Password (min 6 chars)"
              className="rounded-xl border border-border bg-white/70 px-4 py-2.5 text-sm outline-none focus:border-gold/50"
            />
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="Phone (optional)"
              className="rounded-xl border border-border bg-white/70 px-4 py-2.5 text-sm outline-none focus:border-gold/50"
            />
          </div>

          <div className="mt-4">
            <p className="mb-2 text-sm font-medium text-text">Permissions</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(PERM_LABELS).map(([perm, label]) => (
                <button
                  key={perm}
                  type="button"
                  onClick={() => togglePerm(perm)}
                  className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                    form.permissions.includes(perm)
                      ? 'bg-gold text-white'
                      : 'bg-border/50 text-text-secondary'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="premium-button mt-6 rounded-full bg-gold px-6 py-2.5 text-sm font-medium text-white"
          >
            Create Staff
          </button>
        </form>
      )}

      <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-text-secondary">
              <th className="w-16 px-5 py-3 font-medium">No.</th>
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Role</th>
              <th className="px-5 py-3 font-medium">Permissions</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-text-secondary">Loading...</td>
              </tr>
            ) : staff.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-text-secondary">No staff found</td>
              </tr>
            ) : (
              staff.map((s, index) => (
                <tr key={s.id} className="border-b border-border/50 hover:bg-gold/5">
                  <td className="px-5 py-3 text-text-secondary">{index + 1}</td>
                  <td className="px-5 py-3 font-medium text-text">{s.name}</td>
                  <td className="px-5 py-3 text-text-secondary">{s.email}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      s.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    }`}>{s.role}</span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-1">
                      {s.permissions.length === 0 ? (
                        <span className="text-text-secondary">—</span>
                      ) : (
                        s.permissions.map((p) => (
                          <span key={p} className="rounded-full bg-gold/10 px-2 py-0.5 text-xs text-gold">
                            {PERM_LABELS[p] || p}
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      s.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>{s.status}</span>
                  </td>
                  <td className="px-5 py-3">
                    <select
                      value={s.status}
                      onChange={(e) => handleStatusChange(s.id, e.target.value)}
                      className="rounded-lg border border-border bg-white px-2 py-1 text-xs outline-none"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
