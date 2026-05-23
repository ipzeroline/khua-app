import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getDictionary, LOCALES, type Locale, type ProductData } from '@/i18n'
import {
  DEFAULT_OG_IMAGE,
  SITE_URL,
  absoluteUrl,
  fitSeoText,
  getOpenGraphLocale,
  mergeKeywords,
  THAI_SEO_KEYWORDS,
} from '@/i18n/seo'
import ProductCard from '@/components/ui/ProductCard'

interface CollectionPageProps {
  params: Promise<{ lang: string; slug: string }>
}

const phayaoLandingImages = {
  hero: '/collections/phayao-recipe/phayao-food-hero.png',
  editorial: '/collections/phayao-recipe/apple-food-editorial.png',
  larb: '/collections/phayao-recipe/larb-khua-pair.png',
  namNgiao: '/collections/phayao-recipe/nam-ngiao-lanna-bowl.png',
  curry: '/collections/phayao-recipe/pounding-northern-curry.png',
  taDaeng: '/collections/phayao-recipe/lanna-table-lifestyle.png',
  spices: '/collections/phayao-recipe/lanna-spices-closeup.png',
  kitchen: '/collections/phayao-recipe/northern-kitchen-real.png',
  steps: '/collections/phayao-recipe/larb-cooking-steps.png',
}

const northernThaiFoodImages = {
  hero: '/collections/northern-thai-food/hero-lifestyle.png',
  process: '/collections/northern-thai-food/cooking-process.png',
  ingredients: '/collections/northern-thai-food/ingredient-flat-lay.png',
  texture: '/collections/northern-thai-food/closeup-texture.png',
  pairing: '/collections/northern-thai-food/product-food-pairing.png',
  lanna: '/collections/northern-thai-food/traditional-lanna-mood.png',
  product: '/collections/northern-thai-food/minimal-product-shot.png',
  family: '/collections/northern-thai-food/family-dining.png',
  market: '/collections/northern-thai-food/northern-market.png',
  divider: '/collections/northern-thai-food/section-divider.png',
}

const lannaFoodImages = {
  hero: '/collections/lanna-food/lanna-food-phayao-hero.png',
  spices: '/collections/lanna-food/northern-thai-spices-phayao.png',
  market: '/collections/lanna-food/phayao-local-food-market.png',
  larbProcess: '/collections/lanna-food/authentic-larb-northern-thai-process.png',
  cooking: '/collections/lanna-food/namprik-larb-phayao-cooking.png',
  table: '/collections/lanna-food/lanna-dining-table-phayao.png',
  closeup: '/collections/lanna-food/northern-dried-chili-closeup.png',
  culture: '/collections/lanna-food/lanna-culture-kitchen-phayao.png',
}

const lannaFaqByLocale: Record<Locale, Array<{ question: string; answer: string }>> = {
  th: [
    { question: 'น้ำพริกลาบเหนือคืออะไร', answer: 'น้ำพริกลาบเหนือคือเครื่องลาบหรือพริกลาบเมืองเหนือที่รวมพริกแห้งคั่ว มะแขว่น ดีปลี หอม กระเทียม และเครื่องเทศล้านนา ใช้ทำลาบเหนือ คั่วลาบ และเมนูพื้นเมืองหลายชนิด' },
    { question: 'ลาบเหนือแตกต่างจากลาบอีสานอย่างไร', answer: 'ลาบเหนือเน้นกลิ่นเครื่องเทศคั่วและสมุนไพร ไม่เน้นรสเปรี้ยวแบบลาบอีสาน จึงให้รสเข้ม หอมลึก และมีเอกลักษณ์แบบอาหารล้านนา' },
    { question: 'อาหารเหนือจากพะเยามีจุดเด่นอะไร', answer: 'อาหารเหนือพะเยามีจุดเด่นเรื่องกลิ่นคั่ว เครื่องแกงพื้นบ้าน และรสที่สุขุมกว่าเผ็ดจัด ใช้วัตถุดิบอย่างพริกเหนือ มะแขว่น ถั่วเน่า ดอกงิ้ว และสมุนไพรท้องถิ่น' },
    { question: 'KHUA ใช้วัตถุดิบจากที่ไหน', answer: 'KHUA เน้นวัตถุดิบพื้นบ้านและแนวทางรสชาติจากครัวพะเยา เช่น พริกแห้งเหนือ หอมแดง กระเทียมไทย มะแขว่น ดีปลี ถั่วเน่า และสมุนไพรล้านนา' },
    { question: 'มีผงชูรสไหม', answer: 'สูตรของ KHUA เน้นรสจากเครื่องเทศและวัตถุดิบพื้นบ้านเป็นหลัก หากต้องการข้อมูลส่วนผสมเฉพาะสินค้า ให้ดูรายละเอียดบนหน้าสินค้านั้น ๆ ก่อนสั่งซื้อ' },
    { question: 'เผ็ดระดับไหน', answer: 'โดยรวมอยู่ในระดับกลางถึงเข้มแบบอาหารเหนือ เน้นความหอมของพริกคั่วและเครื่องเทศ สามารถปรับปริมาณการใช้ให้เหมาะกับคนกินได้' },
  ],
  en: [
    { question: 'What is Northern larb chili paste?', answer: 'It is a Lanna spice blend made with roasted dried chilies, ma-khwaen, long pepper, shallots, garlic, and Northern herbs. It is used for Northern larb, kua larb, and other regional dishes.' },
    { question: 'How is Northern larb different from Isan larb?', answer: 'Northern larb focuses on roasted spices and savory aroma, while many Isan larb recipes emphasize sourness and toasted rice.' },
    { question: 'What makes Phayao Lanna food distinctive?', answer: 'Phayao food is known for roasted spice aroma, local curry pastes, measured heat, and ingredients such as ma-khwaen, fermented soybean, dried cotton tree flowers, and local herbs.' },
    { question: 'Where does KHUA source its flavor from?', answer: 'KHUA builds its recipes around Phayao home cooking, local Northern ingredients, roasted chili aroma, and Lanna spice traditions.' },
    { question: 'Does KHUA use MSG?', answer: 'KHUA focuses on spice and ingredient-driven flavor. Please check each product detail page for its specific ingredient list before ordering.' },
    { question: 'How spicy is it?', answer: 'Most KHUA products are medium to bold in Northern Thai style, with aroma leading the heat. You can adjust the amount used in each dish.' },
  ],
  lo: [
    { question: 'ນ້ຳພິກລາບເໜືອແມ່ນຫຍັງ', answer: 'ແມ່ນເຄື່ອງລາບລ້ານນາທີ່ມີພິກແຫ້ງຄົ່ວ ໝາກແຂ່ວ ດີປີ ຫອມ ກະທຽມ ແລະສະໝຸນໄພເໜືອ.' },
    { question: 'ລາບເໜືອຕ່າງຈາກລາບອີສານແນວໃດ', answer: 'ລາບເໜືອເນັ້ນກິ່ນເຄື່ອງເທດຄົ່ວ ແລະບໍ່ເນັ້ນລົດສົ້ມເຫມືອນລາບອີສານ.' },
    { question: 'ອາຫານເໜືອພະເຍົາມີຈຸດເດັ່ນຫຍັງ', answer: 'ເນັ້ນກິ່ນຄົ່ວ ເຄື່ອງແກງພື້ນບ້ານ ແລະສະໝຸນໄພລ້ານນາເຊັ່ນ ໝາກແຂ່ວ ຖົ່ວເນົ່າ ແລະດອກງິ້ວ.' },
    { question: 'KHUA ໃຊ້ວັດຖຸດິບຈາກໃສ', answer: 'KHUA ໃຊ້ແນວທາງລົດຊາດຈາກຄົວພະເຍົາ ພິກແຫ້ງ ຫອມ ກະທຽມ ແລະເຄື່ອງເທດລ້ານນາ.' },
    { question: 'ມີຜົງຊູລົດບໍ່', answer: 'ສູດ KHUA ເນັ້ນລົດຈາກເຄື່ອງເທດ ແລະວັດຖຸດິບ. ກະລຸນາເບິ່ງສ່ວນຜະສົມໃນຫນ້າສິນຄ້າ.' },
    { question: 'ເຜັດລະດັບໃດ', answer: 'ສ່ວນໃຫຍ່ເຜັດປານກາງ ເນັ້ນກິ່ນຫອມ ແລະປັບປະລິມານໄດ້.' },
  ],
  zh: [
    { question: '泰北拉布辣椒酱是什么', answer: '它是兰纳拉布香料，由烘烤干辣椒、马告、荜茇、红葱、蒜和泰北香草组成，用于泰北拉布、炒拉布和地方菜。' },
    { question: '泰北拉布和 Isan 拉布有什么不同', answer: '泰北拉布强调烘烤香料与咸香气味，而许多 Isan 拉布更强调酸味和炒米香。' },
    { question: '帕尧兰纳料理有什么特色', answer: '帕尧料理以烘烤香气、地方咖喱酱、温和但深的辣度，以及马告、豆豉、干木棉花等地方食材为特色。' },
    { question: 'KHUA 的风味来自哪里', answer: 'KHUA 以帕尧家庭厨房、地方泰北食材、烘烤辣椒香气和兰纳香料传统为基础。' },
    { question: 'KHUA 使用味精吗', answer: 'KHUA 注重香料与食材本身的味道。下单前请查看各商品页的具体成分说明。' },
    { question: '辣度如何', answer: '多数产品为中等至浓郁泰北风格，香气先于辣度，可根据菜肴调整用量。' },
  ],
}

