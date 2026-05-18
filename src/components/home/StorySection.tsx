'use client'

import { motion } from 'framer-motion'
import { Dictionary } from '@/i18n'
import SectionDivider from '@/components/ui/SectionDivider'

interface StorySectionProps {
  dict: Dictionary
}

export default function StorySection({ dict }: StorySectionProps) {
  return (
    <section className="py-24 px-6 bg-surface">
      <div className="max-w-3xl mx-auto text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="apple-eyebrow text-gold/60 text-xs uppercase mb-4"
        >
          {dict.story.label}
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="apple-headline text-3xl sm:text-4xl text-text"
        >
          {dict.story.title}
        </motion.h2>

        <SectionDivider />

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-text-secondary leading-relaxed text-base sm:text-lg"
        >
          {dict.story.p1}
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-text-secondary/80 leading-relaxed text-sm sm:text-base mt-4"
        >
          {dict.story.p2}
        </motion.p>
      </div>
    </section>
  )
}
