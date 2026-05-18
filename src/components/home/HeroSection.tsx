'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Dictionary } from '@/i18n'

interface HeroSectionProps {
  dict: Dictionary
}

export default function HeroSection({ dict }: HeroSectionProps) {
  const heroProducts = dict.products_data.slice(0, 3)
  const heroTitleLength = [...dict.hero.title].length
  const heroTitleViewport =
    dict.locale === 'en'
      ? 150 / heroTitleLength
      : dict.locale === 'zh'
        ? 94 / heroTitleLength
        : 118 / heroTitleLength

  return (
    <section className="apple-hero-stage relative min-h-[760px] overflow-hidden bg-[#fbfbfd] px-5 pt-24 text-center sm:min-h-screen sm:px-6 sm:pt-28">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#fff_0%,#fbfbfd_35%,#f5f5f7_100%)]" />
      <div className="absolute inset-x-0 top-0 h-40 bg-white/80" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[radial-gradient(ellipse_at_50%_100%,rgba(168,120,36,0.18),transparent_58%)]" />

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#6e6e73]"
        >
          <Image
            src="/khua-logo.png"
            alt=""
            width={32}
            height={32}
            priority
            className="h-7 w-7 rounded-md object-cover"
          />
          <span>{dict.hero.subtitle}</span>
        </motion.div>

        <div className="relative max-w-4xl">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="apple-eyebrow mb-3 text-xs uppercase text-gold/70"
          >
            {dict.site.nameThai} จากพะเยา
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.28 }}
            className="apple-display mx-auto max-w-[94vw] whitespace-nowrap text-text"
            style={{
              fontSize: `clamp(0.8rem, ${heroTitleViewport.toFixed(2)}vw, 5.7rem)`,
            }}
          >
            {dict.hero.title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.42 }}
            className="apple-subheadline mx-auto mt-3 max-w-2xl text-2xl text-text sm:text-3xl"
          >
            {dict.site.tagline}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.54 }}
            className="mx-auto mt-4 max-w-2xl text-base leading-7 text-text-secondary sm:text-lg"
          >
            {dict.hero.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.68 }}
            className="mt-7 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-lg"
          >
            <Link href={`/${dict.locale}/products`} className="apple-cta-link">
              {dict.hero.cta}
            </Link>
            <Link href={`/${dict.locale}/about`} className="apple-cta-link">
              {dict.nav.about}
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 34, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.78 }}
          className="relative mt-10 h-[315px] w-full max-w-5xl sm:mt-12 sm:h-[390px] lg:h-[440px]"
          aria-label={dict.products.title}
        >
          <div className="absolute inset-x-2 bottom-0 h-28 rounded-[100%] bg-[radial-gradient(ellipse_at_center,rgba(29,29,31,0.18),transparent_68%)] blur-2xl" />
          {heroProducts.map((product, index) => {
            const positions = [
              'left-1/2 top-2 z-20 h-[255px] w-[190px] -translate-x-1/2 sm:h-[340px] sm:w-[250px] lg:h-[390px] lg:w-[290px]',
              'left-[15%] top-20 z-10 h-[210px] w-[155px] -rotate-6 sm:left-[18%] sm:h-[285px] sm:w-[210px] lg:h-[330px] lg:w-[245px]',
              'right-[15%] top-20 z-10 h-[210px] w-[155px] rotate-6 sm:right-[18%] sm:h-[285px] sm:w-[210px] lg:h-[330px] lg:w-[245px]',
            ]

            return (
              <Link
                key={product.slug}
                href={`/${dict.locale}/products/${product.slug}`}
                className={`absolute ${positions[index]} block overflow-hidden rounded-[34px] bg-white shadow-[0_34px_90px_rgba(29,29,31,0.16)] ring-1 ring-black/5 transition-transform duration-500 hover:-translate-y-2`}
              >
                {product.image && (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 55vw, (max-width: 1024px) 34vw, 290px"
                    className="object-cover"
                    priority={index === 0}
                  />
                )}
              </Link>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
