'use client'

import { motion } from 'framer-motion'
import { Dictionary, Locale } from '@/i18n'
import ProductCard from '@/components/ui/ProductCard'
import Button from '@/components/ui/Button'

interface FeaturedProductsProps {
  dict: Dictionary
  lang: Locale
}

export default function FeaturedProducts({ dict, lang }: FeaturedProductsProps) {
  const featured = dict.products_data.filter((p) => p.featured)

  return (
    <section className="py-24 px-6 bg-bg">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="apple-eyebrow text-gold/60 text-xs uppercase mb-4">
            {dict.products.label}
          </p>
          <h2 className="apple-headline text-3xl sm:text-4xl text-text">
            {dict.products.title}
          </h2>
          <p className="apple-subheadline text-text-secondary text-base mt-3">
            {dict.products.subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {featured.map((product) => (
            <ProductCard key={product.slug} product={product} dict={dict} lang={lang} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Button href={`/${lang}/products`} variant="outline">
            {dict.products.viewAll}
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
