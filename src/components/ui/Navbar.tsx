'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Dictionary, Locale, LOCALES } from '@/i18n'
import CartDrawer from '@/components/cart/CartDrawer'

const localePathPattern = /^\/(th|en|lo|zh)/

interface NavbarProps {
  dict: Dictionary
  lang: Locale
}

export default function Navbar({ dict, lang }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  const navLinks = [
    { href: `/${lang}`, label: dict.nav.home },
    { href: `/${lang}/products`, label: dict.nav.products },
    { href: `/${lang}/articles`, label: dict.nav.articles },
    { href: `/${lang}/about`, label: dict.nav.about },
    { href: `/${lang}/contact`, label: dict.nav.contact },
  ]

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const pathWithoutLang = pathname.replace(localePathPattern, '') || '/'

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'glass border-b border-black/5' : 'bg-white/70 backdrop-blur-xl'
      }`}
    >
      <nav className="mx-auto flex h-12 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link
          href={`/${lang}`}
          className="flex items-center gap-2 text-[13px] font-semibold tracking-normal text-text"
        >
          <Image
            src="/khua-logo.png"
            alt="KHUA"
            width={40}
            height={40}
            priority
            className="h-7 w-7 rounded-md object-cover"
          />
          <span>KHUA</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-7 md:flex">
          <ul className="flex items-center gap-7">
            {navLinks.map((link) => {
              const linkPath = link.href.replace(localePathPattern, '') || '/'
              const isActive = pathWithoutLang === linkPath
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`text-[0.76rem] tracking-normal transition-colors duration-300 ${
                      isActive
                        ? 'text-gold font-medium'
                        : 'text-text-secondary hover:text-text'
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              )
            })}
          </ul>

          <div className="flex items-center gap-5">
            <Link
              href={`/${lang}/account`}
              className="text-[0.76rem] text-text-secondary transition-colors hover:text-text"
            >
              {dict.nav.account}
            </Link>
            <CartDrawer dict={dict} lang={lang} />
          </div>

          {/* Locale switcher */}
          <div className="ml-1 flex items-center gap-1 border-l border-border pl-3">
            {LOCALES.map((l) => {
              const newPath = pathname.replace(localePathPattern, `/${l}`)
              return (
                <Link
                  key={l}
                  href={newPath}
                  className={`rounded px-2 py-1 text-[0.68rem] transition-colors ${
                    lang === l
                      ? 'bg-gold/10 text-gold font-medium'
                      : 'text-text-secondary hover:text-text'
                  }`}
                >
                  {l.toUpperCase()}
                </Link>
              )
            })}
          </div>
        </div>

        <div className="ml-auto mr-2 md:hidden">
          <CartDrawer dict={dict} lang={lang} />
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex flex-col gap-1.5 p-2 md:hidden"
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
        >
          <motion.span
            animate={isOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
            className="block h-px w-5 bg-text"
          />
          <motion.span
            animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
            className="block h-px w-5 bg-text"
          />
          <motion.span
            animate={isOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
            className="block h-px w-5 bg-text"
          />
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: '100dvh' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="glass overflow-hidden md:hidden"
          >
            <ul className="flex h-full flex-col items-start justify-start gap-1 px-8 pt-20">
              {navLinks.map((link, i) => (
                <motion.li
                  key={link.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="block py-3 text-3xl font-semibold tracking-normal text-text"
                  >
                    {link.label}
                  </Link>
                </motion.li>
              ))}
              <motion.li
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
              >
                <Link
                  href={`/${lang}/account`}
                  onClick={() => setIsOpen(false)}
                  className="block py-3 text-3xl font-semibold tracking-normal text-text"
                >
                  {dict.nav.account}
                </Link>
              </motion.li>
              {/* Locale switcher mobile */}
              <motion.li
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="mt-6 flex items-center gap-3">
                  {LOCALES.map((l) => {
                    const newPath = pathname.replace(localePathPattern, `/${l}`)
                    return (
                      <Link
                        key={l}
                        href={newPath}
                        onClick={() => setIsOpen(false)}
                        className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                          lang === l
                            ? 'bg-gold/10 text-gold font-medium'
                            : 'text-text-secondary hover:text-text'
                        }`}
                      >
                        {l.toUpperCase()}
                      </Link>
                    )
                  })}
                </div>
              </motion.li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
