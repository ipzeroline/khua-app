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
        scrolled ? 'glass border-b border-border' : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          href={`/${lang}`}
          className="flex items-center gap-2.5 text-[15px] font-semibold tracking-normal text-text"
        >
          <Image
            src="/khua-logo.png"
            alt="KHUA"
            width={40}
            height={40}
            priority
            className="h-9 w-9 rounded-md object-cover"
          />
          <span>KHUA</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <ul className="flex items-center gap-8">
            {navLinks.map((link) => {
              const linkPath = link.href.replace(localePathPattern, '') || '/'
              const isActive = pathWithoutLang === linkPath
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`premium-link text-[0.8rem] tracking-wide transition-colors duration-300 ${
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

          <div className="flex items-center gap-6">
            <Link
              href={`/${lang}/account`}
              className="premium-link text-[0.8rem] text-text-secondary transition-colors hover:text-text"
            >
              {dict.nav.account}
            </Link>
            <CartDrawer dict={dict} lang={lang} />
          </div>

          {/* Locale switcher */}
          <div className="flex items-center gap-1 ml-2 pl-4 border-l border-border">
            {LOCALES.map((l) => {
              const newPath = pathname.replace(localePathPattern, `/${l}`)
              return (
                <Link
                  key={l}
                  href={newPath}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
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

        <div className="md:hidden ml-auto mr-3">
          <CartDrawer dict={dict} lang={lang} />
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden flex flex-col gap-1.5 p-2"
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
        >
          <motion.span
            animate={isOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
            className="block w-6 h-px bg-gold"
          />
          <motion.span
            animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
            className="block w-6 h-px bg-gold"
          />
          <motion.span
            animate={isOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
            className="block w-6 h-px bg-gold"
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
            className="md:hidden glass overflow-hidden"
          >
            <ul className="flex flex-col items-center justify-center h-full gap-8 -mt-16">
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
                    className="text-2xl font-semibold tracking-normal text-text"
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
                  className="text-2xl font-semibold tracking-normal text-text"
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
                <div className="flex items-center gap-3 mt-4">
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
