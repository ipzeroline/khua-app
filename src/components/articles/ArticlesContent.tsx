'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Dictionary, Locale } from '@/i18n'
import { ArticleData } from '@/i18n/types'

interface ArticlesContentProps {
  dict: Dictionary
  lang: Locale
  articles: ArticleData[]
  query: string
  page: number
  totalPages: number
}

export default function ArticlesContent({
  dict,
  lang,
  articles,
  query,
  page,
  totalPages,
}: ArticlesContentProps) {
  const hrefForPage = (targetPage: number) => {
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (targetPage > 1) params.set('page', String(targetPage))
    const suffix = params.toString()
    return `/${lang}/articles${suffix ? `?${suffix}` : ''}`
  }

  return (
    <div className="pt-32 pb-24 px-6">
      <section className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="apple-eyebrow mb-4 text-xs uppercase text-gold/70">
            {dict.articles.label}
          </p>
          <h1 className="apple-headline text-4xl text-text sm:text-5xl">
            {dict.articles.title}
          </h1>
          <p className="apple-subheadline mt-4 text-base text-text-secondary sm:text-lg">
            {dict.articles.subtitle}
          </p>
        </motion.div>

        <motion.form
          action={`/${lang}/articles`}
          method="get"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="premium-card mx-auto mt-10 flex max-w-3xl flex-col gap-3 rounded-2xl border border-white/70 bg-surface p-4 shadow-[0_18px_60px_rgba(29,29,31,0.08)] sm:flex-row"
        >
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder={dict.articles.searchPlaceholder}
            className="min-h-12 flex-1 rounded-xl border border-border bg-white px-4 text-sm text-text outline-none transition focus:border-gold"
          />
          <button
            type="submit"
            className="min-h-12 rounded-full bg-text px-6 text-sm font-medium text-white transition hover:bg-gold"
          >
            {dict.articles.searchButton}
          </button>
          {query ? (
            <Link
              href={`/${lang}/articles`}
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-border px-5 text-sm font-medium text-text-secondary transition hover:border-gold hover:text-text"
            >
              {dict.articles.clearSearch}
            </Link>
          ) : null}
        </motion.form>

        <div className="mt-14 grid gap-8 lg:grid-cols-3">
          {articles.map((article, index) => (
            <motion.article
              key={article.slug}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="premium-card flex min-h-[520px] flex-col rounded-2xl border border-white/70 bg-surface p-6"
            >
              <p className="apple-eyebrow text-xs uppercase text-gold/70">
                {article.category}
              </p>
              <h2 className="apple-headline mt-4 text-2xl text-text">
                {article.title}
              </h2>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-text-secondary">
                {article.excerpt}
              </p>
              <div className="mt-5 space-y-3 rounded-xl border border-border bg-white/45 p-4">
                {article.highlights.map((highlight) => (
                  <p key={highlight} className="text-sm leading-relaxed text-text-secondary">
                    {highlight}
                  </p>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-gold/20 bg-gold/10 px-3 py-1 text-xs font-medium text-text-secondary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-border pt-5 text-xs text-text-secondary">
                <span>{article.date}</span>
                <span>{article.readTime}</span>
              </div>
              <Link
                href={`/${lang}/articles/${article.slug}`}
                className="premium-link mt-5 inline-flex w-fit text-sm font-medium text-gold"
              >
                {dict.articles.readMore}
              </Link>
            </motion.article>
          ))}
        </div>

        {articles.length === 0 ? (
          <p className="mt-14 text-center text-sm text-text-secondary">
            {dict.articles.noResults}
          </p>
        ) : null}

        {totalPages > 1 ? (
          <nav className="mt-14 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={hrefForPage(Math.max(1, page - 1))}
              aria-disabled={page <= 1}
              className="inline-flex min-h-11 items-center rounded-full border border-border px-5 text-sm font-medium text-text-secondary transition hover:border-gold hover:text-text aria-disabled:pointer-events-none aria-disabled:opacity-40"
            >
              {dict.articles.previousPage}
            </Link>
            <span className="rounded-full bg-white px-5 py-3 text-sm font-medium text-text-secondary">
              {dict.articles.pageLabel} {page} / {totalPages}
            </span>
            <Link
              href={hrefForPage(Math.min(totalPages, page + 1))}
              aria-disabled={page >= totalPages}
              className="inline-flex min-h-11 items-center rounded-full border border-border px-5 text-sm font-medium text-text-secondary transition hover:border-gold hover:text-text aria-disabled:pointer-events-none aria-disabled:opacity-40"
            >
              {dict.articles.nextPage}
            </Link>
          </nav>
        ) : null}
      </section>
    </div>
  )
}
