'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'

interface Article {
  id: number
  slug: string
  status: string
  category: string | null
  cover_image_url: string | null
  published_at: string | null
  author_name: string | null
  updated_at: string
}

interface GenerateArticleResponse {
  id?: number
  error?: string
}

interface ArticlesResponse {
  articles: Article[]
  total: number
  page: number
  limit: number
  categories: string[]
}

async function parseJsonResponse<T>(res: Response): Promise<T> {
  const contentType = res.headers.get('content-type') || ''
  const text = await res.text()

  if (contentType.includes('application/json')) {
    return JSON.parse(text) as T
  }

  const fallback = text.includes('<!DOCTYPE')
    ? 'Server returned an HTML error page. Please check the server logs and try again.'
    : text.slice(0, 300) || 'Empty response from server'

  return { error: fallback } as T
}

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [categories, setCategories] = useState<string[]>([])
  const [showGenerateForm, setShowGenerateForm] = useState(false)
  const [generateBrief, setGenerateBrief] = useState('')
  const [generateCategory, setGenerateCategory] = useState('')
  const lang = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : 'th'

  const buildParams = useCallback(() => {
    const params = new URLSearchParams({ locale: lang })
    if (statusFilter) params.set('status', statusFilter)
    if (categoryFilter) params.set('category', categoryFilter)
    return params
  }, [categoryFilter, lang, statusFilter])

  useEffect(() => {
    let ignore = false

    void (async () => {
      try {
        const params = buildParams()
        const res = await fetch(`/api/admin/articles?${params}`)
        const data = await res.json() as ArticlesResponse
        if (!ignore) {
          setArticles(data.articles || [])
          setTotal(data.total || 0)
          setCategories(data.categories || [])
        }
      } finally {
        if (!ignore) setLoading(false)
      }
    })()

    return () => { ignore = true }
  }, [buildParams])

  const fetchArticles = async () => {
    setLoading(true)
    try {
      const params = buildParams()
      const res = await fetch(`/api/admin/articles?${params}`)
      const data = await res.json() as ArticlesResponse
      setArticles(data.articles || [])
      setTotal(data.total || 0)
      setCategories(data.categories || [])
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
    if (!generateCategory.trim()) {
      setError('Please choose an article category first.')
      setShowGenerateForm(true)
      return
    }

    if (!generateBrief.trim()) {
      setError('Please add generation details first.')
      setShowGenerateForm(true)
      return
    }

    setError('')
    setGenerating(true)
    try {
      const res = await fetch('/api/admin/articles/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brief: generateBrief.trim(),
          category: generateCategory.trim(),
        }),
      })
      const data = await parseJsonResponse<GenerateArticleResponse>(res)
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
          <p className="mt-2 text-sm text-text-secondary">
            Manage articles across all languages · {total.toLocaleString()} total
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setGenerateCategory((current) => current || categoryFilter || categories[0] || '')
              setShowGenerateForm(true)
            }}
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

      {showGenerateForm && (
        <div className="mt-6 rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[minmax(180px,260px)_1fr_auto] lg:items-end">
            <label>
              <span className="text-sm font-medium text-text">Category</span>
              <select
                value={generateCategory}
                onChange={(event) => setGenerateCategory(event.target.value)}
                className="mt-2 min-h-12 w-full rounded-xl border border-border bg-white px-4 text-sm text-text outline-none transition focus:border-gold"
              >
                <option value="">Choose category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </label>
            <label>
              <span className="text-sm font-medium text-text">Generation details</span>
              <textarea
                value={generateBrief}
                onChange={(event) => setGenerateBrief(event.target.value)}
                maxLength={800}
                rows={4}
                placeholder="เช่น อยากได้บทความเกี่ยวกับน้ำพริกตาแดงกับผักพื้นบ้านสำหรับ SEO ของฝากพะเยา"
                className="mt-2 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-text outline-none transition focus:border-gold"
              />
              <span className="mt-1 block text-xs text-text-secondary">
                {generateBrief.length}/800 characters
              </span>
            </label>
            <div className="flex gap-2 lg:pb-6">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={generating}
                className="rounded-full bg-gold px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
              >
                {generating ? 'Generating...' : 'Generate Draft'}
              </button>
              <button
                type="button"
                onClick={() => setShowGenerateForm(false)}
                disabled={generating}
                className="rounded-full border border-border bg-white px-5 py-2.5 text-sm font-medium text-text-secondary disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6">
        <div className="mb-4 flex flex-wrap gap-2">
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
          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="rounded-full border border-border bg-white px-4 py-1.5 text-xs font-medium text-text-secondary outline-none transition focus:border-gold"
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-text-secondary">
                <th className="w-16 px-5 py-3 font-medium">No.</th>
                <th className="px-5 py-3 font-medium">Slug</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Author</th>
                <th className="px-5 py-3 font-medium">Updated</th>
                <th className="px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-text-secondary">Loading...</td>
                </tr>
              ) : articles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-text-secondary">No articles found</td>
                </tr>
              ) : (
                articles.map((a, index) => (
                  <tr key={a.id} className="border-b border-border/50 hover:bg-gold/5">
                    <td className="px-5 py-3 text-text-secondary">{index + 1}</td>
                    <td className="px-5 py-3 font-medium text-text">{a.slug}</td>
                    <td className="px-5 py-3 text-text-secondary">{a.category || '—'}</td>
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
