import Link from 'next/link'
import { Dictionary } from '@/i18n'

interface HomeSeoFooterSectionProps {
  dict: Dictionary
}

export default function HomeSeoFooterSection({ dict }: HomeSeoFooterSectionProps) {
  return (
    <section className="bg-bg px-3 py-3 sm:px-4" aria-labelledby="home-seo-footer-title">
      <div className="mx-auto grid max-w-[1480px] gap-8 bg-[#241710] px-5 py-10 text-white sm:px-8 sm:py-12 lg:grid-cols-[1fr_1fr] lg:px-14">
        <div>
          <p className="apple-eyebrow mb-4 text-xs uppercase text-gold-light">
            {dict.site.name}
          </p>
          <h2 id="home-seo-footer-title" className="apple-display text-4xl sm:text-5xl">
            {dict.seoFooter.title}
          </h2>
        </div>

        <div>
          <p className="text-base leading-8 text-white/78 sm:text-lg">{dict.seoFooter.content}</p>
          <div className="mt-7 flex flex-wrap gap-2">
            {dict.collections_data.map((collection) => (
              <Link
                key={collection.slug}
                href={`/${dict.locale}/collections/${collection.slug}`}
                className="border border-white/15 px-3 py-2 text-sm text-white/82 transition-colors hover:border-gold-light/60 hover:text-gold-light"
              >
                {collection.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