const lannaCopy: Record<Locale, {
  heroTitle: string
  heroSubtitle: string
  introLabel: string
  introTitle: string
  introParagraphs: string[]
  clusterEyebrow: string
  clusterTitle: string
  clusterLinks: Array<{ label: string; href: string; desc: string }>
  ingredientTitle: string
  ingredientBody: string
  ingredientTags: string[]
  storyTitle: string
  storyParagraphs: string[]
  ugcTitle: string
  ugcItems: string[]
  videoEyebrow: string
  videoTitle: string
  videoBody: string
  productEyebrow: string
  productTitle: string
  faqEyebrow: string
  faqTitle: string
  keywords: string[]
  schemaCategory: string
}> = {
  th: {
    heroTitle: 'อาหารล้านนาแท้จากพะเยา',
    heroSubtitle: 'ศูนย์รวมรสชาติอาหารเหนือแท้ สูตรล้านนาดั้งเดิม เครื่องเทศเหนือ วัตถุดิบพื้นบ้าน และเรื่องราวครัวพะเยาที่ KHUA อยากรักษาไว้ในทุกขวด',
    introLabel: 'Lanna Food Authority',
    introTitle: 'อาหารล้านนาแท้จากพะเยา สูตรดั้งเดิมที่เริ่มจากวัตถุดิบพื้นบ้าน',
    introParagraphs: [
      'พะเยาเป็นเมืองอาหารเหนือที่มีรสชาติสุขุมและหอมเครื่องเทศเฉพาะตัว อาหารล้านนาในพื้นที่นี้ไม่ได้วัดกันที่ความเผ็ดอย่างเดียว แต่ให้ความสำคัญกับกลิ่นพริกแห้งคั่ว หอมแดง กระเทียม มะแขว่น ดีปลี ถั่วเน่า ดอกงิ้ว และสมุนไพรพื้นบ้านที่ผ่านมือคนครัวเหนือจริง ๆ',
      'KHUA เล่าอาหารเหนือแท้จากพะเยาผ่านน้ำพริกลาบเหนือ น้ำพริกตาแดง น้ำพริกน้ำเงี้ยว และเครื่องแกงเหนือ สูตรถูกออกแบบให้ใกล้เคียงครัวล้านนาดั้งเดิม ใช้วัตถุดิบท้องถิ่นเป็นหัวใจ ไม่พึ่งรสจัดฉาบฉวย และเน้นกลิ่นหอมของเครื่องเทศล้านนาแท้',
      'สิ่งที่ทำให้อาหารเหนือพะเยาต่างจากจังหวัดอื่นคือความพอดีของกลิ่นคั่วและรสเข้มแบบนุ่ม เมนูลาบเหนือ น้ำเงี้ยว แกงแค น้ำพริกตาแดง และอาหารพื้นเมืองล้านนา จึงมีความลึกแต่กินง่าย เหมาะทั้งคนทำอาหารที่บ้าน ร้านอาหาร และคนที่กำลังมองหาของฝากพะเยาอาหารเหนือที่มีเรื่องราวจริง',
      'หน้านี้จึงไม่ได้เป็นเพียงหน้ารวมสินค้า แต่เป็นศูนย์กลางความรู้เรื่องอาหารล้านนา เครื่องแกงเหนือ เครื่องเทศล้านนา น้ำพริกอาหารเหนือโฮมเมด และวิถีครัวเหนือ เพื่อให้คนอ่านเข้าใจว่า KHUA คือแบรนด์ที่เชี่ยวชาญอาหารเหนือพะเยาอย่างแท้จริง',
    ],
    clusterEyebrow: 'ศูนย์ความรู้อาหารเหนือ',
    clusterTitle: 'อ่านต่อเรื่องอาหารเหนือพะเยา',
    clusterLinks: [
      { label: 'วิธีทำลาบเหนือ', href: '/articles/how-to-make-phayao-northern-larb', desc: 'สูตรลาบเมืองเหนือและการใช้พริกลาบ KHUA' },
      { label: 'เครื่องเทศเหนือมีอะไรบ้าง', href: '/articles/what-is-makhwaen-lanna-spice', desc: 'รู้จักมะแขว่น ดีปลี และเครื่องเทศล้านนา' },
      { label: 'วิธีทำน้ำเงี้ยว', href: '/articles/how-to-make-phayao-nam-ngiao', desc: 'น้ำเงี้ยวพะเยา ดอกงิ้ว ถั่วเน่า และน้ำแกงเข้มข้น' },
      { label: 'วิถีครัวล้านนา', href: '/articles/why-northern-thai-food-aromatic', desc: 'ทำไมอาหารเหนือถึงหอมจากไฟคั่วและสมุนไพร' },
      { label: 'อาหารพื้นเมืองพะเยา', href: '/collections/phayao-recipe', desc: 'รวมสูตรอาหารพะเยาและเครื่องปรุงที่ใช้จริง' },
      { label: 'ของฝากพะเยาแนะนำ', href: '/products', desc: 'น้ำพริกและเครื่องแกงเหนือพร้อมส่ง' },
    ],
    ingredientTitle: 'วัตถุดิบพื้นบ้านจากพะเยา',
    ingredientBody: 'อาหารล้านนาแท้ต้องเริ่มจากวัตถุดิบที่มีตัวตน พริกแห้งเหนือให้สีและกลิ่นคั่ว มะแขว่นให้ความหอมซ่า ดีปลีช่วยเพิ่มมิติ เครือสมุนไพรอย่างข่า ตะไคร้ ใบมะกรูด หอมแดง กระเทียมไทย ถั่วเน่า และดอกงิ้ว ทำให้เมนูอย่างลาบเหนือ น้ำเงี้ยว และแกงเหนือมีเอกลักษณ์ที่คนกินจดจำได้',
    ingredientTags: ['พริกแห้งเหนือ', 'มะแขว่น', 'ดีปลี', 'หอมแดงพื้นเมือง', 'กระเทียมไทย', 'ถั่วเน่า', 'ดอกงิ้ว', 'สมุนไพรล้านนา'],
    storyTitle: 'เรื่องราวครัวเหนือจากพะเยา',
    storyParagraphs: [
      'KHUA เริ่มจากความตั้งใจที่จะรักษารสชาติอาหารเหนือที่กินจริงในครอบครัว ไม่ใช่รสชาติที่ถูกทำให้เหมือนกันทุกพื้นที่ สูตรของเราจึงให้ความสำคัญกับการคั่ว การตำ และการเลือกวัตถุดิบที่มีกลิ่นเฉพาะถิ่น',
      'เราอยากให้คนที่อยู่ไกลภาคเหนือยังทำลาบเมือง น้ำเงี้ยว แกงเหนือ และน้ำพริกตาแดงได้ง่าย โดยยังสัมผัสภาพจำของครัวไม้ล้านนา โต๊ะอาหารเหนือ และภูมิปัญญาท้องถิ่นพะเยาในทุกมื้อ',
    ],
    ugcTitle: 'รีวิวการใช้งานจริงจากครัวบ้าน',
    ugcItems: ['ทำลาบเหนือได้กลิ่นเครื่องเทศชัด ไม่ต้องตำเองหลายอย่าง', 'น้ำเงี้ยวเข้มขึ้นเมื่อผัดน้ำพริกกับไฟอ่อนก่อนเติมน้ำซุป', 'น้ำพริกตาแดงกินกับข้าวเหนียวและผักลวกได้ทุกวัน', 'พริกแกงเหนือช่วยให้แกงแคและแกงหน่อไม้หอมเหมือนครัวเหนือ'],
    videoEyebrow: 'วิธีใช้เครื่องปรุง',
    videoTitle: 'วิธีใช้เครื่องปรุงล้านนาในครัวบ้าน',
    videoBody: 'เริ่มจากผัดน้ำพริกหรือเครื่องแกงด้วยไฟอ่อนให้กลิ่นคั่วตื่นขึ้นก่อน แล้วค่อยเติมเนื้อสัตว์ น้ำซุป หรือผักพื้นบ้าน วิธีนี้ช่วยให้ลาบเหนือ น้ำเงี้ยว และแกงเหนือได้กลิ่นหอมลึกแบบครัวล้านนา',
    productEyebrow: 'สินค้าแนะนำ',
    productTitle: 'สินค้า KHUA สำหรับอาหารล้านนาแท้',
    faqEyebrow: 'คำถามที่พบบ่อย',
    faqTitle: 'คำถามที่พบบ่อยเกี่ยวกับอาหารล้านนา KHUA',
    keywords: ['อาหารเหนือ', 'อาหารล้านนา', 'อาหารเหนือแท้', 'อาหารเหนือพะเยา', 'เครื่องแกงเหนือ', 'น้ำพริกลาบเหนือ', 'น้ำพริกลาบเหนือ สูตรเมืองพะเยา', 'เครื่องเทศล้านนาแท้', 'ของฝากพะเยา อาหารเหนือ', 'น้ำพริกอาหารเหนือโฮมเมด', 'อาหารพื้นเมืองล้านนา'],
    schemaCategory: 'อาหารล้านนาและเครื่องปรุงอาหารเหนือ',
  },
  en: {
    heroTitle: 'Authentic Lanna Food from Phayao',
    heroSubtitle: 'A regional guide to Northern Thai food, Phayao home cooking, Lanna spices, local ingredients, and KHUA seasonings made for real Northern dishes.',
    introLabel: 'Lanna Food Authority',
    introTitle: 'Authentic Lanna Food from Phayao, Built on Local Ingredients',
    introParagraphs: [
      'Phayao is one of Northern Thailand’s quiet food provinces, known for roasted spice aroma, local herbs, and recipes that feel deeply Lanna without being one-dimensional. The flavor begins with dried Northern chilies, shallots, garlic, ma-khwaen, long pepper, fermented soybean, dried cotton tree flowers, and herbs handled by real home cooks.',
      'KHUA tells this story through Northern larb paste, red eye chili paste, nam ngiao paste, and Northern curry paste. The goal is to keep the flavor close to Phayao home kitchens: roasted, aromatic, ingredient-led, and practical for people who want to cook authentic Northern Thai food at home.',
      'This collection is more than a product page. It builds context around Lanna food, Northern spices, Phayao local food, homemade Northern chili paste, and the cooking culture behind every jar, helping both people and search engines understand KHUA as a focused Northern Thai food specialist.',
    ],
    clusterEyebrow: 'Lanna Food Guide',
    clusterTitle: 'Explore Lanna Food Stories',
    clusterLinks: [
      { label: 'How to Make Northern Larb', href: '/articles/how-to-make-phayao-northern-larb', desc: 'A Phayao-style larb guide using KHUA larb paste' },
      { label: 'What Is Ma-Khwaen?', href: '/articles/what-is-makhwaen-lanna-spice', desc: 'Learn the signature Lanna spice aroma' },
      { label: 'How to Make Nam Ngiao', href: '/articles/how-to-make-phayao-nam-ngiao', desc: 'A Northern noodle soup with cotton tree flowers and fermented soybean' },
      { label: 'Why Northern Thai Food Is Aromatic', href: '/articles/why-northern-thai-food-aromatic', desc: 'Roasting, herbs, and fire in Lanna cooking' },
      { label: 'Phayao Recipes', href: '/collections/phayao-recipe', desc: 'Recipes and seasonings from Phayao kitchens' },
      { label: 'Shop Northern Thai Gifts', href: '/products', desc: 'Chili pastes and curry pastes ready to ship' },
    ],
    ingredientTitle: 'Local Ingredients from Phayao',
    ingredientBody: 'Real Lanna food starts with ingredients that carry place: Northern dried chilies for color and aroma, ma-khwaen for bright spice, long pepper for depth, galangal, lemongrass, kaffir lime leaf, shallots, Thai garlic, fermented soybean, dried cotton tree flowers, and local herbs that define Northern larb, nam ngiao, and curry pastes.',
    ingredientTags: ['Northern dried chilies', 'Ma-khwaen', 'Long pepper', 'Local shallots', 'Thai garlic', 'Fermented soybean', 'Dried cotton tree flowers', 'Lanna herbs'],
    storyTitle: 'The Phayao Home Kitchen Behind KHUA',
    storyParagraphs: ['KHUA began with the intention to preserve Northern flavors as they are cooked in families, not flattened into generic chili paste. Roasting, pounding, and choosing aromatic local ingredients remain central.', 'We want people far from Northern Thailand to cook larb muang, nam ngiao, Northern curries, and red eye chili paste while still feeling the wooden Lanna kitchen, shared table, and local wisdom behind the food.'],
    ugcTitle: 'Real Cooking Notes',
    ugcItems: ['Northern larb becomes aromatic without pounding every spice from scratch', 'Nam ngiao tastes deeper when the paste is fried gently before stock is added', 'Red eye chili paste works with sticky rice and vegetables every day', 'Northern curry paste helps gaeng khae and bamboo shoot curry smell like a Lanna kitchen'],
    videoEyebrow: 'Cooking Guide',
    videoTitle: 'How to Use Lanna Seasonings at Home',
    videoBody: 'Gently fry chili paste or curry paste first so the roasted aroma opens up, then add meat, stock, or local greens. This simple step helps Northern larb, nam ngiao, and Lanna curries taste deeper and closer to a Phayao home kitchen.',
    productEyebrow: 'Featured Products',
    productTitle: 'KHUA Products for Authentic Lanna Food',
    faqEyebrow: 'FAQ',
    faqTitle: 'FAQ About KHUA Lanna Food',
    keywords: ['Northern Thai food', 'Lanna food', 'authentic Northern Thai food', 'Phayao food', 'Northern curry paste', 'Northern larb chili paste', 'Phayao larb paste', 'authentic Lanna spices', 'Phayao food souvenir', 'homemade Northern chili paste', 'local Lanna food'],
    schemaCategory: 'Lanna food and Northern Thai seasonings',
  },
  lo: {
    heroTitle: 'ອາຫານລ້ານນາແທ້ຈາກພະເຍົາ',
    heroSubtitle: 'ຄູ່ມືອາຫານເໜືອ ສູດລ້ານນາ ເຄື່ອງເທດເໜືອ ວັດຖຸດິບພື້ນບ້ານ ແລະເຄື່ອງປຸງ KHUA ຈາກພະເຍົາ.',
    introLabel: 'Lanna Food Authority',
    introTitle: 'ອາຫານລ້ານນາແທ້ຈາກພະເຍົາ ເລີ່ມຈາກວັດຖຸດິບພື້ນບ້ານ',
    introParagraphs: ['ພະເຍົາເປັນເມືອງອາຫານເໜືອທີ່ມີກິ່ນເຄື່ອງເທດຄົ່ວ ສະໝຸນໄພ ແລະລົດຊາດລ້ານນາຊັດເຈນ.', 'KHUA ເລົ່າລົດຊາດນີ້ຜ່ານນ້ຳພິກລາບ ນ້ຳພິກຕາແດງ ນ້ຳເງ້ຍວ ແລະເຄື່ອງແກງເໜືອ ໂດຍເນັ້ນການຄົ່ວ ການຕຳ ແລະວັດຖຸດິບທ້ອງຖິ່ນ.', 'ຫນ້ານີ້ເປັນສູນກາງຄວາມຮູ້ອາຫານລ້ານນາ ເຄື່ອງແກງເໜືອ ແລະວິຖີຄົວພະເຍົາ.'],
    clusterEyebrow: 'ຄູ່ມືອາຫານເໜືອ',
    clusterTitle: 'ອ່ານຕໍ່ເລື່ອງອາຫານລ້ານນາ',
    clusterLinks: [
      { label: 'ວິທີເຮັດລາບເໜືອ', href: '/articles/how-to-make-phayao-northern-larb', desc: 'ສູດລາບເມືອງພະເຍົາ' },
      { label: 'ໝາກແຂ່ວແມ່ນຫຍັງ', href: '/articles/what-is-makhwaen-lanna-spice', desc: 'ເຄື່ອງເທດຫອມຂອງລ້ານນາ' },
      { label: 'ວິທີເຮັດນ້ຳເງ້ຍວ', href: '/articles/how-to-make-phayao-nam-ngiao', desc: 'ນ້ຳເງ້ຍວພະເຍົາ' },
      { label: 'ວິຖີຄົວລ້ານນາ', href: '/articles/why-northern-thai-food-aromatic', desc: 'ກິ່ນຫອມຈາກໄຟຄົ່ວ' },
      { label: 'ສູດອາຫານພະເຍົາ', href: '/collections/phayao-recipe', desc: 'ເມນູແລະເຄື່ອງປຸງພະເຍົາ' },
      { label: 'ສິນຄ້າ KHUA', href: '/products', desc: 'ນ້ຳພິກ ແລະເຄື່ອງແກງພ້ອມສົ່ງ' },
    ],
    ingredientTitle: 'ວັດຖຸດິບພື້ນບ້ານຈາກພະເຍົາ',
    ingredientBody: 'ອາຫານລ້ານນາແທ້ເລີ່ມຈາກພິກແຫ້ງເໜືອ ໝາກແຂ່ວ ດີປີ ຫອມ ກະທຽມ ຖົ່ວເນົ່າ ດອກງິ້ວ ແລະສະໝຸນໄພລ້ານນາ.',
    ingredientTags: ['ພິກແຫ້ງເໜືອ', 'ໝາກແຂ່ວ', 'ດີປີ', 'ຫອມພື້ນເມືອງ', 'ກະທຽມ', 'ຖົ່ວເນົ່າ', 'ດອກງິ້ວ', 'ສະໝຸນໄພລ້ານນາ'],
    storyTitle: 'ເລື່ອງລາວຄົວເໜືອຈາກພະເຍົາ',
    storyParagraphs: ['KHUA ຕັ້ງໃຈຮັກສາລົດຊາດອາຫານເໜືອທີ່ກິນຈິງໃນຄອບຄົວ.', 'ພວກເຮົາຢາກໃຫ້ຄົນຢູ່ໄກພາກເໜືອ ເຮັດລາບ ນ້ຳເງ້ຍວ ແລະແກງເໜືອໄດ້ງ່າຍ.'],
    ugcTitle: 'ບັນທຶກຈາກຄົວບ້ານ',
    ugcItems: ['ລາບເໜືອຫອມເຄື່ອງເທດ', 'ນ້ຳເງ້ຍວເຂັ້ມຂຶ້ນເມື່ອຜັດນ້ຳພິກກ່ອນ', 'ນ້ຳພິກຕາແດງກິນກັບເຂົ້າໜຽວໄດ້ທຸກມື້', 'ເຄື່ອງແກງເໜືອເຮັດແກງແຄຫອມ'],
    videoEyebrow: 'ວິທີໃຊ້ເຄື່ອງປຸງ',
    videoTitle: 'ວິທີໃຊ້ເຄື່ອງປຸງລ້ານນາໃນຄົວບ້ານ',
    videoBody: 'ຜັດນ້ຳພິກ ຫຼື ເຄື່ອງແກງດ້ວຍໄຟອ່ອນໃຫ້ກິ່ນຄົ່ວອອກກ່ອນ ແລ້ວຈຶ່ງເພີ່ມຊີ້ນ ນ້ຳຊຸບ ຫຼື ຜັກພື້ນບ້ານ ເພື່ອໃຫ້ລາບ ນ້ຳເງ້ຍວ ແລະແກງເໜືອຫອມເຂັ້ມ.',
    productEyebrow: 'ສິນຄ້າແນະນຳ',
    productTitle: 'ສິນຄ້າ KHUA ສຳລັບອາຫານລ້ານນາ',
    faqEyebrow: 'ຄຳຖາມທີ່ພົບເລື້ອຍ',
    faqTitle: 'ຄຳຖາມກ່ຽວກັບອາຫານລ້ານນາ KHUA',
    keywords: ['ອາຫານເໜືອ', 'ອາຫານລ້ານນາ', 'ອາຫານເໜືອແທ້', 'ອາຫານພະເຍົາ', 'ເຄື່ອງແກງເໜືອ', 'ນ້ຳພິກລາບເໜືອ'],
    schemaCategory: 'ອາຫານລ້ານນາ ແລະເຄື່ອງປຸງເໜືອ',
  },
  zh: {
    heroTitle: '来自帕尧的正宗兰纳料理',
    heroSubtitle: '泰北料理、兰纳香料、地方食材、帕尧家庭厨房与 KHUA 调味料的区域指南。',
    introLabel: 'Lanna Food Authority',
    introTitle: '来自帕尧的正宗兰纳料理，从地方食材开始',
    introParagraphs: ['帕尧是泰北饮食文化中安静却鲜明的地方，料理重视烘烤香料、地方香草与兰纳家庭味道。', 'KHUA 通过泰北拉布辣椒酱、红眼辣椒酱、南妮欧酱和泰北咖喱酱保存这种风味。', '本页不仅是商品列表，也是关于兰纳料理、泰北香料、帕尧地方食材和家庭厨房文化的内容中心。'],
    clusterEyebrow: '兰纳料理指南',
    clusterTitle: '继续探索兰纳料理主题',
    clusterLinks: [
      { label: '泰北拉布做法', href: '/articles/how-to-make-phayao-northern-larb', desc: '使用 KHUA 拉布酱的帕尧风格食谱' },
      { label: '马告是什么', href: '/articles/what-is-makhwaen-lanna-spice', desc: '认识兰纳代表香料' },
      { label: '南妮欧做法', href: '/articles/how-to-make-phayao-nam-ngiao', desc: '泰北米线汤与干木棉花' },
      { label: '泰北料理为什么香', href: '/articles/why-northern-thai-food-aromatic', desc: '火候、香草与烘烤香气' },
      { label: '帕尧食谱', href: '/collections/phayao-recipe', desc: '帕尧厨房的菜谱与调味料' },
      { label: 'KHUA 产品', href: '/products', desc: '辣椒酱与咖喱酱' },
    ],
    ingredientTitle: '来自帕尧的地方食材',
    ingredientBody: '真正的兰纳料理来自有地方性的食材：泰北干辣椒、马告、荜茇、红葱、泰国蒜、豆豉、干木棉花与兰纳香草。',
    ingredientTags: ['泰北干辣椒', '马告', '荜茇', '地方红葱', '泰国蒜', '豆豉', '干木棉花', '兰纳香草'],
    storyTitle: 'KHUA 背后的帕尧家庭厨房',
    storyParagraphs: ['KHUA 希望保存真实家庭中的泰北味道，而不是泛化的辣椒酱。', '我们希望远离泰北的人也能轻松制作拉布、南妮欧、泰北咖喱与红眼辣椒酱。'],
    ugcTitle: '真实烹饪记录',
    ugcItems: ['泰北拉布不用从零捣香料也有香气', '南妮欧先炒酱再加汤会更浓', '红眼辣椒酱适合每天配糯米和蔬菜', '泰北咖喱酱让แกงแค更有兰纳厨房香气'],
    videoEyebrow: '使用方法',
    videoTitle: '在家使用兰纳调味料的方法',
    videoBody: '先用小火炒香辣椒酱或咖喱酱，让烘烤香气释放出来，再加入肉类、高汤或地方蔬菜。这个步骤能让泰北拉布、南妮欧和兰纳咖喱更接近帕尧家庭厨房的味道。',
    productEyebrow: '推荐产品',
    productTitle: '适合正宗兰纳料理的 KHUA 产品',
    faqEyebrow: '常见问题',
    faqTitle: 'KHUA 兰纳料理常见问题',
    keywords: ['泰北料理', '兰纳料理', '正宗泰北料理', '帕尧料理', '泰北咖喱酱', '泰北拉布辣椒酱', '帕尧拉布酱', '兰纳香料', '帕尧伴手礼', '泰北辣椒酱'],
    schemaCategory: '兰纳料理与泰北调味料',
  },
}

