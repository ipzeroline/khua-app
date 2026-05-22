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
  category: string
  categorySlug: string
  categories: Array<{ label: string; slug: string; count: number }>
  page: number
  totalPages: number
}

const pageLabels: Record<Locale, {
  latest: string
  latestEyebrow: string
  topics: string
  topicsEyebrow: string
  knowledge: string
  readArticle: string
  explore: string
}> = {
  th: {
    latest: 'บทความล่าสุด',
    latestEyebrow: 'อ่านก่อน',
    topics: 'เลือกอ่านตามหัวข้อ',
    topicsEyebrow: 'หมวดความรู้',
    knowledge: 'พื้นฐานความรู้จากครัวพะเยา',
    readArticle: 'อ่านบทความ',
    explore: 'สำรวจหัวข้อนี้',
  },
  en: {
    latest: 'Latest Articles',
    latestEyebrow: 'Start Reading',
    topics: 'Explore by Topic',
    topicsEyebrow: 'Knowledge Categories',
    knowledge: 'Knowledge From the Phayao Kitchen',
    readArticle: 'Read Article',
    explore: 'Explore Topic',
  },
  lo: {
    latest: 'ບົດຄວາມຫຼ້າສຸດ',
    latestEyebrow: 'ເລີ່ມອ່ານ',
    topics: 'ເລືອກອ່ານຕາມຫົວຂໍ້',
    topicsEyebrow: 'ໝວດຄວາມຮູ້',
    knowledge: 'ຄວາມຮູ້ຈາກຄົວພະເຍົາ',
    readArticle: 'ອ່ານບົດຄວາມ',
    explore: 'ສຳຫຼວດຫົວຂໍ້ນີ້',
  },
  zh: {
    latest: '最新文章',
    latestEyebrow: '先读这里',
    topics: '按主题阅读',
    topicsEyebrow: '知识分类',
    knowledge: '来自帕尧厨房的知识',
    readArticle: '阅读文章',
    explore: '探索主题',
  },
}

