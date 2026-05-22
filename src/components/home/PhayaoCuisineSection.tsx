import { Dictionary } from '@/i18n'

interface PhayaoCuisineSectionProps {
  dict: Dictionary
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="mt-5 grid gap-3">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-sm leading-7 text-text-secondary sm:text-base">
          <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-gold" />
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
      <div className="mx-auto max-w-[1480px] bg-surface px-5 py-9 sm:px-8 sm:py-12 lg:px-14">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          <div>
            <p className="apple-eyebrow mb-4 text-xs uppercase text-gold/75">
              {dict.products.originValue}
            </p>
            <h2
              id="phayao-cuisine-title"
              className="apple-display max-w-3xl text-4xl text-text sm:text-5xl lg:text-6xl"
            >
              {section.title}
            </h2>
            <p className="mt-6 max-w-3xl text-base leading-8 text-text-secondary sm:text-lg sm:leading-9">
              {section.paragraphs[0]}
            </p>
            <p className="mt-6 max-w-3xl border-l-2 border-gold/50 pl-5 text-base leading-8 text-text sm:text-lg">
              {section.closing}
            </p>
          </div>

          <div className="grid content-start gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="border border-gold/15 bg-gold-pale/40 p-5 sm:p-6">
              <h3 className="text-xl font-semibold text-text">{section.menusTitle}</h3>
              <BulletList items={section.menus.slice(0, 5)} />
            </div>
            <div className="border border-gold/15 bg-bg/70 p-5 sm:p-6">
              <h3 className="text-xl font-semibold text-text">{section.whyTitle}</h3>
              <BulletList items={section.whyItems.slice(0, 5)} />
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 border-t border-gold/15 pt-7 lg:grid-cols-2">
          {supportingParagraphs.map((paragraph) => (
            <p key={paragraph} className="text-sm leading-7 text-text-secondary sm:text-base">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  )
}
