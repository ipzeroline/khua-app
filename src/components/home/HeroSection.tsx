import Image from 'next/image'
import Link from 'next/link'
import { Dictionary } from '@/i18n'

interface HeroSectionProps {
  dict: Dictionary
}

export default function HeroSection({ dict }: HeroSectionProps) {
  const heroTitleLength = [...dict.hero.title].length
  const heroTitleViewport =
    dict.locale === 'en'
      ? 150 / heroTitleLength
      : dict.locale === 'zh'
        ? 94 / heroTitleLength
        : 118 / heroTitleLength

  return (
    <section className="apple-hero-stage relative min-h-[760px] overflow-hidden bg-[#24170f] px-5 pt-20 text-center text-white sm:min-h-screen sm:px-8 sm:pt-24 lg:text-left">
      <Image
        src="/khua-hero-lifestyle-wide-20260519-2.webp"
        alt="KHUA premium Northern Thai chili pastes served with sticky rice and fresh vegetables"
        fill
        priority
        sizes="(min-width: 640px) 100vw, 0vw"
        className="hidden object-cover object-center sm:block"
      />
      <Image
        src="/khua-hero-lifestyle-mobile-20260519.webp"
        alt="KHUA premium Northern Thai chili pastes arranged for mobile view"
        fill
        sizes="(max-width: 639px) 100vw, 0vw"
        className="object-cover object-[center_58%] sm:hidden"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.42)_0%,rgba(0,0,0,0.08)_34%,rgba(0,0,0,0.42)_100%)] sm:bg-[linear-gradient(180deg,rgba(0,0,0,0.38)_0%,rgba(0,0,0,0.08)_34%,rgba(0,0,0,0.42)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,11,7,0.74)_0%,rgba(18,11,7,0.42)_34%,rgba(18,11,7,0.08)_66%,rgba(18,11,7,0.38)_100%)] sm:bg-[linear-gradient(90deg,rgba(18,11,7,0.78)_0%,rgba(18,11,7,0.5)_36%,rgba(18,11,7,0.1)_68%,rgba(18,11,7,0.34)_100%)]" />
      <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0.42),transparent)]" />

      <div className="relative z-10 mx-auto flex min-h-[680px] max-w-7xl flex-col items-center justify-center sm:min-h-[calc(100vh-6rem)] lg:items-start">
        <div className="mb-6 flex flex-col items-center gap-3 text-sm font-semibold text-white/78 lg:items-start">
          <div className="flex items-center gap-2">
            <Image
              src="/khua-logo.webp"
              alt=""
              width={32}
              height={32}
              className="h-7 w-7 rounded-md object-cover"
            />
            <span>{dict.hero.subtitle}</span>
          </div>
          <span className="inline-flex whitespace-nowrap rounded-full border border-gold-light/25 bg-black/20 px-3 py-1 text-xs font-medium leading-none text-gold-light shadow-[0_12px_30px_rgba(0,0,0,0.18)] backdrop-blur-sm">
            {dict.site.nameThai} จากพะเยา
          </span>
        </div>

        <div className="relative max-w-[94vw] sm:max-w-4xl">
          <h1
            className="apple-display mx-auto max-w-[94vw] whitespace-nowrap text-white drop-shadow-[0_16px_46px_rgba(0,0,0,0.28)] lg:mx-0"
            style={{
              fontSize: `clamp(0.8rem, ${heroTitleViewport.toFixed(2)}vw, 5.7rem)`,
            }}
          >
            {dict.hero.title}
          </h1>

          <p className="apple-subheadline mx-auto mt-3 max-w-2xl text-2xl text-white/92 sm:text-3xl lg:mx-0">
            {dict.site.tagline}
          </p>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/72 sm:text-lg lg:mx-0">
            {dict.hero.description}
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-lg lg:justify-start">
            <Link href={`/${dict.locale}/products`} className="apple-cta-link apple-cta-link-light">
              {dict.hero.cta}
            </Link>
            <Link href={`/${dict.locale}/about`} className="apple-cta-link apple-cta-link-light">
              {dict.nav.about}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