const northernProductSeo: Record<string, {
  badge: string
  description: string
  highlights: string[]
  menus: string[]
  image: string
}> = {
  'nam-prik-larb-phayao': {
    badge: 'ขายดี',
    description:
      'น้ำพริกลาบเหนือสูตรล้านนาแท้ หอมมะแขว่น ดีปลี และพริกคั่ว เหมาะสำหรับทำลาบหมูเมืองเหนือ คั่วลาบ และเมนูเครื่องลาบเหนือที่ต้องการกลิ่นคั่วชัดแบบอาหารเหนือแท้',
    highlights: ['สูตรล้านนาแท้', 'หอมเครื่องเทศเหนือ', 'ทำลาบง่ายที่บ้าน'],
    menus: ['ลาบเหนือ', 'คั่วลาบ', 'ลาบหมูเมือง', 'ยำจิ๊นไก่'],
    image: northernThaiFoodImages.texture,
  },
  'nam-prik-ta-daeng-phayao': {
    badge: 'อาหารเหนือยอดนิยม',
    description:
      'น้ำพริกตาแดงเหนือสำหรับกินคู่ข้าวเหนียว ผักลวก ไข่ต้ม และแคบหมู รสเข้ม หอมพริกคั่วและปลาย่าง เหมาะกับคนที่อยากซื้ออาหารเหนือออนไลน์ไว้กินง่ายทุกมื้อ',
    highlights: ['กินง่ายทุกมื้อ', 'คู่ข้าวเหนียว', 'รสเข้มแบบเหนือ'],
    menus: ['น้ำพริกตาแดง', 'ข้าวเหนียว', 'ผักลวก', 'ข้าวคลุกน้ำพริก'],
    image: northernThaiFoodImages.pairing,
  },
  'nam-prik-nam-ngiao-phayao': {
    badge: 'แนะนำ',
    description:
      'น้ำพริกน้ำเงี้ยวเหนือสำหรับทำขนมจีนน้ำเงี้ยว รสเข้มข้น หอมถั่วเน่า ดอกงิ้ว และพริกแห้งคั่ว เหมาะสำหรับเมนูน้ำเงี้ยวเชียงรายและพะเยาที่ทำเองได้ง่าย',
    highlights: ['น้ำแกงเข้มข้น', 'หอมดอกงิ้ว', 'พร้อมทำขนมจีนน้ำเงี้ยว'],
    menus: ['น้ำเงี้ยว', 'ขนมจีนน้ำเงี้ยว', 'เส้นน้ำเงี้ยว', 'น้ำเงี้ยวหมู'],
    image: northernThaiFoodImages.process,
  },
  'nam-prik-kaeng-nuea-phayao': {
    badge: 'สูตรดั้งเดิม',
    description:
      'พริกแกงเหนือหรือเครื่องแกงเหนือแท้สำหรับแกงแค แกงอ่อม แกงหน่อไม้ และแกงขนุน ใช้วัตถุดิบพื้นบ้านอย่างข่า ตะไคร้ ขมิ้น หอม กระเทียม และพริกแห้งเหนือ',
    highlights: ['เครื่องแกงเหนือแท้', 'ใช้วัตถุดิบพื้นบ้าน', 'ทำแกงเหนือได้หลายเมนู'],
    menus: ['แกงแค', 'แกงอ่อม', 'แกงหน่อไม้', 'แกงขนุน'],
    image: northernThaiFoodImages.ingredients,
  },
  'khua-lanna-set-5-phayao': {
    badge: 'ชุดเริ่มต้น',
    description:
      'ชุดอาหารเหนือเริ่มต้น รวมรสหลักของ KHUA สำหรับคนอยากลองเครื่องปรุงอาหารเหนือหลายแบบ ทั้งน้ำพริกลาบ น้ำเงี้ยว พริกแกงเหนือ และน้ำพริกตาแดง เหมาะเป็นของฝากหรือชุดพร้อมส่งทั่วไทย',
    highlights: ['ครบหลายเมนู', 'เหมาะเป็นของฝาก', 'เริ่มทำอาหารเหนือได้ทันที'],
    menus: ['ลาบเหนือ', 'น้ำเงี้ยว', 'แกงเหนือ', 'น้ำพริกเหนือ'],
    image: northernThaiFoodImages.product,
  },
}

const northernFaq = [
  {
    question: 'น้ำพริกลาบเหนือใช้ทำอะไรได้บ้าง',
    answer:
      'ใช้ทำลาบหมูเมืองเหนือ ลาบควาย คั่วลาบ ยำจิ๊นไก่ หรือประยุกต์เป็นข้าวผัดลาบเหนือได้ จุดเด่นคือกลิ่นเครื่องเทศคั่วและมะแขว่นแบบล้านนา',
  },
  {
    question: 'น้ำพริกตาแดงต่างจากน้ำพริกอ่องยังไง',
    answer:
      'น้ำพริกตาแดงเป็นน้ำพริกคั่วรสเข้ม กินคู่ข้าวเหนียว ผักลวก หรือแคบหมู ส่วนน้ำพริกอ่องมีมะเขือเทศและหมูสับ เนื้อสัมผัสและรสชาติจะนุ่มกว่า',
  },
  {
    question: 'พริกแกงเหนือเก็บได้นานไหม',
    answer:
      'ควรเก็บในภาชนะปิดสนิท หลีกเลี่ยงความชื้น และแช่เย็นหลังเปิดใช้ เพื่อรักษากลิ่นสมุนไพรและเครื่องเทศเหนือให้นานที่สุด',
  },
  {
    question: 'อาหารเหนือของ KHUA เป็นสูตรภาคเหนือแท้ไหม',
    answer:
      'KHUA พัฒนาสูตรจากแนวทางครัวล้านนาและรสชาติพะเยา เน้นกลิ่นคั่ว วัตถุดิบพื้นบ้าน และเครื่องเทศเหนือ เพื่อให้ทำอาหารเหนือแท้ได้ง่ายขึ้นที่บ้าน',
  },
]

const phayaoProductSeo: Record<string, {
  description: string
  menus: string[]
  recipeLinks: Array<{ label: string; href: string }>
  image: string
}> = {
  'nam-prik-larb-phayao': {
    description:
      'น้ำพริกลาบเหนือสูตรพะเยา ใช้เครื่องเทศล้านนาแท้ เช่น มะแขว่น ดีปลี พริกคั่ว หอมแดง และกระเทียมคั่ว เหมาะสำหรับทำลาบเมืองเหนือ คั่วลาบ ลาบหมู ลาบควาย และเมนูพื้นบ้านล้านนาที่ต้องการกลิ่นเครื่องลาบเหนือหอมชัด',
    menus: ['ลาบหมูเมืองเหนือ', 'ลาบควาย', 'คั่วลาบเหนือ', 'ยำจิ๊นไก่'],
    recipeLinks: [
      { label: 'ดูสูตรลาบเหนือ', href: '/articles/how-to-make-phayao-northern-larb' },
      { label: 'เลือกเครื่องลาบเหนือ', href: '/products/nam-prik-larb-phayao' },
    ],
    image: phayaoLandingImages.larb,
  },
  'nam-prik-nam-ngiao-phayao': {
    description:
      'น้ำพริกน้ำเงี้ยวสูตรล้านนาแท้สำหรับทำขนมจีนน้ำเงี้ยวแบบเชียงรายและพะเยา รสเข้มข้น หอมพริกแห้งคั่ว ถั่วเน่า ดอกงิ้ว และเครื่องเทศเหนือ เหมาะกับคนที่ค้นหาวิธีทำน้ำเงี้ยวเหนือให้อร่อยแบบบ้าน ๆ',
    menus: ['ขนมจีนน้ำเงี้ยว', 'เส้นน้ำเงี้ยว', 'น้ำเงี้ยวหมู', 'ซุปน้ำเงี้ยวเหนือ'],
    recipeLinks: [
      { label: 'ดูสูตรน้ำเงี้ยว', href: '/articles/how-to-make-phayao-nam-ngiao' },
      { label: 'เลือกเครื่องแกงน้ำเงี้ยว', href: '/products/nam-prik-nam-ngiao-phayao' },
    ],
    image: phayaoLandingImages.namNgiao,
  },
  'nam-prik-kaeng-nuea-phayao': {
    description:
      'น้ำพริกแกงเหนือสูตรพะเยา หรือเครื่องแกงล้านนา ใช้ทำแกงแค แกงอ่อม แกงหน่อไม้ แกงขนุน และเมนูอาหารเหนือที่ต้องการกลิ่นสมุนไพรคั่ว ข่า ตะไคร้ ขมิ้น หอม กระเทียม และพริกแห้งเหนือ',
    menus: ['แกงแค', 'แกงอ่อมเหนือ', 'แกงหน่อไม้', 'แกงขนุน'],
    recipeLinks: [
      { label: 'ดูเครื่องแกงเหนือ', href: '/products/nam-prik-kaeng-nuea-phayao' },
      { label: 'อ่านเรื่องอาหารเหนือแท้', href: '/collections/northern-thai-food' },
    ],
    image: phayaoLandingImages.curry,
  },
  'nam-prik-ta-daeng-phayao': {
    description:
      'น้ำพริกตาแดงเหนือสูตรพะเยา เป็นน้ำพริกเหนือแท้สำหรับกินคู่ข้าวเหนียว ผักลวก ไข่ต้ม แคบหมู หรือใช้คลุกข้าวและทำเมนูง่าย ๆ ในครัว รสเข้ม หอมพริกคั่วและปลาย่างแบบอาหารล้านนา',
    menus: ['ข้าวเหนียวน้ำพริกตาแดง', 'ผักลวกน้ำพริกเหนือ', 'ข้าวคลุกน้ำพริก', 'แคบหมูจิ้มน้ำพริก'],
    recipeLinks: [
      { label: 'ดูน้ำพริกตาแดง', href: '/products/nam-prik-ta-daeng-phayao' },
      { label: 'อ่านเรื่องน้ำพริกเหนือ', href: '/collections/nam-prik-nuea' },
    ],
    image: phayaoLandingImages.taDaeng,
  },
}

const phayaoFaq = [
  {
    question: 'น้ำพริกลาบเหนือแตกต่างจากลาบอีสานยังไง',
    answer:
      'ลาบเหนือหรือลาบเมืองเน้นเครื่องเทศคั่ว เช่น มะแขว่น ดีปลี และพริกลาบ กลิ่นหอมลึกและไม่เน้นรสเปรี้ยวแบบลาบอีสาน จึงเหมาะกับการทำลาบหมูเมือง ลาบควาย และคั่วลาบเหนือ',
  },
  {
    question: 'น้ำพริกน้ำเงี้ยวใช้ทำอะไรได้บ้าง',
    answer:
      'ใช้ทำขนมจีนน้ำเงี้ยว เส้นน้ำเงี้ยว น้ำเงี้ยวหมู หรือซุปน้ำเงี้ยวเหนือ โดยใช้คู่กับดอกงิ้ว ถั่วเน่า มะเขือเทศ และน้ำซุปกระดูกเพื่อให้รสเข้มแบบล้านนา',
  },
  {
    question: 'เครื่องแกงเหนือเผ็ดไหม',
    answer:
      'เครื่องแกงเหนือของ KHUA เผ็ดระดับกลาง เน้นกลิ่นสมุนไพรและเครื่องเทศคั่วมากกว่าความเผ็ดจัด สามารถลดหรือเพิ่มปริมาณตามเมนูและคนกินได้',
  },
  {
    question: 'ถ้าอยากเริ่มทำอาหารพะเยาควรเลือกสินค้าไหนก่อน',
    answer:
      'ถ้าชอบเมนูลาบให้เริ่มจากน้ำพริกลาบเหนือ ถ้าชอบเส้นและน้ำแกงให้เลือกน้ำพริกน้ำเงี้ยว ถ้าทำกับข้าวหลายเมนูให้เลือกน้ำพริกแกงเหนือ และถ้าต้องการกินง่ายกับข้าวเหนียวให้เลือกน้ำพริกตาแดง',
  },
]

