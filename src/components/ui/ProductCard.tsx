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
    >
      <div className="group relative">
        {/* Card */}
        <Link href={`/${lang}/products/${product.slug}`} className="block">
          <div className="premium-card relative overflow-hidden aspect-[4/5] bg-surface rounded-2xl border border-white/70 group-hover:border-gold/30 group-hover:-translate-y-1 group-hover:shadow-[0_28px_70px_rgba(29,29,31,0.1)] transition-all duration-500">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gold/15 text-7xl group-hover:scale-110 transition-transform duration-700">
                🏺
              </div>
            )}

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-white/82 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
              <span className="text-gold tracking-widest text-xs font-medium border-b border-gold/30 pb-1">
                {dict.products.viewDetail}
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="mt-5 text-center">
            <h3 className="apple-headline text-xl text-text group-hover:gold-text transition-all duration-500">
              {product.name}
            </h3>
            <p className="text-text-secondary text-sm mt-2 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
            <p className="mt-3 text-gold font-medium tracking-wide">
              ฿{product.price}
            </p>
          </div>
        </Link>
        <div className="mt-5 flex justify-center">
          <AddToCartButton product={product} dict={dict} size="sm" />
        </div>
      </div>
    </motion.div>
  )
}
