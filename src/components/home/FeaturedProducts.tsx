import Image from 'next/image'
import Link from 'next/link'
import { Dictionary, Locale } from '@/i18n'
import ProductCard from '@/components/ui/ProductCard'

interface FeaturedProductsProps {
  dict: Dictionary
  lang: Locale
}

export default function FeaturedProducts({ dict, lang }: FeaturedProductsProps) {
  const featured = dict.products_data.filter((p) => p.featured)

  return (
    <section className="bg-[#f5f5f7] px-3 py-3 sm:px-4">
      <div className="mx-auto max-w-[1480px]">
        <div className="mb-3 bg-white px-5 py-12 text-center sm:py-16">
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
        </div>

        <div className="relative mb-3 overflow-hidden bg-[#f3dfcd] sm:min-h-[620px]">
          <Link
            href={`/${lang}/products`}
            className="relative block aspect-[4/5] sm:aspect-[16/9] lg:aspect-[2.25/1]"
            aria-label={dict.products.viewAll}
          >
            <Image
              src="/khua-product-lineup-mobile-20260519.webp"
              alt={dict.products.title}
              fill
              sizes="(max-width: 639px) 100vw, 0vw"
              className="object-cover object-center transition-transform duration-700 hover:scale-[1.02] sm:hidden"
            />
            <Image
              src="/khua-product-lineup-wide-20260519.webp"
              alt={dict.products.title}
              fill
              sizes="(min-width: 640px) 96vw, 0vw"
              className="hidden object-cover object-center transition-transform duration-700 hover:scale-[1.02] sm:block"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,11,7,0.2)_0%,rgba(18,11,7,0.03)_42%,rgba(18,11,7,0.7)_100%)] sm:bg-[linear-gradient(180deg,rgba(18,11,7,0.14)_0%,rgba(18,11,7,0)_42%,rgba(18,11,7,0.62)_100%)]" />
            <div className="absolute inset-x-0 bottom-0 h-2/5 bg-[linear-gradient(180deg,transparent,rgba(18,11,7,0.72))]" />
            <div className="absolute inset-x-0 bottom-0 px-5 pb-8 text-center text-white drop-shadow-[0_14px_32px_rgba(0,0,0,0.45)] sm:px-10 sm:pb-12">
              <p className="apple-eyebrow mb-2 text-xs uppercase text-gold-light/95">
                KHUA Lineup
              </p>
              <h3 className="apple-display text-3xl text-white sm:text-5xl">
                {dict.products.title}
              </h3>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((product) => (
            <ProductCard
              key={product.slug}
              product={product}
              dict={dict}
              lang={lang}
              variant="home"
            />
          ))}
        </div>
      </div>
    </section>
  )
}
