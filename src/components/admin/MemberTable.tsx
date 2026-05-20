'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface Member {
  id: number
  email: string
  name: string
  phone: string | null
  role: string
  status: string
  points_balance: number
  order_count: number
  order_total: string
  created_at: string
}

interface MembersResponse {
  members: Member[]
  total: number
}

interface ApiResponse {
  error?: string
  success?: boolean
}

interface EditForm {
  email: string
  name: string
  phone: string
  role: string
  status: string
  points_balance: string
}

export default function MemberTable() {
  const pathname = usePathname()
  const lang = pathname.split('/')[1] || 'th'
  const [members, setMembers] = useState<Member[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [actionError, setActionError] = useState('')
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [passwordMember, setPasswordMember] = useState<Member | null>(null)
  const [editForm, setEditForm] = useState<EditForm>({
    email: '',
    name: '',
    phone: '',
    role: 'member',
    status: 'active',
    points_balance: '0',
  })
  const [newPassword, setNewPassword] = useState('')

  const fetchMembers = async (p: number, s: string) => {
    setLoading(true)
    setActionError('')
    try {
      const params = new URLSearchParams({ page: String(p), limit: '20' })
      if (s) params.set('search', s)
      const res = await fetch(`/api/admin/members?${params}`)
      const data = await res.json() as MembersResponse
      setMembers(data.members)
      setTotal(data.total)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let ignore = false

    void (async () => {
      setLoading(true)
      setActionError('')
      try {
        const params = new URLSearchParams({ page: String(page), limit: '20' })
        if (search) params.set('search', search)
        const res = await fetch(`/api/admin/members?${params}`)
        const data = await res.json() as MembersResponse
        if (!ignore) {
          setMembers(data.members)
          setTotal(data.total)
        }
      } finally {
        if (!ignore) setLoading(false)
      }
    })()

    return () => { ignore = true }
  }, [page, search])

  const totalPages = Math.ceil(total / 20)

  const handleStatusChange = async (id: number, status: string) => {
    await fetch(`/api/admin/members/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    fetchMembers(page, search)
  }

  const openEdit = (member: Member) => {
    setActionError('')
    setEditingMember(member)
    setEditForm({
      email: member.email,
      name: member.name,
      phone: member.phone || '',
      role: member.role,
      status: member.status,
      points_balance: String(member.points_balance || 0),
    })
  }

  const handleEditSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!editingMember) return

    setSaving(true)
    setActionError('')
    try {
      const res = await fetch(`/api/admin/members/${editingMember.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editForm,
          points_balance: Number(editForm.points_balance || 0),
        }),
      })
      const data = await res.json() as ApiResponse
      if (!res.ok) throw new Error(data.error || 'Update failed')
      setEditingMember(null)
      await fetchMembers(page, search)
    } catch (error: unknown) {
      setActionError(error instanceof Error ? error.message : 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  const openPassword = (member: Member) => {
    setActionError('')
    setNewPassword('')
    setPasswordMember(member)
  }

  const handlePasswordSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!passwordMember) return

    setSaving(true)
    setActionError('')
    try {
      const res = await fetch(`/api/admin/members/${passwordMember.id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      })
      const data = await res.json() as ApiResponse
      if (!res.ok) throw new Error(data.error || 'Password update failed')
      setPasswordMember(null)
      setNewPassword('')
    } catch (error: unknown) {
      setActionError(error instanceof Error ? error.message : 'Password update failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (member: Member) => {
    if (!confirm(`Delete ${member.name}? This will deactivate the member and sign them out.`)) return

    setActionError('')
    const res = await fetch(`/api/admin/members/${member.id}`, { method: 'DELETE' })
    const data = await res.json() as ApiResponse
    if (!res.ok) {
      setActionError(data.error || 'Delete failed')
      return
    }
    await fetchMembers(page, search)
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          placeholder="Search members..."
          className="w-full max-w-xs rounded-xl border border-border bg-white/70 px-4 py-2 text-sm outline-none transition-colors focus:border-gold/50"
        />
        <p className="rounded-full bg-gold/10 px-4 py-2 text-sm font-medium text-gold">
          {total.toLocaleString()} members
        </p>
      </div>

      {actionError && (
        <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{actionError}</div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-text-secondary">
              <th className="w-16 px-5 py-3 font-medium">No.</th>
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Role</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Orders</th>
              <th className="px-5 py-3 font-medium">Spend</th>
              <th className="px-5 py-3 font-medium">Points</th>
              <th className="px-5 py-3 font-medium">Joined</th>
              <th className="px-5 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={10} className="px-5 py-8 text-center text-text-secondary">
                  Loading...
                </td>
              </tr>
            ) : members.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-5 py-8 text-center text-text-secondary">
                  No members found
                </td>
              </tr>
            ) : (
              members.map((m, index) => (
                <tr key={m.id} className="border-b border-border/50 last:border-0 hover:bg-gold/5">
                  <td className="px-5 py-3 text-text-secondary">{(page - 1) * 20 + index + 1}</td>
                  <td className="px-5 py-3 font-medium text-text">{m.name}</td>
                  <td className="px-5 py-3 text-text-secondary">{m.email}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      m.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                      m.role === 'staff' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {m.role}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      m.status === 'active' ? 'bg-green-100 text-green-700' :
                      m.status === 'suspended' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-semibold text-text">
                    {Number(m.order_count || 0).toLocaleString()}
                  </td>
                  <td className="px-5 py-3 font-semibold text-text">
                    ฿{Number(m.order_total || 0).toLocaleString()}
                  </td>
                  <td className="px-5 py-3 font-semibold text-gold">
                    {Number(m.points_balance || 0).toLocaleString()}
                  </td>
                  <td className="px-5 py-3 text-text-secondary">
                    {new Date(m.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={m.status}
                        onChange={(e) => handleStatusChange(m.id, e.target.value)}
                        className="rounded-lg border border-border bg-white px-2 py-1 text-xs outline-none"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                      </select>
                      <Link
                        href={`/${lang}/admin/orders?userId=${m.id}`}
                        className="rounded-lg border border-gold/30 px-2 py-1 text-xs font-medium text-gold transition-colors hover:bg-gold/10"
                      >
                        View orders
                      </Link>
                      <button
                        type="button"
                        onClick={() => openEdit(m)}
                        className="rounded-lg border border-border bg-white px-2 py-1 text-xs font-medium text-text-secondary transition-colors hover:border-gold/30 hover:text-gold"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => openPassword(m)}
                        className="rounded-lg border border-border bg-white px-2 py-1 text-xs font-medium text-text-secondary transition-colors hover:border-gold/30 hover:text-gold"
                      >
                        Password
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(m)}
                        className="rounded-lg border border-red-200 bg-white px-2 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-text-secondary">
          <span>{total} members total</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="rounded-lg border border-border bg-surface px-3 py-1.5 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="px-3 py-1.5">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="rounded-lg border border-border bg-surface px-3 py-1.5 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4">
          <form
            onSubmit={handleEditSubmit}
            className="w-full max-w-xl rounded-2xl border border-border bg-surface p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="apple-headline text-xl text-text">Edit member</h2>
                <p className="mt-1 text-sm text-text-secondary">{editingMember.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                className="rounded-lg px-2 py-1 text-text-secondary hover:bg-border/50"
              >
                x
              </button>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-text">
                Name
                <input
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-border bg-white/70 px-4 py-2.5 text-sm outline-none focus:border-gold/50"
                />
              </label>
              <label className="block text-sm font-medium text-text">
                Email
                <input
                  required
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-border bg-white/70 px-4 py-2.5 text-sm outline-none focus:border-gold/50"
                />
              </label>
              <label className="block text-sm font-medium text-text">
                Phone
                <input
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-border bg-white/70 px-4 py-2.5 text-sm outline-none focus:border-gold/50"
                />
              </label>
              <label className="block text-sm font-medium text-text">
                Points
                <input
                  min={0}
                  type="number"
                  value={editForm.points_balance}
                  onChange={(e) => setEditForm({ ...editForm, points_balance: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-border bg-white/70 px-4 py-2.5 text-sm outline-none focus:border-gold/50"
                />
              </label>
              <label className="block text-sm font-medium text-text">
                Role
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-border bg-white/70 px-4 py-2.5 text-sm outline-none focus:border-gold/50"
                >
                  <option value="member">Member</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
              <label className="block text-sm font-medium text-text">
                Status
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-border bg-white/70 px-4 py-2.5 text-sm outline-none focus:border-gold/50"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                className="rounded-full border border-border bg-white px-5 py-2.5 text-sm text-text-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="premium-button rounded-full bg-gold px-6 py-2.5 text-sm font-medium text-white disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {passwordMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4">
          <form
            onSubmit={handlePasswordSubmit}
            className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="apple-headline text-xl text-text">Change password</h2>
                <p className="mt-1 text-sm text-text-secondary">{passwordMember.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setPasswordMember(null)}
                className="rounded-lg px-2 py-1 text-text-secondary hover:bg-border/50"
              >
                x
              </button>
            </div>

            <label className="mt-5 block text-sm font-medium text-text">
              New password
              <input
                required
                minLength={8}
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-white/70 px-4 py-2.5 text-sm outline-none focus:border-gold/50"
              />
            </label>

            <p className="mt-3 text-xs text-text-secondary">
              Changing the password will sign this member out from active sessions.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setPasswordMember(null)}
                className="rounded-full border border-border bg-white px-5 py-2.5 text-sm text-text-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="premium-button rounded-full bg-gold px-6 py-2.5 text-sm font-medium text-white disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Update password'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
