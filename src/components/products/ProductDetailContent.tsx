'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
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
              {product.name}
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
      </div>
    </div>
  )
}
