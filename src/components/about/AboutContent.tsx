'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Dictionary } from '@/i18n'
import SectionDivider from '@/components/ui/SectionDivider'

interface AboutContentProps {
  dict: Dictionary
}

export default function AboutContent({ dict }: AboutContentProps) {
  return (
    <div className="pb-24">
      <section className="premium-stage relative flex min-h-[620px] items-center overflow-hidden bg-bg px-6 pb-20 pt-24 text-center sm:min-h-[720px] sm:pt-28">
        <div className="absolute inset-0 lanna-pattern-bg opacity-30" />
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4 }}
          className="absolute inset-x-0 top-0 h-1/2 bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(250,245,235,0.28)_42%,transparent)]"
        />
        <div className="absolute left-1/2 top-1/2 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/10" />
        <div className="absolute left-1/2 top-1/2 h-[24rem] w-[24rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/10" />

        <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1 }}
            className="mx-auto mb-8 flex max-w-xs items-center justify-center gap-3 text-gold/45"
            aria-hidden="true"
          >
            <span className="h-px flex-1 bg-gradient-to-r from-transparent to-gold/40" />
            <span className="text-sm tracking-[0.35em]">ᨣᩃᨶ</span>
            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-gold/40" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="mx-auto mb-6 flex justify-center"
          >
            <div className="premium-logo-frame overflow-hidden rounded-[30px] p-2">
              <Image
                src="/khua-logo.png"
                alt="KHUA logo"
                width={176}
                height={176}
                priority
                className="h-24 w-24 rounded-[20px] object-cover sm:h-28 sm:w-28"
              />
            </div>
          </motion.div>

          <div className="relative max-w-3xl">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-[-2rem] bottom-8 top-6 -z-10 rounded-full bg-white/55 blur-3xl"
            />
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="apple-eyebrow mb-5 text-xs uppercase text-gold/60"
            >
              {dict.about.label}
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="apple-headline mb-5 text-5xl text-text drop-shadow-[0_14px_34px_rgba(184,134,11,0.12)] sm:text-6xl lg:text-7xl"
            >
              {dict.about.title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="apple-subheadline text-xl text-text-secondary sm:text-2xl"
            >
              {dict.about.subtitle}
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.75 }}
              className="mt-5 text-sm font-medium text-gold/45"
            >
              Crafted Northern Soul
            </motion.p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="h-10 w-px bg-gradient-to-b from-gold/40 to-transparent"
          />
        </motion.div>
      </section>

      <div className="py-16">
        <SectionDivider />
      </div>

      <section className="px-3 sm:px-4">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative mx-auto max-w-[1480px] overflow-hidden bg-[#21150f]"
        >
          <div className="relative aspect-[4/5] sm:aspect-[16/9] lg:aspect-[2.1/1]">
            <Image
              src="/khua-phayao-lanna-origin.png"
              alt={dict.products.originValue}
              fill
              sizes="(max-width: 640px) 100vw, 96vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.1)_0%,rgba(0,0,0,0.1)_42%,rgba(0,0,0,0.52)_100%)]" />
            <div className="absolute inset-x-0 bottom-0 px-6 pb-8 text-center text-white sm:px-10 sm:pb-12">
              <p className="apple-eyebrow mb-2 text-xs uppercase text-gold-light">
                {dict.products.originLabel}
              </p>
              <h2 className="apple-display text-3xl sm:text-5xl">
                {dict.products.originValue}
              </h2>
            </div>
          </div>
        </motion.div>
      </section>

      <div className="py-16">
        <SectionDivider />
      </div>

      {/* Story */}
      <section className="px-6 max-w-3xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-6 text-text-secondary leading-relaxed"
        >
          {dict.about.paragraphs.map((p, i) => (
            <p key={i} className={i === dict.about.paragraphs.length - 1 ? 'text-text font-medium' : ''}>
              {i === 0 ? (
                <>
                  <span className="gold-text font-medium">{dict.site.name}</span>
                  {' — '}{p.replace(/^KHUA — /, '').replace(/^KHUA — /, '')}
                </>
              ) : (
                p
              )}
            </p>
          ))}
        </motion.div>
      </section>

      <div className="py-12">
        <SectionDivider />
      </div>

      <section className="relative z-10 mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start"
        >
          <div>
            <p className="apple-eyebrow mb-4 text-xs uppercase text-gold/70">
              {dict.about.label}
            </p>
            <h2 className="apple-display text-4xl text-text sm:text-5xl">
              {dict.about.detailTitle}
            </h2>
          </div>
          <div className="space-y-6 text-base leading-8 text-text-secondary">
            {dict.about.detailParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </motion.div>
      </section>

      <div className="py-12">
        <SectionDivider />
      </div>

      <section className="relative z-10 mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center"
        >
          <p className="apple-eyebrow mb-4 text-xs uppercase text-gold/70">
            KHUA
          </p>
          <h2 className="apple-display text-4xl text-text sm:text-5xl">
            {dict.about.principlesTitle}
          </h2>
        </motion.div>

        <div className="grid gap-3 md:grid-cols-3">
          {dict.about.principles.map((principle, index) => (
            <motion.article
              key={principle.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="bg-surface p-6 text-center shadow-[0_18px_55px_rgba(29,29,31,0.05)]"
            >
              <span className="mx-auto mb-5 grid h-10 w-10 place-items-center rounded-full bg-gold-pale text-sm font-semibold text-gold">
                {index + 1}
              </span>
              <h3 className="apple-headline text-xl text-text">
                {principle.title}
              </h3>
              <p className="mt-4 text-sm leading-7 text-text-secondary">
                {principle.description}
              </p>
            </motion.article>
          ))}
        </div>
      </section>

      <div className="py-12">
        <SectionDivider />
      </div>

      <section className="px-3 sm:px-4">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mx-auto grid max-w-[1480px] gap-3 bg-[#f5f5f7] lg:grid-cols-2"
        >
          <div className="flex flex-col justify-center bg-surface p-6 text-center sm:p-10 lg:p-14 lg:text-left">
            <p className="apple-eyebrow mb-4 text-xs uppercase text-gold/70">
              {dict.craftsmanship.label}
            </p>
            <h2 className="apple-display text-4xl text-text sm:text-5xl">
              {dict.craftsmanship.items[0]?.title}
            </h2>
            <p className="mt-6 text-base leading-8 text-text-secondary">
              {dict.craftsmanship.items[0]?.description}
            </p>
          </div>
          <div className="relative min-h-[440px] overflow-hidden bg-[#21150f] sm:min-h-[560px]">
            <Image
              src="/khua-local-ingredients.png"
              alt={dict.craftsmanship.items[0]?.title || dict.craftsmanship.title}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.04)_0%,rgba(0,0,0,0.04)_50%,rgba(0,0,0,0.18)_100%)]" />
          </div>
        </motion.div>
      </section>

      <div className="py-12">
        <SectionDivider />
      </div>

      <section className="px-3 sm:px-4">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mx-auto grid max-w-[1480px] gap-3 bg-[#f5f5f7] lg:grid-cols-2"
        >
          <div className="relative min-h-[440px] overflow-hidden bg-[#21150f] sm:min-h-[560px]">
            <Image
              src="/khua-roasting-process.png"
              alt={dict.craftsmanship.items[1]?.title || dict.craftsmanship.title}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.04)_0%,rgba(0,0,0,0.1)_50%,rgba(0,0,0,0.32)_100%)]" />
          </div>
          <div className="flex flex-col justify-center bg-surface p-6 text-center sm:p-10 lg:p-14 lg:text-left">
            <p className="apple-eyebrow mb-4 text-xs uppercase text-gold/70">
              {dict.craftsmanship.label}
            </p>
            <h2 className="apple-display text-4xl text-text sm:text-5xl">
              {dict.craftsmanship.items[1]?.title}
            </h2>
            <p className="mt-6 text-base leading-8 text-text-secondary">
              {dict.craftsmanship.items[1]?.description}
            </p>
          </div>
        </motion.div>
      </section>

      <div className="py-12">
        <SectionDivider />
      </div>

      <section className="px-3 sm:px-4">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mx-auto grid max-w-[1480px] gap-3 bg-[#f5f5f7] lg:grid-cols-2"
        >
          <div className="flex flex-col justify-center bg-surface p-6 text-center sm:p-10 lg:p-14 lg:text-left">
            <p className="apple-eyebrow mb-4 text-xs uppercase text-gold/70">
              {dict.craftsmanship.label}
            </p>
            <h2 className="apple-display text-4xl text-text sm:text-5xl">
              {dict.lanna.items[1]?.title}
            </h2>
            <p className="mt-6 text-base leading-8 text-text-secondary">
              {dict.lanna.items[1]?.description}
            </p>
          </div>
          <div className="relative min-h-[440px] overflow-hidden bg-[#21150f] sm:min-h-[560px]">
            <Image
              src="/khua-stone-mortar-closeup.png"
              alt={dict.lanna.items[1]?.title || dict.craftsmanship.title}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.04)_0%,rgba(0,0,0,0.08)_50%,rgba(0,0,0,0.28)_100%)]" />
          </div>
        </motion.div>
      </section>

      <div className="py-12">
        <SectionDivider />
      </div>

      <section className="px-3 sm:px-4">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mx-auto grid max-w-[1480px] gap-3 bg-[#f5f5f7] lg:grid-cols-2"
        >
          <div className="relative min-h-[520px] overflow-hidden bg-[#21150f] sm:min-h-[640px] lg:order-2">
            <Image
              src="/khua-handmade-packaging.png"
              alt={dict.site.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.04)_0%,rgba(0,0,0,0.06)_50%,rgba(0,0,0,0.3)_100%)]" />
          </div>
          <div className="flex flex-col justify-center bg-surface p-6 text-center sm:p-10 lg:p-14 lg:text-left">
            <p className="apple-eyebrow mb-4 text-xs uppercase text-gold/70">
              {dict.site.name}
            </p>
            <h2 className="apple-display text-4xl text-text sm:text-5xl">
              {dict.craftsmanship.items[2]?.title}
            </h2>
            <p className="mt-6 text-base leading-8 text-text-secondary">
              {dict.about.paragraphs[dict.about.paragraphs.length - 1]}
            </p>
          </div>
        </motion.div>
      </section>

      <div className="py-12">
        <SectionDivider />
      </div>

      <section className="relative z-10 mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center"
        >
          <p className="apple-eyebrow mb-4 text-xs uppercase text-gold/70">
            {dict.craftsmanship.label}
          </p>
          <h2 className="apple-display text-4xl text-text sm:text-5xl">
            {dict.about.timelineTitle}
          </h2>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-2">
          {dict.about.timeline.map((step, index) => (
            <motion.article
              key={step.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06 }}
              className="border border-border bg-surface p-6"
            >
              <p className="apple-eyebrow text-xs uppercase text-gold/70">
                {String(index + 1).padStart(2, '0')} / {step.period}
              </p>
              <h3 className="apple-headline mt-4 text-2xl text-text">
                {step.title}
              </h3>
              <p className="mt-4 text-sm leading-7 text-text-secondary">
                {step.description}
              </p>
            </motion.article>
          ))}
        </div>
      </section>

      <div className="py-12">
        <SectionDivider />
      </div>

      {/* Values */}
      <section className="px-6 max-w-5xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16">
          {dict.craftsmanship.items.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="text-center"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full border border-gold/20 flex items-center justify-center text-3xl bg-gold-pale/50">
                {['🌾', '🏺', '🍲'][i]}
              </div>
              <h3 className="apple-headline text-xl text-text mb-2">
                {item.title}
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
}
