'use client'

import { motion } from 'framer-motion'
import { Dictionary } from '@/i18n'

interface CraftsmanshipSectionProps {
  dict: Dictionary
}

export default function CraftsmanshipSection({ dict }: CraftsmanshipSectionProps) {
  return (
    <section className="py-24 px-6 bg-surface border-y border-border">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="apple-eyebrow text-gold/60 text-xs uppercase mb-4">
            {dict.craftsmanship.label}
          </p>
          <h2 className="apple-headline text-3xl sm:text-4xl text-text">
            {dict.craftsmanship.title}
          </h2>
        </motion.div>

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
              <div className="w-20 h-20 mx-auto mb-6 rounded-full border border-gold/15 flex items-center justify-center text-3xl bg-gold-pale/50 transition-all duration-500">
                {['🌾', '🏺', '🍲'][i]}
              </div>
              <h3 className="apple-headline text-xl text-text mb-3">
                {item.title}
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
