import { Locale } from './types'

export const SITE_URL = 'https://khualab.com'
export const DEFAULT_OG_IMAGE = '/khua-logo.png'

export const THAI_SEO_KEYWORDS = [
  'น้ำพริก',
  'น้ำพริกเหนือ',
  'น้ำพริกพะเยา',
  'น้ำพริกล้านนา',
  'น้ำพริกตาแดงเหนือ',
  'น้ำพริกลาบเหนือ',
  'น้ำพริกลาบพะเยา',
  'น้ำพริกลาบพรีเมี่ยม',
  'น้ำพริกลาบใกล้ฉัน',
  'สั่งซื้อน้ำพริกลาบเหนือ',
  'น้ำพริกลาบเผ็ดๆ',
  'น้ำพริกแกงเหนือ',
  'น้ำพริกน้ำเงี้ยวเหนือ',
  'น้ำพริกตาแดงพะเยา',
  'น้ำพริกตาแดงแมงดาพะเยา',
  'น้ำพริกแกงพะเยา',
  'น้ำพริกน้ำเงี้ยวพะเยา',
  'ของฝากพะเยา',
  'ของฝากภาคเหนือ',
  'อาหารเหนือ',
  'อาหารล้านนา',
  'ครัวล้านนา',
  'พริกแห้งคั่ว',
  'มะแขว่น',
  'ตำรับล้านนา',
  'สูตรพะเยา',
  'พะเยา',
  'เชียงใหม่',
  'น้ำพริกเชียงใหม่',
  'น้ำพริกราคาถูก',
  'น้ำพริกใกล้ฉัน',
  'น้ำพริกเหนือใกล้ฉัน',
  'น้ำพริกออนไลน์',
  'น้ำพริกพร้อมส่ง',
  'น้ำพริกโฮมเมด',
  'น้ำพริกพรีเมียม',
  'ซื้อ น้ำพริก เหนือ',
  'KHUA',
]

export function mergeKeywords(...groups: Array<Array<string | undefined> | string | undefined>) {
  return Array.from(
    new Set(
      groups
        .flat()
        .filter((keyword): keyword is string => Boolean(keyword))
        .map((keyword) => keyword.trim())
        .filter(Boolean),
    ),
  )
}

export function getOpenGraphLocale(locale: Locale | string) {
  if (locale === 'th') return 'th_TH'
  if (locale === 'lo') return 'lo_LA'
  if (locale === 'zh') return 'zh_CN'
  return 'en_US'
}

export function compactSeoText(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

export function fitSeoText(value: string, maxLength: number, minWordBreak = 42) {
  const text = compactSeoText(value)
  if (text.length <= maxLength) return text

  const sliced = text.slice(0, maxLength - 1).trim()
  const lastSpace = sliced.lastIndexOf(' ')
  const safe = lastSpace > minWordBreak ? sliced.slice(0, lastSpace) : sliced
  return `${safe.replace(/[|,.;:，。]+$/, '')}…`
}

export function absoluteUrl(path: string) {
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}
