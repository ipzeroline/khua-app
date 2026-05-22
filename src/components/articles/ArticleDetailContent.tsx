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

function renderContentBlock(block: string, index: number) {
  const trimmed = block.trim()
  if (!trimmed) return null

  if (trimmed.startsWith('## ')) {
    return (
      <h3 key={`${index}-${trimmed}`} className="text-xl font-semibold leading-snug text-text">
        {trimmed.replace(/^##\s+/, '')}
      </h3>
    )
  }

  if (trimmed.startsWith('# ')) {
    return (
      <h2 key={`${index}-${trimmed}`} className="pt-4 text-3xl font-semibold leading-snug text-text">
        {trimmed.replace(/^#\s+/, '')}
      </h2>
    )
  }

  const imageMatch = trimmed.match(/^!\[(.*)]\((.*)\)$/)
  if (imageMatch) {
    const [, alt, src] = imageMatch
    return (
      <figure key={`${index}-${trimmed}`} className="overflow-hidden rounded-2xl bg-gold-pale">
        <div className="relative aspect-[16/9]">
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
          />
        </div>
      </figure>
    )
  }

  const lines = trimmed.split('\n').map((line) => line.trim()).filter(Boolean)
  if (lines.length > 0 && lines.every((line) => line.startsWith('* '))) {
    return (
      <ul key={`${index}-${trimmed}`} className="space-y-2 rounded-2xl border border-border bg-white/45 p-5">
        {lines.map((line) => (
          <li key={line} className="flex gap-3">
            <span className="mt-3 h-1.5 w-1.5 flex-none rounded-full bg-gold" />
            <span>{line.replace(/^\*\s+/, '')}</span>
          </li>
        ))}
      </ul>
    )
  }

  return <p key={`${index}-${trimmed}`}>{trimmed}</p>
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
            {article.content.map(renderContentBlock)}
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
