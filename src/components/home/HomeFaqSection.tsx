import { Dictionary } from '@/i18n'

interface HomeFaqSectionProps {
  dict: Dictionary
}

export default function HomeFaqSection({ dict }: HomeFaqSectionProps) {
  const items = [...dict.homePhayaoCuisine.faqs, ...dict.faq.items].slice(0, 6)

  return (
    <section className="bg-bg px-3 py-3 sm:px-4">
      <div className="mx-auto grid max-w-[1480px] gap-8 bg-surface px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[0.76fr_1.24fr] lg:px-14">
        <div>
          <p className="apple-eyebrow mb-4 text-xs uppercase text-gold/70">{dict.faq.label}</p>
          <h2 className="apple-display max-w-lg text-4xl text-text sm:text-5xl">
            {dict.faq.title}
          </h2>
          <p className="mt-5 max-w-md text-sm leading-7 text-text-secondary sm:text-base">
            {dict.homePhayaoCuisine.paragraphs[0]}
          </p>
        </div>

        <div className="space-y-3">
          {items.map((item, index) => (
            <details
              key={`${item.question}-${index}`}
              className="group border border-gold/15 bg-bg/70 p-5 transition-colors open:bg-white/90"
              open={index === 0}
            >
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-base font-semibold leading-7 text-text">
                <span>{item.question}</span>
                <span className="mt-1 text-xl leading-none text-gold transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-text-secondary sm:text-base">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
