import Image from 'next/image'
import { Dictionary } from '@/i18n'

interface HomeRoastingSectionProps {
  dict: Dictionary
}

export default function HomeRoastingSection({ dict }: HomeRoastingSectionProps) {
  const roasting = dict.lanna.items[0]

  return (
    <section className="bg-[#f5f5f7] px-3 py-3 sm:px-4">
      <div className="mx-auto grid max-w-[1480px] gap-3 lg:grid-cols-2">
        <div className="relative min-h-[520px] overflow-hidden bg-[#21150f] sm:min-h-[640px]">
          <Image
            src="/khua-home-roasting-aroma.webp"
            alt={roasting.title}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-center transition-transform duration-700 hover:scale-[1.02]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.04)_0%,rgba(0,0,0,0.12)_52%,rgba(0,0,0,0.42)_100%)]" />
        </div>

        <div className="flex flex-col justify-center bg-[#1f1711] p-6 text-center text-white sm:p-10 lg:p-14 lg:text-left">
          <p className="apple-eyebrow mb-4 text-xs uppercase text-gold-light">
            {dict.lanna.label}
          </p>
          <h2 className="apple-display text-4xl sm:text-6xl">
            {roasting.title}
          </h2>
          <p className="apple-subheadline mt-6 max-w-xl text-base text-white/70 sm:text-xl lg:mx-0">
            {roasting.description}
          </p>
          <p className="mt-8 text-sm font-medium text-gold-light/80">
            {dict.site.tagline}
          </p>
        </div>
      </div>
    </section>
  )
}
