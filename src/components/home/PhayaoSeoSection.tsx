import Image from 'next/image'
import { Dictionary } from '@/i18n'

interface PhayaoSeoSectionProps {
  dict: Dictionary
}

export default function PhayaoSeoSection({ dict }: PhayaoSeoSectionProps) {
  return (
    <section className="bg-bg px-3 py-3 sm:px-4">
      <div className="mx-auto grid max-w-[1480px] gap-3 lg:grid-cols-2">
        <div className="relative min-h-[520px] overflow-hidden bg-[#21150f] sm:min-h-[620px]">
          <Image
            src="/khua-phayao-lanna-origin.webp"
            alt={dict.phayaoSeo.title}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-center transition-transform duration-700 hover:scale-[1.02]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08)_0%,rgba(0,0,0,0.04)_45%,rgba(0,0,0,0.44)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 px-6 pb-8 text-white sm:px-10 sm:pb-10">
            <p className="apple-eyebrow mb-2 text-xs uppercase text-gold-light">
              {dict.products.originValue}
            </p>
            <h2 className="apple-display max-w-xl text-3xl sm:text-5xl">
              {dict.phayaoSeo.label}
            </h2>
          </div>
        </div>

        <div className="flex flex-col justify-center bg-surface p-6 sm:p-10 lg:p-14">
          <p className="apple-eyebrow mb-4 text-xs uppercase text-gold/70">
            {dict.phayaoSeo.label}
          </p>
          <h2 className="apple-display max-w-2xl text-4xl text-text sm:text-5xl">
            {dict.phayaoSeo.title}
          </h2>
          <div className="mt-7 space-y-5 text-base leading-8 text-text-secondary">
            {dict.phayaoSeo.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-2">
            {dict.products.seoTagsBase.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-gold/20 bg-gold-pale/50 px-3 py-1.5 text-xs font-medium text-gold"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
