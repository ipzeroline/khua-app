import Image from 'next/image'
import Link from 'next/link'
import { Dictionary } from '@/i18n'

interface HomeServingSectionProps {
  dict: Dictionary
}

export default function HomeServingSection({ dict }: HomeServingSectionProps) {
  return (
    <section className="bg-[#f5f5f7] px-3 py-3 sm:px-4">
      <div className="mx-auto grid max-w-[1480px] gap-3 lg:grid-cols-2">
        <div className="flex flex-col justify-center bg-surface p-6 text-center sm:p-10 lg:p-14 lg:text-left">
          <p className="apple-eyebrow mb-4 text-xs uppercase text-gold/70">
            {dict.products.originValue}
          </p>
          <h2 className="apple-display text-4xl text-text sm:text-6xl">
            {dict.site.tagline}
          </h2>
          <p className="apple-subheadline mt-6 max-w-xl text-base text-text-secondary sm:text-xl lg:mx-0">
            {dict.hero.description}
          </p>
          <Link
            href={`/${dict.locale}/products`}
            className="apple-cta-link mt-7 inline-flex justify-center text-lg lg:justify-start"
          >
            {dict.hero.cta}
          </Link>
        </div>

        <div className="relative min-h-[520px] overflow-hidden bg-[#21150f] sm:min-h-[640px]">
          <Image
            src="/khua-home-serving-table.webp"
            alt={dict.site.tagline}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-center transition-transform duration-700 hover:scale-[1.02]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.03)_0%,rgba(0,0,0,0.04)_54%,rgba(0,0,0,0.24)_100%)]" />
        </div>
      </div>
    </section>
  )
}
