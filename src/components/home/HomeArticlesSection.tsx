'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Dictionary, Locale } from '@/i18n'

interface HomeArticlesSectionProps {
  dict: Dictionary
  lang: Locale
}

export default function HomeArticlesSection({ dict, lang }: HomeArticlesSectionProps) {
  const articles = dict.articles_data.slice(0, 3)

  return (
    <section className="bg-surface px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14 max-w-3xl"
        >
          <p className="apple-eyebrow mb-4 text-xs uppercase text-gold/70">
            {dict.articles.label}
          </p>
          <h2 className="apple-headline text-3xl text-text sm:text-4xl">
            {dict.articles.homeTitle}
          </h2>
          <p className="apple-subheadline mt-4 text-base text-text-secondary sm:text-lg">
            {dict.articles.homeSubtitle}
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {articles.map((article, index) => (
            <motion.article
              key={article.slug}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="premium-card flex min-h-[280px] flex-col rounded-2xl border border-white/70 bg-bg p-6"
            >
              <div className="flex items-center justify-between gap-4 text-xs text-text-secondary">
                <span className="apple-eyebrow uppercase text-gold/70">
                  {article.category}
                </span>
                <span>{article.readTime}</span>
              </div>
              <h3 className="apple-headline mt-5 text-2xl text-text">
                {article.title}
              </h3>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-text-secondary">
                {article.excerpt}
              </p>
              <Link
                href={`/${lang}/articles/${article.slug}`}
                className="premium-link mt-6 inline-flex w-fit text-sm font-medium text-gold"
              >
                {dict.articles.readMore}
              </Link>
            </motion.article>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-10 text-center"
        >
          <Link
            href={`/${lang}/articles`}
            className="premium-button inline-flex rounded-full border border-gold/30 bg-white/50 px-8 py-3 text-sm font-medium text-gold transition-colors hover:bg-gold/5"
          >
            {dict.articles.title}
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
