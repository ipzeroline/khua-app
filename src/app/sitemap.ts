import type { MetadataRoute } from 'next'
import { getDictionary, LOCALES, type Locale } from '@/i18n'

const SITE_URL = 'https://khualab.com'

const staticPaths = ['', '/products', '/articles', '/about', '/contact', '/account']

function sitemapEntry(
  path: string,
  priority: number,
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'],
): MetadataRoute.Sitemap[number] {
  return {
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    sitemapEntry('/', 1, 'daily'),
    sitemapEntry('/google4243f4ab0f6102a8.html', 0.1, 'yearly'),
  ]

  for (const locale of LOCALES) {
    for (const path of staticPaths) {
      entries.push(
        sitemapEntry(
          `/${locale}${path}`,
          locale === 'th' && path === '' ? 1 : 0.7,
          path === '/articles' ? 'daily' : 'weekly',
        ),
      )
    }

    const dict = await getDictionary(locale as Locale)

    for (const product of dict.products_data) {
      entries.push(
        sitemapEntry(`/${locale}/products/${product.slug}`, locale === 'th' ? 0.9 : 0.6, 'weekly'),
      )
    }

    for (const collection of dict.collections_data) {
      entries.push(
        sitemapEntry(
          `/${locale}/collections/${collection.slug}`,
          locale === 'th' ? 0.88 : 0.58,
          'weekly',
        ),
      )
    }

    for (const article of dict.articles_data) {
      entries.push(
        sitemapEntry(`/${locale}/articles/${article.slug}`, locale === 'th' ? 0.8 : 0.5, 'daily'),
      )
    }
  }

  return entries
}
