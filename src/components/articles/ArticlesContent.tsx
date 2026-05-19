'use client'

import Image from 'next/image'
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
  const titleLength = [...dict.articles.title].length
  const titleViewport = dict.locale === 'zh' ? 92 / titleLength : 112 / titleLength

  const hrefForPage = (targetPage: number) => {
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (targetPage > 1) params.set('page', String(targetPage))
    const suffix = params.toString()
    return `/${lang}/articles${suffix ? `?${suffix}` : ''}`
  }

  return (
    <div className="pb-24">
      <section className="relative overflow-hidden bg-[#21150f] px-6 pt-28 text-white sm:pt-32">
        <Image
          src="/khua-lanna-table-scene.png"
          alt={dict.articles.title}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,11,7,0.72)_0%,rgba(18,11,7,0.2)_44%,rgba(18,11,7,0.68)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(18,11,7,0.82)_0%,rgba(18,11,7,0.34)_52%,rgba(18,11,7,0.58)_100%)]" />

        <div className="relative z-10 mx-auto flex min-h-[520px] max-w-7xl items-center py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl text-center sm:text-left"
          >
            <p className="apple-eyebrow mb-4 text-xs uppercase text-gold-light/95 drop-shadow-[0_12px_28px_rgba(0,0,0,0.45)]">
              {dict.articles.label}
            </p>
            <h1
              className="apple-display max-w-[94vw] whitespace-nowrap py-1 leading-[1.18] text-white drop-shadow-[0_18px_48px_rgba(0,0,0,0.46)] sm:leading-[1.14]"
              style={{
                fontSize: `clamp(2.1rem, ${titleViewport.toFixed(2)}vw, 4.5rem)`,
              }}
            >
              {dict.articles.title}
            </h1>
            <p className="apple-subheadline mt-4 max-w-2xl text-base text-white/84 drop-shadow-[0_12px_30px_rgba(0,0,0,0.38)] sm:text-xl">
              {dict.articles.subtitle}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6">

        <motion.form
          action={`/${lang}/articles`}
          method="get"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="premium-card mx-auto -mt-10 flex max-w-4xl flex-col gap-3 rounded-[18px] border border-white/80 bg-white/88 p-3 shadow-[0_24px_80px_rgba(29,29,31,0.1)] backdrop-blur-md sm:flex-row"
        >
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder={dict.articles.searchPlaceholder}
            className="min-h-12 flex-1 rounded-xl border border-border bg-white/92 px-4 text-sm text-text outline-none transition focus:border-gold"
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

        {articles.length > 0 ? (
          <div className="mt-14 grid grid-cols-1 gap-3 md:grid-cols-2">
            {articles.map((article, index) => (
              <motion.article
                key={article.slug}
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="group flex min-h-[620px] flex-col overflow-hidden bg-white px-5 pb-7 pt-9 text-center sm:min-h-[680px] sm:px-8 sm:pt-12"
              >
                <Link href={`/${lang}/articles/${article.slug}`} className="flex flex-1 flex-col">
                  <p className="apple-eyebrow text-xs uppercase text-gold/70">
                    {article.category}
                  </p>
                  <h2 className="apple-headline mx-auto mt-3 max-w-lg text-3xl text-text sm:text-4xl">
                    {article.title}
                  </h2>
                  <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-text-secondary">
                    {article.excerpt}
                  </p>
                  <div className="mt-5 flex flex-wrap justify-center gap-2">
                    {article.tags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-gold/20 bg-gold/10 px-3 py-1 text-xs font-medium text-text-secondary"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="mt-5 flex items-center justify-center gap-4 text-xs text-text-secondary">
                    <span>{article.date}</span>
                    <span>{article.readTime}</span>
                  </div>

                  <div className="relative mt-8 aspect-[4/5] flex-none overflow-hidden rounded-[28px] bg-gold-pale shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)]">
                    {article.coverImage ? (
                      <Image
                        src={article.coverImage}
                        alt={article.title}
                        fill
                        sizes="(min-width: 768px) 50vw, 100vw"
                        className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.035]"
                      />
                    ) : null}
                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent_42%,rgba(18,11,7,0.18))]" />
                  </div>
                </Link>

                <Link
                  href={`/${lang}/articles/${article.slug}`}
                  className="apple-cta-link relative z-10 mt-5 inline-flex justify-center text-sm font-medium"
                >
                  {dict.articles.readMore}
                </Link>
              </motion.article>
            ))}
          </div>
        ) : null}

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
