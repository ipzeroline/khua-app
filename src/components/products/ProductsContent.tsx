'use client'

import { motion } from 'framer-motion'
import { Dictionary, Locale } from '@/i18n'
import ProductCard from '@/components/ui/ProductCard'
import SectionDivider from '@/components/ui/SectionDivider'

interface ProductsContentProps {
  dict: Dictionary
  lang: Locale
}

export default function ProductsContent({ dict, lang }: ProductsContentProps) {
  return (
    <div className="pt-32 pb-24">
      <section className="px-6 text-center relative z-10">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="apple-eyebrow text-gold/60 text-xs uppercase mb-4"
        >
          {dict.products.label}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="apple-headline text-4xl sm:text-5xl text-text"
        >
          {dict.products.title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="apple-subheadline text-text-secondary mt-3 text-base"
        >
          {dict.products.subtitle}
        </motion.p>
      </section>

      <SectionDivider />

      <section className="px-6 max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {dict.products_data.map((product) => (
            <ProductCard key={product.slug} product={product} dict={dict} lang={lang} />
          ))}
        </div>
      </section>
    </div>
  )
}
