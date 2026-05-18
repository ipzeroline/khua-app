'use client'

import { motion } from 'framer-motion'
import { Dictionary } from '@/i18n'

interface LannaSoulSectionProps {
  dict: Dictionary
}

const symbols = ['ᨣ', 'ᩃ', 'ᨶ']
const icons = ['◇', '◎', '✧']

export default function LannaSoulSection({ dict }: LannaSoulSectionProps) {
  return (
    <section className="relative overflow-hidden bg-[#1f1711] px-6 py-28 text-white">
      <div className="absolute inset-0 opacity-20 lanna-pattern-bg" />
      <div className="absolute left-1/2 top-0 h-72 w-[48rem] -translate-x-1/2 rounded-full bg-gold/20 blur-[120px]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/35 to-transparent" />

      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <p className="apple-eyebrow mb-5 text-xs uppercase text-gold-light">
              {dict.lanna.label}
            </p>
            <h2 className="apple-headline max-w-xl text-4xl sm:text-5xl">
              {dict.lanna.title}
            </h2>
            <p className="apple-subheadline mt-6 max-w-xl text-base text-white/68 sm:text-lg">
              {dict.lanna.subtitle}
            </p>

            <div className="mt-10 rounded-2xl border border-gold/20 bg-white/[0.06] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-sm">
              <div className="mb-5 flex gap-3">
                {symbols.map((symbol) => (
                  <span
                    key={symbol}
                    className="grid h-11 w-11 place-items-center rounded-full border border-gold/25 bg-gold/10 text-xl text-gold-light"
                  >
                    {symbol}
                  </span>
                ))}
              </div>
              <p className="text-xl font-medium leading-relaxed text-gold-light sm:text-2xl">
                {dict.lanna.quote}
              </p>
            </div>
          </motion.div>

          <div className="grid gap-5 sm:grid-cols-3 lg:grid-cols-1">
            {dict.lanna.items.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.12, duration: 0.6 }}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.07] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.18)] backdrop-blur-sm transition-colors hover:border-gold/35"
              >
                <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gold/10 blur-3xl transition-opacity group-hover:opacity-100" />
                <div className="relative">
                  <span className="mb-5 grid h-12 w-12 place-items-center rounded-full border border-gold/20 bg-gold/10 text-2xl text-gold-light">
                    {icons[index]}
                  </span>
                  <h3 className="apple-headline text-2xl text-white">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/62">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
