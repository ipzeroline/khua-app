import Link from 'next/link'
import { Dictionary } from '@/i18n'

interface HomeSeoAuthoritySectionProps {
  dict: Dictionary
}

export default function HomeSeoAuthoritySection({ dict }: HomeSeoAuthoritySectionProps) {
  const section = dict.homeSeoAuthority

  return (
    <section className="bg-bg px-3 py-3 sm:px-4" aria-labelledby="seo-authority-title">
      <div className="mx-auto max-w-[1480px] bg-surface px-5 py-10 sm:px-8 sm:py-14 lg:px-14">
        <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:gap-14">
          <div>
            <p className="apple-eyebrow mb-4 text-xs uppercase text-gold/70">
              {section.eyebrow}
            </p>
            <h2
              id="seo-authority-title"
              className="apple-display max-w-xl text-4xl text-text sm:text-5xl"
            >
              {section.title}
            </h2>
            <p className="mt-6 max-w-xl text-base leading-8 text-text-secondary sm:text-lg">
              {section.intro}
            </p>

            <div className="mt-8 grid gap-2">
              {dict.collections_data.map((collection) => (
                <Link
                  key={collection.slug}
                  href={`/${dict.locale}/collections/${collection.slug}`}
                  className="group flex items-center justify-between border border-gold/15 bg-bg/70 px-4 py-3 text-sm font-medium text-text transition-colors hover:border-gold/35 hover:bg-gold-pale/45"
                >
                  <span>{collection.title}</span>
                  <span className="text-gold transition-transform group-hover:translate-x-1">→</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {section.sections.map((item) => (
              <article key={item.title} className="border border-gold/15 bg-bg/60 p-5 sm:p-6">
                <h3 className="text-xl font-semibold leading-8 text-text">{item.title}</h3>
                <p className="mt-4 text-sm leading-7 text-text-secondary sm:text-base">
                  {item.content}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
