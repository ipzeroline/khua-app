import type { Metadata } from 'next'
import { getDictionary, type Locale, LOCALES } from '@/i18n'
import {
  DEFAULT_OG_IMAGE,
  SITE_URL,
  absoluteUrl,
  fitSeoText,
  getOpenGraphLocale,
  mergeKeywords,
  THAI_SEO_KEYWORDS,
} from '@/i18n/seo'
import HeroSection from '@/components/home/HeroSection'
import StorySection from '@/components/home/StorySection'
import LannaSoulSection from '@/components/home/LannaSoulSection'
import HomeRoastingSection from '@/components/home/HomeRoastingSection'
import HomeServingSection from '@/components/home/HomeServingSection'
import FeaturedProducts from '@/components/home/FeaturedProducts'
import CraftsmanshipSection from '@/components/home/CraftsmanshipSection'
import HomeArticlesSection from '@/components/home/HomeArticlesSection'
import PhayaoCuisineSection from '@/components/home/PhayaoCuisineSection'
import PhayaoSeoSection from '@/components/home/PhayaoSeoSection'
import HomeSeoAuthoritySection from '@/components/home/HomeSeoAuthoritySection'
import HomeFaqSection from '@/components/home/HomeFaqSection'
import { getPublishedArticles } from '@/lib/articles'

interface HomePageProps {
  params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { lang } = await params
  const locale = lang as Locale
  const dict = await getDictionary(locale)

  const alternates: Record<string, string> = {}
  LOCALES.forEach((l) => { alternates[l] = `/${l}` })
  const title = fitSeoText(`น้ำพริกพะเยา น้ำพริกเหนือพรีเมียม | ${dict.site.name}`, 60)
  const description = fitSeoText(
    `${dict.site.name} น้ำพริกพะเยาและน้ำพริกเหนือพรีเมียมตำรับล้านนา คั่วหอม พร้อมส่งทั่วไทย เหมาะเป็นของฝากพะเยาและของฝากภาคเหนือ`,
    160,
  )

