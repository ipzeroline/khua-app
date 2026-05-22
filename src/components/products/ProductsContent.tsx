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
    <div className="bg-[#f5f5f7] pb-24">
      <section className="relative overflow-hidden bg-[#21150f] px-5 pt-24 text-white sm:px-8 sm:pt-28">
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
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,11,7,0.74)_0%,rgba(18,11,7,0.22)_38%,rgba(18,11,7,0.08)_62%,rgba(18,11,7,0.74)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(18,11,7,0.78)_0%,rgba(18,11,7,0.25)_42%,rgba(18,11,7,0.08)_70%,rgba(18,11,7,0.5)_100%)]" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 mx-auto flex min-h-[600px] max-w-[1480px] flex-col justify-end pb-14 pt-24 sm:min-h-[720px] sm:pb-20"
        >
          <div className="max-w-4xl">
            <p className="apple-eyebrow mb-4 text-xs uppercase text-gold-light/95 drop-shadow-[0_10px_24px_rgba(0,0,0,0.35)]">
              {dict.products.label}
            </p>
            <h1 className="apple-display max-w-4xl text-5xl text-white drop-shadow-[0_16px_46px_rgba(0,0,0,0.5)] sm:text-7xl">
              {dict.products.title}
            </h1>
            <p className="apple-subheadline mt-5 max-w-2xl text-lg text-white/88 drop-shadow-[0_12px_30px_rgba(0,0,0,0.42)] sm:text-2xl">
              {dict.products.subtitle}
            </p>
          </div>
        </motion.div>
      </section>

      <section
        className="relative z-20 -mt-10 px-3 pb-3 sm:-mt-16 sm:px-4"
        aria-labelledby="products-seo-intro"
      >
        <div className="mx-auto max-w-[1480px] bg-surface shadow-[0_28px_90px_rgba(35,23,15,0.12)]">
          <div className="grid gap-px bg-gold/10 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="bg-surface px-5 py-10 sm:px-8 sm:py-14 lg:px-14">
              <p className="apple-eyebrow mb-4 text-xs uppercase text-gold/70">
                {dict.products.originValue}
              </p>
              <h2
                id="products-seo-intro"
                className="apple-display max-w-4xl text-4xl text-text sm:text-5xl"
              >
                {seo.introTitle}
              </h2>
              <div className="mt-7 grid gap-5 text-base leading-8 text-text-secondary lg:grid-cols-2">
                {seo.introParagraphs.map((paragraph, index) => (
                  <p key={paragraph} className={index === 0 ? 'lg:col-span-2 sm:text-lg sm:leading-9' : ''}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            <div className="bg-[#241710] px-5 py-10 text-white sm:px-8 sm:py-14 lg:px-10">
              <p className="apple-eyebrow mb-4 text-xs uppercase text-gold-light">
                {seo.collectionTitle}
              </p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                {seo.collectionItems.map((item, index) => (
                  <Link
                    key={item.href}
                    href={`/${lang}${item.href}`}
                    className="group border border-white/10 bg-white/[0.035] p-4 transition-colors hover:border-gold-light/50 hover:bg-white/[0.08]"
                  >
                    <div className="flex items-start gap-4">
                      <span className="mt-1 text-xs font-semibold text-gold-light/80">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <h3 className="text-base font-semibold leading-7">{item.title}</h3>
                          <span className="text-gold-light transition-transform group-hover:translate-x-1">
                            →
                          </span>
                        </div>
                        <p className="mt-1 text-sm leading-6 text-white/68">{item.description}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 px-3 py-3 sm:px-4" aria-labelledby="products-grid-title">
        <div className="mx-auto max-w-[1480px]">
          <div className="mb-3 grid gap-6 bg-white px-5 py-10 sm:px-8 lg:grid-cols-[0.75fr_1.25fr] lg:px-12">
            <div>
              <p className="apple-eyebrow mb-3 text-xs uppercase text-gold/70">
                {dict.products.label}
              </p>
              <h2 id="products-grid-title" className="apple-display text-4xl text-text sm:text-5xl">
                {dict.products.title}
              </h2>
            </div>
            <p className="max-w-3xl text-base leading-8 text-text-secondary sm:text-lg">
              {seo.introParagraphs[1]}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {dict.products_data.map((product) => (
              <ProductCard key={product.slug} product={product} dict={dict} lang={lang} />
            ))}
          </div>
        </div>
      </section>

      <section className="px-3 py-3 sm:px-4" aria-labelledby="northern-menu-title">
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

          <div className="grid gap-3 lg:grid-cols-4 lg:grid-rows-[auto_auto]">
            {seo.menuItems.map((item, index) => (
              <Link
                key={item.title}
                href={`/${lang}${item.href}`}
                className={`group flex min-h-full flex-col overflow-hidden bg-bg transition-transform hover:-translate-y-0.5 ${
                  index === 0 ? 'lg:col-span-2 lg:row-span-2' : ''
                }`}
              >
                <div
                  className={`relative overflow-hidden bg-gold-pale ${
                    index === 0 ? 'aspect-[4/3] lg:aspect-[1.32/1]' : 'aspect-[4/3]'
                  }`}
                >
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,11,7,0)_40%,rgba(18,11,7,0.34)_100%)]" />
                </div>
                <div className={index === 0 ? 'flex flex-1 flex-col p-6 sm:p-8' : 'flex flex-1 flex-col p-5'}>
                  <p className="apple-eyebrow text-[11px] uppercase text-gold/70">
                    {item.keyword}
                  </p>
                  <h3 className={index === 0 ? 'mt-3 text-3xl font-semibold leading-10 text-text' : 'mt-3 text-xl font-semibold leading-8 text-text'}>
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-text-secondary sm:text-base">
                    {item.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-3 py-3 sm:px-4" aria-labelledby="products-why-title">
        <div className="mx-auto max-w-[1480px] bg-[#241710]">
          <div className="grid gap-8 px-5 py-10 text-white sm:px-8 sm:py-14 lg:grid-cols-[0.72fr_1.28fr] lg:px-14">
            <div>
              <p className="apple-eyebrow mb-4 text-xs uppercase text-gold-light">
                {dict.site.name}
              </p>
              <h2 id="products-why-title" className="apple-display text-4xl sm:text-5xl">
                {seo.whyTitle}
              </h2>
            </div>
            <div className="grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
              {seo.whyItems.map((item) => (
                <article key={item.title} className="bg-[#241710] p-5 sm:p-6">
                  <span className="mb-5 flex size-9 items-center justify-center border border-gold-light/35 text-gold-light">
                    ✓
                  </span>
                  <h3 className="text-lg font-semibold leading-7 text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/68">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-3 py-3 sm:px-4" aria-labelledby="products-faq-title">
        <div className="mx-auto grid max-w-[1480px] gap-px bg-gold/10 lg:grid-cols-[0.75fr_1.25fr]">
          <div className="bg-surface px-5 py-10 sm:px-8 sm:py-14 lg:px-14">
            <p className="apple-eyebrow mb-4 text-xs uppercase text-gold/70">
              {dict.products.label}
            </p>
            <h2 id="products-faq-title" className="apple-display text-4xl text-text sm:text-5xl">
              {seo.faqTitle}
            </h2>
            <p className="mt-5 text-base leading-8 text-text-secondary">
              {seo.introParagraphs[2]}
            </p>
          </div>
          <div className="space-y-3 bg-surface px-5 py-10 sm:px-8 sm:py-14 lg:px-12">
            {seo.faqItems.map((item, index) => (
              <details
                key={item.question}
                className="group border border-gold/15 bg-bg/70 p-5 transition-colors open:bg-white/90"
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

      <section className="px-3 py-3 sm:px-4" aria-labelledby="products-seo-footer">
        <div className="mx-auto grid max-w-[1480px] gap-8 bg-white px-5 py-10 sm:px-8 sm:py-12 lg:grid-cols-[0.85fr_1.15fr] lg:px-14">
          <div>
            <p className="apple-eyebrow mb-4 text-xs uppercase text-gold/70">
              {dict.products.originValue}
            </p>
            <h2 id="products-seo-footer" className="apple-display text-4xl text-text sm:text-5xl">
              {seo.footerTitle}
            </h2>
          </div>
          <div className="space-y-5 text-base leading-8 text-text-secondary sm:text-lg">
            {seo.footerParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <div className="flex flex-wrap gap-2 pt-2">
              {dict.collections_data.map((collection) => (
                <Link
                  key={collection.slug}
                  href={`/${lang}/collections/${collection.slug}`}
                  className="border border-gold/20 px-3 py-2 text-sm font-medium text-gold transition-colors hover:border-gold/40 hover:bg-gold-pale"
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
