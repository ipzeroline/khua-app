'use client'

import { motion } from 'framer-motion'
import { Dictionary } from '@/i18n'
import Button from '@/components/ui/Button'
import SectionDivider from '@/components/ui/SectionDivider'

interface ContactContentProps {
  dict: Dictionary
}

export default function ContactContent({ dict }: ContactContentProps) {
  return (
    <div className="pt-32 pb-24">
      <section className="px-6 text-center relative z-10">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="apple-eyebrow text-gold/60 text-xs uppercase mb-4"
        >
          {dict.contact.label}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="apple-headline text-4xl sm:text-5xl text-text"
        >
          {dict.contact.title}
        </motion.h1>
      </section>

      <SectionDivider />

      <section className="px-6 max-w-2xl mx-auto relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-center">
          {/* LINE */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="p-8 rounded-2xl bg-surface border border-border shadow-sm hover:shadow-md transition-all duration-500"
          >
            <div className="text-4xl mb-4">💬</div>
            <h3 className="apple-headline text-lg text-text mb-2">
              {dict.contact.lineTitle}
            </h3>
            <p className="text-text-secondary text-sm mb-4">
              {dict.contact.lineDesc}
            </p>
            <p className="text-gold font-medium">{dict.site.lineId}</p>
            <div className="mt-4">
              <Button href={dict.social.line} variant="outline" size="sm" external>
                {dict.contact.addLine}
              </Button>
            </div>
          </motion.div>

          {/* Phone */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="p-8 rounded-2xl bg-surface border border-border shadow-sm hover:shadow-md transition-all duration-500"
          >
            <div className="text-4xl mb-4">📞</div>
            <h3 className="apple-headline text-lg text-text mb-2">
              {dict.contact.phoneTitle}
            </h3>
            <p className="text-text-secondary text-sm mb-4">
              {dict.contact.phoneDesc}
            </p>
            <p className="text-gold font-medium">{dict.site.phone}</p>
            <div className="mt-4">
              <Button
                href={`tel:${dict.site.phone.replace(/-/g, '')}`}
                variant="outline"
                size="sm"
              >
                {dict.contact.callNow}
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Social */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="text-text-secondary text-sm mb-6">
            {dict.contact.followUs}
          </p>
          <div className="flex items-center justify-center gap-6">
            <a
              href={dict.social.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-secondary hover:text-gold transition-colors duration-300 text-sm tracking-wider"
            >
              Facebook
            </a>
            <span className="text-border">/</span>
            <a
              href={dict.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-secondary hover:text-gold transition-colors duration-300 text-sm tracking-wider"
            >
              Instagram
            </a>
            <span className="text-border">/</span>
            <a
              href={dict.social.line}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-secondary hover:text-gold transition-colors duration-300 text-sm tracking-wider"
            >
              LINE
            </a>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
