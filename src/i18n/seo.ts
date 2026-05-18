import { Locale } from './types'

export const THAI_SEO_KEYWORDS = [
  'น้ำพริก',
  'น้ำพริกเหนือ',
  'น้ำพริกพะเยา',
  'น้ำพริกล้านนา',
  'น้ำพริกตาแดงเหนือ',
  'น้ำพริกลาบเหนือ',
  'น้ำพริกแกงเหนือ',
  'น้ำพริกน้ำเงี้ยวเหนือ',
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
