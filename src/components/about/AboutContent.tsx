'use client'

import { motion } from 'framer-motion'
import { Dictionary } from '@/i18n'
import SectionDivider from '@/components/ui/SectionDivider'

interface AboutContentProps {
  dict: Dictionary
}

export default function AboutContent({ dict }: AboutContentProps) {
  return (
    <div className="pt-32 pb-24">
      {/* Header */}
      <section className="px-6 text-center relative z-10">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="apple-eyebrow text-gold/60 text-xs uppercase mb-4"
        >
          {dict.about.label}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="apple-headline text-4xl sm:text-5xl text-text"
        >
          {dict.about.title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="apple-subheadline text-text-secondary mt-3 text-base"
        >
          {dict.about.subtitle}
        </motion.p>
      </section>

      <SectionDivider />

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
