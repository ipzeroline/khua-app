'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { LOCALES, LOCALE_NAMES } from '@/i18n'

interface Translation {
  locale: string
  title: string
  excerpt: string
  category: string
  date_label: string
  read_time: string
  tags: string[]
  highlights: string[]
  content: string[]
  meta_title: string
  meta_description: string
}

interface ArticleData {
  id?: number
  slug: string
  status: string
  cover_image_url: string
  image_prompt: string
  published_at: string
  meta_title: string
  meta_description: string
  translations: Translation[]
}

interface CoverResponse {
  cover_image_url?: string
  image_prompt?: string
  error?: string
}

const emptyTranslation = (locale: string): Translation => ({
  locale,
  title: '',
  excerpt: '',
  category: '',
  date_label: '',
  read_time: '',
  tags: [],
  highlights: [],
  content: [],
  meta_title: '',
  meta_description: '',
})

interface ArticleEditorProps {
  lang: string
  article?: ArticleData
}

export default function ArticleEditor({ lang, article }: ArticleEditorProps) {
  const router = useRouter()
  const isNew = !article
  const [activeLocale, setActiveLocale] = useState(LOCALES[0])
  const [saving, setSaving] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState<ArticleData>(
    article || {
      slug: '',
      status: 'draft',
      cover_image_url: '',
      image_prompt: '',
      published_at: '',
      meta_title: '',
      meta_description: '',
      translations: LOCALES.map(emptyTranslation),
    },
  )

  const t = form.translations.find((t) => t.locale === activeLocale)!

  const updateTranslation = (locale: string, field: keyof Translation, value: string | string[]) => {
    setForm((f) => ({
      ...f,
      translations: f.translations.map((tr) =>
        tr.locale === locale ? { ...tr, [field]: value } : tr,
      ),
    }))
  }

  const addContentBlock = (locale: string) => {
    updateTranslation(locale, 'content', [
      ...form.translations.find((t) => t.locale === locale)!.content,
      '',
    ])
  }

  const updateContentBlock = (locale: string, index: number, value: string) => {
    const content = [...form.translations.find((t) => t.locale === locale)!.content]
    content[index] = value
    updateTranslation(locale, 'content', content)
  }

  const removeContentBlock = (locale: string, index: number) => {
    const content = form.translations.find((t) => t.locale === locale)!.content.filter(
      (_: string, i: number) => i !== index,
    )
    updateTranslation(locale, 'content', content)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const url = isNew
        ? '/api/admin/articles'
        : `/api/admin/articles/${article!.id}`
      const method = isNew ? 'POST' : 'PUT'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Save failed')
      }

      router.push(`/${lang}/admin/articles`)
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const uploadCover = async (file: File | null) => {
    if (isNew || !article?.id) return
    if (!file) return
    setError('')
    setUploadingCover(true)

    try {
      const formData = new FormData()
      formData.append('cover', file)

      const res = await fetch(`/api/admin/articles/${article.id}/cover/upload`, {
        method: 'POST',
        body: formData,
      })
      const data = await res.json() as CoverResponse
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      setForm((f) => ({
        ...f,
        cover_image_url: data.cover_image_url ?? f.cover_image_url,
        image_prompt: data.image_prompt ?? f.image_prompt,
      }))
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploadingCover(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      {/* Top-level fields */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-text">Slug *</label>
          <input
            required
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            className="mt-1 w-full rounded-xl border border-border bg-white/70 px-4 py-2.5 text-sm outline-none focus:border-gold/50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text">Status</label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="mt-1 w-full rounded-xl border border-border bg-white/70 px-4 py-2.5 text-sm outline-none focus:border-gold/50"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-text">Cover Image URL</label>
          <input
            value={form.cover_image_url}
            onChange={(e) => setForm({ ...form, cover_image_url: e.target.value })}
            className="mt-1 w-full rounded-xl border border-border bg-white/70 px-4 py-2.5 text-sm outline-none focus:border-gold/50"
            placeholder="/uploads/articles/..."
          />
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <label className="block text-sm font-medium text-text">Upload Cover Image</label>
          <p className="mt-1 text-sm leading-6 text-text-secondary">
            Upload a JPG, PNG, or WebP image. The file will be cropped and optimized to a 3:2 article cover.
          </p>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={isNew || uploadingCover}
            onChange={(event) => {
              const file = event.target.files?.[0] || null
              void uploadCover(file)
              event.target.value = ''
            }}
            className="mt-4 block w-full rounded-xl border border-border bg-white/70 px-4 py-2.5 text-sm text-text-secondary file:mr-4 file:rounded-full file:border-0 file:bg-gold file:px-4 file:py-2 file:text-sm file:font-medium file:text-white disabled:cursor-not-allowed disabled:opacity-50"
          />
          {isNew ? (
            <p className="mt-2 text-xs text-text-secondary">
              Save the article first, then upload or replace the cover image.
            </p>
          ) : (
            <p className="mt-2 text-xs text-text-secondary">
              {uploadingCover ? 'Uploading and optimizing image...' : 'Uploading replaces the current cover image.'}
            </p>
          )}
        </div>
        <div className="rounded-2xl border border-border bg-surface p-3">
          <div className="relative aspect-[3/2] overflow-hidden rounded-xl bg-border/30">
            {form.cover_image_url ? (
              <Image
                src={form.cover_image_url}
                alt="Article cover preview"
                fill
                sizes="320px"
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-text-secondary">
                No cover image
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, cover_image_url: '', image_prompt: '' }))}
            disabled={!form.cover_image_url || saving || uploadingCover}
            className="mt-3 w-full rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:border-gold/40 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Remove Cover From Article
          </button>
        </div>
      </div>

      {/* Locale tabs */}
      <div className="mt-8 border-b border-border">
        <div className="flex gap-1">
          {LOCALES.map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => setActiveLocale(loc)}
              className={`rounded-t-xl px-5 py-2.5 text-sm font-medium transition-colors ${
                activeLocale === loc
                  ? 'border-b-2 border-gold bg-surface text-gold'
                  : 'text-text-secondary hover:text-text'
              }`}
            >
              {LOCALE_NAMES[loc]} ({loc})
            </button>
          ))}
        </div>
      </div>

      {/* Translation fields */}
      <div className="mt-6 space-y-5 rounded-b-2xl border-x border-b border-border bg-surface p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-text">Title *</label>
            <input
              required
              value={t.title}
              onChange={(e) => updateTranslation(activeLocale, 'title', e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-white/70 px-4 py-2.5 text-sm outline-none focus:border-gold/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text">Category</label>
            <input
              value={t.category}
              onChange={(e) => updateTranslation(activeLocale, 'category', e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-white/70 px-4 py-2.5 text-sm outline-none focus:border-gold/50"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-text">Excerpt</label>
            <textarea
              value={t.excerpt}
              onChange={(e) => updateTranslation(activeLocale, 'excerpt', e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-xl border border-border bg-white/70 px-4 py-2.5 text-sm outline-none focus:border-gold/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text">Date Label</label>
            <input
              value={t.date_label}
              onChange={(e) => updateTranslation(activeLocale, 'date_label', e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-white/70 px-4 py-2.5 text-sm outline-none focus:border-gold/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text">Read Time</label>
            <input
              value={t.read_time}
              onChange={(e) => updateTranslation(activeLocale, 'read_time', e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-white/70 px-4 py-2.5 text-sm outline-none focus:border-gold/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text">Meta Title</label>
            <input
              value={t.meta_title}
              onChange={(e) => updateTranslation(activeLocale, 'meta_title', e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-white/70 px-4 py-2.5 text-sm outline-none focus:border-gold/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text">Meta Description</label>
            <input
              value={t.meta_description}
              onChange={(e) => updateTranslation(activeLocale, 'meta_description', e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-white/70 px-4 py-2.5 text-sm outline-none focus:border-gold/50"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-text">Tags (comma separated)</label>
            <input
              value={t.tags.join(', ')}
              onChange={(e) =>
                updateTranslation(activeLocale, 'tags', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))
              }
              className="mt-1 w-full rounded-xl border border-border bg-white/70 px-4 py-2.5 text-sm outline-none focus:border-gold/50"
            />
          </div>
        </div>

        {/* Content blocks */}
        <div>
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-text">Content Blocks</label>
            <button
              type="button"
              onClick={() => addContentBlock(activeLocale)}
              className="text-xs text-gold transition-colors hover:text-gold-light"
            >
              + Add block
            </button>
          </div>
          <div className="mt-2 space-y-2">
            {t.content.map((block: string, i: number) => (
              <div key={i} className="flex gap-2">
                <textarea
                  value={block}
                  onChange={(e) => updateContentBlock(activeLocale, i, e.target.value)}
                  rows={3}
                  className="flex-1 rounded-xl border border-border bg-white/70 px-4 py-2.5 text-sm outline-none focus:border-gold/50"
                />
                <button
                  type="button"
                  onClick={() => removeContentBlock(activeLocale, i)}
                  className="self-start rounded-lg p-2 text-red-400 transition-colors hover:bg-red-50"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="mt-8 flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="premium-button rounded-full bg-gold px-8 py-3 text-sm font-medium text-white disabled:opacity-50"
        >
          {saving ? 'Saving...' : isNew ? 'Create Article' : 'Update Article'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-full border border-border bg-surface px-6 py-3 text-sm text-text-secondary"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