export default function ArticlesContent({
  dict,
  lang,
  articles,
  query,
  category,
  categorySlug,
  categories,
  page,
  totalPages,
}: ArticlesContentProps) {
  const hub = dict.articlesHub
  const labels = pageLabels[lang] ?? pageLabels.th
  const titleLength = [...hub.heroTitle].length
  const titleViewport = dict.locale === 'zh' ? 118 / titleLength : 138 / titleLength
  const leadArticle = articles[0]
  const remainingArticles = articles.slice(1)
  const articleBasePath = categorySlug ? `/${lang}/articles/${categorySlug}` : `/${lang}/articles`
  const sectionTitle = category || labels.latest
  const searchIntro = lang === 'th'
    ? `ผลการค้นหา "${query}"${category ? ` ในหมวด${category}` : ''}`
    : `Search results for "${query}"${category ? ` in ${category}` : ''}`
  const sectionIntro = query
    ? articles.length > 0 ? searchIntro : dict.articles.noResults
    : category
      ? hub.categorySubtitle
      : hub.introParagraphs[0]

  const localizedHref = (href: string) => `/${lang}${href}`

  const hrefForPage = (targetPage: number) => {
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    const suffix = params.toString()
    const path = targetPage > 1 ? `${articleBasePath}/page/${targetPage}` : articleBasePath
    return `${path}${suffix ? `?${suffix}` : ''}`
  }

  const hrefForCategory = (targetCategorySlug: string) => {
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    const suffix = params.toString()
    const path = targetCategorySlug ? `/${lang}/articles/${targetCategorySlug}` : `/${lang}/articles`
    return `${path}${suffix ? `?${suffix}` : ''}`
  }

  const hrefForClearSearch = () => {
    return articleBasePath
  }

  return (
    <div className="bg-[#f7f1e8] pb-20 text-text">
      <section className="relative min-h-[580px] overflow-hidden bg-[#21150f] px-6 pt-28 text-white sm:min-h-[660px] sm:pt-32">
        <Image
          src="/khua-articles-hero.png"
          alt={hub.heroTitle}
          fill
          priority
          sizes="100vw"
          className="object-cover object-[54%_50%] sm:object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,11,7,0.58)_0%,rgba(18,11,7,0.18)_42%,rgba(18,11,7,0.86)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(18,11,7,0.9)_0%,rgba(18,11,7,0.5)_45%,rgba(18,11,7,0.12)_100%)]" />

        <div className="relative z-10 mx-auto flex min-h-[450px] max-w-7xl items-end py-14 sm:min-h-[520px] sm:items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <p className="apple-eyebrow mb-5 text-xs uppercase text-gold-light/95">
              {dict.articles.label}
            </p>
            <h1
              className="apple-display max-w-[94vw] py-1 leading-[1.12] text-white drop-shadow-[0_18px_48px_rgba(0,0,0,0.46)]"
              style={{
                fontSize: `clamp(2.25rem, ${titleViewport.toFixed(2)}vw, 5rem)`,
              }}
            >
              {hub.heroTitle}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/88 sm:text-2xl">
              {hub.heroSubtitle}
            </p>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/72 sm:text-lg">
              {hub.heroDescription}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6">
        <motion.form
          action={articleBasePath}
          method="get"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="mx-auto -mt-10 flex max-w-5xl flex-col gap-3 rounded-[28px] border border-white/80 bg-white/92 p-3 shadow-[0_28px_90px_rgba(37,23,14,0.16)] backdrop-blur-md sm:flex-row"
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
              href={hrefForClearSearch()}
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-border px-5 text-sm font-medium text-text-secondary transition hover:border-gold hover:text-text"
            >
              {dict.articles.clearSearch}
            </Link>
          ) : null}
        </motion.form>

        <section className="py-14 sm:py-20">
          <div className="rounded-[30px] border border-[#dcc9a8]/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.94),rgba(244,232,212,0.74))] p-4 shadow-[0_30px_110px_rgba(37,23,14,0.12)] sm:p-6 lg:p-8">
            <div className="mb-7 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
              <div className="max-w-3xl">
                <p className="apple-eyebrow mb-3 text-xs uppercase text-gold">
                  {labels.latestEyebrow}
                </p>
                <h2 className="apple-headline text-3xl text-text sm:text-5xl">
                  {sectionTitle}
                </h2>
                <p className="mt-4 text-base leading-8 text-text-secondary">
                  {sectionIntro}
                </p>
              </div>
              {categories.length > 0 ? (
                <nav
                  className="flex flex-wrap gap-2 rounded-2xl border border-[#e6d5b8] bg-white/68 p-2 lg:justify-end"
                  aria-label={dict.articles.categoryFilterLabel}
                >
                <Link
                  href={hrefForCategory('')}
                  className={`inline-flex min-h-10 items-center rounded-full border px-4 text-sm font-medium transition ${
                    !categorySlug
                      ? 'border-[#2b1b12] bg-[#2b1b12] text-white shadow-[0_12px_35px_rgba(37,23,14,0.18)]'
                      : 'border-transparent bg-white/70 text-text-secondary hover:border-gold/50 hover:text-text'
                  }`}
                >
                  {dict.articles.allCategories}
                </Link>
                {categories.map((item) => (
                  <Link
                    key={item.slug}
                    href={hrefForCategory(item.slug)}
                    className={`inline-flex min-h-10 items-center rounded-full border px-4 text-sm font-medium transition ${
                      categorySlug === item.slug
                        ? 'border-gold bg-gold text-white shadow-[0_12px_35px_rgba(165,119,43,0.2)]'
                        : 'border-transparent bg-white/70 text-text-secondary hover:border-gold/50 hover:text-text'
                    }`}
                  >
                    {item.label}
                    <span className="ml-2 rounded-full bg-black/5 px-2 py-0.5 text-[11px] font-semibold">
                      {item.count}
                    </span>
                  </Link>
                ))}
                </nav>
              ) : null}
            </div>

          {leadArticle ? (
            <div className="space-y-5">
              <motion.article
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                className="group overflow-hidden rounded-[28px] bg-[#24170f] text-white shadow-[0_30px_100px_rgba(37,23,14,0.2)]"
              >
                <Link href={`/${lang}/articles/${leadArticle.slug}`} className="grid h-full lg:grid-cols-[1.16fr_0.84fr]">
                  <div className="relative min-h-[320px] lg:min-h-[560px]">
                    {leadArticle.coverImage ? (
                      <Image
                        src={leadArticle.coverImage}
                        alt={leadArticle.title}
                        fill
                        sizes="(min-width: 1024px) 50vw, 100vw"
                        className="object-cover transition duration-700 group-hover:scale-[1.035]"
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,11,7,0),rgba(18,11,7,0.42))]" />
                  </div>
                  <div className="flex flex-col justify-center bg-[linear-gradient(145deg,#2a1a11,#160e09)] p-7 sm:p-10 lg:p-12">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="rounded-full border border-gold-light/25 bg-gold-light/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-gold-light">
                        {leadArticle.category}
                      </p>
                      <p className="rounded-full border border-white/12 bg-white/8 px-3 py-1 text-xs text-white/64">
                        {leadArticle.readTime}
                      </p>
                    </div>
                    <h3 className="mt-5 text-3xl font-semibold leading-tight sm:text-5xl">
                      {leadArticle.title}
                    </h3>
                    <p className="mt-5 text-base leading-8 text-white/74">
                      {leadArticle.excerpt}
                    </p>
                    <div className="mt-6 flex flex-wrap gap-2">
                      {leadArticle.tags.slice(0, 4).map((tag) => (
                        <span key={tag} className="rounded-full border border-white/14 bg-white/8 px-3 py-1 text-xs text-white/74">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="mt-8 flex items-center justify-between gap-4 text-sm text-white/62">
                      <span>{leadArticle.date}</span>
                      <span className="rounded-full bg-white px-4 py-2 font-medium text-[#24170f] transition group-hover:bg-gold-light">
                        {labels.readArticle}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.article>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {remainingArticles.length > 0 ? (
                  remainingArticles.map((article, index) => (
                    <motion.article
                      key={article.slug}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * index }}
                      className="group overflow-hidden rounded-[24px] border border-[#dcc9a8] bg-white/82 shadow-[0_18px_60px_rgba(37,23,14,0.06)] transition hover:-translate-y-1 hover:border-gold/60 hover:bg-white hover:shadow-[0_26px_80px_rgba(37,23,14,0.12)]"
                    >
                      <Link href={`/${lang}/articles/${article.slug}`} className="flex h-full flex-col">
                        <div className="relative aspect-[16/10] overflow-hidden bg-gold-pale">
                          {article.coverImage ? (
                            <Image
                              src={article.coverImage}
                              alt={article.title}
                              fill
                              sizes="(min-width: 1280px) 28vw, (min-width: 768px) 45vw, 100vw"
                              className="object-cover transition duration-500 group-hover:scale-[1.04]"
                            />
                          ) : null}
                          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,11,7,0),rgba(18,11,7,0.18))]" />
                        </div>
                        <div className="flex flex-1 flex-col p-5">
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold">
                            {article.category}
                          </p>
                          <h3 className="mt-2 text-lg font-semibold leading-snug text-text transition group-hover:text-gold">
                            {article.title}
                          </h3>
                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-text-secondary">
                            {article.excerpt}
                          </p>
                          <div className="mt-auto flex items-center justify-between gap-3 pt-5 text-xs text-text-secondary">
                            <span>{article.date}</span>
                            <span className="rounded-full bg-[#f3eadb] px-3 py-1 font-medium text-[#7a5418]">
                              {article.readTime}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </motion.article>
                  ))
                ) : (
                  <div className="rounded-2xl border border-[#dcc9a8] bg-white/74 p-6">
                    <p className="apple-eyebrow text-xs uppercase text-gold">
                      {labels.knowledge}
                    </p>
                    <p className="mt-4 text-sm leading-7 text-text-secondary">
                      {hub.introParagraphs[1]}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-[#dcc9a8] bg-white/78 p-8 text-center shadow-[0_24px_80px_rgba(37,23,14,0.07)]">
              <h2 className="text-2xl font-semibold text-text">{hub.emptyTitle}</h2>
              <p className="mx-auto mt-4 max-w-3xl text-base leading-8 text-text-secondary">
                {query || category ? dict.articles.noResults : hub.emptyDescription}
              </p>
            </div>
          )}

          {totalPages > 1 ? (
            <nav className="mt-10 flex flex-wrap items-center justify-center gap-3">
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
          </div>
        </section>

        <section className="border-y border-[#d8c5a7]/70 py-14">
          <div className="mb-8 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="apple-eyebrow mb-3 text-xs uppercase text-gold">
                {labels.topicsEyebrow}
              </p>
              <h2 className="apple-headline text-3xl text-text sm:text-4xl">
                {labels.topics}
              </h2>
              <p className="mt-4 text-base leading-8 text-text-secondary">
                {hub.categorySubtitle}
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {hub.categories.map((item) => (
              <Link
                key={item.title}
                href={localizedHref(item.href)}
                className="group rounded-2xl border border-[#dcc9a8] bg-white/72 p-5 transition hover:-translate-y-1 hover:border-gold/60 hover:bg-white"
              >
                <h3 className="text-lg font-semibold text-text transition group-hover:text-gold">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-text-secondary">
                  {item.description}
                </p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-gold">
                  {labels.explore}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="border-t border-[#d8c5a7]/70 py-16">
          <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
            <div className="max-w-xl">
              <p className="apple-eyebrow mb-3 text-xs uppercase text-gold">
                {dict.site.name}
              </p>
              <h2 className="apple-headline text-3xl text-text sm:text-4xl">
                {hub.introTitle}
              </h2>
            </div>
            <div className="rounded-[28px] border border-[#dcc9a8]/80 bg-white/64 p-6 shadow-[0_22px_70px_rgba(37,23,14,0.07)] sm:p-8">
              <div className="space-y-5 text-base leading-8 text-text-secondary">
                {hub.introParagraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              <div className="mt-7 flex flex-wrap gap-2">
                {hub.categories.slice(0, 4).map((item) => (
                  <Link
                    key={item.title}
                    href={localizedHref(item.href)}
                    className="rounded-full border border-[#e1cfad] bg-[#fbf7ef] px-4 py-2 text-sm font-medium text-text-secondary transition hover:border-gold/60 hover:text-text"
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl bg-[#24170f] p-7 text-white sm:p-10">
            <p className="apple-eyebrow mb-4 text-xs uppercase text-gold-light">
              Expertise
            </p>
            <h2 className="apple-headline text-3xl sm:text-4xl">{hub.authorityTitle}</h2>
            <div className="mt-6 space-y-5 text-base leading-8 text-white/76">
              {hub.authorityParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-[#dcc9a8] bg-white/78 p-7 sm:p-10">
            <h2 className="text-2xl font-semibold text-text">{hub.structureTitle}</h2>
            <ul className="mt-6 space-y-3 text-sm leading-7 text-text-secondary">
              {hub.structureItems.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-gold" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-16 rounded-2xl bg-[#efe1cc] p-8 sm:p-12">
          <h2 className="apple-headline text-3xl text-text sm:text-4xl">
            {hub.footerTitle}
          </h2>
          <div className="mt-6 grid gap-5 text-base leading-8 text-text-secondary lg:grid-cols-2">
            {hub.footerParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>
      </section>
    </div>
  )
}
