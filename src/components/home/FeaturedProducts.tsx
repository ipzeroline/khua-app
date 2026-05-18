'use client'

import { motion } from 'framer-motion'
import { Dictionary, Locale } from '@/i18n'
import ProductCard from '@/components/ui/ProductCard'
import Link from 'next/link'

interface FeaturedProductsProps {
  dict: Dictionary
  lang: Locale
}

export default function FeaturedProducts({ dict, lang }: FeaturedProductsProps) {
  const featured = dict.products_data.filter((p) => p.featured)

  return (
    <section className="bg-[#f5f5f7] px-3 py-3 sm:px-4">
      <div className="mx-auto max-w-[1480px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-3 bg-white px-5 py-12 text-center sm:py-16"
        >
          <p className="apple-eyebrow mb-3 text-xs uppercase text-gold/70">
            {dict.products.label}
          </p>
          <h2 className="apple-display mx-auto max-w-3xl text-4xl text-text sm:text-6xl">
            {dict.products.title}
          </h2>
          <p className="apple-subheadline mx-auto mt-3 max-w-2xl text-xl text-text-secondary sm:text-2xl">
            {dict.products.subtitle}
          </p>
          <Link href={`/${lang}/products`} className="apple-cta-link mt-5 inline-flex text-lg">
            {dict.products.viewAll}
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {featured.map((product) => (
            <ProductCard key={product.slug} product={product} dict={dict} lang={lang} />
          ))}
        </div>
      </div>
    </section>
  )
}
