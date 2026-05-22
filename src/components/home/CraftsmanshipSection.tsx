import { Dictionary } from '@/i18n'

interface CraftsmanshipSectionProps {
  dict: Dictionary
}

export default function CraftsmanshipSection({ dict }: CraftsmanshipSectionProps) {
  return (
    <section className="bg-surface px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 grid gap-4 border-b border-border pb-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
          <p className="apple-eyebrow text-xs uppercase text-gold/60">
            {dict.craftsmanship.label}
          </p>
          <h2 className="apple-headline max-w-3xl text-3xl text-text sm:text-4xl lg:justify-self-end lg:text-right">
            {dict.craftsmanship.title}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {dict.craftsmanship.items.map((item, i) => (
            <div
              key={item.title}
              className="border border-border bg-bg/60 p-6 sm:p-8"
            >
              <p className="mb-8 text-xs font-semibold text-gold">
                {String(i + 1).padStart(2, '0')}
              </p>
              <h3 className="apple-headline mb-3 text-xl text-text">
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed text-text-secondary">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
