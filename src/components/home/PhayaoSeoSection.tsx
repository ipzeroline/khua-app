'use client'

import { motion } from 'framer-motion'
import { Dictionary } from '@/i18n'

interface PhayaoSeoSectionProps {
  dict: Dictionary
}

export default function PhayaoSeoSection({ dict }: PhayaoSeoSectionProps) {
  return (
    <section className="bg-bg px-6 py-24">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="apple-eyebrow mb-4 text-xs uppercase text-gold/70">
            {dict.phayaoSeo.label}
          </p>
          <h2 className="apple-headline text-3xl text-text sm:text-4xl">
            {dict.phayaoSeo.title}
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="premium-card rounded-2xl border border-white/70 bg-surface p-6 sm:p-8"
        >
          <div className="space-y-5 text-base leading-8 text-text-secondary">
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
        </motion.div>
      </div>
    </section>
  )
}