const phayaoProductSeoByLocale: Record<Locale, typeof phayaoProductSeo> = {
  th: phayaoProductSeo,
  en: {
    'nam-prik-larb-phayao': {
      description:
        'Phayao-style Northern larb chili paste made with Lanna spices such as ma-khwaen, long pepper, roasted chilies, shallots, and garlic. Use it for Northern pork larb, beef larb, kua larb, and everyday Lanna dishes that need the aroma of roasted larb spices.',
      menus: ['Northern pork larb', 'Beef larb', 'Kua larb', 'Chicken herb salad'],
      recipeLinks: [
        { label: 'View Northern larb recipe', href: '/articles/how-to-make-phayao-northern-larb' },
        { label: 'Shop larb paste', href: '/products/nam-prik-larb-phayao' },
      ],
      image: phayaoLandingImages.larb,
    },
    'nam-prik-nam-ngiao-phayao': {
      description:
        'A Lanna nam ngiao chili paste for Phayao and Chiang Rai style noodle soup. It brings roasted dried chilies, fermented soybean, dried cotton tree flowers, and Northern spices into one rich base for khanom jeen nam ngiao.',
      menus: ['Khanom jeen nam ngiao', 'Nam ngiao noodles', 'Pork nam ngiao', 'Northern noodle soup'],
      recipeLinks: [
        { label: 'View nam ngiao recipe', href: '/articles/how-to-make-phayao-nam-ngiao' },
        { label: 'Shop nam ngiao paste', href: '/products/nam-prik-nam-ngiao-phayao' },
      ],
      image: phayaoLandingImages.namNgiao,
    },
    'nam-prik-kaeng-nuea-phayao': {
      description:
        'Northern curry paste for gaeng khae, gaeng om, bamboo shoot curry, jackfruit curry, and Lanna home cooking. The paste highlights roasted herbs, galangal, lemongrass, turmeric, shallots, garlic, and dried Northern chilies.',
      menus: ['Gaeng khae', 'Northern gaeng om', 'Bamboo shoot curry', 'Jackfruit curry'],
      recipeLinks: [
        { label: 'Shop Northern curry paste', href: '/products/nam-prik-kaeng-nuea-phayao' },
        { label: 'Read Northern Thai food guide', href: '/collections/northern-thai-food' },
      ],
      image: phayaoLandingImages.curry,
    },
    'nam-prik-ta-daeng-phayao': {
      description:
        'Phayao red eye chili paste for sticky rice, boiled vegetables, eggs, crispy pork rinds, or quick rice bowls. It gives a deep roasted chili aroma with grilled fish and Lanna-style savory heat.',
      menus: ['Sticky rice with chili paste', 'Boiled vegetables', 'Chili rice bowl', 'Crispy pork rind dip'],
      recipeLinks: [
        { label: 'Shop red eye chili paste', href: '/products/nam-prik-ta-daeng-phayao' },
        { label: 'Read Northern chili paste guide', href: '/collections/nam-prik-nuea' },
      ],
      image: phayaoLandingImages.taDaeng,
    },
  },
  lo: {
    'nam-prik-larb-phayao': {
      description:
        'ນ້ຳພິກລາບເໜືອສູດພະເຍົາ ໃຊ້ເຄື່ອງເທດລ້ານນາ ໝາກແຂ່ວ ດີປີ ພິກຄົ່ວ ຫອມ ແລະກະທຽມ ເໝາະສຳລັບລາບເໜືອ ຄົ່ວລາບ ແລະເມນູພື້ນບ້ານລ້ານນາ.',
      menus: ['ລາບໝູເໜືອ', 'ລາບງົວ', 'ຄົ່ວລາບ', 'ຍຳໄກ່ສະໝຸນໄພ'],
      recipeLinks: [
        { label: 'ເບິ່ງສູດລາບເໜືອ', href: '/articles/how-to-make-phayao-northern-larb' },
        { label: 'ເລືອກນ້ຳພິກລາບ', href: '/products/nam-prik-larb-phayao' },
      ],
      image: phayaoLandingImages.larb,
    },
    'nam-prik-nam-ngiao-phayao': {
      description:
        'ນ້ຳພິກນ້ຳເງ້ຍວສູດລ້ານນາ ສຳລັບເຮັດຂະໜົມຈີນນ້ຳເງ້ຍວແບບພະເຍົາ ຫອມພິກຄົ່ວ ຖົ່ວເນົ່າ ດອກງິ້ວ ແລະເຄື່ອງເທດເໜືອ.',
      menus: ['ຂະໜົມຈີນນ້ຳເງ້ຍວ', 'ເສັ້ນນ້ຳເງ້ຍວ', 'ນ້ຳເງ້ຍວໝູ', 'ຊຸບນ້ຳເງ້ຍວ'],
      recipeLinks: [
        { label: 'ເບິ່ງສູດນ້ຳເງ້ຍວ', href: '/articles/how-to-make-phayao-nam-ngiao' },
        { label: 'ເລືອກນ້ຳພິກນ້ຳເງ້ຍວ', href: '/products/nam-prik-nam-ngiao-phayao' },
      ],
      image: phayaoLandingImages.namNgiao,
    },
    'nam-prik-kaeng-nuea-phayao': {
      description:
        'ນ້ຳພິກແກງເໜືອສູດພະເຍົາ ໃຊ້ເຮັດແກງແຄ ແກງອ່ອມ ແກງໜໍ່ໄມ້ ແລະແກງຂະໜຸນ ຫອມຂ່າ ຕະໄຄ້ ຂີ້ໝິ້ນ ຫອມ ກະທຽມ ແລະພິກແຫ້ງ.',
      menus: ['ແກງແຄ', 'ແກງອ່ອມເໜືອ', 'ແກງໜໍ່ໄມ້', 'ແກງຂະໜຸນ'],
      recipeLinks: [
        { label: 'ເລືອກແກງເໜືອ', href: '/products/nam-prik-kaeng-nuea-phayao' },
        { label: 'ອ່ານອາຫານເໜືອແທ້', href: '/collections/northern-thai-food' },
      ],
      image: phayaoLandingImages.curry,
    },
    'nam-prik-ta-daeng-phayao': {
      description:
        'ນ້ຳພິກຕາແດງເໜືອສູດພະເຍົາ ກິນກັບເຂົ້າໜຽວ ຜັກລວກ ໄຂ່ຕົ້ມ ແລະແຄບໝູ ຫອມພິກຄົ່ວ ແລະປາຍ່າງແບບລ້ານນາ.',
      menus: ['ເຂົ້າໜຽວນ້ຳພິກ', 'ຜັກລວກ', 'ເຂົ້າຄຸກນ້ຳພິກ', 'ແຄບໝູຈິ້ມ'],
      recipeLinks: [
        { label: 'ເລືອກນ້ຳພິກຕາແດງ', href: '/products/nam-prik-ta-daeng-phayao' },
        { label: 'ອ່ານນ້ຳພິກເໜືອ', href: '/collections/nam-prik-nuea' },
      ],
      image: phayaoLandingImages.taDaeng,
    },
  },
  zh: {
    'nam-prik-larb-phayao': {
      description:
        '帕尧泰北拉布辣椒酱，使用马告、荜茇、烘烤辣椒、红葱与蒜等兰纳香料。适合制作泰北猪肉拉布、牛肉拉布、炒拉布和带有烘烤香气的家常兰纳菜。',
      menus: ['泰北猪肉拉布', '牛肉拉布', '炒拉布', '鸡肉香草凉拌'],
      recipeLinks: [
        { label: '查看泰北拉布食谱', href: '/articles/how-to-make-phayao-northern-larb' },
        { label: '选择拉布辣椒酱', href: '/products/nam-prik-larb-phayao' },
      ],
      image: phayaoLandingImages.larb,
    },
    'nam-prik-nam-ngiao-phayao': {
      description:
        '兰纳南妮欧辣椒酱，适合制作帕尧与清莱风格米线汤。烘烤干辣椒、豆豉、干木棉花与泰北香料带来浓郁汤底。',
      menus: ['南妮欧米线', '南妮欧面', '猪肉南妮欧', '泰北汤面'],
      recipeLinks: [
        { label: '查看南妮欧食谱', href: '/articles/how-to-make-phayao-nam-ngiao' },
        { label: '选择南妮欧酱', href: '/products/nam-prik-nam-ngiao-phayao' },
      ],
      image: phayaoLandingImages.namNgiao,
    },
    'nam-prik-kaeng-nuea-phayao': {
      description:
        '泰北咖喱酱适合制作แกงแค、泰北炖咖喱、竹笋咖喱、菠萝蜜咖喱等兰纳家常菜，突出南姜、香茅、姜黄、红葱、蒜与干辣椒香气。',
      menus: ['泰北แกงแค', '泰北炖咖喱', '竹笋咖喱', '菠萝蜜咖喱'],
      recipeLinks: [
        { label: '选择泰北咖喱酱', href: '/products/nam-prik-kaeng-nuea-phayao' },
        { label: '阅读泰北料理指南', href: '/collections/northern-thai-food' },
      ],
      image: phayaoLandingImages.curry,
    },
    'nam-prik-ta-daeng-phayao': {
      description:
        '帕尧红眼辣椒酱适合搭配糯米、烫蔬菜、鸡蛋、炸猪皮，或快速拌饭。烘烤辣椒、烤鱼与兰纳咸香带来浓郁风味。',
      menus: ['糯米配辣椒酱', '烫蔬菜', '辣椒酱拌饭', '炸猪皮蘸酱'],
      recipeLinks: [
        { label: '选择红眼辣椒酱', href: '/products/nam-prik-ta-daeng-phayao' },
        { label: '阅读泰北辣椒酱指南', href: '/collections/nam-prik-nuea' },
      ],
      image: phayaoLandingImages.taDaeng,
    },
  },
}

