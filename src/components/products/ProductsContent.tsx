'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Dictionary, Locale } from '@/i18n'
import ProductCard from '@/components/ui/ProductCard'

interface ProductsContentProps {
  dict: Dictionary
  lang: Locale
}

export default function ProductsContent({ dict, lang }: ProductsContentProps) {
  const seo = dict.productsPageSeo

  return (
    <div className="pb-24">
      <section className="relative overflow-hidden bg-[#21150f] px-6 pt-28 text-center text-white sm:pt-32">
        <Image
          src="/khua-product-lineup-mobile-20260519.png"
          alt={dict.products.title}
          fill
          priority
          sizes="(max-width: 639px) 100vw, 0vw"
          className="object-cover object-center sm:hidden"
        />
        <Image
          src="/khua-product-lineup-wide-20260519.png"
          alt={dict.products.title}
          fill
          priority
          sizes="(min-width: 640px) 100vw, 0vw"
          className="hidden object-cover object-center sm:block"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,11,7,0.7)_0%,rgba(18,11,7,0.34)_34%,rgba(18,11,7,0.08)_66%,rgba(18,11,7,0.5)_100%)] sm:bg-[linear-gradient(180deg,rgba(18,11,7,0.58)_0%,rgba(18,11,7,0.16)_42%,rgba(18,11,7,0.48)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(18,11,7,0.62)_0%,rgba(18,11,7,0.1)_50%,rgba(18,11,7,0.46)_100%)]" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 mx-auto flex min-h-[560px] max-w-5xl flex-col items-center justify-center py-16 sm:min-h-[680px]"
        >
          <p className="apple-eyebrow mb-4 text-xs uppercase text-gold-light/95 drop-shadow-[0_10px_24px_rgba(0,0,0,0.35)]">
            {dict.products.label}
          </p>
          <h1 className="apple-display text-5xl text-white drop-shadow-[0_16px_46px_rgba(0,0,0,0.5)] sm:text-7xl">
            {dict.products.title}
          </h1>
          <p className="apple-subheadline mx-auto mt-4 max-w-2xl text-lg text-white/88 drop-shadow-[0_12px_30px_rgba(0,0,0,0.42)] sm:text-2xl">
            {dict.products.subtitle}
          </p>
        </motion.div>
      </section>

      <section className="bg-bg px-3 py-3 sm:px-4" aria-labelledby="products-seo-intro">
        <div className="mx-auto grid max-w-[1480px] gap-3 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="bg-surface px-5 py-10 sm:px-8 sm:py-14 lg:px-14">
            <p className="apple-eyebrow mb-4 text-xs uppercase text-gold/70">
              {dict.products.originValue}
            </p>
            <h2 id="products-seo-intro" className="apple-display text-4xl text-text sm:text-5xl">
              {seo.introTitle}
            </h2>
            <div className="mt-6 space-y-5 text-base leading-8 text-text-secondary sm:text-lg sm:leading-9">
              {seo.introParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>

          <div className="bg-[#241710] px-5 py-10 text-white sm:px-8 sm:py-14 lg:px-10">
            <p className="apple-eyebrow mb-4 text-xs uppercase text-gold-light">
              {seo.collectionTitle}
            </p>
            <div className="grid gap-3">
              {seo.collectionItems.map((item) => (
                <Link
                  key={item.href}
                  href={`/${lang}${item.href}`}
                  className="group border border-white/12 bg-white/[0.04] p-4 transition-colors hover:border-gold-light/50 hover:bg-white/[0.08]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-lg font-semibold leading-7">{item.title}</h3>
                    <span className="text-gold-light transition-transform group-hover:translate-x-1">→</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-white/72">{item.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 bg-[#f5f5f7] px-3 py-3 sm:px-4">
        <div className="mx-auto grid max-w-[1480px] grid-cols-1 gap-3 md:grid-cols-2">
          {dict.products_data.map((product) => (
            <ProductCard key={product.slug} product={product} dict={dict} lang={lang} />
          ))}
        </div>
      </section>

      <section className="bg-bg px-3 py-3 sm:px-4" aria-labelledby="northern-menu-title">
        <div className="mx-auto max-w-[1480px] bg-surface px-5 py-10 sm:px-8 sm:py-14 lg:px-14">
          <div className="mb-8 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="apple-eyebrow mb-3 text-xs uppercase text-gold/70">
                Recipe Links
              </p>
              <h2 id="northern-menu-title" className="apple-display text-4xl text-text sm:text-5xl">
                {seo.menuTitle}
              </h2>
            </div>
            <Link href={`/${lang}/collections/northern-thai-food`} className="apple-cta-link text-lg">
              {dict.collections.view}
            </Link>
          </div>

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {seo.menuItems.map((item) => (
              <Link
                key={item.title}
                href={`/${lang}${item.href}`}
                className="group flex min-h-full flex-col overflow-hidden bg-bg transition-transform hover:-translate-y-0.5"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-gold-pale">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <p className="apple-eyebrow text-[11px] uppercase text-gold/70">
                    {item.keyword}
                  </p>
                  <h3 className="mt-3 text-xl font-semibold leading-8 text-text">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-text-secondary">{item.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-bg px-3 py-3 sm:px-4" aria-labelledby="products-why-title">
        <div className="mx-auto grid max-w-[1480px] gap-3 lg:grid-cols-[0.78fr_1.22fr]">
          <div className="bg-[#241710] px-5 py-10 text-white sm:px-8 sm:py-14 lg:px-14">
            <p className="apple-eyebrow mb-4 text-xs uppercase text-gold-light">
              {dict.site.name}
            </p>
            <h2 id="products-why-title" className="apple-display text-4xl sm:text-5xl">
              {seo.whyTitle}
            </h2>
          </div>
          <div className="grid gap-3 bg-surface p-3 sm:grid-cols-2 lg:grid-cols-3">
            {seo.whyItems.map((item) => (
              <article key={item.title} className="border border-gold/15 bg-bg/70 p-5">
                <span className="mb-5 flex size-9 items-center justify-center border border-gold/30 text-gold">
                  ✓
                </span>
                <h3 className="text-lg font-semibold leading-7 text-text">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-text-secondary">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-bg px-3 py-3 sm:px-4" aria-labelledby="products-faq-title">
        <div className="mx-auto grid max-w-[1480px] gap-8 bg-surface px-5 py-10 sm:px-8 sm:py-14 lg:grid-cols-[0.8fr_1.2fr] lg:px-14">
          <div>
            <p className="apple-eyebrow mb-4 text-xs uppercase text-gold/70">
              {dict.products.label}
            </p>
            <h2 id="products-faq-title" className="apple-display text-4xl text-text sm:text-5xl">
              {seo.faqTitle}
            </h2>
          </div>
          <div className="space-y-3">
            {seo.faqItems.map((item, index) => (
              <details
                key={item.question}
                className="group border border-gold/15 bg-bg/70 p-5 open:bg-white/90"
                open={index === 0}
              >
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-base font-semibold leading-7 text-text">
                  <span>{item.question}</span>
                  <span className="mt-1 text-xl leading-none text-gold transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-4 text-sm leading-7 text-text-secondary sm:text-base">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-bg px-3 py-3 sm:px-4" aria-labelledby="products-seo-footer">
        <div className="mx-auto grid max-w-[1480px] gap-8 bg-[#241710] px-5 py-10 text-white sm:px-8 sm:py-12 lg:grid-cols-[0.85fr_1.15fr] lg:px-14">
          <div>
            <p className="apple-eyebrow mb-4 text-xs uppercase text-gold-light">
              {dict.products.originValue}
            </p>
            <h2 id="products-seo-footer" className="apple-display text-4xl sm:text-5xl">
              {seo.footerTitle}
            </h2>
          </div>
          <div className="space-y-5 text-base leading-8 text-white/78 sm:text-lg">
            {seo.footerParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <div className="flex flex-wrap gap-2 pt-2">
              {dict.collections_data.map((collection) => (
                <Link
                  key={collection.slug}
                  href={`/${lang}/collections/${collection.slug}`}
                  className="border border-white/15 px-3 py-2 text-sm text-white/82 transition-colors hover:border-gold-light/60 hover:text-gold-light"
                >
                  {collection.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
