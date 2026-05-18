import { Locale } from './types'

export function getOpenGraphLocale(locale: Locale | string) {
  if (locale === 'th') return 'th_TH'
  if (locale === 'lo') return 'lo_LA'
  if (locale === 'zh') return 'zh_CN'
  return 'en_US'
}
