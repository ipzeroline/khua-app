'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Dictionary, Locale, ProductData } from '@/i18n'
import Button from '@/components/ui/Button'
import SectionDivider from '@/components/ui/SectionDivider'
import AddToCartButton from '@/components/cart/AddToCartButton'

interface ProductDetailContentProps {
  product: ProductData
  dict: Dictionary
  lang: Locale
}

export default function ProductDetailContent({
  product,
  dict,
}: ProductDetailContentProps) {
  const displayImage = product.detailImage || product.image
  const galleryImages = product.galleryImages || []
  const seoTags = [
    product.name,
    product.nameEn,
    dict.products.originValue,
    ...dict.products.seoTagsBase,
  ]

  return (
    <div className="pt-32 pb-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="relative aspect-[4/5] bg-gold-pale rounded-2xl overflow-hidden shadow-sm"
          >
            {displayImage ? (
              <Image
                src={displayImage}
                alt={product.name}
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover object-center"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gold/15 text-8xl">
                🏺
              </div>
            )}
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <p className="apple-eyebrow text-gold/60 text-xs uppercase mb-3">
              {product.weight}
            </p>
            <h1
              className="apple-headline gold-text overflow-visible break-words py-1 text-3xl leading-[1.28] sm:text-4xl sm:leading-[1.28] [overflow-wrap:anywhere]"
            >
              {product.seoContent?.h1 || product.name}
            </h1>
            <p className="text-gold/50 text-sm mt-2 font-medium">
              {product.nameEn}
            </p>

            <p className="text-text-secondary mt-6 leading-relaxed">
              {product.longDescription}
            </p>

            <SectionDivider />

            <div className="rounded-2xl border border-gold/15 bg-gold-pale/40 p-5">
              <p className="apple-eyebrow text-xs uppercase text-gold/70">
                {product.badge || dict.products.originLabel}
              </p>
              <p className="apple-headline mt-2 text-xl text-text">
                {dict.products.originValue}
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {seoTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border bg-white/70 px-3 py-1.5 text-xs font-medium text-text-secondary"
                >
                  {tag}
                </span>
              ))}
            </div>

            <SectionDivider />

            <h2 className="apple-headline text-lg text-text mb-4">
              {product.type === 'bundle' && product.badge ? product.badge : dict.products.ingredients}
            </h2>
            <ul className="space-y-2">
              {(product.bundleItems || product.ingredients).map((ingredient) => (
                <li
                  key={ingredient}
                  className="flex items-center gap-3 text-text-secondary text-sm"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-gold/60 flex-shrink-0" />
                  {ingredient}
                </li>
              ))}
            </ul>

            <div className="mt-8 pt-8 border-t border-border">
              <div className="flex flex-wrap items-end gap-3">
                <p className="text-gold text-2xl font-medium tracking-wide">
                  ฿{product.price}
                </p>
                {product.compareAtPrice ? (
                  <p className="pb-1 text-sm text-text-secondary line-through">
                    ฿{product.compareAtPrice}
                  </p>
                ) : null}
              </div>
              <p className="text-text-secondary text-xs mt-1">
                {dict.products.pricePerUnit} ({product.weight})
              </p>

              <div className="mt-6">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <AddToCartButton product={product} dict={dict} />
                  <Button href={`/${dict.locale}/contact`} size="lg" variant="outline">
                    {dict.products.orderViaLine}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {galleryImages.length > 0 ? (
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18 }}
            className="mt-20 border-t border-gold/10 pt-14 sm:mt-24 sm:pt-16"
          >
            <div className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
              <p className="apple-eyebrow text-xs uppercase text-gold/55">
                {product.badge || product.weight}
              </p>
              <h2 className="apple-headline mt-3 text-2xl text-text sm:text-4xl">
                {product.name}
              </h2>
            </div>

            <div className="grid gap-3 sm:gap-4 md:grid-cols-12">
              {galleryImages.map((image, index) => {
                const tileClass =
                  index === 0
                    ? 'md:col-span-5 md:row-span-2 md:aspect-[4/5]'
                    : index === 1
                      ? 'md:col-span-7 md:aspect-[7/5]'
                      : index === 2
                        ? 'md:col-span-7 md:aspect-[7/5]'
                        : 'md:col-span-5 md:aspect-[4/5]'

                return (
                  <div
                    key={image}
                    className={`group relative aspect-[4/5] overflow-hidden rounded-[18px] border border-gold/10 bg-[#efe4d3] shadow-[0_18px_50px_rgba(48,31,16,0.08)] ${tileClass}`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 2}`}
                      fill
                      sizes="(min-width: 768px) 50vw, 100vw"
                      className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.025]"
                    />
                    <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/20" />
                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent_35%,rgba(28,18,10,0.12))]" />
                  </div>
                )
              })}
            </div>
          </motion.section>
        ) : null}

        {product.seoContent ? (
          <motion.article
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.22 }}
            className="mx-auto mt-20 max-w-4xl border-t border-gold/10 pt-14 text-text sm:mt-24 sm:pt-16"
          >
            <div className="space-y-5 text-base leading-8 text-text-secondary sm:text-lg">
              {product.seoContent.opening.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <div className="mt-12 space-y-14">
              {product.seoContent.sections.map((section) => (
                <section key={section.title}>
                  <h2 className="apple-headline text-2xl text-text sm:text-3xl">
                    {section.title}
                  </h2>

                  {section.paragraphs?.length ? (
                    <div className="mt-5 space-y-4 text-base leading-8 text-text-secondary">
                      {section.paragraphs.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                  ) : null}

                  {section.items?.length ? (
                    <ul className="mt-5 grid gap-3 text-text-secondary sm:grid-cols-2">
                      {section.items.map((item) => (
                        <li key={item} className="flex gap-3">
                          <span className="mt-3 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gold/70" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  {section.table ? (
                    <div className="mt-6 overflow-hidden rounded-2xl border border-gold/15 bg-white/70">
                      <table className="w-full border-collapse text-left text-sm sm:text-base">
                        <thead className="bg-gold-pale/70 text-text">
                          <tr>
                            {section.table.headers.map((header) => (
                              <th key={header} className="px-4 py-3 font-semibold sm:px-6">
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {section.table.rows.map((row) => (
                            <tr key={row.join('-')} className="text-text-secondary">
                              {row.map((cell) => (
                                <td key={cell} className="px-4 py-3 sm:px-6">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : null}

                  {section.recipe ? (
                    <div className="mt-6 grid gap-8 md:grid-cols-2">
                      <div>
                        <h3 className="apple-headline text-lg text-text">
                          {section.recipe.ingredientsTitle}
                        </h3>
                        <ul className="mt-4 space-y-3 text-text-secondary">
                          {section.recipe.ingredients.map((ingredient) => (
                            <li key={ingredient} className="flex gap-3">
                              <span className="mt-3 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gold/70" />
                              <span>{ingredient}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3 className="apple-headline text-lg text-text">
                          {section.recipe.stepsTitle}
                        </h3>
                        <ol className="mt-4 space-y-3 text-text-secondary">
                          {section.recipe.steps.map((step, index) => (
                            <li key={step} className="flex gap-3">
                              <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gold-pale text-sm font-semibold text-gold">
                                {index + 1}
                              </span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  ) : null}
                </section>
              ))}
            </div>

            {product.seoContent.faq?.length ? (
              <section className="mt-14 border-t border-gold/10 pt-12">
                <h2 className="apple-headline text-2xl text-text sm:text-3xl">
                  FAQ
                </h2>
                <div className="mt-6 divide-y divide-border rounded-2xl border border-gold/15 bg-white/70">
                  {product.seoContent.faq.map((item) => (
                    <div key={item.question} className="p-5 sm:p-6">
                      <h3 className="apple-headline text-lg text-text">
                        {item.question}
                      </h3>
                      <p className="mt-3 leading-7 text-text-secondary">
                        {item.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {product.seoContent.internalLinks?.length ? (
              <section className="mt-14 border-t border-gold/10 pt-10">
                <h2 className="apple-headline text-xl text-text">
                  {product.seoContent.internalLinksTitle || 'เมนูแนะนำจาก KHUA'}
                </h2>
                <div className="mt-5 flex flex-wrap gap-3">
                  {product.seoContent.internalLinks.map((link) => (
                    <Link
                      key={link.slug}
                      href={`/${dict.locale}/products/${link.slug}`}
                      className="rounded-full border border-gold/20 bg-white/70 px-4 py-2 text-sm font-medium text-gold transition-colors hover:border-gold/40 hover:bg-gold-pale"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}

            {dict.collections_data.length ? (
              <section className="mt-14 border-t border-gold/10 pt-10">
                <h2 className="apple-headline text-xl text-text">
                  {dict.collections.title}
                </h2>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {dict.collections_data
                    .filter((collection) => collection.relatedProductSlugs.includes(product.slug))
                    .map((collection) => (
                      <Link
                        key={collection.slug}
                        href={`/${dict.locale}/collections/${collection.slug}`}
                        className="border border-gold/15 bg-white/70 p-4 text-sm font-medium text-text transition-colors hover:border-gold/35 hover:bg-gold-pale"
                      >
                        <span className="block text-gold">{collection.title}</span>
                        <span className="mt-2 block leading-6 text-text-secondary">
                          {collection.excerpt}
                        </span>
                      </Link>
                    ))}
                </div>
              </section>
            ) : null}

            {product.seoContent.blogClusters?.length ? (
              <section className="mt-14 border-t border-gold/10 pt-10">
                <h2 className="apple-headline text-xl text-text">
                  {product.seoContent.blogClustersTitle || 'บทความแนะนำ'}
                </h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {product.seoContent.blogClusters.map((cluster) => (
                    <div
                      key={cluster.title}
                      className="rounded-2xl border border-gold/15 bg-white/70 p-5"
                    >
                      <h3 className="apple-headline text-base text-text">
                        {cluster.title}
                      </h3>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {cluster.keywords.map((keyword) => (
                          <span
                            key={keyword}
                            className="rounded-full bg-gold-pale px-3 py-1 text-xs font-medium text-gold"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </motion.article>
        ) : null}
      </div>
    </div>
  )
}
