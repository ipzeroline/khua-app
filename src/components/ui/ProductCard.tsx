'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Dictionary, Locale, ProductData } from '@/i18n'
import AddToCartButton from '@/components/cart/AddToCartButton'

interface ProductCardProps {
  product: ProductData
  dict: Dictionary
  lang: Locale
}

export default function ProductCard({ product, dict, lang }: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6 }}
      className="h-full"
    >
      <div className="group relative flex h-full min-h-[620px] flex-col overflow-hidden bg-white px-5 pb-7 pt-9 text-center sm:min-h-[680px] sm:px-8 sm:pt-12">
        <Link href={`/${lang}/products/${product.slug}`} className="flex flex-1 flex-col">
          <div className="relative z-10 mx-auto max-w-md">
            <p className="apple-eyebrow mb-2 text-xs uppercase text-gold/70">
              {dict.products.originValue}
            </p>
            <h3 className="apple-headline text-3xl text-text sm:text-4xl">
              {product.name}
            </h3>
            <p className="mx-auto mt-3 max-w-sm text-base leading-relaxed text-text-secondary">
              {product.description}
            </p>
            <div className="mt-4 flex items-center justify-center gap-6 text-base sm:text-lg">
              <span className="font-medium text-text">฿{product.price}</span>
              <span className="apple-cta-link">{dict.products.viewDetail}</span>
            </div>
          </div>

          <div className="relative mt-8 flex-1 overflow-hidden rounded-[28px] bg-[#f5f5f7] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)]">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 100vw, 50vw"
                className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.035]"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-7xl text-gold/15 transition-transform duration-700 group-hover:scale-110">
                🏺
              </div>
            )}
          </div>
        </Link>
        <div className="relative z-10 mt-5 flex justify-center">
          <AddToCartButton product={product} dict={dict} size="sm" />
        </div>
      </div>
    </motion.div>
  )
}
