'use client'

import { motion } from 'framer-motion'
import { Dictionary } from '@/i18n'

interface HomeFaqSectionProps {
  dict: Dictionary
}

export default function HomeFaqSection({ dict }: HomeFaqSectionProps) {
  return (
    <section className="bg-bg px-6 py-24">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <p className="apple-eyebrow mb-4 text-xs uppercase text-gold/70">
            {dict.faq.label}
          </p>
          <h2 className="apple-headline text-3xl text-text sm:text-4xl">
            {dict.faq.title}
          </h2>
        </motion.div>

        <div className="space-y-4">
          {dict.faq.items.map((item, index) => (
            <motion.details
              key={item.question}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="group rounded-2xl border border-border bg-surface p-5 shadow-sm"
              open={index === 0}
            >
              <summary className="cursor-pointer list-none apple-headline text-lg text-text">
                {item.question}
              </summary>
              <p className="mt-4 text-sm leading-relaxed text-text-secondary">
                {item.answer}
              </p>
            </motion.details>
          ))}
        </div>
      </div>
    </section>
  )
}
