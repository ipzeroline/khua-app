import Image from 'next/image'
import Link from 'next/link'
import { Dictionary, Locale } from '@/i18n'

interface HomeArticlesSectionProps {
  dict: Dictionary
  lang: Locale
}

export default function HomeArticlesSection({ dict, lang }: HomeArticlesSectionProps) {
  const articles = dict.articles_data.slice(0, 3)

  return (
    <section className="bg-surface px-3 py-3 sm:px-4">
      <div className="mx-auto max-w-7xl">
        <div className="bg-white px-5 py-12 text-center sm:py-16">
          <p className="apple-eyebrow mb-4 text-xs uppercase text-gold/70">
            {dict.articles.label}
          </p>
          <h2 className="apple-display mx-auto max-w-4xl text-4xl text-text sm:text-6xl">
            {dict.articles.homeTitle}
          </h2>
          <p className="apple-subheadline mx-auto mt-4 max-w-2xl text-base text-text-secondary sm:text-xl">
            {dict.articles.homeSubtitle}
          </p>
        </div>

        <div className="relative mb-3 overflow-hidden bg-[#21150f]">
          <Link
            href={`/${lang}/articles`}
            className="relative block aspect-[4/5] sm:aspect-[16/9] lg:aspect-[2.1/1]"
            aria-label={dict.articles.title}
          >
            <Image
              src="/khua-lanna-table-scene.webp"
              alt={dict.articles.homeTitle}
              fill
              sizes="(max-width: 640px) 100vw, 92vw"
              className="object-cover object-center transition-transform duration-700 hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08)_0%,rgba(0,0,0,0.08)_44%,rgba(0,0,0,0.46)_100%)]" />
            <div className="absolute inset-x-0 bottom-0 px-6 pb-8 text-center text-white sm:px-10 sm:pb-12">
              <p className="apple-eyebrow mb-2 text-xs uppercase text-gold-light">
                Lanna Table
              </p>
              <h3 className="apple-display text-3xl sm:text-5xl">
                {dict.articles.title}
              </h3>
            </div>
          </Link>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {articles.map((article) => (
            <article
              key={article.slug}
              className="premium-card flex min-h-[280px] flex-col bg-bg p-6"
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
            </article>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href={`/${lang}/articles`}
            className="premium-button inline-flex rounded-full border border-gold/30 bg-white/50 px-8 py-3 text-sm font-medium text-gold transition-colors hover:bg-gold/5"
          >
            {dict.articles.title}
          </Link>
        </div>
      </div>
    </section>
  )
}
