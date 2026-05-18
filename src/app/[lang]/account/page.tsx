import type { Metadata } from 'next'
import { getDictionary, type Locale, LOCALES } from '@/i18n'
import { getOpenGraphLocale, mergeKeywords, THAI_SEO_KEYWORDS } from '@/i18n/seo'
import AccountContent from '@/components/account/AccountContent'

interface AccountPageProps {
  params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: AccountPageProps): Promise<Metadata> {
  const { lang } = await params
  const locale = lang as Locale
  const dict = await getDictionary(locale)

  const alternates: Record<string, string> = {}
  LOCALES.forEach((l) => { alternates[l] = `/${l}/account` })

  return {
    title: dict.account.label,
    description: dict.account.subtitle,
    keywords: mergeKeywords(
      THAI_SEO_KEYWORDS,
      'สมาชิก KHUA',
      'สมัครสมาชิกน้ำพริก',
      'สั่งน้ำพริกออนไลน์',
    ),
    alternates: { canonical: `/${locale}/account`, languages: alternates },
    openGraph: {
      title: `${dict.account.label} | ${dict.site.name}`,
      description: dict.account.subtitle,
      locale: getOpenGraphLocale(locale),
      type: 'website',
    },
  }
}

export default async function AccountPage({ params }: AccountPageProps) {
  const { lang } = await params
  const locale = lang as Locale
  const dict = await getDictionary(locale)

  return <AccountContent dict={dict} />
}
