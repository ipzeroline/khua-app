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
  variant?: 'standard' | 'home'
}

export default function ProductCard({
  product,
  dict,
  lang,
  variant = 'standard',
}: ProductCardProps) {
  const isBundle = product.type === 'bundle'
  const isHome = variant === 'home'

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6 }}
      className={`h-full ${isBundle ? 'sm:col-span-2 lg:col-span-3' : ''}`}
    >
      <div className={`group relative flex h-full flex-col overflow-hidden bg-white px-5 pb-7 pt-9 text-center sm:px-8 sm:pt-12 ${
        isHome && isBundle
          ? 'min-h-[640px] sm:min-h-[700px]'
          : isHome
          ? 'min-h-[640px] sm:min-h-[700px]'
          : isBundle
            ? 'min-h-[680px] sm:min-h-[760px]'
            : 'min-h-[620px] sm:min-h-[680px]'
      }`}>
        <Link href={`/${lang}/products/${product.slug}`} className="flex flex-1 flex-col">
          <div className="relative z-10 mx-auto flex min-h-[220px] max-w-md flex-col items-center sm:min-h-[240px]">
            <p className="apple-eyebrow mb-2 text-xs uppercase text-gold/70">
              {product.badge || dict.products.originValue}
            </p>
            <h3 className="apple-headline text-3xl text-text sm:text-4xl">
              {product.name}
            </h3>
            <p className="mx-auto mt-3 max-w-sm text-base leading-relaxed text-text-secondary">
              {product.description}
            </p>
            <div className="mt-auto flex items-center justify-center gap-6 pt-4 text-base sm:text-lg">
              <span className="font-medium text-text">฿{product.price}</span>
              {product.compareAtPrice ? (
                <span className="text-sm text-text-secondary line-through">
                  ฿{product.compareAtPrice}
                </span>
              ) : null}
              <span className="apple-cta-link">{dict.products.viewDetail}</span>
            </div>
          </div>

          <div className={`relative mt-8 overflow-hidden rounded-[28px] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)] ${
            isHome && isBundle
              ? 'aspect-[16/10] flex-none bg-[radial-gradient(ellipse_at_center,#4a2b18_0%,#21150f_68%)] sm:aspect-[2.2/1]'
              : isHome
              ? 'aspect-[4/5] flex-none bg-[#f5f5f7]'
              : isBundle
                ? 'min-h-[320px] flex-none bg-[radial-gradient(ellipse_at_center,#4a2b18_0%,#21150f_68%)] sm:min-h-[420px] lg:min-h-[500px]'
              : 'flex-1 bg-[#f5f5f7]'
          }`}>
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes={isBundle ? '(max-width: 640px) 100vw, 96vw' : '(max-width: 640px) 100vw, 50vw'}
                className={`transition-transform duration-700 group-hover:scale-[1.035] ${
                  isBundle
                    ? 'object-contain object-center p-4 sm:p-6'
                    : 'object-cover object-center'
                }`}
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
