'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

interface Article {
  id: number
  slug: string
  status: string
  cover_image_url: string | null
  published_at: string | null
  author_name: string | null
  updated_at: string
}

interface GenerateArticleResponse {
  id?: number
  error?: string
}

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const lang = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : 'th'

  useEffect(() => {
    let ignore = false

    void (async () => {
      try {
        const params = new URLSearchParams()
        if (statusFilter) params.set('status', statusFilter)
        const res = await fetch(`/api/admin/articles?${params}`)
        const data = await res.json()
        if (!ignore) setArticles(data.articles)
      } finally {
        if (!ignore) setLoading(false)
      }
    })()

    return () => { ignore = true }
  }, [statusFilter])

  const fetchArticles = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)
      const res = await fetch(`/api/admin/articles?${params}`)
      const data = await res.json()
      setArticles(data.articles)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this article?')) return
    await fetch(`/api/admin/articles/${id}`, { method: 'DELETE' })
    fetchArticles()
  }

  const handleGenerate = async () => {
    setError('')
    setGenerating(true)
    try {
      const res = await fetch('/api/admin/articles/generate', { method: 'POST' })
      const data = await res.json() as GenerateArticleResponse
      if (!res.ok) throw new Error(data.error || 'Generate failed')
      window.location.href = `/${lang}/admin/articles/${data.id}/edit`
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Generate failed')
      setGenerating(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="apple-headline text-2xl text-text">Articles</h1>
          <p className="mt-2 text-sm text-text-secondary">Manage articles across all languages</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            className="premium-button rounded-full bg-gold px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {generating ? 'Generating...' : 'Generate Article'}
          </button>
          <Link
            href={`/${lang}/admin/articles/new`}
            className="rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-medium text-text-secondary"
          >
            + New Article
          </Link>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      <div className="mt-6">
        <div className="mb-4 flex gap-2">
          {['', 'published', 'draft'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === s ? 'bg-gold text-white' : 'bg-border/50 text-text-secondary'
              }`}
            >
              {s || 'All'}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-text-secondary">
                <th className="px-5 py-3 font-medium">Slug</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Author</th>
                <th className="px-5 py-3 font-medium">Updated</th>
                <th className="px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-text-secondary">Loading...</td>
                </tr>
              ) : articles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-text-secondary">No articles found</td>
                </tr>
              ) : (
                articles.map((a) => (
                  <tr key={a.id} className="border-b border-border/50 hover:bg-gold/5">
                    <td className="px-5 py-3 font-medium text-text">{a.slug}</td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        a.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-text-secondary">{a.author_name || '—'}</td>
                    <td className="px-5 py-3 text-text-secondary">
                      {new Date(a.updated_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-2">
                        <Link
                          href={`/${lang}/admin/articles/${a.id}/edit`}
                          className="rounded-lg border border-border bg-white px-3 py-1.5 text-xs transition-colors hover:border-gold/30"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(a.id)}
                          className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs text-red-600 transition-colors hover:bg-red-50"
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
      </div>
    </div>
  )
}