const phayaoLandingCopy: Record<Locale, {
  contextLabel: string
  introTitle: string
  introParagraphs: string[]
  editorialAlt: string
  productsLabel: string
  productsTitle: string
  productEyebrow: string
  menuLabel: string
  viewProduct: string
  clusterTitle: string
  clusters: Array<[string, string]>
  stepsAlt: string
  spiceTitle: string
  spiceBody: string
  spiceAlt: string
  spices: string[]
  narrativeTitle: string
  narrativeParagraphs: string[]
  kitchenAlt: string
  faqTitle: string
  faq: typeof phayaoFaq
  keywords: string[]
  schemaItemList: string
  schemaCategory: string
}> = {
  th: {
    contextLabel: 'Phayao Food Context',
    introTitle: 'เครื่องปรุงอาหารเหนือ และสูตรอาหารพะเยาแท้',
    introParagraphs: [
      'หน้านี้รวบรวมเครื่องแกง น้ำพริก และวัตถุดิบอาหารเหนือพื้นบ้านจากสูตรล้านนาแท้ของจังหวัดพะเยา สำหรับคนที่อยากทำอาหารเหนือที่บ้านให้มีกลิ่นหอมแบบครัวเมืองเหนือจริง ๆ ไม่ว่าจะเป็นน้ำพริกลาบเหนือ น้ำพริกแกงเหนือ น้ำพริกน้ำเงี้ยว หรือน้ำพริกตาแดงที่กินคู่ข้าวเหนียวและผักพื้นบ้านได้ทุกวัน',
      'จุดเด่นของสูตรพะเยาคือการคั่วพริก หอม กระเทียม และเครื่องเทศด้วยไฟอ่อนก่อนนำมาตำหรือปรุง ทำให้ได้กลิ่นคั่วลึก รสเข้ม และความหอมของมะแขว่น ดีปลี ถั่วเน่า ดอกงิ้ว และสมุนไพรล้านนาอย่างชัดเจน เหมาะสำหรับเมนูเหนือ เช่น ลาบหมูเมืองเหนือ ลาบควาย คั่วลาบ แกงแค แกงหน่อไม้ น้ำเงี้ยว และอาหารพื้นบ้านล้านนา',
      'KHUA วางหน้านี้ให้เป็นคลังความรู้และทางลัดในการเลือกเครื่องปรุง ไม่ใช่เพียงหน้ารวมสินค้า คุณจึงเห็นทั้งบริบทของเมนู วิธีใช้สินค้า คำค้นที่คนมักหา เช่น วิธีทำลาบเหนือ เครื่องลาบเหนือซื้อที่ไหน น้ำเงี้ยวเชียงราย น้ำพริกเหนือแท้ เครื่องแกงเหนือ และลิงก์ไปยังหน้าสินค้าหรือบทความที่เกี่ยวข้องเพื่ออ่านต่ออย่างเป็นธรรมชาติ',
    ],
    editorialAlt: 'Apple food editorial style ของเมนูอาหารเหนือและน้ำเงี้ยว',
    productsLabel: 'Products With Cooking Intent',
    productsTitle: 'สินค้าใช้ทำอะไรได้บ้าง',
    productEyebrow: 'เครื่องปรุงอาหารเหนือสูตรพะเยา',
    menuLabel: 'เมนูแนะนำจากสินค้านี้',
    viewProduct: 'ดูสินค้า',
    clusterTitle: 'สูตรอาหารเหนือจากน้ำพริกลาบและเครื่องแกงพะเยา',
    clusters: [
      ['น้ำพริกลาบเหนือ', 'ลาบเหนือ, ลาบเมือง, ลาบหมูเหนือ, คั่วลาบ'],
      ['น้ำพริกน้ำเงี้ยว', 'ขนมจีนน้ำเงี้ยว, น้ำเงี้ยวเชียงราย, น้ำเงี้ยวพะเยา'],
      ['น้ำพริกแกงเหนือ', 'เครื่องแกงล้านนา, แกงแค, แกงหน่อไม้, แกงอ่อม'],
      ['น้ำพริกตาแดง', 'น้ำพริกเหนือ, ข้าวเหนียว, ผักลวก, แคบหมู'],
    ],
    stepsAlt: 'ขั้นตอนทำลาบเหนือด้วยน้ำพริกลาบ KHUA',
    spiceTitle: 'เครื่องเทศพื้นบ้านล้านนา',
    spiceBody:
      'รสชาติพะเยาเริ่มจากวัตถุดิบพื้นบ้าน เช่น มะแขว่น ดีปลี พริกลาบ ถั่วเน่า ดอกงิ้ว พริกแห้ง หอมแดง กระเทียม ข่า ตะไคร้ และขมิ้น วัตถุดิบเหล่านี้ทำให้ Google เข้าใจความสัมพันธ์ของคำว่าอาหารพะเยา อาหารล้านนา เครื่องเทศล้านนา เครื่องแกงเหนือ และน้ำพริกเหนือได้ชัดขึ้น ขณะเดียวกันคนอ่านก็เห็นทันทีว่าสินค้าแต่ละตัวไม่ได้เป็นแค่ของขาย แต่เป็นส่วนหนึ่งของวิธีทำอาหารเหนือจริง ๆ',
    spiceAlt: 'เครื่องเทศพื้นบ้านล้านนา มะแขว่น ดีปลี พริกแห้ง ถั่วเน่า และสมุนไพรเหนือ',
    spices: ['มะแขว่น', 'ดีปลี', 'พริกลาบ', 'ถั่วเน่า', 'ดอกงิ้ว', 'พริกแห้งคั่ว', 'หอมแดง', 'กระเทียมไทย'],
    narrativeTitle: 'จากครัวพื้นบ้านพะเยาสู่เครื่องปรุงอาหารเหนือ KHUA',
    narrativeParagraphs: [
      'Collection นี้เล่าเรื่องจากครัวพื้นบ้านจังหวัดพะเยา ที่ยังใช้ไฟคั่ว ครกหิน สมุนไพรสด และการกินจริงในครอบครัวเป็นหัวใจ KHUA คัดเลือกแนวทางรสชาติแบบล้านนาแท้ แล้วทำให้ใช้ง่ายขึ้นสำหรับครัวบ้านยุคใหม่ โดยยังคงกลิ่นพริกคั่วและเครื่องเทศเหนือเป็นตัวนำ',
      'เมื่อคนค้นหา “น้ำพริกลาบเหนือ”, “เครื่องแกงเหนือ”, “สูตรอาหารเหนือ”, “อาหารพะเยา” หรือ “วัตถุดิบอาหารเหนือ” หน้านี้จึงตอบทั้งความต้องการซื้อสินค้าและความต้องการเข้าใจว่าแต่ละเครื่องปรุงใช้ทำเมนูอะไรได้บ้าง',
    ],
    kitchenAlt: 'วิถีครัวเหนือจริงในบ้านไม้ล้านนาพะเยา',
    faqTitle: 'คำถามที่พบบ่อยเกี่ยวกับเครื่องปรุงอาหารเหนือ',
    faq: phayaoFaq,
    keywords: ['น้ำพริกลาบเหนือ', 'เครื่องแกงเหนือ', 'อาหารพะเยา', 'สูตรอาหารเหนือ', 'น้ำเงี้ยว', 'เครื่องลาบเหนือ', 'น้ำพริกเหนือ', 'อาหารล้านนา', 'วัตถุดิบอาหารเหนือ', 'เครื่องเทศล้านนา'],
    schemaItemList: 'เครื่องปรุงอาหารเหนือสูตรพะเยา',
    schemaCategory: 'เครื่องปรุงอาหารเหนือ',
  },
  en: {
    contextLabel: 'Phayao Food Context',
    introTitle: 'Northern Thai Seasonings and Authentic Phayao Recipes',
    introParagraphs: [
      'This page brings together Northern Thai curry pastes, chili pastes, and local ingredients inspired by authentic Lanna cooking from Phayao. It helps home cooks choose seasonings for Northern larb, nam ngiao, gaeng khae, bamboo shoot curry, red eye chili paste, and everyday Lanna meals.',
      'Phayao flavor begins with slow roasting: dried chilies, shallots, garlic, and spices are heated gently before pounding or cooking. That process gives depth, roasted aroma, and the character of ma-khwaen, long pepper, fermented soybean, dried cotton tree flowers, and Northern herbs.',
      'KHUA designed this page as a contextual buying guide, not just a product grid. It answers search intent around how to make Northern larb, where to buy larb spices, Chiang Rai and Phayao style nam ngiao, authentic Northern chili paste, Northern curry paste, and Lanna ingredients.',
    ],
    editorialAlt: 'Apple food editorial style Northern Thai food and nam ngiao',
    productsLabel: 'Products With Cooking Intent',
    productsTitle: 'What can you cook with these products?',
    productEyebrow: 'Phayao-style Northern Thai seasoning',
    menuLabel: 'Recommended dishes',
    viewProduct: 'View product',
    clusterTitle: 'Northern Thai recipe ideas from KHUA pastes',
    clusters: [
      ['Northern larb paste', 'Northern larb, larb muang, pork larb, kua larb'],
      ['Nam ngiao paste', 'Khanom jeen nam ngiao, Chiang Rai nam ngiao, Phayao nam ngiao'],
      ['Northern curry paste', 'Lanna curry paste, gaeng khae, bamboo shoot curry, gaeng om'],
      ['Red eye chili paste', 'Northern chili paste, sticky rice, boiled vegetables, crispy pork rinds'],
    ],
    stepsAlt: 'Northern larb cooking steps with KHUA larb paste',
    spiceTitle: 'Local Lanna Spices',
    spiceBody:
      'Phayao flavor is built from local ingredients such as ma-khwaen, long pepper, larb spices, fermented soybean, dried cotton tree flowers, dried chilies, shallots, garlic, galangal, lemongrass, and turmeric. These terms connect the page semantically with Phayao food, Lanna food, Northern spices, Northern curry paste, and Northern chili paste.',
    spiceAlt: 'Local Lanna spices, ma-khwaen, dried chilies, fermented soybean, and Northern herbs',
    spices: ['Ma-khwaen', 'Long pepper', 'Larb spices', 'Fermented soybean', 'Dried cotton tree flowers', 'Roasted dried chilies', 'Shallots', 'Thai garlic'],
    narrativeTitle: 'From Phayao Home Kitchens to KHUA Northern Thai Seasonings',
    narrativeParagraphs: [
      'This collection tells the story of Phayao home kitchens where slow roasting, stone mortars, fresh herbs, and shared meals still shape flavor. KHUA keeps that Lanna foundation while making it easier for modern home cooks.',
      'When people search for Northern larb paste, Northern curry paste, Phayao food, Northern Thai recipes, or Lanna ingredients, this page connects product choice with real cooking intent.',
    ],
    kitchenAlt: 'Real Northern Thai kitchen in a Phayao Lanna wooden home',
    faqTitle: 'FAQ About Northern Thai Seasonings',
    faq: [
      { question: 'How is Northern larb different from Isan larb?', answer: 'Northern larb focuses on roasted spices such as ma-khwaen, long pepper, and larb spice blends. It is aromatic and savory rather than sour like many Isan larb recipes.' },
      { question: 'What can nam ngiao paste be used for?', answer: 'Use it for khanom jeen nam ngiao, nam ngiao noodles, pork nam ngiao, or Northern noodle soup with dried cotton tree flowers and fermented soybean.' },
      { question: 'Is Northern curry paste very spicy?', answer: 'KHUA Northern curry paste is medium spicy and aroma-forward, so you can adjust the amount for family meals.' },
      { question: 'Which product should I start with?', answer: 'Choose larb paste for Northern larb, nam ngiao paste for noodle soup, Northern curry paste for curries, and red eye chili paste for sticky rice and vegetables.' },
    ],
    keywords: ['Northern larb paste', 'Northern curry paste', 'Phayao food', 'Northern Thai recipes', 'nam ngiao', 'larb spices', 'Northern chili paste', 'Lanna food', 'Northern Thai ingredients', 'Lanna spices'],
    schemaItemList: 'Phayao-style Northern Thai seasonings',
    schemaCategory: 'Northern Thai seasoning',
  },
  lo: {
    contextLabel: 'ບໍລິບົດອາຫານພະເຍົາ',
    introTitle: 'ເຄື່ອງປຸງອາຫານເໜືອ ແລະສູດອາຫານພະເຍົາແທ້',
    introParagraphs: [
      'ຫນ້ານີ້ລວມເຄື່ອງແກງ ນ້ຳພິກ ແລະວັດຖຸດິບອາຫານເໜືອຈາກສູດລ້ານນາຂອງພະເຍົາ ສຳລັບຄົນທີ່ຢາກເຮັດລາບເໜືອ ນ້ຳເງ້ຍວ ແກງແຄ ແລະນ້ຳພິກຕາແດງຢູ່ເຮືອນ.',
      'ຈຸດເດັ່ນຂອງສູດພະເຍົາແມ່ນການຄົ່ວພິກ ຫອມ ກະທຽມ ແລະເຄື່ອງເທດດ້ວຍໄຟອ່ອນ ເຮັດໃຫ້ຫອມເລິກ ແລະມີລົດເຂັ້ມແບບລ້ານນາ.',
      'KHUA ຈັດຫນ້ານີ້ເປັນຄູ່ມືເລືອກເຄື່ອງປຸງ ພ້ອມບໍລິບົດເມນູ ວິທີໃຊ້ສິນຄ້າ ແລະລິ້ງໄປຫາສູດຫຼືສິນຄ້າທີ່ກ່ຽວຂ້ອງ.',
    ],
    editorialAlt: 'ອາຫານເໜືອ ແລະນ້ຳເງ້ຍວແບບ editorial',
    productsLabel: 'ສິນຄ້າກັບເມນູທີ່ເຮັດໄດ້',
    productsTitle: 'ສິນຄ້າໃຊ້ເຮັດຫຍັງໄດ້ແດ່',
    productEyebrow: 'ເຄື່ອງປຸງເໜືອສູດພະເຍົາ',
    menuLabel: 'ເມນູແນະນຳ',
    viewProduct: 'ເບິ່ງສິນຄ້າ',
    clusterTitle: 'ສູດອາຫານເໜືອຈາກນ້ຳພິກ KHUA',
    clusters: [
      ['ນ້ຳພິກລາບເໜືອ', 'ລາບເໜືອ, ລາບເມືອງ, ລາບໝູ, ຄົ່ວລາບ'],
      ['ນ້ຳພິກນ້ຳເງ້ຍວ', 'ຂະໜົມຈີນນ້ຳເງ້ຍວ, ນ້ຳເງ້ຍວພະເຍົາ'],
      ['ນ້ຳພິກແກງເໜືອ', 'ເຄື່ອງແກງລ້ານນາ, ແກງແຄ, ແກງໜໍ່ໄມ້'],
      ['ນ້ຳພິກຕາແດງ', 'ນ້ຳພິກເໜືອ, ເຂົ້າໜຽວ, ຜັກລວກ'],
    ],
    stepsAlt: 'ຂັ້ນຕອນເຮັດລາບເໜືອດ້ວຍນ້ຳພິກ KHUA',
    spiceTitle: 'ເຄື່ອງເທດພື້ນບ້ານລ້ານນາ',
    spiceBody: 'ລົດຊາດພະເຍົາເລີ່ມຈາກໝາກແຂ່ວ ດີປີ ພິກລາບ ຖົ່ວເນົ່າ ດອກງິ້ວ ພິກແຫ້ງ ຫອມ ກະທຽມ ຂ່າ ຕະໄຄ້ ແລະຂີ້ໝິ້ນ.',
    spiceAlt: 'ເຄື່ອງເທດລ້ານນາ ໝາກແຂ່ວ ພິກແຫ້ງ ແລະສະໝຸນໄພເໜືອ',
    spices: ['ໝາກແຂ່ວ', 'ດີປີ', 'ພິກລາບ', 'ຖົ່ວເນົ່າ', 'ດອກງິ້ວ', 'ພິກແຫ້ງຄົ່ວ', 'ຫອມ', 'ກະທຽມ'],
    narrativeTitle: 'ຈາກຄົວພະເຍົາສູ່ເຄື່ອງປຸງເໜືອ KHUA',
    narrativeParagraphs: ['Collection ນີ້ເລົ່າເລື່ອງຄົວພື້ນບ້ານພະເຍົາ ໄຟຄົ່ວ ຄົກຫີນ ສະໝຸນໄພສົດ ແລະການກິນຮ່ວມກັນ.', 'ຫນ້ານີ້ຕອບທັງຄວາມຕ້ອງການຊື້ ແລະຄວາມຢາກຮູ້ວ່າເຄື່ອງປຸງແຕ່ລະຢ່າງໃຊ້ເຮັດເມນູໃດ.'],
    kitchenAlt: 'ຄົວເໜືອໃນເຮືອນໄມ້ລ້ານນາພະເຍົາ',
    faqTitle: 'ຄຳຖາມກ່ຽວກັບເຄື່ອງປຸງອາຫານເໜືອ',
    faq: [
      { question: 'ນ້ຳພິກລາບເໜືອຕ່າງຈາກລາບອີສານແນວໃດ', answer: 'ລາບເໜືອເນັ້ນເຄື່ອງເທດຄົ່ວ ແລະກິ່ນຫອມ ບໍ່ເນັ້ນລົດສົ້ມແບບລາບອີສານ.' },
      { question: 'ນ້ຳພິກນ້ຳເງ້ຍວໃຊ້ເຮັດຫຍັງໄດ້', answer: 'ໃຊ້ເຮັດຂະໜົມຈີນນ້ຳເງ້ຍວ ເສັ້ນນ້ຳເງ້ຍວ ແລະຊຸບນ້ຳເງ້ຍວ.' },
      { question: 'ເຄື່ອງແກງເໜືອເຜັດບໍ່', answer: 'ເຜັດປານກາງ ເນັ້ນກິ່ນສະໝຸນໄພ ແລະປັບປະລິມານໄດ້.' },
      { question: 'ຄວນເລີ່ມຈາກສິນຄ້າໃດ', answer: 'ຖ້າມັກລາບເລືອກນ້ຳພິກລາບ ຖ້າມັກນ້ຳເງ້ຍວເລືອກນ້ຳພິກນ້ຳເງ້ຍວ.' },
    ],
    keywords: ['ນ້ຳພິກລາບເໜືອ', 'ເຄື່ອງແກງເໜືອ', 'ອາຫານພະເຍົາ', 'ສູດອາຫານເໜືອ', 'ນ້ຳເງ້ຍວ', 'ນ້ຳພິກເໜືອ', 'ອາຫານລ້ານນາ'],
    schemaItemList: 'ເຄື່ອງປຸງອາຫານເໜືອສູດພະເຍົາ',
    schemaCategory: 'ເຄື່ອງປຸງອາຫານເໜືອ',
  },
  zh: {
    contextLabel: '帕尧料理语境',
    introTitle: '泰北调味料与正宗帕尧食谱',
    introParagraphs: [
      '本页汇集来自帕尧兰纳传统的泰北咖喱酱、辣椒酱与地方食材，适合在家制作泰北拉布、南妮欧、แกงแค、竹笋咖喱、红眼辣椒酱和兰纳家常菜。',
      '帕尧风味的核心是慢火烘烤：干辣椒、红葱、蒜与香料先被烘出香气，再捣制或入锅，形成马告、荜茇、豆豉、干木棉花与泰北香草的深层味道。',
      'KHUA 将本页设计为有语境的选购指南，而不是单纯商品列表，回应“泰北拉布做法”“哪里买拉布香料”“南妮欧”“正宗泰北辣椒酱”“泰北咖喱酱”等搜索意图。',
    ],
    editorialAlt: '泰北料理与南妮欧的 Apple food editorial 风格图片',
    productsLabel: '商品与烹饪意图',
    productsTitle: '这些商品可以做什么菜',
    productEyebrow: '帕尧风格泰北调味料',
    menuLabel: '推荐菜单',
    viewProduct: '查看商品',
    clusterTitle: '用 KHUA 调味酱制作的泰北食谱',
    clusters: [
      ['泰北拉布辣椒酱', '泰北拉布, 拉布เมือง, 猪肉拉布, 炒拉布'],
      ['南妮欧辣椒酱', '南妮欧米线, 清莱南妮欧, 帕尧南妮欧'],
      ['泰北咖喱酱', '兰纳咖喱酱, แกงแค, 竹笋咖喱, 泰北炖咖喱'],
      ['红眼辣椒酱', '泰北辣椒酱, 糯米, 烫蔬菜, 炸猪皮'],
    ],
    stepsAlt: '使用 KHUA 拉布辣椒酱制作泰北拉布的步骤',
    spiceTitle: '兰纳地方香料',
    spiceBody: '帕尧风味来自马告、荜茇、拉布香料、豆豉、干木棉花、干辣椒、红葱、蒜、南姜、香茅和姜黄。这些食材让页面与帕尧料理、兰纳料理、泰北香料、泰北咖喱酱和泰北辣椒酱形成清晰语义关联。',
    spiceAlt: '兰纳地方香料、马告、干辣椒、豆豉与泰北香草',
    spices: ['马告', '荜茇', '拉布香料', '豆豉', '干木棉花', '烘烤干辣椒', '红葱', '泰国蒜'],
    narrativeTitle: '从帕尧家庭厨房到 KHUA 泰北调味料',
    narrativeParagraphs: ['这个 collection 讲述帕尧家庭厨房的味道：慢火烘烤、石臼、鲜香草与家人共享的一餐。KHUA 保留兰纳基础，同时让现代家庭更容易烹饪。', '当人们搜索泰北拉布辣椒酱、泰北咖喱酱、帕尧料理、泰北食谱或兰纳食材时，本页连接商品选择与真实烹饪需求。'],
    kitchenAlt: '帕尧兰纳木屋中的真实泰北厨房',
    faqTitle: '泰北调味料常见问题',
    faq: [
      { question: '泰北拉布和 Isan 拉布有什么不同', answer: '泰北拉布重视马告、荜茇和拉布香料等烘烤香气，味道偏咸香浓郁，不像许多 Isan 拉布那样以酸味为主。' },
      { question: '南妮欧辣椒酱可以做什么', answer: '可制作南妮欧米线、南妮欧面、猪肉南妮欧或加入干木棉花与豆豉的泰北汤面。' },
      { question: '泰北咖喱酱很辣吗', answer: 'KHUA 泰北咖喱酱为中等辣度，更强调香草与烘烤香气，可依家庭口味调整用量。' },
      { question: '第一次购买应选哪一种', answer: '想做拉布选拉布辣椒酱，想做面汤选南妮欧酱，常做咖喱选泰北咖喱酱，配糯米和蔬菜选红眼辣椒酱。' },
    ],
    keywords: ['泰北拉布辣椒酱', '泰北咖喱酱', '帕尧料理', '泰北食谱', '南妮欧', '拉布香料', '泰北辣椒酱', '兰纳料理', '泰北食材', '兰纳香料'],
    schemaItemList: '帕尧风格泰北调味料',
    schemaCategory: '泰北调味料',
  },
}

