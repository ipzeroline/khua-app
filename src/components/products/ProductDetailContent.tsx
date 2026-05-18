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
            {product.image ? (
              <Image
                src={product.image}
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
            <h1 className="apple-headline text-3xl sm:text-4xl gold-text">
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
                {dict.products.originLabel}
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
              {dict.products.ingredients}
            </h2>
            <ul className="space-y-2">
              {product.ingredients.map((ingredient) => (
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
              <p className="text-gold text-2xl font-medium tracking-wide">
                ฿{product.price}
              </p>
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
      </div>
    </div>
  )
}
