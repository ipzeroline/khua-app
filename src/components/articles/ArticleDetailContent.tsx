'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArticleData, Dictionary, Locale } from '@/i18n'

interface ArticleDetailContentProps {
  article: ArticleData
  dict: Dictionary
  lang: Locale
}

function buildSectionHeading(article: ArticleData, index: number) {
  const highlight = article.highlights[index - 1]
  if (highlight) return highlight

  const tag = article.tags[index % Math.max(article.tags.length, 1)]
  return tag ? `${article.category}: ${tag}` : article.category
}

export default function ArticleDetailContent({
  article,
  dict,
  lang,
}: ArticleDetailContentProps) {
  const [intro, ...sections] = article.content

  return (
    <article className="pt-32 pb-24 px-6">
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-3xl text-center"
      >
        <p className="apple-eyebrow mb-4 text-xs uppercase text-gold/70">
          {article.category}
        </p>
        <h1 className="apple-headline text-4xl text-text sm:text-5xl">
          {article.title}
        </h1>
        <p className="mt-5 text-sm text-text-secondary">
          {article.date} · {article.readTime}
        </p>
      </motion.header>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="premium-card mx-auto mt-12 max-w-3xl overflow-hidden rounded-2xl border border-white/70 bg-surface"
      >
        {article.coverImage ? (
          <div className="relative aspect-[16/9] bg-gold-pale">
            <Image
              src={article.coverImage}
              alt={article.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover object-center"
            />
          </div>
        ) : null}
        <div className="p-6 sm:p-10">
          <div className="mb-8 flex flex-wrap justify-center gap-2">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-gold/20 bg-gold/10 px-3 py-1 text-xs font-medium text-text-secondary"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="mb-8 grid gap-3 border-b border-border pb-8 sm:grid-cols-3">
            {article.highlights.map((highlight) => (
              <p
                key={highlight}
                className="rounded-xl border border-border bg-white/45 p-4 text-sm leading-relaxed text-text-secondary"
              >
                {highlight}
              </p>
            ))}
          </div>
          <div className="space-y-8 text-base leading-8 text-text-secondary">
            {intro ? <p>{intro}</p> : null}
            {sections.map((paragraph, index) => {
              const heading = buildSectionHeading(article, index + 1)

              return (
                <section key={paragraph} className="space-y-3">
                  <h2 className="text-2xl font-semibold leading-snug text-text">
                    {heading}
                  </h2>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-gold/80">
                    {article.tags[index % Math.max(article.tags.length, 1)] || article.category}
                  </h3>
                  <p>{paragraph}</p>
                </section>
              )
            })}
            {sections.length === 0 && article.highlights.length > 0 ? (
              <section className="space-y-3">
                <h2 className="text-2xl font-semibold leading-snug text-text">
                  {article.category}
                </h2>
                <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-gold/80">
                  {article.tags[0] || article.category}
                </h3>
              </section>
            ) : null}
          </div>
          <Link
            href={`/${lang}/articles`}
            className="premium-link mt-10 inline-flex text-sm font-medium text-gold"
          >
            {dict.articles.backToArticles}
          </Link>
        </div>
      </motion.div>
    </article>
  )
}
