'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Dictionary } from '@/i18n'
import Button from '@/components/ui/Button'

interface HeroSectionProps {
  dict: Dictionary
}

export default function HeroSection({ dict }: HeroSectionProps) {
  return (
    <section className="premium-stage relative min-h-screen overflow-hidden bg-bg px-6 pt-28 pb-20 flex items-center">
      {/* Subtle Lanna pattern background */}
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

        <div className="max-w-3xl text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="apple-eyebrow text-gold/60 text-xs uppercase mb-5"
          >
            {dict.hero.subtitle}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="apple-headline hero-gold-title mb-5 text-5xl font-semibold sm:text-6xl lg:text-7xl"
          >
            {dict.hero.title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="apple-subheadline text-text-secondary text-xl sm:text-2xl"
          >
            {dict.site.tagline}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-text-secondary"
          >
            {dict.hero.description}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.85 }}
            className="text-gold/45 text-sm mt-3 font-medium"
          >
            Crafted Northern Soul
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.05 }}
            className="mt-8"
          >
            <Button href={`/${dict.locale}/products`} size="lg">
              {dict.hero.cta}
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-px h-10 bg-gradient-to-b from-gold/40 to-transparent"
        />
      </motion.div>
    </section>
  )
}
