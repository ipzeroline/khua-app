import Link from 'next/link'
import Image from 'next/image'
import { Dictionary, Locale } from '@/i18n'

interface FooterProps {
  dict: Dictionary
}

export default function Footer({ dict }: FooterProps) {
  const lang: Locale = dict.locale
  const facebookLabels: Record<Locale, string> = {
    th: 'ติดตาม Facebook Page',
    en: 'Follow Facebook Page',
    lo: 'ຕິດຕາມ Facebook Page',
    zh: '关注 Facebook Page',
  }
  const instagramLabels: Record<Locale, string> = {
    th: 'ติดตาม Instagram',
    en: 'Follow Instagram',
    lo: 'ຕິດຕາມ Instagram',
    zh: '关注 Instagram',
  }
  const socialLinkLabels = {
    facebook: 'Facebook',
    instagram: 'Instagram',
  }
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
            <div className="mt-7 flex flex-wrap gap-2.5">
              <a
                href={dict.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={facebookLabels[lang]}
                className="group inline-flex min-h-11 items-center gap-3 rounded-md border border-border bg-white/55 px-3.5 pr-4 text-sm font-medium text-text-secondary shadow-[0_10px_30px_rgba(38,24,10,0.04)] transition duration-300 hover:border-gold/40 hover:bg-white hover:text-text"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#1877f2]/20 bg-[#1877f2]/8 text-[0.95rem] font-semibold leading-none text-[#1877f2] transition duration-300 group-hover:border-[#1877f2]/35 group-hover:bg-[#1877f2]/12">
                  f
                </span>
                <span>{socialLinkLabels.facebook}</span>
              </a>
              <a
                href={dict.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={instagramLabels[lang]}
                className="group inline-flex min-h-11 items-center gap-3 rounded-md border border-border bg-white/55 px-3.5 pr-4 text-sm font-medium text-text-secondary shadow-[0_10px_30px_rgba(38,24,10,0.04)] transition duration-300 hover:border-gold/40 hover:bg-white hover:text-text"
              >
                <span className="relative inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#e1306c]/20 bg-[linear-gradient(135deg,rgba(245,133,41,0.12),rgba(225,48,108,0.10),rgba(131,58,180,0.12))] text-[#e1306c] transition duration-300 group-hover:border-[#e1306c]/35 group-hover:bg-[linear-gradient(135deg,rgba(245,133,41,0.16),rgba(225,48,108,0.14),rgba(131,58,180,0.16))]">
                  <span className="h-3.5 w-3.5 rounded-[4px] border border-current" />
                  <span className="absolute h-1.5 w-1.5 rounded-full border border-current" />
                  <span className="absolute right-[8px] top-[8px] h-1 w-1 rounded-full bg-current" />
                </span>
                <span>{socialLinkLabels.instagram}</span>
              </a>
            </div>
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
