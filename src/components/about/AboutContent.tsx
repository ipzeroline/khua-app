'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Dictionary } from '@/i18n'

interface AboutContentProps {
  dict: Dictionary
}

const heroImage = '/khua-about-artisan-kitchen.png'
const kitchenImage = '/khua-about-lanna-kitchen.png'
const roastingImage = '/khua-about-roasted-spices.png'

export default function AboutContent({ dict }: AboutContentProps) {
  const about = dict.aboutExperience

  return (
    <div className="bg-[#f5f5f7] pb-24">
      <section className="relative min-h-[720px] overflow-hidden bg-[#21150f] px-5 pt-24 text-white sm:min-h-[760px] sm:px-8 sm:pt-28 lg:min-h-[780px]">
        <Image
          src={heroImage}
          alt={dict.about.title}
          fill
          priority
          sizes="100vw"
          className="object-cover object-[68%_center] sm:object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(18,11,7,0.34)_0%,rgba(18,11,7,0.12)_45%,rgba(18,11,7,0.22)_100%)] sm:bg-[linear-gradient(90deg,rgba(18,11,7,0.8)_0%,rgba(18,11,7,0.38)_42%,rgba(18,11,7,0.12)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,11,7,0.2)_0%,rgba(18,11,7,0.08)_36%,rgba(18,11,7,0.86)_100%)] sm:bg-[linear-gradient(180deg,rgba(18,11,7,0.54)_0%,rgba(18,11,7,0.08)_42%,rgba(18,11,7,0.68)_100%)]" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 mx-auto flex min-h-[720px] max-w-[1480px] flex-col justify-end pb-12 sm:min-h-[760px] sm:pb-16 lg:min-h-[780px]"
        >
          <p className="apple-eyebrow mb-4 text-xs uppercase text-gold-light">
            {dict.about.label}
          </p>
          <h1 className="apple-display max-w-4xl text-5xl text-white sm:text-7xl">
            {dict.about.title}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/82 sm:text-2xl sm:leading-9">
            {dict.about.subtitle}
          </p>
        </motion.div>
      </section>

      <section className="relative z-20 -mt-10 px-3 pb-3 sm:-mt-16 sm:px-4">
        <div className="mx-auto grid max-w-[1480px] gap-px bg-gold/10 shadow-[0_28px_90px_rgba(35,23,15,0.12)] lg:grid-cols-[0.86fr_1.14fr]">
          <div className="bg-[#241710] px-5 py-10 text-white sm:px-8 sm:py-14 lg:px-14">
            <p className="apple-eyebrow mb-4 text-xs uppercase text-gold-light">
              {dict.products.originValue}
            </p>
            <h2 className="apple-display text-4xl sm:text-5xl">{about.originTitle}</h2>
          </div>
          <div className="bg-surface px-5 py-10 sm:px-8 sm:py-14 lg:px-14">
            <div className="grid gap-5 text-base leading-8 text-text-secondary sm:text-lg sm:leading-9">
              {about.originParagraphs.map((paragraph, index) => (
                <p
                  key={paragraph}
                  className={index === 2 ? 'border-l-2 border-gold/45 pl-5 text-text' : ''}
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-3 py-3 sm:px-4" aria-labelledby="about-philosophy-title">
        <div className="mx-auto grid max-w-[1480px] gap-3 lg:grid-cols-2">
          <div className="bg-surface px-5 py-10 sm:px-8 sm:py-14 lg:px-14">
            <p className="apple-eyebrow mb-4 text-xs uppercase text-gold/70">
              {dict.craftsmanship.label}
            </p>
            <h2 id="about-philosophy-title" className="apple-display text-4xl text-text sm:text-5xl">
              {about.philosophyTitle}
            </h2>
            <div className="mt-7 space-y-5 text-base leading-8 text-text-secondary sm:text-lg sm:leading-9">
              {about.philosophyParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
          <div className="relative min-h-[520px] overflow-hidden bg-[#21150f] sm:min-h-[640px]">
            <Image
              src={roastingImage}
              alt={about.philosophyTitle}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.04)_0%,rgba(0,0,0,0.08)_48%,rgba(0,0,0,0.32)_100%)]" />
          </div>
        </div>
      </section>

      <section className="px-3 py-3 sm:px-4" aria-labelledby="about-craft-title">
        <div className="mx-auto max-w-[1480px] bg-surface px-5 py-10 sm:px-8 sm:py-14 lg:px-14">
          <div className="mb-8 grid gap-6 lg:grid-cols-[0.72fr_1.28fr]">
            <div>
              <p className="apple-eyebrow mb-4 text-xs uppercase text-gold/70">
                Artisan Craft
              </p>
              <h2 id="about-craft-title" className="apple-display text-4xl text-text sm:text-5xl">
                {dict.craftsmanship.title}
              </h2>
            </div>
            <p className="max-w-3xl text-base leading-8 text-text-secondary sm:text-lg">
              {dict.about.detailParagraphs[2]}
            </p>
          </div>

          <div className="grid gap-px bg-gold/10 md:grid-cols-3">
            {dict.about.timeline.map((step, index) => (
              <article key={step.title} className="bg-bg/75 p-5 sm:p-6">
                <p className="apple-eyebrow text-xs uppercase text-gold/70">
                  {String(index + 1).padStart(2, '0')} / {step.period}
                </p>
                <h3 className="mt-4 text-xl font-semibold leading-8 text-text">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-text-secondary">{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-3 py-3 sm:px-4" aria-labelledby="about-culture-title">
        <div className="mx-auto grid max-w-[1480px] gap-3 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative min-h-[540px] overflow-hidden bg-[#21150f] sm:min-h-[680px]">
            <Image
              src={kitchenImage}
              alt={about.cultureTitle}
              fill
              sizes="(max-width: 1024px) 100vw, 58vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.02)_0%,rgba(0,0,0,0.04)_48%,rgba(0,0,0,0.35)_100%)]" />
          </div>
          <div className="flex flex-col justify-center bg-[#241710] px-5 py-10 text-white sm:px-8 sm:py-14 lg:px-14">
            <p className="apple-eyebrow mb-4 text-xs uppercase text-gold-light">
              Lanna Culture
            </p>
            <h2 id="about-culture-title" className="apple-display text-4xl sm:text-5xl">
              {about.cultureTitle}
            </h2>
            <div className="mt-7 space-y-5 text-base leading-8 text-white/72 sm:text-lg">
              {about.cultureParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-3 py-3 sm:px-4" aria-labelledby="about-founder-title">
        <div className="mx-auto grid max-w-[1480px] gap-px bg-gold/10 lg:grid-cols-[0.82fr_1.18fr]">
          <div className="bg-surface px-5 py-10 sm:px-8 sm:py-14 lg:px-14">
            <p className="apple-eyebrow mb-4 text-xs uppercase text-gold/70">
              Founder Feeling
            </p>
            <h2 id="about-founder-title" className="apple-display text-4xl text-text sm:text-5xl">
              {about.founderTitle}
            </h2>
          </div>
          <div className="bg-surface px-5 py-10 sm:px-8 sm:py-14 lg:px-14">
            <div className="space-y-5 text-base leading-8 text-text-secondary sm:text-lg sm:leading-9">
              {about.founderParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-3 py-3 sm:px-4" aria-labelledby="about-why-title">
        <div className="mx-auto max-w-[1480px] bg-[#241710]">
          <div className="grid gap-8 px-5 py-10 text-white sm:px-8 sm:py-14 lg:grid-cols-[0.72fr_1.28fr] lg:px-14">
            <div>
              <p className="apple-eyebrow mb-4 text-xs uppercase text-gold-light">
                {dict.site.name}
              </p>
              <h2 id="about-why-title" className="apple-display text-4xl sm:text-5xl">
                {about.whyTitle}
              </h2>
            </div>
            <div className="grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
              {about.whyItems.map((item) => (
                <article key={item.title} className="bg-[#241710] p-5 sm:p-6">
                  <span className="mb-5 flex size-9 items-center justify-center border border-gold-light/35 text-gold-light">
                    ✓
                  </span>
                  <h3 className="text-lg font-semibold leading-7 text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/68">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-3 py-3 sm:px-4" aria-labelledby="about-faq-title">
        <div className="mx-auto grid max-w-[1480px] gap-px bg-gold/10 lg:grid-cols-[0.75fr_1.25fr]">
          <div className="bg-surface px-5 py-10 sm:px-8 sm:py-14 lg:px-14">
            <p className="apple-eyebrow mb-4 text-xs uppercase text-gold/70">
              {dict.about.label}
            </p>
            <h2 id="about-faq-title" className="apple-display text-4xl text-text sm:text-5xl">
              {about.faqTitle}
            </h2>
          </div>
          <div className="space-y-3 bg-surface px-5 py-10 sm:px-8 sm:py-14 lg:px-12">
            {about.faqItems.map((item, index) => (
              <details
                key={item.question}
                className="group border border-gold/15 bg-bg/70 p-5 transition-colors open:bg-white/90"
                open={index === 0}
              >
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-base font-semibold leading-7 text-text">
                  <span>{item.question}</span>
                  <span className="mt-1 text-xl leading-none text-gold transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-4 text-sm leading-7 text-text-secondary sm:text-base">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="px-3 py-3 sm:px-4" aria-labelledby="about-seo-footer">
        <div className="mx-auto grid max-w-[1480px] gap-8 bg-white px-5 py-10 sm:px-8 sm:py-12 lg:grid-cols-[0.85fr_1.15fr] lg:px-14">
          <div>
            <p className="apple-eyebrow mb-4 text-xs uppercase text-gold/70">
              {dict.products.originValue}
            </p>
            <h2 id="about-seo-footer" className="apple-display text-4xl text-text sm:text-5xl">
              {about.footerTitle}
            </h2>
          </div>
          <div className="space-y-5 text-base leading-8 text-text-secondary sm:text-lg">
            {about.footerParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
