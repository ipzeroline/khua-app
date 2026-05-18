export type Locale = 'th' | 'en' | 'lo' | 'zh'

export const LOCALES: Locale[] = ['th', 'en', 'lo', 'zh']
export const DEFAULT_LOCALE: Locale = 'th'

export const LOCALE_NAMES: Record<Locale, string> = {
  th: 'ไทย',
  en: 'English',
  lo: 'ລາວ',
  zh: '中文',
}

export interface ProductData {
  slug: string
  name: string
  nameEn: string
  description: string
  longDescription: string
  ingredients: string[]
  price: string
  weight: string
  featured: boolean
  image?: string
}

export interface ArticleData {
  slug: string
  title: string
  excerpt: string
  category: string
  date: string
  readTime: string
  tags: string[]
  highlights: string[]
  content: string[]
}

export interface Dictionary {
  locale: Locale
  localeName: string

  site: {
    name: string
    nameThai: string
    tagline: string
    description: string
    lineId: string
    phone: string
    email: string
  }

  nav: {
    home: string
    products: string
    articles: string
    about: string
    contact: string
    account: string
  }

  hero: {
    subtitle: string
    title: string
    description: string
    cta: string
  }

  phayaoSeo: {
    label: string
    title: string
    paragraphs: string[]
  }

  faq: {
    label: string
    title: string
    items: Array<{
      question: string
      answer: string
    }>
  }

  story: {
    label: string
    title: string
    p1: string
    p2: string
  }

  lanna: {
    label: string
    title: string
    subtitle: string
    quote: string
    items: Array<{
      title: string
      description: string
    }>
  }

  products: {
    label: string
    title: string
    subtitle: string
    viewAll: string
    viewDetail: string
    notFound: string
    notFoundDesc: string
    orderViaLine: string
    ingredients: string
    originLabel: string
    originValue: string
    pricePerUnit: string
    addToCart: string
    addedToCart: string
    seoTagsBase: string[]
  }

  cart: {
    title: string
    empty: string
    emptyDesc: string
    open: string
    close: string
    subtotal: string
    checkout: string
    continueShopping: string
    remove: string
    decrease: string
    increase: string
    quantity: string
    items: string
    currency: string
  }

  account: {
    label: string
    title: string
    subtitle: string
    signIn: string
    register: string
    name: string
    email: string
    phone: string
    password: string
    save: string
    logout: string
    welcome: string
    memberSince: string
    benefitsTitle: string
    benefits: string[]
    ordersTitle: string
    noOrders: string
  }

  articles: {
    label: string
    title: string
    subtitle: string
    homeTitle: string
    homeSubtitle: string
    searchPlaceholder: string
    searchButton: string
    clearSearch: string
    noResults: string
    pageLabel: string
    previousPage: string
    nextPage: string
    readMore: string
    backToArticles: string
    notFound: string
  }

  craftsmanship: {
    label: string
    title: string
    items: Array<{
      title: string
      description: string
    }>
  }

  about: {
    label: string
    title: string
    subtitle: string
    paragraphs: string[]
  }

  contact: {
    label: string
    title: string
    lineTitle: string
    lineDesc: string
    addLine: string
    phoneTitle: string
    phoneDesc: string
    callNow: string
    followUs: string
  }

  footer: {
    menu: string
    contact: string
    line: string
    phone: string
    email: string
    proudly: string
    rights: string
  }

  products_data: ProductData[]
  articles_data: ArticleData[]

  social: {
    instagram: string
    facebook: string
    line: string
  }
}
