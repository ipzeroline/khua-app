import type { Metadata } from 'next'
import { getDictionary, type Locale, LOCALES } from '@/i18n'
import { getOpenGraphLocale } from '@/i18n/seo'
import ContactContent from '@/components/contact/ContactContent'

interface ContactPageProps {
  params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: ContactPageProps): Promise<Metadata> {
  const { lang } = await params
  const locale = lang as Locale
  const dict = await getDictionary(locale)

  const alternates: Record<string, string> = {}
  LOCALES.forEach((l) => { alternates[l] = `/${l}/contact` })

  return {
    title: dict.contact.title,
    description: `${dict.contact.lineDesc} — ${dict.site.name}`,
    alternates: { canonical: `/${locale}/contact`, languages: alternates },
    openGraph: {
      title: `${dict.contact.title} | ${dict.site.name}`,
      description: `${dict.contact.lineDesc} — ${dict.site.name}`,
      locale: getOpenGraphLocale(locale),
      type: 'website',
    },
  }
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { lang } = await params
  const locale = lang as Locale
  const dict = await getDictionary(locale)

  return <ContactContent dict={dict} />
}
