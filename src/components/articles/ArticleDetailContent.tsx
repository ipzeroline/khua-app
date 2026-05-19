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

export default function ArticleDetailContent({
  article,
  dict,
  lang,
}: ArticleDetailContentProps) {
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
          <div className="space-y-6 text-base leading-8 text-text-secondary">
            {article.content.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
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
