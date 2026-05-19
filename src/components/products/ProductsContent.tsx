'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Dictionary, Locale } from '@/i18n'
import ProductCard from '@/components/ui/ProductCard'

interface ProductsContentProps {
  dict: Dictionary
  lang: Locale
}

export default function ProductsContent({ dict, lang }: ProductsContentProps) {
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

      <section className="relative z-10 bg-[#f5f5f7] px-3 py-3 sm:px-4">
        <div className="mx-auto grid max-w-[1480px] grid-cols-1 gap-3 md:grid-cols-2">
          {dict.products_data.map((product) => (
            <ProductCard key={product.slug} product={product} dict={dict} lang={lang} />
          ))}
        </div>
      </section>
    </div>
  )
}