function getPhayaoProductSeo(slug: string, locale: Locale) {
  return phayaoProductSeoByLocale[locale][slug] ?? phayaoProductSeo[slug]
}

export async function generateStaticParams() {
  const params: Array<{ lang: string; slug: string }> = []

  for (const locale of LOCALES) {
    const dict = await getDictionary(locale)
    dict.collections_data.forEach((collection) => {
      params.push({ lang: locale, slug: collection.slug })
    })
  }

  return params
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { lang, slug } = await params
  const locale = lang as Locale
  const dict = await getDictionary(locale)
  const collection = dict.collections_data.find((item) => item.slug === slug)

  if (!collection) {
    return { title: dict.products.notFound }
  }

  const isPhayaoLanding = slug === 'phayao-recipe'
  const isNorthernLanding = locale === 'th' && slug === 'northern-thai-food'
  const isLannaLanding = slug === 'lanna-food'
  const phayaoCopy = phayaoLandingCopy[locale]
  const lannaLandingCopy = lannaCopy[locale]
  const ogImage = isPhayaoLanding
    ? phayaoLandingImages.hero
    : isNorthernLanding
      ? northernThaiFoodImages.hero
      : isLannaLanding
        ? lannaFoodImages.hero
        : DEFAULT_OG_IMAGE
  const alternates: Record<string, string> = {}
  LOCALES.forEach((l) => {
    alternates[l] = `/${l}/collections/${slug}`
  })

  return {
    title: { absolute: fitSeoText(collection.metaTitle, 60) },
    description: fitSeoText(collection.metaDescription, 160),
    keywords: mergeKeywords(
      THAI_SEO_KEYWORDS,
      collection.title,
      dict.products.originValue,
      dict.products.seoTagsBase,
      collection.sections.map((section) => section.title),
      isPhayaoLanding ? phayaoCopy.keywords : undefined,
      isLannaLanding ? lannaLandingCopy.keywords : undefined,
      isNorthernLanding
        ? [
            'อาหารเหนือแท้',
            'เครื่องปรุงอาหารเหนือ',
            'น้ำพริกลาบเหนือ',
            'น้ำพริกตาแดง',
            'น้ำเงี้ยว',
            'พริกแกงเหนือ',
            'ซื้ออาหารเหนือออนไลน์',
            'เครื่องแกงเหนือแท้',
            'อาหารล้านนาพร้อมส่ง',
          ]
        : undefined,
    ),
    robots: { index: true, follow: true },
    alternates: { canonical: `/${locale}/collections/${slug}`, languages: alternates },
    openGraph: {
      title: collection.metaTitle,
      description: collection.metaDescription,
      url: absoluteUrl(`/${locale}/collections/${slug}`),
      siteName: dict.site.name,
      locale: getOpenGraphLocale(locale),
      type: 'website',
      images: [{ url: absoluteUrl(ogImage), width: 1200, height: 900, alt: collection.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: collection.metaTitle,
      description: collection.metaDescription,
      images: [absoluteUrl(ogImage)],
    },
  }
}

function createProductJsonLd(product: ProductData, locale: Locale) {
  const seo = getPhayaoProductSeo(product.slug, locale)
  const copy = phayaoLandingCopy[locale]

  return {
    '@type': 'Product',
    name: product.name,
    image: absoluteUrl(product.image || seo?.image || '/khua-logo.png'),
    description: seo?.description || product.longDescription || product.description,
    brand: {
      '@type': 'Brand',
      name: 'KHUA',
    },
    category: copy.schemaCategory,
    offers: {
      '@type': 'Offer',
      url: absoluteUrl(`/${locale}/products/${product.slug}`),
      priceCurrency: 'THB',
      price: product.price,
      availability: 'https://schema.org/InStock',
    },
  }
}

function PhayaoSeoProductCard({
  product,
  locale,
}: {
  product: ProductData
  locale: Locale
}) {
  const seo = getPhayaoProductSeo(product.slug, locale)
  const copy = phayaoLandingCopy[locale]
  const image = seo?.image || product.image || '/khua-logo.png'
  const menus = seo?.menus ?? []

  return (
    <article className="grid gap-0 overflow-hidden bg-white lg:grid-cols-[0.88fr_1.12fr]">
      <Link
        href={`/${locale}/products/${product.slug}`}
        className="relative min-h-[280px] bg-[#22140e] sm:min-h-[360px] lg:min-h-full"
      >
        <Image
          src={image}
          alt={`${product.name} ${copy.productsTitle}`}
          fill
          sizes="(max-width: 1024px) 100vw, 42vw"
          className="object-cover transition duration-700 hover:scale-[1.025]"
        />
      </Link>
      <div className="p-6 sm:p-8 lg:p-10">
        <p className="apple-eyebrow mb-3 text-xs uppercase text-gold/70">
          {copy.productEyebrow}
        </p>
        <h3 className="apple-display text-3xl text-text sm:text-4xl">
          {product.name}
        </h3>
        <p className="mt-5 text-base leading-8 text-text-secondary">
          {seo?.description || product.longDescription || product.description}
        </p>
        {menus.length ? (
          <div className="mt-6">
            <p className="text-sm font-semibold text-text">{copy.menuLabel}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {menus.map((menu) => (
                <span
                  key={menu}
                  className="rounded-full border border-gold/20 bg-gold/10 px-3 py-1.5 text-xs font-medium text-text-secondary"
                >
                  {menu}
                </span>
              ))}
            </div>
          </div>
        ) : null}
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <Link
            href={`/${locale}/products/${product.slug}`}
            className="rounded-full bg-text px-5 py-3 text-sm font-semibold text-white transition hover:bg-gold"
          >
            {copy.viewProduct}
          </Link>
          {seo?.recipeLinks.map((link) => (
            <Link
              key={link.href}
              href={`/${locale}${link.href}`}
              className="rounded-full border border-border bg-bg px-5 py-3 text-sm font-medium text-text-secondary transition hover:border-gold/40 hover:text-gold"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </article>
  )
}

function PhayaoRecipeLanding({
  collection,
  products,
  locale,
}: {
  collection: NonNullable<Awaited<ReturnType<typeof getDictionary>>['collections_data'][number]>
  products: ProductData[]
  locale: Locale
}) {
  const copy = phayaoLandingCopy[locale]

  return (
    <main className="bg-bg pb-24 pt-12">
      <section className="px-3 sm:px-4">
        <div className="relative mx-auto min-h-[calc(100vh-4rem)] max-w-[1480px] overflow-hidden bg-[#1f130d] text-white">
          <Image
            src={phayaoLandingImages.hero}
            alt={collection.title}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-78"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/74 via-black/34 to-black/8" />
          <div className="relative flex min-h-[calc(100vh-4rem)] max-w-5xl flex-col justify-end px-5 pb-16 pt-40 sm:px-10 lg:px-14">
            <p className="apple-eyebrow mb-5 text-xs uppercase text-gold-light">
              {collection.heroEyebrow}
            </p>
            <h1 className="apple-display max-w-4xl text-5xl sm:text-7xl">
              {collection.title}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-9 text-white/84">
              {collection.excerpt}
            </p>
          </div>
        </div>
      </section>

      <section className="px-3 py-3 sm:px-4">
        <div className="mx-auto grid max-w-[1480px] gap-3 lg:grid-cols-[1.05fr_0.95fr]">
          <article className="bg-white p-6 sm:p-10 lg:p-14">
            <p className="apple-eyebrow mb-4 text-xs uppercase text-gold/70">
              {copy.contextLabel}
            </p>
            <h2 className="apple-display text-4xl text-text sm:text-5xl">
              {copy.introTitle}
            </h2>
            <div className="mt-7 space-y-5 text-base leading-8 text-text-secondary">
              {copy.introParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </article>
          <figure className="relative min-h-[420px] overflow-hidden bg-[#241710]">
            <Image
              src={phayaoLandingImages.editorial}
              alt={copy.editorialAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 48vw"
              className="object-cover"
            />
          </figure>
        </div>
      </section>

      <section className="px-3 py-3 sm:px-4">
        <div className="mx-auto max-w-[1480px] bg-[#f5f5f7] p-3">
          <div className="bg-white px-5 py-10 text-center sm:px-8">
            <p className="apple-eyebrow mb-3 text-xs uppercase text-gold/70">
              {copy.productsLabel}
            </p>
            <h2 className="apple-display text-4xl text-text sm:text-5xl">
              {copy.productsTitle}
            </h2>
          </div>
          <div className="mt-3 grid gap-3">
            {products.map((product) => (
              <PhayaoSeoProductCard key={product.slug} product={product} locale={locale} />
            ))}
          </div>
        </div>
      </section>

      <section className="px-3 py-3 sm:px-4">
        <div className="mx-auto grid max-w-[1480px] gap-3 lg:grid-cols-3">
          <article className="bg-[#241710] p-6 text-white sm:p-9 lg:col-span-2">
            <h2 className="apple-display text-4xl sm:text-5xl">
              {copy.clusterTitle}
            </h2>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {copy.clusters.map(([title, text]) => (
                <div key={title} className="border border-white/12 bg-white/7 p-5">
                  <h3 className="text-lg font-semibold">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/74">{text}</p>
                </div>
              ))}
            </div>
          </article>
          <figure className="relative min-h-[430px] overflow-hidden bg-[#241710]">
            <Image
              src={phayaoLandingImages.steps}
              alt={copy.stepsAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 33vw"
              className="object-cover"
            />
          </figure>
        </div>
      </section>

      <section className="px-3 py-3 sm:px-4">
        <div className="mx-auto grid max-w-[1480px] gap-3 lg:grid-cols-[0.95fr_1.05fr]">
          <figure className="relative min-h-[430px] overflow-hidden bg-[#241710]">
            <Image
              src={phayaoLandingImages.spices}
              alt={copy.spiceAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 48vw"
              className="object-cover"
            />
          </figure>
          <article className="bg-white p-6 sm:p-10 lg:p-14">
            <h2 className="apple-display text-4xl text-text sm:text-5xl">
              {copy.spiceTitle}
            </h2>
            <p className="mt-6 text-base leading-8 text-text-secondary">
              {copy.spiceBody}
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              {copy.spices.map((item) => (
                <span key={item} className="rounded-full border border-gold/20 bg-gold/10 px-3 py-1.5 text-sm text-text-secondary">
                  {item}
                </span>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="px-3 py-3 sm:px-4">
        <div className="mx-auto grid max-w-[1480px] gap-3 lg:grid-cols-[1fr_1fr]">
          <article className="bg-white p-6 sm:p-10 lg:p-14">
            <h2 className="apple-display text-4xl text-text sm:text-5xl">
              {copy.narrativeTitle}
            </h2>
            <div className="mt-6 space-y-5 text-base leading-8 text-text-secondary">
              {copy.narrativeParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </article>
          <figure className="relative min-h-[430px] overflow-hidden bg-[#241710]">
            <Image
              src={phayaoLandingImages.kitchen}
              alt={copy.kitchenAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </figure>
        </div>
      </section>

      <section className="px-3 py-3 sm:px-4">
        <div className="mx-auto max-w-[1480px] bg-white p-6 sm:p-10 lg:p-14">
          <p className="apple-eyebrow mb-3 text-xs uppercase text-gold/70">
            FAQ
          </p>
          <h2 className="apple-display text-4xl text-text sm:text-5xl">
            {copy.faqTitle}
          </h2>
          <div className="mt-8 grid gap-3 md:grid-cols-2">
            {copy.faq.map((item) => (
              <article key={item.question} className="border border-border bg-bg/70 p-5">
                <h3 className="text-lg font-semibold text-text">{item.question}</h3>
                <p className="mt-3 text-sm leading-7 text-text-secondary">{item.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

function NorthernThaiFoodCard({
  product,
  locale,
}: {
  product: ProductData
  locale: Locale
}) {
  const seo = northernProductSeo[product.slug]
  const image = seo?.image || product.image || '/khua-logo.png'

  return (
    <article className="group flex h-full flex-col overflow-hidden bg-white">
      <Link href={`/${locale}/products/${product.slug}`} className="relative min-h-[300px] bg-[#241710]">
        <Image
          src={image}
          alt={`${product.name} สูตรล้านนาแท้ KHUA`}
          fill
          sizes="(max-width: 1024px) 100vw, 33vw"
          className="object-cover transition duration-700 group-hover:scale-[1.03]"
        />
        {seo?.badge ? (
          <span className="absolute left-4 top-4 rounded-full bg-white/92 px-3 py-1.5 text-xs font-semibold text-text shadow-sm">
            {seo.badge}
          </span>
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col p-6">
        <p className="apple-eyebrow mb-3 text-xs uppercase text-gold/70">
          {product.weight}
        </p>
        <h3 className="apple-display text-3xl text-text">{product.name}</h3>
        <p className="mt-4 text-sm leading-7 text-text-secondary">
          {seo?.description || product.longDescription || product.description}
        </p>
        {seo?.highlights.length ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {seo.highlights.map((item) => (
              <span key={item} className="rounded-full border border-gold/20 bg-gold/10 px-3 py-1 text-xs text-text-secondary">
                {item}
              </span>
            ))}
          </div>
        ) : null}
        {seo?.menus.length ? (
          <div className="mt-5">
            <p className="text-sm font-semibold text-text">เมนูแนะนำ</p>
            <p className="mt-2 text-sm leading-7 text-text-secondary">
              {seo.menus.join(' / ')}
            </p>
          </div>
        ) : null}
        <div className="mt-auto flex items-center justify-between gap-4 pt-6">
          <span className="text-lg font-semibold text-text">฿{product.price}</span>
          <Link
            href={`/${locale}/products/${product.slug}`}
            className="rounded-full bg-text px-5 py-3 text-sm font-semibold text-white transition hover:bg-gold"
          >
            ดูสินค้า
          </Link>
        </div>
      </div>
    </article>
  )
}

function NorthernThaiFoodLanding({
  collection,
  products,
  locale,
}: {
  collection: NonNullable<Awaited<ReturnType<typeof getDictionary>>['collections_data'][number]>
  products: ProductData[]
  locale: Locale
}) {
  const sellingPoints = ['สูตรล้านนาแท้', 'ไม่มีวัตถุกันเสีย', 'ทำอาหารเหนือได้ง่าย', 'ใช้วัตถุดิบพื้นบ้าน', 'ส่งตรงทั่วไทย']
  const subCollections = [
    { title: 'น้ำพริกเหนือ', desc: 'น้ำพริกลาบเหนือ น้ำพริกตาแดง และน้ำพริกเหนือแท้', href: '/collections/nam-prik-nuea' },
    { title: 'พริกแกงเหนือ', desc: 'เครื่องแกงล้านนาสำหรับแกงแค แกงอ่อม และแกงหน่อไม้', href: '/products/nam-prik-kaeng-nuea-phayao' },
    { title: 'สูตรอาหารพะเยา', desc: 'วิธีใช้เครื่องปรุง KHUA กับเมนูพื้นบ้านล้านนา', href: '/collections/phayao-recipe' },
    { title: 'อาหารล้านนา', desc: 'วัฒนธรรมอาหารเหนือ สมุนไพร และรสชาติครัวเมือง', href: '/collections/lanna-food' },
  ]
  const bestSellerSlugs = [
    'nam-prik-larb-phayao',
    'nam-prik-ta-daeng-phayao',
    'nam-prik-nam-ngiao-phayao',
    'nam-prik-kaeng-nuea-phayao',
  ]
  const bestSellers = bestSellerSlugs
    .map((slug) => products.find((product) => product.slug === slug))
    .filter((product): product is ProductData => Boolean(product))

  return (
    <main className="bg-bg pb-24 pt-12">
      <section className="px-3 sm:px-4">
        <div className="relative mx-auto min-h-[calc(100vh-4rem)] max-w-[1480px] overflow-hidden bg-[#1f130d] text-white">
          <Image
            src={northernThaiFoodImages.hero}
            alt="อาหารเหนือแท้ สูตรล้านนา น้ำพริกลาบ น้ำเงี้ยว และพริกแกงเหนือ KHUA"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-82"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/76 via-black/34 to-black/10" />
          <div className="relative flex min-h-[calc(100vh-4rem)] max-w-5xl flex-col justify-end px-5 pb-16 pt-40 sm:px-10 lg:px-14">
            <p className="apple-eyebrow mb-5 text-xs uppercase text-gold-light">
              {collection.heroEyebrow}
            </p>
            <h1 className="apple-display max-w-4xl text-5xl sm:text-7xl">
              อาหารเหนือแท้ สูตรล้านนา | KHUA
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-9 text-white/84">
              {collection.excerpt}
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              {sellingPoints.map((point) => (
                <span key={point} className="rounded-full border border-white/18 bg-white/12 px-3 py-2 text-sm text-white/86 backdrop-blur">
                  {point}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-3 py-3 sm:px-4">
        <div className="mx-auto grid max-w-[1480px] gap-3 lg:grid-cols-[1.05fr_0.95fr]">
          <article className="bg-white p-6 sm:p-10 lg:p-14">
            <p className="apple-eyebrow mb-4 text-xs uppercase text-gold/70">
              Northern Thai Food Buying Guide
            </p>
            <h2 className="apple-display text-4xl text-text sm:text-5xl">
              รวมเครื่องปรุงอาหารเหนือแท้ สำหรับทำเมนูล้านนาได้ง่ายที่บ้าน
            </h2>
            <div className="mt-7 space-y-5 text-base leading-8 text-text-secondary">
              <p>
                รวมผลิตภัณฑ์อาหารเหนือและเครื่องปรุงล้านนาแท้จาก KHUA ไม่ว่าจะเป็นน้ำพริกลาบเหนือ น้ำพริกตาแดง น้ำเงี้ยว และพริกแกงเหนือ คัดเลือกวัตถุดิบคุณภาพ สูตรต้นตำรับภาคเหนือแท้ เหมาะสำหรับทำอาหารเหนือได้ง่ายที่บ้าน และตอบโจทย์คนที่ต้องการซื้ออาหารเหนือออนไลน์แบบพร้อมส่งทั่วไทย
              </p>
              <p>
                จุดเด่นของอาหารเหนือแท้คือกลิ่นสมุนไพรและเครื่องเทศคั่ว เช่น มะแขว่น พริกแห้ง หอมแดง กระเทียม ข่า ตะไคร้ ขมิ้น ถั่วเน่า และดอกงิ้ว KHUA จึงวางสินค้าแต่ละตัวให้ชัดว่าใช้ทำอะไรได้บ้าง ตั้งแต่น้ำพริกลาบเหนือสำหรับลาบเมือง ไปจนถึงเครื่องแกงเหนือแท้สำหรับแกงแค แกงอ่อม และแกงหน่อไม้
              </p>
              <p>
                หน้านี้ไม่ได้เป็นแค่ catalog รวมสินค้า แต่เป็นหน้าช่วยตัดสินใจซื้อสำหรับคนที่ค้นหาอาหารเหนือแท้ เครื่องปรุงอาหารเหนือ น้ำพริกลาบเหนือ น้ำพริกตาแดง น้ำเงี้ยว พริกแกงเหนือ อาหารล้านนาพร้อมส่ง และวัตถุดิบสำหรับทำอาหารเหนือที่บ้าน
              </p>
            </div>
          </article>
          <figure className="relative min-h-[440px] overflow-hidden bg-[#241710]">
            <Image
              src={northernThaiFoodImages.process}
              alt="ขั้นตอนทำอาหารเหนือด้วยน้ำพริกลาบ น้ำเงี้ยว และพริกแกงเหนือ"
              fill
              sizes="(max-width: 1024px) 100vw, 48vw"
              className="object-cover"
            />
          </figure>
        </div>
      </section>

      <section className="px-3 py-3 sm:px-4">
        <div className="mx-auto max-w-[1480px] bg-white p-6 sm:p-10 lg:p-12">
          <p className="apple-eyebrow mb-3 text-xs uppercase text-gold/70">
            Internal Collections
          </p>
          <h2 className="apple-display text-4xl text-text sm:text-5xl">
            เลือกหมวดเครื่องปรุงอาหารเหนือ
          </h2>
          <div className="mt-8 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {subCollections.map((item) => (
              <Link
                key={item.href}
                href={`/${locale}${item.href}`}
                className="border border-border bg-bg/70 p-5 transition hover:border-gold/40 hover:bg-gold-pale/35"
              >
                <h3 className="text-lg font-semibold text-text">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-text-secondary">{item.desc}</p>
                <span className="mt-5 inline-flex text-sm font-semibold text-gold">ดูหมวดนี้ →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-3 py-3 sm:px-4">
        <div className="mx-auto max-w-[1480px] bg-[#f5f5f7] p-3">
          <div className="bg-white px-5 py-10 text-center sm:px-8">
            <p className="apple-eyebrow mb-3 text-xs uppercase text-gold/70">
              Best Sellers
            </p>
            <h2 className="apple-display text-4xl text-text sm:text-5xl">
              สินค้าขายดีอาหารเหนือ
            </h2>
          </div>
          <div className="mt-3 grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <NorthernThaiFoodCard key={product.slug} product={product} locale={locale} />
            ))}
          </div>
        </div>
      </section>

      <section className="px-3 py-3 sm:px-4">
        <div className="mx-auto grid max-w-[1480px] gap-3 lg:grid-cols-[0.95fr_1.05fr]">
          <figure className="relative min-h-[430px] overflow-hidden bg-[#241710]">
            <Image
              src={northernThaiFoodImages.ingredients}
              alt="วัตถุดิบพื้นบ้านสำหรับเครื่องปรุงอาหารเหนือ พริกแห้ง มะแขว่น ข่า ตะไคร้"
              fill
              sizes="(max-width: 1024px) 100vw, 48vw"
              className="object-cover"
            />
          </figure>
          <article className="bg-white p-6 sm:p-10 lg:p-14">
            <h2 className="apple-display text-4xl text-text sm:text-5xl">
              ทำลาบเหนือให้อร่อย ต้องใช้อะไรบ้าง
            </h2>
            <p className="mt-6 text-base leading-8 text-text-secondary">
              เมนูลาบเหนือเริ่มจากน้ำพริกลาบเหนือ KHUA เนื้อหมูหรือเนื้อวัวสด ผักพื้นบ้าน หอมเจียว หนังหมู และข้าวเหนียวร้อน ๆ เมื่อต้องการกลิ่นแบบลาบเมือง ให้คั่วเครื่องลาบกับเนื้อด้วยไฟอ่อนจนหอม แล้วเสิร์ฟคู่ผักสดเพื่อตัดรสเข้มของเครื่องเทศเหนือ
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              {['น้ำพริกลาบเหนือ KHUA', 'ผักพื้นบ้าน', 'หอมเจียว', 'หนังหมู', 'ข้าวเหนียว', 'มะแขว่น'].map((item) => (
                <span key={item} className="rounded-full border border-gold/20 bg-gold/10 px-3 py-1.5 text-sm text-text-secondary">
                  {item}
                </span>
              ))}
            </div>
            <Link
              href={`/${locale}/products/nam-prik-larb-phayao`}
              className="mt-8 inline-flex rounded-full bg-text px-5 py-3 text-sm font-semibold text-white transition hover:bg-gold"
            >
              เลือกน้ำพริกลาบเหนือ
            </Link>
          </article>
        </div>
      </section>

      <section className="px-3 py-3 sm:px-4">
        <div className="mx-auto grid max-w-[1480px] gap-3 lg:grid-cols-3">
          <article className="bg-[#241710] p-6 text-white sm:p-9 lg:col-span-2">
            <h2 className="apple-display text-4xl sm:text-5xl">
              ทำไมอาหารเหนือ KHUA ถึงแตกต่าง
            </h2>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {[
                ['สูตรล้านนาแท้', 'ออกแบบรสจากครัวเหนือ เน้นกลิ่นเครื่องเทศคั่วและสมุนไพรพื้นบ้าน'],
                ['กลิ่นเครื่องเทศเหนือแท้', 'มะแขว่น พริกแห้ง หอม กระเทียม และถั่วเน่าให้กลิ่นเฉพาะตัว'],
                ['เหมาะกับมือใหม่และร้านอาหาร', 'ใช้เป็น base สำหรับเมนูเหนือ ทำซ้ำได้ง่ายและรสคงที่'],
                ['พร้อมส่งทั่วไทย', 'เหมาะสำหรับซื้ออาหารเหนือออนไลน์และเก็บไว้ทำอาหารที่บ้าน'],
              ].map(([title, text]) => (
                <div key={title} className="border border-white/12 bg-white/7 p-5">
                  <h3 className="text-lg font-semibold">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/74">{text}</p>
                </div>
              ))}
            </div>
          </article>
          <figure className="relative min-h-[430px] overflow-hidden bg-[#241710]">
            <Image
              src={northernThaiFoodImages.family}
              alt="ครอบครัวรับประทานอาหารเหนือพร้อมสินค้า KHUA"
              fill
              sizes="(max-width: 1024px) 100vw, 33vw"
              className="object-cover"
            />
          </figure>
        </div>
      </section>

      <section className="px-3 py-3 sm:px-4">
        <div className="mx-auto grid max-w-[1480px] gap-3 lg:grid-cols-[1fr_1fr]">
          <figure className="relative min-h-[430px] overflow-hidden bg-[#241710]">
            <Image
              src={northernThaiFoodImages.market}
              alt="ตลาดวัตถุดิบอาหารเหนือและสมุนไพรล้านนา"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </figure>
          <article className="bg-white p-6 sm:p-10 lg:p-14">
            <h2 className="apple-display text-4xl text-text sm:text-5xl">
              ชุดอาหารเหนือเริ่มต้น
            </h2>
            <p className="mt-6 text-base leading-8 text-text-secondary">
              ถ้าอยากเริ่มทำอาหารเหนือที่บ้าน แนะนำชุดที่มีน้ำพริกลาบ น้ำเงี้ยว พริกแกงเหนือ และน้ำพริกตาแดง เพื่อครอบคลุมทั้งเมนูลาบ เมนูเส้น เมนูแกง และเมนูกินคู่ข้าวเหนียว ช่วยให้การซื้อครั้งแรกครบกว่าเลือกทีละอย่าง
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {bestSellers.map((product) => (
                <Link
                  key={product.slug}
                  href={`/${locale}/products/${product.slug}`}
                  className="border border-border bg-bg/70 p-4 transition hover:border-gold/40 hover:bg-gold-pale/35"
                >
                  <span className="text-sm font-semibold text-text">{product.name}</span>
                  <p className="mt-2 text-xs text-text-secondary">฿{product.price} · {product.weight}</p>
                </Link>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="px-3 py-3 sm:px-4">
        <div className="mx-auto max-w-[1480px] bg-white p-6 sm:p-10 lg:p-14">
          <p className="apple-eyebrow mb-3 text-xs uppercase text-gold/70">
            FAQ
          </p>
          <h2 className="apple-display text-4xl text-text sm:text-5xl">
            คำถามที่พบบ่อยเกี่ยวกับอาหารเหนือ KHUA
          </h2>
          <div className="mt-8 grid gap-3 md:grid-cols-2">
            {northernFaq.map((item) => (
              <article key={item.question} className="border border-border bg-bg/70 p-5">
                <h3 className="text-lg font-semibold text-text">{item.question}</h3>
                <p className="mt-3 text-sm leading-7 text-text-secondary">{item.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

function LannaFoodLanding({
  collection,
  products,
  locale,
}: {
  collection: NonNullable<Awaited<ReturnType<typeof getDictionary>>['collections_data'][number]>
  products: ProductData[]
  locale: Locale
}) {
  const copy = lannaCopy[locale]
  const faqs = lannaFaqByLocale[locale]
  const featuredProducts = products.slice(0, 5)

  return (
    <main className="bg-bg pb-24 pt-12">
      <section className="px-3 sm:px-4">
        <div className="relative mx-auto min-h-[calc(100vh-4rem)] max-w-[1480px] overflow-hidden bg-[#1f130d] text-white">
          <Image
            src={lannaFoodImages.hero}
            alt={`${copy.heroTitle} KHUA`}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-84"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/74 via-black/36 to-black/10" />
          <div className="relative flex min-h-[calc(100vh-4rem)] max-w-5xl flex-col justify-end px-5 pb-16 pt-40 sm:px-10 lg:px-14">
            <p className="apple-eyebrow mb-5 text-xs uppercase text-gold-light">
              {collection.heroEyebrow}
            </p>
            <h1 className="apple-display max-w-4xl text-5xl sm:text-7xl">
              {copy.heroTitle}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-9 text-white/84">
              {copy.heroSubtitle}
            </p>
          </div>
        </div>
      </section>

      <section className="px-3 py-3 sm:px-4">
        <div className="mx-auto grid max-w-[1480px] gap-3 lg:grid-cols-[1.08fr_0.92fr]">
          <article className="bg-white p-6 sm:p-10 lg:p-14">
            <p className="apple-eyebrow mb-4 text-xs uppercase text-gold/70">
              {copy.introLabel}
            </p>
            <h2 className="apple-display text-4xl text-text sm:text-5xl">
              {copy.introTitle}
            </h2>
            <div className="mt-7 space-y-5 text-base leading-8 text-text-secondary">
              {copy.introParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </article>
          <figure className="relative min-h-[440px] overflow-hidden bg-[#241710]">
            <Image
              src={lannaFoodImages.market}
              alt={`${copy.ingredientTitle} KHUA`}
              fill
              sizes="(max-width: 1024px) 100vw, 48vw"
              className="object-cover"
            />
          </figure>
        </div>
      </section>

      <section className="px-3 py-3 sm:px-4">
        <div className="mx-auto max-w-[1480px] bg-white p-6 sm:p-10 lg:p-12">
          <p className="apple-eyebrow mb-3 text-xs uppercase text-gold/70">
            {copy.clusterEyebrow}
          </p>
          <h2 className="apple-display text-4xl text-text sm:text-5xl">
            {copy.clusterTitle}
          </h2>
          <div className="mt-8 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {copy.clusterLinks.map((item) => (
              <Link
                key={item.href}
                href={`/${locale}${item.href}`}
                className="border border-border bg-bg/70 p-5 transition hover:border-gold/40 hover:bg-gold-pale/35"
              >
                <h3 className="text-lg font-semibold text-text">{item.label}</h3>
                <p className="mt-3 text-sm leading-7 text-text-secondary">{item.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-3 py-3 sm:px-4">
        <div className="mx-auto grid max-w-[1480px] gap-3 lg:grid-cols-[0.95fr_1.05fr]">
          <figure className="relative min-h-[430px] overflow-hidden bg-[#241710]">
            <Image
              src={lannaFoodImages.spices}
              alt={`Authentic Northern Thai spices from Phayao province - ${copy.ingredientTitle}`}
              fill
              sizes="(max-width: 1024px) 100vw, 48vw"
              className="object-cover"
            />
          </figure>
          <article className="bg-white p-6 sm:p-10 lg:p-14">
            <h2 className="apple-display text-4xl text-text sm:text-5xl">
              {copy.ingredientTitle}
            </h2>
            <p className="mt-6 text-base leading-8 text-text-secondary">
              {copy.ingredientBody}
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              {copy.ingredientTags.map((item) => (
                <span key={item} className="rounded-full border border-gold/20 bg-gold/10 px-3 py-1.5 text-sm text-text-secondary">
                  {item}
                </span>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="px-3 py-3 sm:px-4">
        <div className="mx-auto grid max-w-[1480px] gap-3 lg:grid-cols-3">
          <article className="bg-[#241710] p-6 text-white sm:p-9 lg:col-span-2">
            <h2 className="apple-display text-4xl sm:text-5xl">
              {copy.storyTitle}
            </h2>
            <div className="mt-7 space-y-5 text-base leading-8 text-white/78">
              {copy.storyParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </article>
          <figure className="relative min-h-[430px] overflow-hidden bg-[#241710]">
            <Image
              src={lannaFoodImages.culture}
              alt={`อาหารเหนือพื้นเมืองจากพะเยาพร้อมเครื่องเทศล้านนาแบบดั้งเดิม - ${copy.storyTitle}`}
              fill
              sizes="(max-width: 1024px) 100vw, 33vw"
              className="object-cover"
            />
          </figure>
        </div>
      </section>

      <section className="px-3 py-3 sm:px-4">
        <div className="mx-auto max-w-[1480px] bg-[#f5f5f7] p-3">
          <div className="bg-white px-5 py-10 text-center sm:px-8">
            <p className="apple-eyebrow mb-3 text-xs uppercase text-gold/70">
              {copy.productEyebrow}
            </p>
            <h2 className="apple-display text-4xl text-text sm:text-5xl">
              {copy.productTitle}
            </h2>
          </div>
          <div className="mt-3 grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
            {featuredProducts.map((product) => (
              <article key={product.slug} className="flex h-full flex-col bg-white">
                <Link href={`/${locale}/products/${product.slug}`} className="relative min-h-[300px] bg-[#241710]">
                  <Image
                    src={product.image || lannaFoodImages.closeup}
                    alt={`${product.name} ${copy.schemaCategory} KHUA`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover transition duration-700 hover:scale-[1.03]"
                  />
                </Link>
                <div className="flex flex-1 flex-col p-6">
                  <p className="apple-eyebrow mb-3 text-xs uppercase text-gold/70">
                    {product.weight}
                  </p>
                  <h3 className="apple-display text-3xl text-text">{product.name}</h3>
                  <p className="mt-4 text-sm leading-7 text-text-secondary">
                    {product.longDescription || product.description}
                  </p>
                  <div className="mt-auto flex items-center justify-between gap-4 pt-6">
                    <span className="text-lg font-semibold text-text">฿{product.price}</span>
                    <Link
                      href={`/${locale}/products/${product.slug}`}
                      className="rounded-full bg-text px-5 py-3 text-sm font-semibold text-white transition hover:bg-gold"
                    >
                      {locale === 'th' ? 'ดูสินค้า' : locale === 'lo' ? 'ເບິ່ງສິນຄ້າ' : locale === 'zh' ? '查看商品' : 'View product'}
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-3 py-3 sm:px-4">
        <div className="mx-auto grid max-w-[1480px] gap-3 lg:grid-cols-[1fr_1fr]">
          <figure className="relative min-h-[430px] overflow-hidden bg-[#241710]">
            <Image
              src={lannaFoodImages.larbProcess}
              alt={`authentic-larb-northern-thai-process ${copy.heroTitle}`}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </figure>
          <article className="bg-white p-6 sm:p-10 lg:p-14">
            <h2 className="apple-display text-4xl text-text sm:text-5xl">
              {copy.ugcTitle}
            </h2>
            <div className="mt-7 grid gap-3">
              {copy.ugcItems.map((item) => (
                <p key={item} className="border border-border bg-bg/70 p-5 text-sm leading-7 text-text-secondary">
                  {item}
                </p>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="px-3 py-3 sm:px-4">
        <div className="mx-auto grid max-w-[1480px] gap-3 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="bg-[#111] p-6 text-white sm:p-10 lg:p-14">
            <p className="apple-eyebrow mb-3 text-xs uppercase text-gold-light">
              {copy.videoEyebrow}
            </p>
            <h2 className="apple-display text-4xl sm:text-5xl">{copy.videoTitle}</h2>
            <p className="mt-6 text-base leading-8 text-white/76">{copy.videoBody}</p>
          </article>
          <figure className="relative min-h-[430px] overflow-hidden bg-[#241710]">
            <Image
              src={lannaFoodImages.cooking}
              alt={`namprik-larb-phayao-cooking ${copy.videoTitle}`}
              fill
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover"
            />
          </figure>
        </div>
      </section>

      <section className="px-3 py-3 sm:px-4">
        <div className="mx-auto max-w-[1480px] bg-white p-6 sm:p-10 lg:p-14">
          <p className="apple-eyebrow mb-3 text-xs uppercase text-gold/70">
            {copy.faqEyebrow}
          </p>
          <h2 className="apple-display text-4xl text-text sm:text-5xl">
            {copy.faqTitle}
          </h2>
          <div className="mt-8 grid gap-3 md:grid-cols-2">
            {faqs.map((item) => (
              <article key={item.question} className="border border-border bg-bg/70 p-5">
                <h3 className="text-lg font-semibold text-text">{item.question}</h3>
                <p className="mt-3 text-sm leading-7 text-text-secondary">{item.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { lang, slug } = await params
  const locale = lang as Locale
  const dict = await getDictionary(locale)
  const collection = dict.collections_data.find((item) => item.slug === slug)

  if (!collection) {
    notFound()
  }

  const isPhayaoLanding = collection.slug === 'phayao-recipe'
  const phayaoCopy = phayaoLandingCopy[locale]
  const isNorthernLanding = locale === 'th' && collection.slug === 'northern-thai-food'
  const isLannaLanding = collection.slug === 'lanna-food'
  const lannaLandingCopy = lannaCopy[locale]
  const phayaoProductSlugs = [
    'nam-prik-larb-phayao',
    'nam-prik-nam-ngiao-phayao',
    'nam-prik-kaeng-nuea-phayao',
    'nam-prik-ta-daeng-phayao',
  ]
  const northernProductSlugs = [
    'nam-prik-larb-phayao',
    'nam-prik-ta-daeng-phayao',
    'nam-prik-nam-ngiao-phayao',
    'nam-prik-kaeng-nuea-phayao',
    'khua-lanna-set-5-phayao',
  ]
  const lannaProductSlugs = [
    'khua-lanna-set-5-phayao',
    'nam-prik-larb-phayao',
    'nam-prik-ta-daeng-phayao',
    'nam-prik-kaeng-nuea-phayao',
    'nam-prik-nam-ngiao-phayao',
  ]
  const relatedProducts = collection.relatedProductSlugs
    .map((productSlug) => dict.products_data.find((product) => product.slug === productSlug))
    .filter(Boolean)
    .slice(0, 4)

  const phayaoProducts = phayaoProductSlugs
    .map((productSlug) => dict.products_data.find((product) => product.slug === productSlug))
    .filter((product): product is ProductData => Boolean(product))
  const northernProducts = northernProductSlugs
    .map((productSlug) => dict.products_data.find((product) => product.slug === productSlug))
    .filter((product): product is ProductData => Boolean(product))
  const lannaProducts = lannaProductSlugs
    .map((productSlug) => dict.products_data.find((product) => product.slug === productSlug))
    .filter((product): product is ProductData => Boolean(product))

  if (isLannaLanding) {
    const collectionUrl = absoluteUrl(`/${locale}/collections/${collection.slug}`)
    const lannaJsonLd = [
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: collection.title,
        description: collection.metaDescription,
        url: collectionUrl,
        inLanguage: locale,
        image: absoluteUrl(lannaFoodImages.hero),
        about: lannaLandingCopy.keywords,
        mainEntity: {
          '@type': 'ItemList',
          name: lannaLandingCopy.schemaCategory,
          itemListElement: lannaProducts.map((product, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: absoluteUrl(`/${locale}/products/${product.slug}`),
            item: {
              '@type': 'Product',
              name: product.name,
              image: absoluteUrl(product.image || lannaFoodImages.closeup),
              description: product.longDescription || product.description,
              brand: { '@type': 'Brand', name: 'KHUA' },
              category: lannaLandingCopy.schemaCategory,
              offers: {
                '@type': 'Offer',
                url: absoluteUrl(`/${locale}/products/${product.slug}`),
                priceCurrency: 'THB',
                price: product.price,
                availability: 'https://schema.org/InStock',
              },
            },
          })),
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: lannaFaqByLocale[locale].map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: dict.nav.home, item: absoluteUrl(`/${locale}`) },
          { '@type': 'ListItem', position: 2, name: dict.collections.label, item: absoluteUrl(`/${locale}/collections/northern-thai-food`) },
          { '@type': 'ListItem', position: 3, name: collection.title, item: collectionUrl },
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: dict.site.name,
        url: absoluteUrl(`/${locale}`),
        image: absoluteUrl(lannaFoodImages.hero),
        description: collection.metaDescription,
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Phayao',
          addressRegion: 'Phayao',
          addressCountry: 'TH',
        },
        sameAs: [dict.social.facebook, dict.social.instagram],
      },
    ]

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(lannaJsonLd).replace(/</g, '\\u003c') }}
        />
        <LannaFoodLanding collection={collection} products={lannaProducts} locale={locale} />
      </>
    )
  }

  if (isNorthernLanding) {
    const collectionUrl = absoluteUrl(`/${locale}/collections/${collection.slug}`)
    const productList = northernProducts.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: absoluteUrl(`/${locale}/products/${product.slug}`),
      item: {
        ...createProductJsonLd(product, locale),
        description:
          northernProductSeo[product.slug]?.description || product.longDescription || product.description,
      },
    }))
    const northernJsonLd = [
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: collection.title,
        description: collection.metaDescription,
        url: collectionUrl,
        inLanguage: locale,
        image: absoluteUrl(northernThaiFoodImages.hero),
        mainEntity: {
          '@type': 'ItemList',
          name: 'สินค้าขายดีอาหารเหนือ KHUA',
          itemListElement: productList,
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: northernFaq.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: dict.nav.home, item: absoluteUrl(`/${locale}`) },
          { '@type': 'ListItem', position: 2, name: dict.collections.label, item: absoluteUrl(`/${locale}/collections/nam-prik-nuea`) },
          { '@type': 'ListItem', position: 3, name: collection.title, item: collectionUrl },
        ],
      },
    ]

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(northernJsonLd).replace(/</g, '\\u003c') }}
        />
        <NorthernThaiFoodLanding collection={collection} products={northernProducts} locale={locale} />
      </>
    )
  }

  if (isPhayaoLanding) {
    const collectionUrl = absoluteUrl(`/${locale}/collections/${collection.slug}`)
    const phayaoJsonLd = [
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: collection.title,
        description: collection.metaDescription,
        url: collectionUrl,
        inLanguage: locale,
        image: absoluteUrl(phayaoLandingImages.hero),
        mainEntity: {
          '@type': 'ItemList',
          name: phayaoCopy.schemaItemList,
          itemListElement: phayaoProducts.map((product, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: absoluteUrl(`/${locale}/products/${product.slug}`),
            item: createProductJsonLd(product, locale),
          })),
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: phayaoCopy.faq.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: dict.nav.home, item: absoluteUrl(`/${locale}`) },
          { '@type': 'ListItem', position: 2, name: dict.collections.label, item: absoluteUrl(`/${locale}/collections/nam-prik-nuea`) },
          { '@type': 'ListItem', position: 3, name: collection.title, item: collectionUrl },
        ],
      },
    ]

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(phayaoJsonLd).replace(/</g, '\\u003c') }}
        />
        <PhayaoRecipeLanding collection={collection} products={phayaoProducts} locale={locale} />
      </>
    )
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: collection.title,
    description: collection.excerpt,
    url: `${SITE_URL}/${locale}/collections/${collection.slug}`,
    inLanguage: locale,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: relatedProducts.map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${SITE_URL}/${locale}/products/${product!.slug}`,
        name: product!.name,
      })),
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="bg-bg pb-24 pt-32">
        <section className="px-3 sm:px-4">
          <div className="mx-auto max-w-[1480px] bg-[#241710] px-5 py-14 text-white sm:px-8 sm:py-20 lg:px-14">
            <p className="apple-eyebrow mb-4 text-xs uppercase text-gold-light">
              {collection.heroEyebrow}
            </p>
            <h1 className="apple-display max-w-4xl text-5xl sm:text-7xl">
              {collection.title}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-9 text-white/78">
              {collection.excerpt}
            </p>
          </div>
        </section>

        <section className="px-3 py-3 sm:px-4">
          <div className="mx-auto grid max-w-[1480px] gap-3 lg:grid-cols-[1.1fr_0.9fr]">
            <article className="bg-surface px-5 py-10 sm:px-8 sm:py-12 lg:px-12">
              <div className="space-y-12">
                {collection.sections.map((section) => (
                  <section key={section.title}>
                    <h2 className="apple-display text-3xl text-text sm:text-4xl">
                      {section.title}
                    </h2>
                    <div className="mt-5 space-y-4 text-base leading-8 text-text-secondary">
                      {section.content.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                    {section.links?.length ? (
                      <div className="mt-6 flex flex-wrap gap-2">
                        {section.links.map((link) => (
                          <Link
                            key={link.href}
                            href={`/${locale}${link.href}`}
                            className="border border-gold/20 bg-bg/70 px-3 py-2 text-sm font-medium text-gold transition-colors hover:border-gold/40 hover:bg-gold-pale"
                          >
                            {link.label}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </section>
                ))}
              </div>
            </article>

            <aside className="grid content-start gap-3">
              <div className="bg-surface p-5 sm:p-7">
                <p className="apple-eyebrow text-xs uppercase text-gold/70">
                  {dict.collections.label}
                </p>
                <div className="mt-5 grid gap-2">
                  {dict.collections_data.map((item) => (
                    <Link
                      key={item.slug}
                      href={`/${locale}/collections/${item.slug}`}
                      className="flex items-center justify-between border border-gold/15 bg-bg/60 px-4 py-3 text-sm font-medium text-text transition-colors hover:border-gold/35 hover:bg-gold-pale/45"
                    >
                      <span>{item.title}</span>
                      <span className="text-gold">→</span>
                    </Link>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </section>

        {relatedProducts.length ? (
          <section className="px-3 py-3 sm:px-4">
            <div className="mx-auto max-w-[1480px] bg-[#f5f5f7] p-3">
              <div className="mb-3 bg-white px-5 py-10 text-center sm:px-8">
                <p className="apple-eyebrow mb-3 text-xs uppercase text-gold/70">
                  {dict.products.label}
                </p>
                <h2 className="apple-display text-4xl text-text sm:text-5xl">
                  {dict.products.title}
                </h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {relatedProducts.map((product) => (
                  <ProductCard key={product!.slug} product={product!} dict={dict} lang={locale} />
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </main>
    </>
  )
}
