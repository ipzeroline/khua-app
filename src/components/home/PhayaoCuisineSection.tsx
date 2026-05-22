import { Dictionary } from '@/i18n'

interface PhayaoCuisineSectionProps {
  dict: Dictionary
}

function NumberedList({ items }: { items: string[] }) {
  return (
    <ul className="mt-6 grid gap-4">
      {items.map((item, index) => (
        <li key={item} className="grid grid-cols-[2rem_1fr] gap-4 border-t border-[#e7d8bd] pt-4">
          <span className="pt-1 text-xs font-semibold text-gold">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

export default function PhayaoCuisineSection({ dict }: PhayaoCuisineSectionProps) {
  const section = dict.homePhayaoCuisine
  const supportingParagraphs = section.paragraphs.slice(1)

  return (
    <section className="bg-bg px-3 py-3 sm:px-4" aria-labelledby="phayao-cuisine-title">
      <div className="mx-auto max-w-[1480px] bg-[#f8f3ea] px-5 py-12 sm:px-8 sm:py-16 lg:px-14 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="apple-eyebrow mb-5 text-xs uppercase text-gold/75">
              {dict.products.originValue}
            </p>
            <h2
              id="phayao-cuisine-title"
              className="apple-display max-w-3xl text-4xl text-text sm:text-5xl lg:text-6xl"
            >
              {section.title}
            </h2>
            <p className="mt-7 max-w-2xl text-base leading-8 text-text-secondary sm:text-lg sm:leading-9">
              {section.paragraphs[0]}
            </p>
            <p className="mt-8 max-w-2xl border-l border-gold/55 pl-5 text-lg leading-9 text-text">
              {section.closing}
            </p>
          </div>

          <div className="grid gap-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="bg-white px-6 py-7 shadow-[0_18px_55px_rgba(37,23,14,0.06)] sm:px-8">
                <p className="apple-eyebrow text-xs uppercase text-gold/70">
                  Signature Menus
                </p>
                <h3 className="mt-3 text-2xl font-semibold leading-snug text-text">
                  {section.menusTitle}
                </h3>
                <div className="text-sm leading-7 text-text-secondary">
                  <NumberedList items={section.menus.slice(0, 5)} />
                </div>
              </div>
              <div className="bg-[#20150f] px-6 py-7 text-white shadow-[0_24px_70px_rgba(37,23,14,0.16)] sm:px-8">
                <p className="apple-eyebrow text-xs uppercase text-gold-light/80">
                  KHUA Standard
                </p>
                <h3 className="mt-3 text-2xl font-semibold leading-snug">
                  {section.whyTitle}
                </h3>
                <ul className="mt-6 grid gap-4">
                  {section.whyItems.slice(0, 5).map((item, index) => (
                    <li key={item} className="grid grid-cols-[2rem_1fr] gap-4 border-t border-white/12 pt-4 text-sm leading-7 text-white/68">
                      <span className="pt-1 text-xs font-semibold text-gold-light">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="grid gap-5 border-t border-gold/15 pt-6 lg:grid-cols-2">
              {supportingParagraphs.map((paragraph) => (
                <p key={paragraph} className="text-sm leading-7 text-text-secondary sm:text-base">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
