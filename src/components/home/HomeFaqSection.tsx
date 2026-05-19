import Image from 'next/image'
import { Dictionary } from '@/i18n'

interface HomeFaqSectionProps {
  dict: Dictionary
}

export default function HomeFaqSection({ dict }: HomeFaqSectionProps) {
  return (
    <section className="relative overflow-hidden bg-[#21150f] px-6 py-24">
      <Image
        src="/khua-chili-texture-macro.webp"
        alt=""
        fill
        sizes="100vw"
        className="object-cover object-center"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-[#f5f5f7]/90" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(168,120,36,0.12),transparent_58%)]" />

      <div className="relative z-10 mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <p className="apple-eyebrow mb-4 text-xs uppercase text-gold/70">
            {dict.faq.label}
          </p>
          <h2 className="apple-headline text-3xl text-text sm:text-4xl">
            {dict.faq.title}
          </h2>
        </div>

        <div className="space-y-4">
          {dict.faq.items.map((item, index) => (
            <details
              key={item.question}
              className="group rounded-2xl border border-white/70 bg-white/86 p-5 shadow-[0_18px_55px_rgba(29,29,31,0.08)] backdrop-blur-md"
              open={index === 0}
            >
              <summary className="cursor-pointer list-none apple-headline text-lg text-text">
                {item.question}
              </summary>
              <p className="mt-4 text-sm leading-relaxed text-text-secondary">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
