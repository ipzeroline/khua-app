import Link from 'next/link'
import Image from 'next/image'
import { Dictionary, Locale } from '@/i18n'

interface FooterProps {
  dict: Dictionary
}

export default function Footer({ dict }: FooterProps) {
  const lang: Locale = dict.locale
  const navLinks = [
    { href: `/${lang}`, label: dict.nav.home },
    { href: `/${lang}/products`, label: dict.nav.products },
    { href: `/${lang}/articles`, label: dict.nav.articles },
    { href: `/${lang}/about`, label: dict.nav.about },
    { href: `/${lang}/contact`, label: dict.nav.contact },
    { href: `/${lang}/account`, label: dict.nav.account },
  ]

  return (
    <footer className="border-t border-border bg-surface/50 mt-32">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <Link
              href={`/${lang}`}
              className="inline-flex items-center gap-3 text-[17px] font-semibold tracking-normal text-text"
            >
              <Image
                src="/khua-logo.png"
                alt="KHUA"
                width={44}
                height={44}
                className="h-10 w-10 rounded-md object-cover"
              />
              <span>KHUA</span>
            </Link>
            <p className="mt-3 text-text-secondary text-sm leading-relaxed max-w-xs">
              {dict.site.tagline}
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-gold text-xs tracking-widest uppercase mb-4 font-medium">
              {dict.footer.menu}
            </h4>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-text-secondary hover:text-gold text-sm transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-gold text-xs tracking-widest uppercase mb-4 font-medium">
              {dict.footer.contact}
            </h4>
            <ul className="space-y-3 text-sm text-text-secondary">
              <li>
                <span className="text-gold/60">{dict.footer.line}:</span>{' '}
                {dict.site.lineId}
              </li>
              <li>
                <span className="text-gold/60">{dict.footer.phone}:</span>{' '}
                {dict.site.phone}
              </li>
              <li>
                <span className="text-gold/60">{dict.footer.email}:</span>{' '}
                {dict.site.email}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-text-secondary text-xs">
            &copy; {new Date().getFullYear()} KHUA. {dict.footer.rights}.
          </p>
          <p className="text-gold/40 text-xs font-medium">
            {dict.footer.proudly}
          </p>
        </div>
      </div>
    </footer>
  )
}