  return {
    title: { absolute: title },
    description,
    keywords: mergeKeywords([
      ...THAI_SEO_KEYWORDS,
      dict.products.originValue,
      ...dict.products.seoTagsBase,
      dict.articles.homeTitle,
      dict.products.title,
    ]),
    robots: { index: true, follow: true },
    alternates: { canonical: `/${locale}`, languages: alternates },
    openGraph: {
      title,
      description,
      url: `/${locale}`,
      siteName: dict.site.name,
      locale: getOpenGraphLocale(locale),
      type: 'website',
      images: [{ url: DEFAULT_OG_IMAGE, width: 1024, height: 1024, alt: 'KHUA น้ำพริกพะเยา' }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
  }
}

export default async function HomePage({ params }: HomePageProps) {
  const { lang } = await params
  const locale = lang as Locale
  const dict = await getDictionary(locale)
  const latestArticles = (await getPublishedArticles(locale, dict)).slice(0, 3)
  const siteUrl = `${SITE_URL}/${locale}`
  const homeFaqSchemaByLocale: Record<
    Locale,
    Array<{
      question: string
      answer: string
    }>
  > = {
    th: [
      {
        question: 'KHUA คือแบรนด์อะไร?',
        answer:
          'KHUA คือแบรนด์น้ำพริกและเครื่องแกงอาหารเหนือสูตรพะเยา ที่เน้นความหอมของเครื่องเทศคั่วและรสชาติแบบล้านนาแท้',
      },
      {
        question: 'สินค้าของ KHUA เป็นสูตรพะเยาหรือไม่?',
        answer:
          'ใช่ สินค้าของ KHUA ทุกสูตรได้รับแรงบันดาลใจจากรสชาติอาหารพื้นเมืองพะเยาและอาหารล้านนาแบบดั้งเดิม',
      },
      {
        question: 'KHUA มีสินค้าอะไรบ้าง?',
        answer:
          'KHUA มีน้ำพริกลาบเหนือ น้ำพริกตาแดง น้ำพริกตาแดงแมงดา น้ำพริกแกงเหนือ น้ำพริกน้ำเงี้ยว และชุดรวม 5 สูตรพะเยา',
      },
      {
        question: 'น้ำพริกและเครื่องแกง KHUA ใช้ทำเมนูอะไรได้บ้าง?',
        answer:
          'สามารถใช้ทำอาหารเหนือได้หลายเมนู เช่น ลาบเหนือ คั่วลาบ ขนมจีนน้ำเงี้ยว แกงแค แกงอ่อม น้ำพริกผักลวก และชุดขันโตก',
      },
      {
        question: 'สินค้าของ KHUA มีสารกันเสียไหม?',
        answer:
          'KHUA เน้นการใช้วัตถุดิบคุณภาพและไม่ใส่สารกันเสีย เพื่อคงรสชาติและกลิ่นหอมแบบธรรมชาติ',
      },
      {
        question: 'อาหารเหนือสูตรพะเยามีจุดเด่นอย่างไร?',
        answer:
          'อาหารเหนือสูตรพะเยามีจุดเด่นเรื่องกลิ่นหอมของเครื่องเทศคั่ว รสชาติเข้มลึก และการใช้สมุนไพรล้านนาแบบพื้นบ้าน',
      },
      {
        question: 'KHUA เหมาะสำหรับใคร?',
        answer:
          'เหมาะสำหรับคนที่ชอบอาหารเหนือ คนที่คิดถึงรสชาติบ้านเกิด ร้านอาหารเหนือ หรือผู้ที่ต้องการของฝากจากภาคเหนือ',
      },
    ],
    en: [
      {
        question: 'What is KHUA?',
        answer:
          'KHUA is a Phayao-style Northern Thai chili paste and curry paste brand focused on roasted spice aroma and authentic Lanna flavor.',
      },
      {
        question: 'Are KHUA products Phayao-style recipes?',
        answer:
          'Yes. Every KHUA product is inspired by the local food traditions of Phayao Province and traditional Lanna cooking.',
      },
      {
        question: 'What products does KHUA offer?',
        answer:
          'KHUA offers Northern larb chili paste, red eye chili paste, mang da red eye chili paste, Northern curry paste, nam ngiao paste, and the Phayao 5-recipe set.',
      },
      {
        question: 'What dishes can I make with KHUA chili pastes and curry pastes?',
        answer:
          'You can make many Northern Thai dishes, including Northern larb, kua larb, khanom jeen nam ngiao, gaeng khae, gaeng om, chili paste with vegetables, and khantoke-style meals.',
      },
      {
        question: 'Do KHUA products contain preservatives?',
        answer:
          'KHUA focuses on quality ingredients and does not add preservatives, preserving a natural aroma and flavor.',
      },
      {
        question: 'What makes Phayao-style Northern Thai food distinctive?',
        answer:
          'Phayao-style Northern Thai food is known for roasted spice aroma, deep flavor, and the use of local Lanna herbs.',
      },
      {
        question: 'Who is KHUA suitable for?',
        answer:
          'KHUA is suitable for Northern Thai food lovers, anyone missing the taste of home, Northern Thai restaurants, and people looking for food gifts from Northern Thailand.',
      },
    ],
    lo: [
      {
        question: 'KHUA ແມ່ນແບຣນຫຍັງ?',
        answer:
          'KHUA ແມ່ນແບຣນນ້ຳພິກ ແລະເຄື່ອງແກງອາຫານເໜືອສູດພະເຍົາ ທີ່ເນັ້ນກິ່ນຫອມຂອງເຄື່ອງເທດຄົ່ວ ແລະລົດຊາດລ້ານນາແທ້',
      },
      {
        question: 'ສິນຄ້າ KHUA ເປັນສູດພະເຍົາບໍ?',
        answer:
          'ແມ່ນ ສິນຄ້າ KHUA ທຸກສູດໄດ້ແຮງບັນດານໃຈຈາກລົດຊາດອາຫານພື້ນເມືອງພະເຍົາ ແລະອາຫານລ້ານນາແບບດັ້ງເດີມ',
      },
      {
        question: 'KHUA ມີສິນຄ້າຫຍັງແດ່?',
        answer:
          'KHUA ມີນ້ຳພິກລາບເໜືອ ນ້ຳພິກຕາແດງ ນ້ຳພິກຕາແດງແມງດາ ນ້ຳພິກແກງເໜືອ ນ້ຳພິກນ້ຳເງ້ຍວ ແລະຊຸດລວມ 5 ສູດພະເຍົາ',
      },
      {
        question: 'ນ້ຳພິກ ແລະເຄື່ອງແກງ KHUA ໃຊ້ເຮັດເມນູຫຍັງໄດ້ແດ່?',
        answer:
          'ສາມາດເຮັດອາຫານເໜືອໄດ້ຫຼາຍເມນູ ເຊັ່ນ ລາບເໜືອ ຄົ່ວລາບ ເຂົ້າປຸ້ນນ້ຳເງ້ຍວ ແກງແຄ ແກງອ່ອມ ນ້ຳພິກຜັກລວກ ແລະຊຸດຂັນໂຕກ',
      },
      {
        question: 'ສິນຄ້າ KHUA ມີສານກັນບູດບໍ?',
        answer:
          'KHUA ເນັ້ນການໃຊ້ວັດຖຸດິບຄຸນນະພາບ ແລະບໍ່ໃສ່ສານກັນບູດ ເພື່ອຮັກສາລົດຊາດ ແລະກິ່ນຫອມແບບທຳມະຊາດ',
      },
      {
        question: 'ອາຫານເໜືອສູດພະເຍົາມີຈຸດເດັ່ນຢ່າງໃດ?',
        answer:
          'ອາຫານເໜືອສູດພະເຍົາເດັ່ນເລື່ອງກິ່ນຫອມຂອງເຄື່ອງເທດຄົ່ວ ລົດຊາດເຂັ້ມລຶກ ແລະການໃຊ້ສະໝຸນໄພລ້ານນາແບບພື້ນບ້ານ',
      },
      {
        question: 'KHUA ເໝາະສຳລັບໃຜ?',
        answer:
          'ເໝາະສຳລັບຄົນທີ່ມັກອາຫານເໜືອ ຄົນທີ່ຄິດຮອດລົດຊາດບ້ານເກີດ ຮ້ານອາຫານເໜືອ ຫຼືຜູ້ທີ່ຕ້ອງການຂອງຝາກຈາກພາກເໜືອ',
      },
    ],
    zh: [
      {
        question: 'KHUA 是什么品牌？',
        answer:
          'KHUA 是帕尧风味泰北辣椒酱与咖喱酱品牌，强调烘烤香料的香气和正宗兰纳风味。',
      },
      {
        question: 'KHUA 的产品都是帕尧风味配方吗？',
        answer:
          '是的。KHUA 的每一款产品都受到帕尧地方料理和传统兰纳饮食风味的启发。',
      },
      {
        question: 'KHUA 有哪些产品？',
        answer:
          'KHUA 有泰北拉布辣椒酱、红眼辣椒酱、红眼田鳖辣椒酱、泰北咖喱酱、南蕖酱，以及帕尧五款组合。',
      },
      {
        question: 'KHUA 辣椒酱和咖喱酱可以做哪些菜？',
        answer:
          '可以制作多种泰北料理，例如泰北拉布、炒拉布、南蕖米线、แกงแค、แกงอ่อม、辣椒酱配烫蔬菜和康托克餐。',
      },
      {
        question: 'KHUA 产品有防腐剂吗？',
        answer:
          'KHUA 重视优质食材，不添加防腐剂，以保留自然的香气与风味。',
      },
      {
        question: '帕尧风味泰北料理有什么特色？',
        answer:
          '帕尧风味泰北料理的特色是烘烤香料的香气、深层味道，以及使用地方兰纳香草。',
      },
      {
        question: 'KHUA 适合哪些人？',
        answer:
          '适合喜爱泰北料理、想念家乡味道的人、泰北餐厅，以及想找泰北伴手礼的人。',
      },
    ],
  }
  const homeFaqSchemaItems = homeFaqSchemaByLocale[locale] ?? homeFaqSchemaByLocale.th
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: dict.site.name,
      url: siteUrl,
      description: dict.hero.description,
      email: dict.site.email,
      telephone: dict.site.phone,
      address: {
        '@type': 'PostalAddress',
        addressRegion: dict.products.originValue,
        addressCountry: 'TH',
      },
      areaServed: dict.products.originValue,
      sameAs: [dict.social.facebook, dict.social.instagram],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: dict.products.title,
      itemListElement: dict.products_data.map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Product',
          name: product.name,
          description: product.description,
          image: product.image ? absoluteUrl(product.image) : undefined,
          brand: {
            '@type': 'Brand',
            name: dict.site.name,
          },
          offers: {
            '@type': 'Offer',
            priceCurrency: 'THB',
            price: product.price,
            availability: 'https://schema.org/InStock',
            url: `${siteUrl}/products/${product.slug}`,
          },
        },
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: dict.site.name,
      url: SITE_URL,
      inLanguage: locale,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${SITE_URL}/${locale}/articles?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: dict.nav.home,
          item: siteUrl,
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: homeFaqSchemaItems.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    },
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HeroSection dict={dict} />
      <FeaturedProducts dict={dict} lang={locale} />
      <PhayaoCuisineSection dict={dict} />
      <PhayaoSeoSection dict={dict} />
      <HomeRoastingSection dict={dict} />
      <LannaSoulSection dict={dict} />
      <StorySection dict={dict} />
      <HomeServingSection dict={dict} />
      <HomeArticlesSection dict={dict} lang={locale} articles={latestArticles} />
      <HomeSeoAuthoritySection dict={dict} />
      <CraftsmanshipSection dict={dict} />
      <HomeFaqSection dict={dict} />
    </>
  )
}
