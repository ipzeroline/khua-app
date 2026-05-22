import Link from 'next/link'
import { Dictionary } from '@/i18n'

interface HomeSeoAuthoritySectionProps {
  dict: Dictionary
}

export default function HomeSeoAuthoritySection({ dict }: HomeSeoAuthoritySectionProps) {
  const section = dict.homeSeoAuthority
  const primaryTopics = section.sections.slice(0, 3)
  const supportingTopics = section.sections.slice(3)

  return (
    <section className="bg-bg px-3 py-3 sm:px-4" aria-labelledby="seo-authority-title">
      <div className="mx-auto max-w-[1480px] bg-[#fbf8f2] px-5 py-12 sm:px-8 sm:py-16 lg:px-14">
        <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="apple-eyebrow mb-4 text-xs uppercase text-gold/70">
              {section.eyebrow}
            </p>
            <h2
              id="seo-authority-title"
              className="apple-display max-w-xl text-4xl text-text sm:text-5xl"
            >
              {section.title}
            </h2>
            <p className="mt-6 max-w-xl text-base leading-8 text-text-secondary">
              {section.intro}
            </p>

            <div className="mt-8 flex flex-wrap gap-2">
              {dict.collections_data.map((collection) => (
                <Link
                  key={collection.slug}
                  href={`/${dict.locale}/collections/${collection.slug}`}
                  className="rounded-full border border-gold/20 bg-white/70 px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:border-gold/45 hover:text-text"
                >
                  {collection.title}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className="grid gap-3 lg:grid-cols-3">
              {primaryTopics.map((item, index) => (
                <article
                  key={item.title}
                  className={`min-h-[300px] p-6 ${
                    index === 1
                      ? 'bg-[#21150f] text-white shadow-[0_24px_70px_rgba(37,23,14,0.16)]'
                      : 'border border-gold/15 bg-white/76'
                  }`}
                >
                  <p className={`text-xs font-semibold ${index === 1 ? 'text-gold-light' : 'text-gold'}`}>
                    {String(index + 1).padStart(2, '0')}
                  </p>
                  <h3 className={`mt-5 text-xl font-semibold leading-8 ${index === 1 ? 'text-white' : 'text-text'}`}>
                    {item.title}
                  </h3>
                  <p className={`mt-4 text-sm leading-7 ${index === 1 ? 'text-white/66' : 'text-text-secondary'}`}>
                    {item.content}
                  </p>
                </article>
              ))}
            </div>

            <div className="mt-5 grid gap-3 border-t border-gold/15 pt-5 md:grid-cols-3">
              {supportingTopics.map((item) => (
                <article key={item.title} className="bg-white/56 p-5">
                  <h3 className="text-base font-semibold leading-7 text-text">{item.title}</h3>
                  <p className="mt-3 line-clamp-4 text-sm leading-7 text-text-secondary">
                    {item.content}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
