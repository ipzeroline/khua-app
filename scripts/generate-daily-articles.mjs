import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import mysql from 'mysql2/promise'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const outputPath = path.join(root, 'src', 'data', 'articles.generated.json')
const websiteLogoPath = path.join(root, 'public', 'khua-logo.webp')
const locales = ['th', 'en', 'lo', 'zh']

loadEnvFile(path.join(root, '.env'))
loadEnvFile(path.join(root, '.env.local'))

function envInt(name, fallback) {
  const value = Number.parseInt(process.env[name] || '', 10)
  return Number.isFinite(value) && value > 0 ? value : fallback
}

async function fetchWithTimeout(url, init = {}, timeoutMs = 30000) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timeout)
  }
}

const uploadsDir = process.env.KHUA_ARTICLE_UPLOADS_DIR
  ? path.resolve(process.env.KHUA_ARTICLE_UPLOADS_DIR)
  : path.join(process.cwd(), 'public', 'uploads', 'articles')

const fallback = {
  th: [],
  en: [],
  lo: [],
  zh: [],
}

const topics = [
  {
    key: 'seasonal-vegetables',
    th: {
      title: 'ผักพื้นบ้านกับน้ำพริกเหนือ: เลือกอย่างไรให้มื้ออาหารพะเยาสมดุล',
      excerpt:
        'รู้จักวิธีเลือกผักพื้นบ้าน ผักลวก และผักสดให้เข้ากับน้ำพริกพะเยา เพื่อให้ได้มื้อเหนือที่หอมคั่วและกินได้ทุกวัน',
      category: 'ความรู้ครัวเหนือ',
      tags: ['ผักพื้นบ้าน', 'น้ำพริกพะเยา', 'อาหารเหนือ', 'ครัวล้านนา', 'ของฝากพะเยา'],
      highlights: [
        'ผักรสหวานช่วยบาลานซ์ความเผ็ดและกลิ่นคั่วของน้ำพริกเหนือ',
        'ผักลวกควรสะเด็ดน้ำให้ดีเพื่อไม่ให้รสน้ำพริกจาง',
        'การเลือกผักตามฤดูกาลช่วยให้มื้ออาหารสดและมีเรื่องราวของพื้นที่',
      ],
      content: [
        'น้ำพริกพะเยาจะอร่อยขึ้นเมื่อมีผักที่เหมาะสมอยู่ข้างจาน ผักพื้นบ้านไม่ได้เป็นแค่เครื่องเคียง แต่เป็นส่วนที่ทำให้รสเผ็ด เค็ม หอม และขมอ่อนๆ ของอาหารเหนือสมดุลขึ้น',
        'ผักรสหวานอย่างฟักทองลวก ถั่วฝักยาว แตงกวา และกะหล่ำปลี ช่วยลดความเผ็ดและทำให้กลิ่นคั่วของพริกชัดขึ้น ส่วนผักที่มีกลิ่นเฉพาะ เช่น ผักชีลาวหรือผักแพว จะช่วยเพิ่มมิติให้จานอาหาร',
        'ถ้าเลือกผักลวก ควรลวกในน้ำเดือดเร็วๆ แล้วสะเด็ดน้ำให้แห้งก่อนจัดจาน เพราะน้ำส่วนเกินจะทำให้รสน้ำพริกจางและเสียความหอมคั่ว',
        'สำหรับมื้อที่ต้องการความพรีเมียม ให้จัดผักหลายสีคู่กับข้าวเหนียว ไข่ต้ม และน้ำพริกหนึ่งถึงสองชนิด เช่น น้ำพริกตาแดงเหนือกับน้ำพริกลาบเหนือ เพื่อให้มีทั้งรสจัดและกลิ่นเครื่องเทศ',
        'หัวใจของครัวล้านนาคือความพอดี ผักดี น้ำพริกดี และข้าวร้อนๆ สามารถทำให้มื้อธรรมดากลายเป็นมื้อที่มีความอบอุ่นและน่าจดจำได้',
      ],
    },
    en: {
      title: 'Local Vegetables and Northern Thai Chili Paste: Building a Balanced Phayao Meal',
      excerpt:
        'Learn how to pair local vegetables, blanched greens, and fresh sides with Phayao chili paste for an everyday Northern Thai table.',
      category: 'Northern Kitchen',
      tags: ['local vegetables', 'Phayao chili paste', 'Northern Thai food', 'Lanna kitchen', 'Phayao souvenir'],
      highlights: [
        'Naturally sweet vegetables balance heat and roasted aroma.',
        'Blanched vegetables should be well drained so the paste stays fragrant.',
        'Seasonal vegetables make the meal fresher and more connected to place.',
      ],
      content: [
        'Phayao chili paste becomes more expressive when the right vegetables sit beside it. Local greens are not just garnish; they help balance heat, salt, roasted aroma, and gentle bitterness.',
        'Sweet vegetables such as pumpkin, long beans, cucumber, and cabbage soften the chili heat and make roasted notes clearer. Herbs with their own aroma can add another layer to the plate.',
        'When serving blanched vegetables, cook them briefly in boiling water and drain them well. Extra water can dilute the chili paste and flatten its roasted fragrance.',
        'For a more premium Northern meal, arrange vegetables in several colors with sticky rice, boiled eggs, and one or two chili pastes such as Nam Prik Ta Daeng Nuea and Nam Prik Larb Nuea.',
        'The heart of the Lanna table is balance. Good vegetables, good chili paste, and warm rice can turn an ordinary meal into something memorable.',
      ],
    },
    lo: {
      title: 'ຜັກພື້ນບ້ານກັບນ້ຳພິກເໜືອ: ເລືອກແນວໃດໃຫ້ມື້ອາຫານພະເຍົາສົມດຸນ',
      excerpt:
        'ຮູ້ວິທີເລືອກຜັກພື້ນບ້ານ ຜັກລວກ ແລະຜັກສົດໃຫ້ເຂົ້າກັບນ້ຳພິກພະເຍົາ',
      category: 'ຄວາມຮູ້ຄົວເໜືອ',
      tags: ['ຜັກພື້ນບ້ານ', 'ນ້ຳພິກພະເຍົາ', 'ອາຫານເໜືອ', 'ຄົວລ້ານນາ', 'ຂອງຝາກພະເຍົາ'],
      highlights: [
        'ຜັກລົດຫວານຊ່ວຍປັບສົມດຸນຄວາມເຜັດ ແລະກິ່ນຄົ່ວ',
        'ຜັກລວກຄວນສະເດັດນ້ຳໃຫ້ດີ ເພື່ອບໍ່ໃຫ້ລົດນ້ຳພິກຈາງ',
        'ຜັກຕາມລະດູການຊ່ວຍໃຫ້ມື້ອາຫານສົດ ແລະມີເລື່ອງລາວຂອງພື້ນທີ່',
      ],
      content: [
        'ນ້ຳພິກພະເຍົາຈະອອກລົດດີຂຶ້ນເມື່ອມີຜັກທີ່ເໝາະສົມຢູ່ຂ້າງຈານ ຜັກພື້ນບ້ານຊ່ວຍປັບຄວາມເຜັດ ເຄັມ ແລະກິ່ນຄົ່ວໃຫ້ສົມດຸນ',
        'ຜັກລົດຫວານເຊັ່ນ ຟັກທອງລວກ ຖົ່ວຝັກຍາວ ແຕງກວາ ແລະກະລ່ຳປີ ຊ່ວຍຫຼຸດຄວາມເຜັດ ແລະເຮັດໃຫ້ກິ່ນຄົ່ວຊັດ',
        'ຖ້າໃຊ້ຜັກລວກ ຄວນລວກໄວ ແລະສະເດັດນ້ຳໃຫ້ແຫ້ງ ເພາະນ້ຳສ່ວນເກີນຈະເຮັດໃຫ້ນ້ຳພິກຈາງ',
        'ສຳລັບມື້ທີ່ຢາກໃຫ້ດູພຣີມຽມ ໃຫ້ຈັດຜັກຫຼາຍສີຄູ່ກັບເຂົ້າໜຽວ ໄຂ່ຕົ້ມ ແລະນ້ຳພິກໜຶ່ງຫຼືສອງຊະນິດ',
        'ຫົວໃຈຂອງໂຕະອາຫານລ້ານນາຄືຄວາມພໍດີ ຜັກດີ ນ້ຳພິກດີ ແລະເຂົ້າຮ້ອນໆ ເຮັດໃຫ້ມື້ທຳມະດາຈື່ຈຳໄດ້',
      ],
    },
    zh: {
      title: '本地蔬菜与泰北辣椒酱：如何搭配出平衡的帕尧餐桌',
      excerpt:
        '学习如何用本地蔬菜、烫青菜与新鲜配菜搭配帕尧辣椒酱，让日常餐桌拥有泰北层次。',
      category: '泰北厨房知识',
      tags: ['本地蔬菜', '帕尧辣椒酱', '泰北料理', '兰纳厨房', '帕尧伴手礼'],
      highlights: [
        '带自然甜味的蔬菜能平衡辣度与烘烤香。',
        '烫蔬菜要充分沥干，才能保持辣椒酱香气集中。',
        '使用时令蔬菜能让餐桌更清新，也更有地方感。',
      ],
      content: [
        '帕尧辣椒酱与合适的蔬菜搭配时，味道会更完整。本地蔬菜不只是配菜，而是帮助平衡辣、咸、烘烤香与轻微苦味的重要角色。',
        '南瓜、长豆、黄瓜和卷心菜等带甜味的蔬菜，可以柔化辣度，让干辣椒的烘烤香更清楚。带有自身香气的香草则会为餐盘增加层次。',
        '如果使用烫蔬菜，建议快速汆烫后充分沥干。多余水分会稀释辣椒酱，让原本集中的香气变弱。',
        '想让泰北餐桌更精致，可以用多色蔬菜搭配糯米、白煮蛋，以及一到两种辣椒酱，例如泰北红眼辣椒酱与泰北拉布辣椒酱。',
        '兰纳餐桌的核心是平衡。好蔬菜、好辣椒酱与热米饭，就能让日常一餐变得值得记住。',
      ],
    },
  },
  {
    key: 'northern-cooking-methods',
    th: {
      title: 'วิธีทำอาหารเหนือเมนูต่างๆ: เริ่มจากน้ำพริกและเครื่องแกงให้รสล้านนาแท้',
      excerpt:
        'คู่มือวิธีทำอาหารเหนือแบบเข้าใจง่าย ตั้งแต่ผัดเครื่องแกง ทำน้ำพริก จัดผัก ไปจนถึงต่อยอดเป็นลาบเหนือ แกงเหนือ และมื้อข้าวเหนียว',
      category: 'วิธีทำอาหารเหนือ',
      tags: ['วิธีทำอาหารเหนือ', 'สูตรอาหารเหนือ', 'เมนูอาหารเหนือ', 'เครื่องแกงเหนือ', 'น้ำพริกเหนือ'],
      highlights: [
        'อาหารเหนือเริ่มจากการเปิดกลิ่นพริกคั่ว หอม กระเทียม และสมุนไพร',
        'เครื่องแกงเหนือใช้ต่อยอดได้ทั้งผัด แกง หมัก และเมนูขลุกขลิก',
        'การจัดผัก ข้าวเหนียว และน้ำพริกช่วยให้มื้อเหนือครบโดยไม่ซับซ้อน',
      ],
      content: [
        'วิธีทำอาหารเหนือให้อร่อยไม่จำเป็นต้องเริ่มจากสูตรยากเสมอไป หัวใจอยู่ที่การเข้าใจฐานรสของครัวล้านนา ได้แก่ กลิ่นพริกคั่ว หอมแดง กระเทียม มะแขว่น สมุนไพร และความพอดีของรสเค็ม เผ็ด หอม และมันนิดๆ',
        'ถ้าจะทำเมนูผัดหรือแกงเหนือ ให้เริ่มจากผัดเครื่องแกงเหนือกับน้ำมันเล็กน้อยจนกลิ่นเปิด จากนั้นใส่หมู ไก่ เห็ด หรือผักพื้นบ้าน เติมน้ำหรือซุปเล็กน้อย แล้วเคี่ยวสั้นๆ ให้รสซึมเข้าเนื้อ วิธีนี้ใช้ได้กับแกงขลุกขลิก ผัดเครื่องแกง และเมนูวันทำงาน',
        'สำหรับน้ำพริกเหนือ ให้คิดเป็นเมนูหลักของโต๊ะอาหาร ไม่ใช่แค่เครื่องจิ้ม จัดคู่กับข้าวเหนียวร้อน ผักสด ผักลวก ไข่ต้ม และโปรตีนย่าง จะได้มื้อที่ครบทั้งรสชาติและเนื้อสัมผัส',
        'เมนูอย่างลาบเหนือ แกงฮังเล แกงโฮะ ไส้อั่ว และข้าวซอยมีรายละเอียดต่างกัน แต่ใช้หลักเดียวกันคือสร้างกลิ่นก่อนปรุงรส วัตถุดิบแห้งควรถูกคั่วหรือผัดให้หอม ส่วนสมุนไพรสดควรเติมในจังหวะที่ยังรักษากลิ่นได้ดี',
        'ถ้าต้องการเขียนหรือค้นหาวิธีทำอาหารเหนือให้ได้ผล ควรเริ่มจากคำถามที่คนใช้จริง เช่น วิธีทำอาหารเหนือแบบง่ายๆ เครื่องแกงเหนือทำเมนูอะไรได้บ้าง และน้ำพริกเหนือกินกับอะไรดี คำตอบที่เป็นขั้นตอนชัดเจนจะทำให้บทความมีคุณภาพและช่วย SEO ได้มากขึ้น',
      ],
    },
    en: {
      title: 'How to Cook Northern Thai Dishes: Start with Chili Paste and Curry Paste for Real Lanna Flavor',
      excerpt:
        'A practical guide to cooking Northern Thai food, from blooming curry paste and serving chili paste to building larb, curries, and sticky-rice meals.',
      category: 'Northern Cooking Methods',
      tags: ['how to cook Northern Thai food', 'Northern Thai recipes', 'Northern Thai dishes', 'Northern curry paste', 'Northern chili paste'],
      highlights: [
        'Northern cooking begins by opening the aroma of roasted chilies, shallots, garlic, and herbs.',
        'Northern curry paste can become stir-fries, curries, marinades, and moist rustic dishes.',
        'Vegetables, sticky rice, and chili paste make a complete Northern meal without complexity.',
      ],
      content: [
        'Learning how to cook Northern Thai food does not need to begin with the most difficult recipe. The foundation is understanding Lanna flavor: roasted chili aroma, shallots, garlic, ma-khwaen, herbs, and a balanced mix of salt, heat, fragrance, and gentle richness.',
        'For stir-fries or Northern curries, start by frying Northern curry paste in a little oil until fragrant. Add pork, chicken, mushrooms, or local vegetables, then add a small amount of water or stock and simmer briefly until the flavor coats the ingredients. This method works for moist stir-fries, rustic curries, and weeknight meals.',
        'For Northern chili paste, think of it as the center of the table, not only a dip. Serve it with warm sticky rice, fresh vegetables, blanched vegetables, boiled eggs, and grilled protein for a balanced meal with several textures.',
        'Dishes such as Northern larb, hang lay curry, gaeng ho, sai ua, and khao soi have different details, but they share one principle: build aroma before adjusting flavor. Dry ingredients should be roasted or fried until fragrant, while fresh herbs should be added at a moment that preserves their lift.',
        'A useful cooking article should answer real search questions: how to cook easy Northern Thai food, what to make with Northern curry paste, and what to eat with Northern chili paste. Clear steps make the content more useful and stronger for SEO.',
      ],
    },
    lo: {
      title: 'ວິທີເຮັດອາຫານເໜືອເມນູຕ່າງໆ: ເລີ່ມຈາກນ້ຳພິກແລະເຄື່ອງແກງໃຫ້ໄດ້ລົດລ້ານນາ',
      excerpt:
        'ຄູ່ມືວິທີເຮັດອາຫານເໜືອແບບເຂົ້າໃຈງ່າຍ ຕັ້ງແຕ່ຜັດເຄື່ອງແກງ ຈັດນ້ຳພິກ ໄປຫາລາບເໜືອ ແກງ ແລະມື້ເຂົ້າໜຽວ',
      category: 'ວິທີເຮັດອາຫານເໜືອ',
      tags: ['ວິທີເຮັດອາຫານເໜືອ', 'ສູດອາຫານເໜືອ', 'ເມນູອາຫານເໜືອ', 'ເຄື່ອງແກງເໜືອ', 'ນ້ຳພິກເໜືອ'],
      highlights: [
        'ອາຫານເໜືອເລີ່ມຈາກການເປີດກິ່ນພິກຄົ່ວ ຫອມ ກະທຽມ ແລະສະໝຸນໄພ',
        'ເຄື່ອງແກງເໜືອໃຊ້ໄດ້ທັງຜັດ ແກງ ໝັກ ແລະເມນູຂຸກຂິກ',
        'ຜັກ ເຂົ້າໜຽວ ແລະນ້ຳພິກຊ່ວຍໃຫ້ມື້ເໜືອຄົບໄດ້ງ່າຍ',
      ],
      content: [
        'ວິທີເຮັດອາຫານເໜືອໃຫ້ອອກລົດດີບໍ່ຈຳເປັນຕ້ອງເລີ່ມຈາກສູດຍາກ ຫົວໃຈຄືການເຂົ້າໃຈຖານລົດລ້ານນາ ກິ່ນພິກຄົ່ວ ຫອມແດງ ກະທຽມ ໝາກແຂ່ວ ແລະສະໝຸນໄພ',
        'ຖ້າຈະເຮັດເມນູຜັດຫຼືແກງເໜືອ ໃຫ້ເລີ່ມຈາກຜັດເຄື່ອງແກງກັບນ້ຳມັນນ້ອຍໜຶ່ງຈົນຫອມ ແລ້ວໃສ່ໝູ ໄກ່ ເຫັດ ຫຼືຜັກພື້ນບ້ານ ເຕີມນ້ຳນ້ອຍໜຶ່ງແລ້ວຕົ້ມສັ້ນໆ',
        'ສຳລັບນ້ຳພິກເໜືອ ໃຫ້ຄິດວ່າເປັນຈຸດກາງຂອງໂຕະອາຫານ ຈັດຄູ່ກັບເຂົ້າໜຽວຮ້ອນ ຜັກສົດ ຜັກລວກ ໄຂ່ຕົ້ມ ແລະໂປຣຕີນປີ້ງ',
        'ເມນູເຊັ່ນ ລາບເໜືອ ແກງຮັງເລ ແກງໂຮະ ໄສ້ອົ່ວ ແລະເຂົ້າຊອຍ ມີລາຍລະອຽດຕ່າງກັນ ແຕ່ມີຫຼັກດຽວຄືສ້າງກິ່ນກ່ອນປຸງລົດ',
        'ບົດຄວາມວິທີເຮັດອາຫານເໜືອທີ່ດີຄວນຕອບຄຳຖາມຈິງ ເຊັ່ນ ວິທີເຮັດອາຫານເໜືອງ່າຍໆ ເຄື່ອງແກງເໜືອເຮັດເມນູຫຍັງໄດ້ ແລະນ້ຳພິກເໜືອກິນກັບຫຍັງ',
      ],
    },
    zh: {
      title: '泰北菜怎么做：从辣椒酱与咖喱酱开始做出兰纳风味',
      excerpt:
        '实用说明泰北菜做法，从炒香咖喱酱、搭配辣椒酱，到延伸为泰北拉布、咖喱与糯米餐。',
      category: '泰北菜做法',
      tags: ['泰北菜做法', '泰北食谱', '泰北美食菜单', '泰北咖喱酱', '泰北辣椒酱'],
      highlights: [
        '泰北料理先打开烘烤辣椒、红葱、蒜与香草的香气。',
        '泰北咖喱酱可用于热炒、咖喱、腌制与带汤汁的乡土菜。',
        '蔬菜、糯米与辣椒酱能组成简单完整的泰北餐。',
      ],
      content: [
        '学习泰北菜怎么做，不一定要从最复杂的食谱开始。关键是理解兰纳风味基础：烘烤辣椒香、红葱、蒜、马告、香草，以及咸、辣、香和轻微油润感之间的平衡。',
        '做泰北热炒或咖喱时，可以先用少量油把泰北咖喱酱炒香，再加入猪肉、鸡肉、菇类或本地蔬菜，加入少量水或高汤，短时间煮到味道包裹食材。这个方法适合快炒、乡土咖喱与工作日晚餐。',
        '泰北辣椒酱不只是蘸料，也可以成为餐桌中心。搭配热糯米、鲜蔬、烫蔬菜、水煮蛋和烤蛋白质，就能组成有层次且平衡的一餐。',
        '泰北拉布、杭雷咖喱、杂菜咖喱、泰北香肠和清迈咖喱面细节不同，但原则相同：先建立香气，再调整味道。干香料应先烘烤或炒香，新鲜香草则要在保留香气的时机加入。',
        '有用的泰北菜做法文章应回答真实搜索问题：泰北菜怎么简单做、泰北咖喱酱能做什么、泰北辣椒酱配什么好吃。清楚的步骤会让内容更有帮助，也更利于 SEO。',
      ],
    },
  },
  {
    key: 'northern-food-menu-guide',
    th: {
      title: 'เมนูอาหารเหนือยอดนิยม: กินอะไรดีให้ได้รสล้านนาแท้จากพะเยา',
      excerpt:
        'รวมเมนูอาหารเหนือที่คนค้นหาบ่อย พร้อมวิธีจับคู่กับน้ำพริกพะเยา เครื่องแกงเหนือ และผักพื้นบ้านให้มื้ออาหารอร่อยครบ',
      category: 'เมนูอาหารเหนือ',
      tags: ['เมนูอาหารเหนือ', 'อาหารเหนือยอดนิยม', 'น้ำพริกพะเยา', 'เครื่องแกงเหนือ', 'อาหารล้านนา'],
      highlights: [
        'เมนูเหนือที่ดีควรมีทั้งกลิ่นคั่ว เครื่องเทศ และผักสดหรือผักลวก',
        'น้ำพริกเหนือช่วยต่อยอดเป็นจานจิ้ม ผัด แกง และมื้อข้าวเหนียวได้ง่าย',
        'การเลือกเมนูตามโอกาสช่วยให้โต๊ะอาหารล้านนาดูครบและมีคุณภาพ',
      ],
      content: [
        'ถ้าค้นหาว่าเมนูอาหารเหนือกินอะไรดี ให้เริ่มจากกลุ่มรสหลักของครัวล้านนา ได้แก่ น้ำพริก เครื่องแกง ลาบเหนือ แกงฮังเล แกงโฮะ ไส้อั่ว ข้าวซอย และชุดผักพื้นบ้าน เมนูเหล่านี้มีจุดร่วมคือกลิ่นคั่ว เครื่องเทศ และความกลมกล่อมที่กินกับข้าวเหนียวได้ดี',
        'น้ำพริกตาแดงเหนือเหมาะกับมื้อที่อยากได้รสจัด หอมพริกคั่ว และกินง่ายกับผักสด ไข่ต้ม หรือหมูย่าง ส่วนเครื่องแกงเหนือเหมาะสำหรับทำแกง ผัด หรือเมนูขลุกขลิกที่ต้องการกลิ่นสมุนไพรลึก',
        'สำหรับมื้อครอบครัว ควรจัดเมนูให้มีรสและเนื้อสัมผัสหลากหลาย เช่น น้ำพริกหนึ่งชนิด ผักลวกหนึ่งจาน โปรตีนย่างหรือทอด และแกงหนึ่งหม้อ วิธีนี้ทำให้โต๊ะเหนือดูครบโดยไม่ต้องทำหลายอย่างเกินไป',
        'คำสำคัญของเมนูอาหารเหนือคุณภาพคือวัตถุดิบดีและความพอดี รสเผ็ดไม่ควรกลบกลิ่นหอมของหอมแดง กระเทียม พริกแห้ง และมะแขว่น เพราะกลิ่นเหล่านี้คือเอกลักษณ์ของอาหารล้านนา',
        'เมื่อเลือกเมนูอาหารเหนือจากพะเยา ให้มองหาอาหารที่เล่าเรื่องพื้นที่ได้ชัด ทั้งน้ำพริก เครื่องแกง ผักพื้นบ้าน และการคั่วอย่างพิถีพิถัน นี่คือจุดที่ทำให้มื้อธรรมดามีคุณค่าและช่วยให้บทความด้านอาหารเหนือค้นเจอได้ดีขึ้น',
      ],
    },
    en: {
      title: 'Popular Northern Thai Food Menu: What to Eat for Real Lanna Flavor from Phayao',
      excerpt:
        'A search-friendly guide to Northern Thai dishes and how to pair them with Phayao chili paste, curry paste, and local vegetables.',
      category: 'Northern Food Menu',
      tags: ['Northern Thai food menu', 'popular Northern Thai food', 'Phayao chili paste', 'Northern curry paste', 'Lanna food'],
      highlights: [
        'A strong Northern meal balances roasted aroma, spices, and fresh or blanched vegetables.',
        'Northern chili paste can become a dip, stir-fry, curry base, or sticky-rice meal.',
        'Choosing dishes by occasion makes a Lanna table feel complete and high quality.',
      ],
      content: [
        'When people search for what to eat in Northern Thai cuisine, the best starting point is the Lanna flavor family: chili paste, curry paste, Northern larb, hang lay curry, gaeng ho, sai ua, khao soi, and local vegetables. These dishes share roasted aroma, spice depth, and a natural fit with sticky rice.',
        'Nam Prik Ta Daeng Nuea suits a bold meal with roasted chili aroma and fresh vegetables, boiled eggs, or grilled pork. Northern curry paste works beautifully in curries, stir-fries, and moist rustic dishes that need deeper herbal flavor.',
        'For a family table, build variety without overcrowding the meal: one chili paste, one vegetable plate, one grilled or fried protein, and one curry. This creates a complete Northern spread with practical effort.',
        'Quality Northern food depends on good ingredients and balance. Chili heat should not cover shallots, garlic, dried chilies, or ma-khwaen, because those aromas define Lanna cooking.',
        'When choosing Phayao-style Northern food, look for dishes that clearly express place through chili paste, curry paste, local vegetables, and careful roasting. That specificity makes the meal richer and the article more useful for search.',
      ],
    },
    lo: {
      title: 'ເມນູອາຫານເໜືອຍອດນິຍົມ: ກິນຫຍັງດີໃຫ້ໄດ້ລົດລ້ານນາຈາກພະເຍົາ',
      excerpt:
        'ຮວບຮວມເມນູອາຫານເໜືອທີ່ຄົນຄົ້ນຫາບ່ອຍ ພ້ອມວິທີຈັບຄູ່ກັບນ້ຳພິກພະເຍົາ ເຄື່ອງແກງ ແລະຜັກພື້ນບ້ານ',
      category: 'ເມນູອາຫານເໜືອ',
      tags: ['ເມນູອາຫານເໜືອ', 'ອາຫານເໜືອຍອດນິຍົມ', 'ນ້ຳພິກພະເຍົາ', 'ເຄື່ອງແກງເໜືອ', 'ອາຫານລ້ານນາ'],
      highlights: [
        'ມື້ເໜືອທີ່ດີຄວນມີກິ່ນຄົ່ວ ເຄື່ອງເທດ ແລະຜັກສົດຫຼືຜັກລວກ',
        'ນ້ຳພິກເໜືອຕໍ່ຍອດເປັນເຄື່ອງຈິ້ມ ຜັດ ແກງ ແລະມື້ເຂົ້າໜຽວໄດ້',
        'ເລືອກເມນູຕາມໂອກາດຊ່ວຍໃຫ້ໂຕະລ້ານນາຄົບແລະດູດີ',
      ],
      content: [
        'ຖ້າຄົ້ນຫາວ່າອາຫານເໜືອກິນຫຍັງດີ ໃຫ້ເລີ່ມຈາກນ້ຳພິກ ເຄື່ອງແກງ ລາບເໜືອ ແກງຮັງເລ ແກງໂຮະ ໄສ້ອົ່ວ ເຂົ້າຊອຍ ແລະຜັກພື້ນບ້ານ',
        'ນ້ຳພິກຕາແດງເໜືອເໝາະກັບມື້ທີ່ຢາກໄດ້ລົດຈັດ ກິ່ນພິກຄົ່ວ ແລະກິນງ່າຍກັບຜັກ ໄຂ່ຕົ້ມ ຫຼືໝູປີ້ງ',
        'ສຳລັບມື້ຄອບຄົວ ຄວນຈັດໃຫ້ມີນ້ຳພິກໜຶ່ງຊະນິດ ຜັກລວກ ໂປຣຕີນປີ້ງຫຼືທອດ ແລະແກງໜຶ່ງຢ່າງ',
        'ຄຳສຳຄັນຂອງອາຫານເໜືອຄຸນນະພາບຄືວັດຖຸດິບດີ ແລະຄວາມພໍດີ ຄວາມເຜັດບໍ່ຄວນກົບກິ່ນຫອມຂອງພິກແຫ້ງ ກະທຽມ ແລະໝາກແຂ່ວ',
        'ເມື່ອເລືອກເມນູອາຫານເໜືອຈາກພະເຍົາ ໃຫ້ມອງຫາອາຫານທີ່ເລົ່າເລື່ອງພື້ນທີ່ໄດ້ຊັດ ນັ້ນເຮັດໃຫ້ມື້ອາຫານມີຄຸນຄ່າ',
      ],
    },
    zh: {
      title: '泰北美食菜单指南：到帕尧风味里吃什么才有兰纳味',
      excerpt:
        '整理常被搜索的泰北菜，并说明如何搭配帕尧辣椒酱、泰北咖喱酱与本地蔬菜。',
      category: '泰北美食菜单',
      tags: ['泰北美食菜单', '热门泰北料理', '帕尧辣椒酱', '泰北咖喱酱', '兰纳料理'],
      highlights: [
        '好的泰北餐桌应有烘烤香、香料层次与新鲜或烫蔬菜。',
        '泰北辣椒酱能作为蘸酱、热炒、咖喱底与糯米餐核心。',
        '按场合选择菜色能让兰纳餐桌完整而有质感。',
      ],
      content: [
        '搜索泰北料理吃什么时，可以从兰纳风味家族开始：辣椒酱、咖喱酱、泰北拉布、杭雷咖喱、杂菜咖喱、泰北香肠、清迈咖喱面与本地蔬菜。这些菜共同拥有烘烤香、香料深度，并适合搭配糯米。',
        '泰北红眼辣椒酱适合需要明显辣香与烘烤气息的一餐，可配鲜蔬、水煮蛋或烤猪肉。泰北咖喱酱则适合做咖喱、热炒与带汤汁的乡土菜。',
        '家庭餐桌可以用一个辣椒酱、一盘蔬菜、一份烤或炸蛋白质，再加一道咖喱来建立丰富度，不必准备过多菜色。',
        '高品质泰北料理依靠好食材与平衡。辣味不应盖过红葱、蒜、干辣椒与马告，因为这些香气才是兰纳料理的识别点。',
        '选择帕尧风格泰北菜时，留意它是否通过辣椒酱、咖喱酱、本地蔬菜与细致烘烤表达地方感。这样的内容对读者更有帮助，也更适合搜索。',
      ],
    },
  },
  {
    key: 'northern-travel-food-route',
    th: {
      title: 'สถานที่ท่องเที่ยวภาคเหนือสายกิน: เที่ยวพะเยาแล้วซื้ออะไรเป็นของฝาก',
      excerpt:
        'แนะนำไอเดียเที่ยวเหนือแบบสายอาหาร ตั้งแต่กว๊านพะเยา ตลาดท้องถิ่น ไปจนถึงของฝากน้ำพริกและเครื่องแกงเหนือที่พกกลับบ้านง่าย',
      category: 'สถานที่ท่องเที่ยวเหนือ',
      tags: ['สถานที่ท่องเที่ยวภาคเหนือ', 'เที่ยวพะเยา', 'ของฝากพะเยา', 'น้ำพริกเหนือ', 'ตลาดท้องถิ่น'],
      highlights: [
        'ทริปเหนือสายกินควรเชื่อมสถานที่ท่องเที่ยวกับรสชาติท้องถิ่น',
        'พะเยาเหมาะกับการซื้อของฝากที่เล่าเรื่องครัวล้านนาได้ชัด',
        'น้ำพริกและเครื่องแกงเป็นของฝากที่ใช้ง่าย เก็บง่าย และเข้ากับหลายเมนู',
      ],
      content: [
        'การเที่ยวภาคเหนือจะน่าจดจำขึ้นเมื่อไม่ได้ดูแค่สถานที่ แต่ได้ชิมรสชาติของพื้นที่ไปพร้อมกัน สำหรับพะเยา จุดหมายอย่างกว๊านพะเยา วัดริมกว๊าน ถนนคนเดิน และตลาดท้องถิ่นช่วยให้เห็นทั้งวิถีชีวิตและวัตถุดิบของครัวล้านนา',
        'นักท่องเที่ยวสายกินมักมองหาของฝากที่กินได้จริงและมีเรื่องราว น้ำพริกเหนือ น้ำพริกพะเยา เครื่องแกงเหนือ และเครื่องเทศอย่างมะแขว่นจึงเหมาะมาก เพราะพกกลับบ้านง่ายและต่อยอดเป็นมื้ออาหารได้หลายแบบ',
        'ถ้าอยากให้ทริปมีรสชาติครบ ให้แวะตลาดเช้าเพื่อดูผักพื้นบ้าน พริกแห้ง หอมแดง กระเทียม และอาหารปรุงสด จากนั้นเลือกของฝากที่สะท้อนกลิ่นคั่วและเครื่องเทศของพื้นที่',
        'ของฝากที่ดีไม่ควรมีแค่หน้าตาสวย แต่ต้องใช้ได้จริงในครัว เช่น นำไปกินกับข้าวเหนียว ทำแกงขลุกขลิก ผัดกับหมูหรือเห็ด หรือจัดคู่กับผักลวกในมื้อเร็ว',
        'เมื่อบทความท่องเที่ยวเหนือเชื่อมคำค้นอย่างเที่ยวพะเยา ของฝากพะเยา น้ำพริกเหนือ และอาหารล้านนาเข้าด้วยกัน ผู้อ่านจะได้ทั้งแรงบันดาลใจเดินทางและเหตุผลในการเลือกซื้อของฝากคุณภาพ',
      ],
    },
    en: {
      title: 'Northern Thailand Food Travel: What to Buy as a Souvenir from Phayao',
      excerpt:
        'A food-focused Northern Thailand travel guide linking Kwan Phayao, local markets, chili paste, and curry paste souvenirs.',
      category: 'Northern Travel',
      tags: ['Northern Thailand travel', 'Phayao travel', 'Phayao souvenir', 'Northern chili paste', 'local market'],
      highlights: [
        'A memorable Northern trip connects attractions with local flavor.',
        'Phayao is well suited for souvenirs that tell a Lanna kitchen story.',
        'Chili paste and curry paste are practical, easy-to-use food souvenirs.',
      ],
      content: [
        'Travel in Northern Thailand becomes more memorable when places and flavors are experienced together. In Phayao, Kwan Phayao, lakeside temples, walking streets, and local markets reveal both daily life and the ingredients behind Lanna cooking.',
        'Food-minded travelers often look for souvenirs that are useful and meaningful. Northern chili paste, Phayao chili paste, Northern curry paste, and spices such as ma-khwaen work well because they travel easily and can become many home meals.',
        'For a richer trip, visit a morning market to see local vegetables, dried chilies, shallots, garlic, and prepared foods. Then choose souvenirs that express the roasted aroma and spice profile of the region.',
        'A good souvenir should be more than attractive packaging. It should be useful with sticky rice, rustic curries, pork or mushroom stir-fries, and quick meals with blanched vegetables.',
        'When a Northern travel article connects search terms such as Phayao travel, Phayao souvenir, Northern chili paste, and Lanna food, readers get both trip inspiration and a clear reason to choose quality local food gifts.',
      ],
    },
    lo: {
      title: 'ສະຖານທີ່ທ່ອງທ່ຽວເໜືອສາຍກິນ: ໄປພະເຍົາແລ້ວຊື້ຫຍັງເປັນຂອງຝາກ',
      excerpt:
        'ໄອເດຍທ່ຽວເໜືອສາຍອາຫານ ຈາກກວ໊ານພະເຍົາ ຕະຫຼາດທ້ອງຖິ່ນ ໄປຫາຂອງຝາກນ້ຳພິກແລະເຄື່ອງແກງ',
      category: 'ສະຖານທີ່ທ່ອງທ່ຽວເໜືອ',
      tags: ['ທ່ຽວພາກເໜືອ', 'ທ່ຽວພະເຍົາ', 'ຂອງຝາກພະເຍົາ', 'ນ້ຳພິກເໜືອ', 'ຕະຫຼາດທ້ອງຖິ່ນ'],
      highlights: [
        'ທຣິບເໜືອສາຍກິນຄວນເຊື່ອມສະຖານທີ່ກັບລົດຊາດທ້ອງຖິ່ນ',
        'ພະເຍົາເໝາະກັບຂອງຝາກທີ່ເລົ່າເລື່ອງຄົວລ້ານນາ',
        'ນ້ຳພິກແລະເຄື່ອງແກງເປັນຂອງຝາກທີ່ໃຊ້ງ່າຍ ແລະເກັບງ່າຍ',
      ],
      content: [
        'ການທ່ຽວພາກເໜືອຈະນ່າຈື່ຈຳຂຶ້ນເມື່ອໄດ້ຊິມລົດຊາດຂອງພື້ນທີ່ໄປພ້ອມກັນ ສຳລັບພະເຍົາ ກວ໊ານພະເຍົາ ວັດຮິມນ້ຳ ຖະໜົນຄົນເດີນ ແລະຕະຫຼາດທ້ອງຖິ່ນຊ່ວຍໃຫ້ເຫັນຄົວລ້ານນາ',
        'ນັກທ່ອງທ່ຽວສາຍກິນມັກຊອກຫາຂອງຝາກທີ່ກິນໄດ້ຈິງ ນ້ຳພິກເໜືອ ເຄື່ອງແກງເໜືອ ແລະໝາກແຂ່ວຈຶ່ງເໝາະຫຼາຍ',
        'ຖ້າຢາກໃຫ້ທຣິບມີລົດຊາດຄົບ ໃຫ້ແວ່ຕະຫຼາດເຊົ້າເພື່ອເບິ່ງຜັກພື້ນບ້ານ ພິກແຫ້ງ ຫອມແດງ ແລະອາຫານປຸງສົດ',
        'ຂອງຝາກທີ່ດີຄວນໃຊ້ໄດ້ຈິງໃນຄົວ ເຊັ່ນ ກິນກັບເຂົ້າໜຽວ ເຮັດແກງ ຜັດກັບໝູຫຼືເຫັດ ຫຼືຈັດຄູ່ຜັກລວກ',
        'ເມື່ອບົດຄວາມທ່ຽວເໜືອເຊື່ອມຄຳຄົ້ນຫາຢ່າງທ່ຽວພະເຍົາ ຂອງຝາກພະເຍົາ ນ້ຳພິກເໜືອ ແລະອາຫານລ້ານນາ ຜູ້ອ່ານຈະໄດ້ແຮງບັນດານໃຈແລະເຫດຜົນໃນການເລືອກຊື້',
      ],
    },
    zh: {
      title: '泰北美食旅行：到帕尧旅游适合买什么伴手礼',
      excerpt:
        '从帕尧湖、本地市场到泰北辣椒酱与咖喱酱伴手礼，规划一条有风味的泰北旅行路线。',
      category: '泰北旅游',
      tags: ['泰北旅游', '帕尧旅游', '帕尧伴手礼', '泰北辣椒酱', '本地市场'],
      highlights: [
        '有记忆点的泰北旅行会把景点与地方味道连接起来。',
        '帕尧适合选择能表达兰纳厨房故事的伴手礼。',
        '辣椒酱与咖喱酱实用、容易携带，也适合多种料理。',
      ],
      content: [
        '泰北旅行若同时体验地点与味道，会更值得记住。在帕尧，帕尧湖、湖边寺庙、步行街与本地市场能让人看见生活方式，也看见兰纳厨房的食材来源。',
        '喜欢美食的旅行者常寻找真正能使用、又有故事的伴手礼。泰北辣椒酱、帕尧辣椒酱、泰北咖喱酱与马告等香料都很适合，因为容易携带，也能回家做出多种餐食。',
        '想让行程更有味道，可以早上逛市场，看本地蔬菜、干辣椒、红葱、蒜和现做熟食，再选择能代表当地烘烤香与香料层次的伴手礼。',
        '好的伴手礼不只是包装漂亮，也应能在厨房里派上用场，例如配糯米、做乡土咖喱、与猪肉或菇类快炒，或搭配烫蔬菜完成一餐。',
        '当泰北旅游文章把帕尧旅游、帕尧伴手礼、泰北辣椒酱与兰纳美食等搜索词自然连接起来，读者会得到旅行灵感，也更容易理解为什么要选择优质地方食品。',
      ],
    },
  },
  {
    key: 'northern-herbs-guide',
    th: {
      title: 'สมุนไพรเหนือในครัวล้านนา: รู้จักมะแขว่น ผักแพว ตะไคร้ และกลิ่นหอมของอาหารพะเยา',
      excerpt:
        'คู่มือสมุนไพรเหนือที่ช่วยสร้างกลิ่นรสให้อาหารล้านนา พร้อมวิธีใช้กับน้ำพริก แกง และเมนูพื้นบ้านให้หอมลึกอย่างพอดี',
      category: 'สมุนไพรเหนือ',
      tags: ['สมุนไพรเหนือ', 'มะแขว่น', 'ผักแพว', 'อาหารพะเยา', 'ครัวล้านนา'],
      highlights: [
        'สมุนไพรเหนือสร้างเอกลักษณ์ผ่านกลิ่นซ่า กลิ่นคั่ว และกลิ่นสด',
        'มะแขว่นควรใช้พอดีเพื่อเสริม ไม่ใช่กลบกลิ่นพริกคั่ว',
        'สมุนไพรสดช่วยให้เมนูน้ำพริกและแกงเหนือมีมิติขึ้น',
      ],
      content: [
        'สมุนไพรเหนือคือหัวใจที่ทำให้อาหารล้านนาแตกต่างจากอาหารภาคอื่น กลิ่นของมะแขว่น ผักแพว ตะไคร้ ข่า ใบมะกรูด หอมแดง และกระเทียม ช่วยสร้างรสที่ทั้งลึก สด และอบอุ่นในจานเดียว',
        'มะแขว่นเป็นเครื่องเทศที่หลายคนเชื่อมโยงกับลาบเหนือและน้ำพริกลาบ กลิ่นซ่าอ่อนๆ ช่วยให้รสเผ็ดมีมิติ แต่ต้องใช้ในปริมาณพอดีเพื่อไม่ให้กลบกลิ่นพริกคั่วและกระเทียม',
        'ผักแพวและสมุนไพรสดเหมาะกับเมนูที่ต้องการความสดปลายลิ้น เช่น ลาบ น้ำพริก หรือจานผักเคียง ส่วนตะไคร้ ข่า และใบมะกรูดช่วยเพิ่มกลิ่นฐานให้แกงและผัด',
        'เมื่อต้องการทำอาหารเหนือให้อร่อยแบบมืออาชีพ ให้คิดเรื่องชั้นกลิ่นก่อนรสเผ็ด เริ่มจากกลิ่นคั่วของพริกและหอม ต่อด้วยกลิ่นเครื่องเทศแห้ง แล้วปิดด้วยสมุนไพรสดตามจาน',
        'บทความสมุนไพรเหนือที่ดีควรตอบทั้งคนอยากทำอาหารและคนค้นหาวัตถุดิบ เช่น สมุนไพรเหนือมีอะไรบ้าง มะแขว่นใช้ทำอะไร และน้ำพริกเหนือควรกินกับผักอะไร คำตอบเหล่านี้ช่วยให้เนื้อหามีคุณภาพและติด SEO ได้ดีกว่าเนื้อหาสั้นทั่วไป',
      ],
    },
    en: {
      title: 'Northern Thai Herbs in a Lanna Kitchen: Ma-Khwaen, Vietnamese Coriander, Lemongrass, and Phayao Aroma',
      excerpt:
        'A practical guide to Northern Thai herbs and how they shape chili paste, curry, and local dishes with balanced aroma.',
      category: 'Northern Herbs',
      tags: ['Northern Thai herbs', 'ma-khwaen', 'Vietnamese coriander', 'Phayao food', 'Lanna kitchen'],
      highlights: [
        'Northern herbs create identity through tingling spice, roasted aroma, and freshness.',
        'Ma-khwaen should support roasted chili instead of overpowering it.',
        'Fresh herbs add dimension to chili paste and Northern curries.',
      ],
      content: [
        'Northern Thai herbs are a core reason Lanna food tastes different from other regional cuisines. Ma-khwaen, Vietnamese coriander, lemongrass, galangal, kaffir lime leaf, shallots, and garlic create flavors that feel deep, fresh, and warm at the same time.',
        'Ma-khwaen is closely associated with Northern larb and Nam Prik Larb. Its gentle tingling aroma gives chili heat more dimension, but it should be used with restraint so roasted chilies and garlic still remain clear.',
        'Vietnamese coriander and fresh herbs suit dishes that need a bright finish, such as larb, chili paste, or vegetable plates. Lemongrass, galangal, and kaffir lime leaf build the aromatic base for curries and stir-fries.',
        'To cook Northern food with a professional feel, think in aroma layers before thinking only about heat: roasted chilies and shallots first, dried spices next, then fresh herbs at the end.',
        'A useful Northern herb article should answer real search questions: what herbs are used in Northern Thai food, what ma-khwaen is used for, and which vegetables pair with Northern chili paste. These answers make the content more helpful and stronger for SEO.',
      ],
    },
    lo: {
      title: 'ສະໝຸນໄພເໜືອໃນຄົວລ້ານນາ: ຮູ້ຈັກໝາກແຂ່ວ ຜັກແພວ ຕະໄຄ້ ແລະກິ່ນຫອມອາຫານພະເຍົາ',
      excerpt:
        'ຄູ່ມືສະໝຸນໄພເໜືອທີ່ຊ່ວຍສ້າງກິ່ນລົດໃຫ້ອາຫານລ້ານນາ ພ້ອມວິທີໃຊ້ກັບນ້ຳພິກ ແກງ ແລະເມນູພື້ນບ້ານ',
      category: 'ສະໝຸນໄພເໜືອ',
      tags: ['ສະໝຸນໄພເໜືອ', 'ໝາກແຂ່ວ', 'ຜັກແພວ', 'ອາຫານພະເຍົາ', 'ຄົວລ້ານນາ'],
      highlights: [
        'ສະໝຸນໄພເໜືອສ້າງເອກະລັກຜ່ານກິ່ນຊ່າ ກິ່ນຄົ່ວ ແລະກິ່ນສົດ',
        'ໝາກແຂ່ວຄວນໃຊ້ພໍດີເພື່ອເສີມກິ່ນພິກຄົ່ວ',
        'ສະໝຸນໄພສົດຊ່ວຍໃຫ້ນ້ຳພິກແລະແກງເໜືອມີມິຕິ',
      ],
      content: [
        'ສະໝຸນໄພເໜືອເປັນຫົວໃຈທີ່ເຮັດໃຫ້ອາຫານລ້ານນາແຕກຕ່າງ ກິ່ນຂອງໝາກແຂ່ວ ຜັກແພວ ຕະໄຄ້ ຂ່າ ໃບມະກູດ ຫອມແດງ ແລະກະທຽມ ຊ່ວຍສ້າງລົດລຶກແລະສົດ',
        'ໝາກແຂ່ວມັກຢູ່ໃນລາບເໜືອແລະນ້ຳພິກລາບ ກິ່ນຊ່າອ່ອນໆ ຊ່ວຍໃຫ້ຄວາມເຜັດມີມິຕິ ແຕ່ຄວນໃຊ້ພໍດີ',
        'ຜັກແພວແລະສະໝຸນໄພສົດເໝາະກັບລາບ ນ້ຳພິກ ຫຼືຈານຜັກຄຽງ ສ່ວນຕະໄຄ້ ຂ່າ ແລະໃບມະກູດຊ່ວຍສ້າງກິ່ນຖານໃຫ້ແກງ',
        'ຖ້າຢາກເຮັດອາຫານເໜືອໃຫ້ດີ ໃຫ້ຄິດເລື່ອງຊັ້ນກິ່ນກ່ອນຄວາມເຜັດ ເລີ່ມຈາກກິ່ນຄົ່ວ ຕາມດ້ວຍເຄື່ອງເທດແຫ້ງ ແລະປິດດ້ວຍຜັກສົດ',
        'ບົດຄວາມສະໝຸນໄພເໜືອທີ່ດີຄວນຕອບຄຳຖາມຈິງ ເຊັ່ນ ສະໝຸນໄພເໜືອມີຫຍັງແດ່ ໝາກແຂ່ວໃຊ້ເຮັດຫຍັງ ແລະນ້ຳພິກເໜືອກິນກັບຜັກຫຍັງ',
      ],
    },
    zh: {
      title: '兰纳厨房里的泰北香草：认识马告、越南香菜、香茅与帕尧料理香气',
      excerpt:
        '实用介绍泰北香草如何为辣椒酱、咖喱与地方菜建立平衡而深邃的香气。',
      category: '泰北香草',
      tags: ['泰北香草', '马告', '越南香菜', '帕尧料理', '兰纳厨房'],
      highlights: [
        '泰北香草通过微麻香料、烘烤香与清新草本建立识别度。',
        '马告应辅助烘烤辣椒，而不是压过其他香气。',
        '新鲜香草能让辣椒酱与泰北咖喱更有层次。',
      ],
      content: [
        '泰北香草是兰纳料理不同于其他地区料理的重要原因。马告、越南香菜、香茅、南姜、柠檬叶、红葱和蒜，共同创造出深邃、清新又温暖的味道。',
        '马告常与泰北拉布和拉布辣椒酱联系在一起。它轻微的麻香能让辣味更有层次，但使用时必须克制，才能保留烘烤辣椒和蒜香的清晰度。',
        '越南香菜和新鲜香草适合需要明亮收尾的菜，例如拉布、辣椒酱或蔬菜配盘。香茅、南姜与柠檬叶则为咖喱和热炒建立底层香气。',
        '想把泰北菜做得更专业，先思考香气层次，再思考辣度：先是辣椒与红葱的烘烤香，再是干香料，最后以新鲜香草收尾。',
        '有价值的泰北香草文章应回答真实搜索问题：泰北料理用哪些香草、马告用来做什么、泰北辣椒酱适合配什么蔬菜。这样的内容更有帮助，也更利于 SEO。',
      ],
    },
  },
  {
    key: 'local-vegetables-northern-list',
    th: {
      title: 'ผักพื้นบ้านภาคเหนือมีอะไรบ้าง: ผักกินกับน้ำพริกเหนือที่ควรรู้จัก',
      excerpt:
        'รวมผักพื้นบ้านภาคเหนือที่เหมาะกับน้ำพริกพะเยา ทั้งผักสด ผักลวก และผักตามฤดูกาล พร้อมวิธีเลือกให้มื้ออาหารอร่อยและดีต่อสุขภาพ',
      category: 'ผักพื้นบ้าน',
      tags: ['ผักพื้นบ้านภาคเหนือ', 'ผักกินกับน้ำพริก', 'น้ำพริกเหนือ', 'อาหารเหนือเพื่อสุขภาพ', 'ผักตามฤดูกาล'],
      highlights: [
        'ผักพื้นบ้านช่วยบาลานซ์รสเผ็ด เค็ม และกลิ่นคั่วของน้ำพริก',
        'ควรเลือกผักหลายรส ทั้งหวาน ขมอ่อน ฝาดนิด และหอมสด',
        'ผักตามฤดูกาลทำให้มื้อเหนือสดขึ้นและมีคุณค่าทางพื้นที่',
      ],
      content: [
        'ผักพื้นบ้านภาคเหนือมีบทบาทมากกว่าการเป็นเครื่องเคียง เพราะช่วยทำให้น้ำพริกเหนือกินอร่อยขึ้นและสมดุลขึ้น ผักที่คนมักใช้คู่กับน้ำพริกมีทั้งแตงกวา ถั่วฝักยาว กะหล่ำปลี ฟักทองลวก มะเขือเปราะ ผักกาด ผักชีลาว ผักแพว และผักตามฤดูกาลของท้องถิ่น',
        'ถ้าอยากจัดจานให้กินง่าย ให้เลือกผักอย่างน้อยสามกลุ่ม ได้แก่ ผักรสหวานเพื่อลดความเผ็ด ผักกลิ่นสดเพื่อเพิ่มความหอม และผักรสขมหรือฝาดอ่อนเพื่อทำให้รสท้ายไม่เลี่ยน',
        'ผักลวกควรลวกสั้นในน้ำเดือดแล้วสะเด็ดน้ำให้แห้ง การปล่อยให้น้ำเกาะมากเกินไปจะทำให้น้ำพริกจางและกลิ่นคั่วลดลง ส่วนผักสดควรล้างให้สะอาดและแช่เย็นเล็กน้อยก่อนเสิร์ฟเพื่อความกรอบ',
        'สำหรับน้ำพริกพะเยารสเข้ม ผักพื้นบ้านจะช่วยให้กินได้ต่อเนื่อง ไม่หนักเกินไป และเหมาะกับคนที่อยากได้มื้ออาหารเหนือเพื่อสุขภาพโดยยังมีรสชาติชัด',
        'คำค้นอย่างผักพื้นบ้านภาคเหนือ ผักกินกับน้ำพริกเหนือ และอาหารเหนือเพื่อสุขภาพควรอยู่ในบทความอย่างเป็นธรรมชาติ พร้อมคำตอบที่ใช้งานได้จริง เพราะผู้อ่านต้องการนำไปจัดมื้ออาหารได้ทันที',
      ],
    },
    en: {
      title: 'Northern Thai Local Vegetables: What to Serve with Northern Chili Paste',
      excerpt:
        'A practical list of local vegetables for Phayao chili paste, including fresh, blanched, and seasonal options for a balanced meal.',
      category: 'Local Vegetables',
      tags: ['Northern Thai local vegetables', 'vegetables with chili paste', 'Northern chili paste', 'healthy Northern Thai food', 'seasonal vegetables'],
      highlights: [
        'Local vegetables balance heat, salt, and roasted aroma.',
        'Choose several flavor types: sweet, gently bitter, lightly astringent, and fresh.',
        'Seasonal vegetables make a Northern meal fresher and more rooted in place.',
      ],
      content: [
        'Northern Thai local vegetables are more than side dishes. They make Northern chili paste easier to enjoy and more balanced. Common pairings include cucumber, long beans, cabbage, blanched pumpkin, Thai eggplant, mustard greens, dill, Vietnamese coriander, and seasonal local greens.',
        'For an easy plate, choose at least three groups: sweet vegetables to soften heat, fresh aromatic herbs for lift, and gently bitter or lightly astringent vegetables to keep the finish clean.',
        'Blanched vegetables should be cooked briefly in boiling water and drained well. Too much surface water dilutes chili paste and weakens roasted aroma. Fresh vegetables should be clean and lightly chilled for crispness.',
        'With bold Phayao chili paste, local vegetables help the meal feel lighter, more continuous, and suitable for people who want healthier Northern Thai food without losing strong flavor.',
        'Search terms such as Northern Thai local vegetables, vegetables with Northern chili paste, and healthy Northern Thai food should appear naturally inside useful answers. Readers want guidance they can apply to a real meal immediately.',
      ],
    },
    lo: {
      title: 'ຜັກພື້ນບ້ານພາກເໜືອມີຫຍັງແດ່: ຜັກກິນກັບນ້ຳພິກເໜືອທີ່ຄວນຮູ້ຈັກ',
      excerpt:
        'ຮວບຮວມຜັກພື້ນບ້ານພາກເໜືອທີ່ເໝາະກັບນ້ຳພິກພະເຍົາ ທັງຜັກສົດ ຜັກລວກ ແລະຜັກຕາມລະດູການ',
      category: 'ຜັກພື້ນບ້ານ',
      tags: ['ຜັກພື້ນບ້ານພາກເໜືອ', 'ຜັກກິນກັບນ້ຳພິກ', 'ນ້ຳພິກເໜືອ', 'ອາຫານເໜືອເພື່ອສຸຂະພາບ', 'ຜັກຕາມລະດູການ'],
      highlights: [
        'ຜັກພື້ນບ້ານຊ່ວຍປັບລົດເຜັດ ເຄັມ ແລະກິ່ນຄົ່ວຂອງນ້ຳພິກ',
        'ຄວນເລືອກຜັກຫຼາຍລົດ ທັງຫວານ ຂົມອ່ອນ ຝາດນ້ອຍ ແລະຫອມສົດ',
        'ຜັກຕາມລະດູການເຮັດໃຫ້ມື້ເໜືອສົດ ແລະມີຄຸນຄ່າທ້ອງຖິ່ນ',
      ],
      content: [
        'ຜັກພື້ນບ້ານພາກເໜືອບໍ່ແມ່ນແຄ່ເຄື່ອງຄຽງ ແຕ່ຊ່ວຍໃຫ້ນ້ຳພິກເໜືອກິນອົບອຸ່ນແລະສົມດຸນ ຜັກທີ່ມັກໃຊ້ມີແຕງກວາ ຖົ່ວຝັກຍາວ ກະລ່ຳປີ ຟັກທອງລວກ ໝາກເຂືອ ຜັກກາດ ຜັກຊີລາວ ຜັກແພວ ແລະຜັກຕາມລະດູ',
        'ຖ້າຢາກຈັດຈານໃຫ້ກິນງ່າຍ ໃຫ້ເລືອກຜັກຢ່າງນ້ອຍສາມກຸ່ມ ຄື ຜັກລົດຫວານ ຜັກກິ່ນສົດ ແລະຜັກຂົມອ່ອນຫຼືຝາດນ້ອຍ',
        'ຜັກລວກຄວນລວກສັ້ນໆ ໃນນ້ຳເດືອດ ແລະສະເດັດນ້ຳໃຫ້ແຫ້ງ ນ້ຳທີ່ເກາະຫຼາຍເກີນໄປຈະເຮັດໃຫ້ນ້ຳພິກຈາງ',
        'ສຳລັບນ້ຳພິກພະເຍົາລົດເຂັ້ມ ຜັກພື້ນບ້ານຊ່ວຍໃຫ້ກິນໄດ້ຕໍ່ເນື່ອງ ບໍ່ໜັກເກີນໄປ ແລະເໝາະກັບມື້ອາຫານເໜືອເພື່ອສຸຂະພາບ',
        'ຄຳຄົ້ນຫາຢ່າງຜັກພື້ນບ້ານພາກເໜືອ ຜັກກິນກັບນ້ຳພິກເໜືອ ແລະອາຫານເໜືອເພື່ອສຸຂະພາບ ຄວນຢູ່ໃນບົດຄວາມຢ່າງທຳມະຊາດ',
      ],
    },
    zh: {
      title: '泰北本地蔬菜有哪些：适合搭配泰北辣椒酱的蔬菜指南',
      excerpt:
        '整理适合帕尧辣椒酱的泰北本地蔬菜，包括鲜蔬、烫蔬菜与时令蔬菜，让餐桌更平衡。',
      category: '本地蔬菜',
      tags: ['泰北本地蔬菜', '辣椒酱配菜', '泰北辣椒酱', '健康泰北料理', '时令蔬菜'],
      highlights: [
        '本地蔬菜能平衡辣度、咸味与烘烤香。',
        '应选择多种味型，包括甜、微苦、轻微涩感与清新香气。',
        '时令蔬菜让泰北餐桌更清新，也更有地方价值。',
      ],
      content: [
        '泰北本地蔬菜不只是配菜，它们能让泰北辣椒酱更好入口、更平衡。常见搭配包括黄瓜、长豆、卷心菜、烫南瓜、泰国小茄子、芥菜、莳萝、越南香菜，以及当地时令蔬菜。',
        '想让餐盘容易入口，可以至少选择三类蔬菜：带甜味的蔬菜用来柔化辣度，带新鲜香气的草本用来提亮，微苦或轻微涩感的蔬菜则让尾韵更干净。',
        '烫蔬菜应在沸水中短时间处理，并充分沥干。表面水分过多会稀释辣椒酱，削弱烘烤香。鲜蔬则应清洗干净并稍微冷藏，让口感更脆。',
        '搭配味道浓郁的帕尧辣椒酱时，本地蔬菜能让整餐更轻盈、能持续吃，也适合想要健康泰北料理但仍重视味道的人。',
        '泰北本地蔬菜、泰北辣椒酱配菜、健康泰北料理等搜索词，应自然出现在真正有用的答案里。读者需要的是可以马上拿去安排一餐的具体建议。',
      ],
    },
  },
  {
    key: 'northern-curry-base',
    th: {
      title: 'พื้นฐานเครื่องแกงเหนือ: ทำไมกลิ่นคั่วจึงเป็นหัวใจของอาหารล้านนา',
      excerpt:
        'อธิบายพื้นฐานเครื่องแกงเหนือจากพริกแห้ง หอม กระเทียม และสมุนไพร เพื่อเข้าใจรสชาติของน้ำพริกแกงเหนือจากพะเยา',
      category: 'เทคนิคทำอาหาร',
      tags: ['เครื่องแกงเหนือ', 'น้ำพริกแกงเหนือ', 'อาหารล้านนา', 'พะเยา', 'พริกแห้งคั่ว'],
      highlights: [
        'เครื่องแกงเหนือเริ่มจากการคั่ววัตถุดิบให้หอมก่อนตำ',
        'พริกแห้งให้ทั้งสี ความเผ็ด และกลิ่นคั่วที่เป็นเอกลักษณ์',
        'เครื่องแกงที่ดีควรใช้ได้ทั้งแกง ผัด และหมักอาหาร',
      ],
      content: [
        'เครื่องแกงเหนือมีความแตกต่างจากเครื่องแกงหลายภูมิภาค เพราะให้ความสำคัญกับกลิ่นคั่วและความลึกของสมุนไพร วัตถุดิบหลักอย่างพริกแห้ง หอมแดง กระเทียม และรากผักชีต้องถูกจัดการอย่างใจเย็น',
        'การคั่วช่วยให้น้ำมันหอมระเหยในวัตถุดิบเปิดตัว กลิ่นจะชัดขึ้นและมีความนวลกว่าเมื่อเทียบกับการนำไปตำสดทันที',
        'น้ำพริกแกงเหนือจากพะเยาควรมีรสที่แน่นพอสำหรับทำแกง แต่ไม่เค็มจัดจนใช้ยาก เมื่อนำไปผัดกับน้ำมันเล็กน้อย กลิ่นสมุนไพรจะเปิดขึ้นและเป็นฐานของจานอาหารได้ดี',
        'ถ้าต้องการทำอาหารเร็ว สามารถใช้เครื่องแกงเหนือกับหมู ไก่ เห็ด หรือผักพื้นบ้าน แล้วเติมน้ำเล็กน้อยเพื่อทำเป็นผัดฉ่ำหรือแกงขลุกขลิก',
        'เมื่อเข้าใจฐานเครื่องแกงเหนือ เราจะเห็นว่าน้ำพริกไม่ได้เป็นแค่เครื่องจิ้ม แต่เป็นหัวใจของครัวล้านนาที่ต่อยอดได้หลายเมนู',
      ],
    },
    en: {
      title: 'Northern Curry Paste Basics: Why Roasted Aroma Defines Lanna Cooking',
      excerpt:
        'A guide to dried chilies, shallots, garlic, and herbs behind Northern Thai curry paste from Phayao.',
      category: 'Cooking Technique',
      tags: ['Northern curry paste', 'Nam Prik Kaeng Nuea', 'Lanna food', 'Phayao', 'roasted dried chili'],
      highlights: [
        'Northern curry paste begins by roasting aromatics before grinding.',
        'Dried chilies provide color, heat, and the signature roasted scent.',
        'A good paste should work in curries, stir-fries, and marinades.',
      ],
      content: [
        'Northern Thai curry paste differs from many regional pastes because it values roasted aroma and herbal depth. Dried chilies, shallots, garlic, and coriander root need patient handling.',
        'Roasting opens the aromatic oils inside the ingredients. The scent becomes clearer and rounder than when everything is ground raw.',
        'A Phayao-style Northern curry paste should be strong enough for curry but not so salty that it becomes hard to use. When fried gently in a little oil, its herbs bloom and become a reliable base for cooking.',
        'For quick meals, use the paste with pork, chicken, mushrooms, or local vegetables. Add a little water for a moist stir-fry or a rustic Northern curry.',
        'Once you understand the base of Northern curry paste, chili paste becomes more than a dip. It becomes the working heart of a Lanna kitchen.',
      ],
    },
    lo: {
      title: 'ພື້ນຖານເຄື່ອງແກງເໜືອ: ເປັນຫຍັງກິ່ນຄົ່ວຈຶ່ງເປັນຫົວໃຈຂອງອາຫານລ້ານນາ',
      excerpt:
        'ເຂົ້າໃຈພື້ນຖານເຄື່ອງແກງເໜືອຈາກພິກແຫ້ງ ຫອມ ກະທຽມ ແລະສະໝຸນໄພ',
      category: 'ເທັກນິກເຮັດອາຫານ',
      tags: ['ເຄື່ອງແກງເໜືອ', 'ນ້ຳພິກແກງເໜືອ', 'ອາຫານລ້ານນາ', 'ພະເຍົາ', 'ພິກແຫ້ງຄົ່ວ'],
      highlights: [
        'ເຄື່ອງແກງເໜືອເລີ່ມຈາກການຄົ່ວວັດຖຸດິບໃຫ້ຫອມ',
        'ພິກແຫ້ງໃຫ້ທັງສີ ຄວາມເຜັດ ແລະກິ່ນຄົ່ວ',
        'ເຄື່ອງແກງທີ່ດີຄວນໃຊ້ໄດ້ທັງແກງ ຜັດ ແລະໝັກອາຫານ',
      ],
      content: [
        'ເຄື່ອງແກງເໜືອແຕກຕ່າງຈາກຫຼາຍພາກ ເພາະໃຫ້ຄວາມສຳຄັນກັບກິ່ນຄົ່ວ ແລະຄວາມລຶກຂອງສະໝຸນໄພ',
        'ການຄົ່ວຊ່ວຍເປີດນ້ຳມັນຫອມໃນວັດຖຸດິບ ກິ່ນຈະຊັດ ແລະກົມກ່ອມກວ່າການຕຳສົດທັນທີ',
        'ນ້ຳພິກແກງເໜືອຈາກພະເຍົາຄວນມີລົດແນ່ນພໍສຳລັບແກງ ແຕ່ບໍ່ເຄັມຈົນໃຊ້ຍາກ',
        'ສຳລັບມື້ໄວ ສາມາດໃຊ້ເຄື່ອງແກງເໜືອກັບໝູ ໄກ່ ເຫັດ ຫຼືຜັກພື້ນບ້ານ ແລ້ວເຕີມນ້ຳນ້ອຍໜຶ່ງ',
        'ເມື່ອເຂົ້າໃຈຖານເຄື່ອງແກງເໜືອ ຈະເຫັນວ່ານ້ຳພິກບໍ່ແມ່ນແຄ່ເຄື່ອງຈິ້ມ ແຕ່ເປັນຫົວໃຈຂອງຄົວລ້ານນາ',
      ],
    },
    zh: {
      title: '泰北咖喱酱基础：为什么烘烤香是兰纳料理的核心',
      excerpt:
        '认识干辣椒、红葱、蒜与香草如何构成来自帕尧的泰北咖喱辣椒酱。',
      category: '料理技巧',
      tags: ['泰北咖喱酱', '泰北辣椒酱', '兰纳料理', '帕尧', '烘烤干辣椒'],
      highlights: [
        '泰北咖喱酱通常先烘烤香料，再进行捣制。',
        '干辣椒提供颜色、辣度与标志性的烘烤香。',
        '好的酱料应该能用于咖喱、热炒与腌制。',
      ],
      content: [
        '泰北咖喱酱不同于许多地区的酱料，因为它重视烘烤香与草本深度。干辣椒、红葱、蒜和香菜根都需要耐心处理。',
        '烘烤能打开食材内部的芳香油脂，让气味比直接生捣更清晰、更圆润。',
        '来自帕尧风格的泰北咖喱酱，应该足够浓郁以支撑咖喱，但不应咸到难以变化。用少量油轻轻炒开时，香草气息会成为稳定的料理基础。',
        '想快速做饭时，可以把酱料与猪肉、鸡肉、菇类或本地蔬菜一起炒，再加少量水做成湿润热炒或乡土咖喱。',
        '理解泰北咖喱酱的基础后，就会发现辣椒酱不只是蘸料，而是兰纳厨房里可以延伸多种菜色的核心。',
      ],
    },
  },
  {
    key: 'ma-khwaen-knowledge',
    th: {
      title: 'มะแขว่นคืออะไร: เครื่องเทศสำคัญที่ทำให้รสเหนือไม่เหมือนใคร',
      excerpt:
        'ทำความรู้จักมะแขว่น กลิ่นซ่าแบบล้านนา และวิธีใช้ให้เหมาะกับลาบเหนือ น้ำพริก และเมนูครัวพะเยา',
      category: 'วัตถุดิบล้านนา',
      tags: ['มะแขว่น', 'เครื่องเทศล้านนา', 'น้ำพริกลาบเหนือ', 'อาหารพะเยา', 'ครัวเหนือ'],
      highlights: [
        'มะแขว่นให้กลิ่นซ่า อุ่น และมีเอกลักษณ์ของอาหารเหนือ',
        'ควรใช้ในปริมาณพอดีเพื่อไม่ให้กลบกลิ่นคั่วของพริกและกระเทียม',
        'เหมาะกับลาบเหนือ น้ำพริก และเมนูย่างที่ต้องการกลิ่นสมุนไพรลึก',
      ],
      content: [
        'มะแขว่นเป็นเครื่องเทศที่ทำให้หลายคนจดจำรสเหนือได้ทันที กลิ่นของมันมีทั้งความซ่า ความอุ่น และโทนสมุนไพรที่ไม่เหมือนพริกไทยทั่วไป',
        'ในครัวล้านนา มะแขว่นมักถูกใช้กับลาบเหนือ น้ำพริก และเมนูเนื้อย่าง เพราะช่วยเพิ่มกลิ่นปลายที่สดและลึก ทำให้จานอาหารมีความซับซ้อนขึ้น',
        'สิ่งสำคัญคือใช้ในปริมาณที่พอดี หากมากเกินไปจะกลบกลิ่นคั่วของพริกแห้ง หอมแดง และกระเทียม แต่ถ้าน้อยเกินไปจะไม่เกิดบุคลิกที่ชัดเจน',
        'สำหรับน้ำพริกลาบเหนือ มะแขว่นทำหน้าที่เชื่อมความเผ็ดของพริกกับกลิ่นเครื่องเทศแห้ง ทำให้เหมาะกับข้าวเหนียว ผักสด และเมนูเนื้อที่มีไขมันเล็กน้อย',
        'เมื่อเลือกน้ำพริกพะเยา ให้สังเกตว่ากลิ่นมะแขว่นควรอยู่ในระดับที่ช่วยเสริม ไม่ใช่ครอบงำ นั่นคือความประณีตของอาหารเหนือแบบพรีเมียม',
      ],
    },
    en: {
      title: 'What Is Ma-Khwaen? The Lanna Spice That Makes Northern Flavor Distinct',
      excerpt:
        'Meet ma-khwaen, its bright tingling aroma, and how it works in Northern larb, chili paste, and Phayao cooking.',
      category: 'Lanna Ingredients',
      tags: ['ma-khwaen', 'Lanna spice', 'Nam Prik Larb Nuea', 'Phayao food', 'Northern Thai kitchen'],
      highlights: [
        'Ma-khwaen brings a warm, bright, tingling aroma to Northern Thai food.',
        'It should be used with restraint so it supports roasted chilies and garlic.',
        'It works especially well in Northern larb, chili paste, and grilled dishes.',
      ],
      content: [
        'Ma-khwaen is one of the spices that makes Northern Thai flavor instantly recognizable. Its aroma is warm, bright, and lightly tingling, different from common black pepper.',
        'In a Lanna kitchen, ma-khwaen often appears in Northern larb, chili paste, and grilled meat dishes because it adds a fresh herbal finish and deeper complexity.',
        'The key is balance. Too much ma-khwaen can cover the roasted scent of dried chilies, shallots, and garlic; too little and the dish loses its signature Northern profile.',
        'In Nam Prik Larb Nuea, ma-khwaen connects chili heat with dry spice aroma, making the paste suitable for sticky rice, fresh vegetables, and richer meat dishes.',
        'When choosing Phayao chili paste, the ma-khwaen should support the flavor rather than dominate it. That restraint is part of premium Northern Thai cooking.',
      ],
    },
    lo: {
      title: 'ໝາກແຂ່ວແມ່ນຫຍັງ: ເຄື່ອງເທດສຳຄັນທີ່ເຮັດໃຫ້ລົດເໜືອແຕກຕ່າງ',
      excerpt:
        'ຮູ້ຈັກໝາກແຂ່ວ ກິ່ນຊ່າແບບລ້ານນາ ແລະວິທີໃຊ້ກັບລາບເໜືອ ນ້ຳພິກ ແລະອາຫານພະເຍົາ',
      category: 'ວັດຖຸດິບລ້ານນາ',
      tags: ['ໝາກແຂ່ວ', 'ເຄື່ອງເທດລ້ານນາ', 'ນ້ຳພິກລາບເໜືອ', 'ອາຫານພະເຍົາ', 'ຄົວເໜືອ'],
      highlights: [
        'ໝາກແຂ່ວໃຫ້ກິ່ນຊ່າ ອົບອຸ່ນ ແລະເປັນເອກະລັກຂອງອາຫານເໜືອ',
        'ຄວນໃຊ້ໃນປະລິມານພໍດີ ເພື່ອບໍ່ກົບກິ່ນຄົ່ວຂອງພິກ ແລະກະທຽມ',
        'ເໝາະກັບລາບເໜືອ ນ້ຳພິກ ແລະເມນູປີ້ງ',
      ],
      content: [
        'ໝາກແຂ່ວເປັນເຄື່ອງເທດທີ່ເຮັດໃຫ້ຫຼາຍຄົນຈື່ຈຳລົດເໜືອໄດ້ທັນທີ ກິ່ນຂອງມັນມີທັງຄວາມຊ່າ ອົບອຸ່ນ ແລະໂທນສະໝຸນໄພ',
        'ໃນຄົວລ້ານນາ ໝາກແຂ່ວມັກໃຊ້ກັບລາບເໜືອ ນ້ຳພິກ ແລະເນື້ອປີ້ງ ເພາະຊ່ວຍເພີ່ມກິ່ນປາຍທີ່ສົດ ແລະລຶກ',
        'ສິ່ງສຳຄັນຄືຄວາມພໍດີ ຫາກໃຊ້ຫຼາຍເກີນໄປຈະກົບກິ່ນຄົ່ວຂອງພິກແຫ້ງ ຫອມແດງ ແລະກະທຽມ',
        'ໃນນ້ຳພິກລາບເໜືອ ໝາກແຂ່ວຊ່ວຍເຊື່ອມຄວາມເຜັດຂອງພິກກັບກິ່ນເຄື່ອງເທດແຫ້ງ',
        'ເມື່ອເລືອກນ້ຳພິກພະເຍົາ ກິ່ນໝາກແຂ່ວຄວນຊ່ວຍເສີມລົດ ບໍ່ແມ່ນກົບລົດອື່ນ ນີ້ຄືຄວາມປະນີດຂອງອາຫານເໜືອ',
      ],
    },
    zh: {
      title: '马告是什么：让泰北风味与众不同的兰纳香料',
      excerpt:
        '认识马告的明亮微麻香气，以及它如何用于泰北拉布、辣椒酱与帕尧料理。',
      category: '兰纳食材',
      tags: ['马告', '兰纳香料', '泰北拉布辣椒酱', '帕尧美食', '泰北厨房'],
      highlights: [
        '马告为泰北料理带来温暖、明亮、微麻的香气。',
        '使用时要克制，才能衬托烘烤辣椒与蒜香。',
        '它特别适合泰北拉布、辣椒酱与烤物。',
      ],
      content: [
        '马告是让泰北风味立刻被辨认出来的香料之一。它的香气温暖、明亮并带轻微麻感，与一般黑胡椒不同。',
        '在兰纳厨房中，马告常用于泰北拉布、辣椒酱和烤肉，因为它能带来清新的草本尾韵与更深的复杂度。',
        '关键是平衡。马告过多会盖过干辣椒、红葱与蒜的烘烤香；过少则难以形成鲜明的泰北轮廓。',
        '在泰北拉布辣椒酱中，马告连接了辣椒的热度与干香料的香气，使酱料适合糯米、鲜蔬与带一点油脂的肉类菜肴。',
        '选择帕尧辣椒酱时，马告应该是辅助而非主导。这份克制，就是优质泰北料理的细腻之处。',
      ],
    },
  },
  {
    key: 'sticky-rice-pairing',
    th: {
      title: 'ข้าวเหนียวกับน้ำพริกเหนือ: วิธีจัดมื้อเรียบง่ายให้ดูพรีเมียม',
      excerpt: 'ไอเดียจัดข้าวเหนียว ผัก ไข่ต้ม และน้ำพริกเหนือให้เป็นมื้อที่กินง่าย ดูดี และยังคงกลิ่นอายครัวล้านนา',
      category: 'ไอเดียจัดโต๊ะ',
      tags: ['ข้าวเหนียว', 'น้ำพริกเหนือ', 'จัดโต๊ะอาหาร', 'อาหารล้านนา', 'มื้อพรีเมียม'],
      highlights: [
        'ข้าวเหนียวร้อนช่วยให้กลิ่นคั่วของน้ำพริกชัดขึ้น',
        'จานที่ดีควรมีรสเผ็ด เค็ม หวานธรรมชาติ และความสดจากผัก',
        'การจัดองค์ประกอบเรียบง่ายทำให้มื้อเหนือดูพรีเมียมขึ้น',
      ],
      content: [
        'ข้าวเหนียวเป็นคู่ที่ทำให้น้ำพริกเหนือสมบูรณ์ขึ้น เพราะความนุ่มและกลิ่นข้าวช่วยรับรสเผ็ด เค็ม และกลิ่นคั่วได้ดี',
        'ถ้าต้องการจัดมื้อให้ดูพรีเมียม ให้เริ่มจากข้าวเหนียวร้อนหนึ่งกระติ๊บ น้ำพริกหนึ่งถ้วย ผักสดหรือผักลวก และไข่ต้มเพื่อเพิ่มความนุ่มนวล',
        'หัวใจของจานคือความชัดเจน ไม่จำเป็นต้องวางของเยอะเกินไป เลือกผักสามถึงสี่ชนิดที่สีต่างกัน แล้วจัดให้มีพื้นที่ว่างบนจาน',
        'น้ำพริกตาแดงเหนือเหมาะกับมื้อที่อยากได้รสจัดและกลิ่นพริกคั่ว ส่วนเครื่องแกงเหนือเหมาะกับการต่อยอดเป็นจานผัดหรือแกงขลุกขลิก',
        'เมื่อจัดทุกอย่างอย่างพอดี มื้อเรียบง่ายอย่างข้าวเหนียวกับน้ำพริกก็กลายเป็นประสบการณ์ครัวล้านนาที่ดูตั้งใจและน่าจดจำ',
      ],
    },
    en: {
      title: 'Sticky Rice and Northern Chili Paste: Making a Simple Meal Feel Premium',
      excerpt: 'Ideas for pairing sticky rice, vegetables, boiled eggs, and Northern chili paste in a clean Lanna-style meal.',
      category: 'Table Ideas',
      tags: ['sticky rice', 'Northern chili paste', 'table styling', 'Lanna food', 'premium meal'],
      highlights: [
        'Warm sticky rice helps roasted chili aroma feel clearer.',
        'A good plate balances heat, salt, natural sweetness, and freshness.',
        'Simple composition makes a Northern meal feel more premium.',
      ],
      content: [
        'Sticky rice completes Northern chili paste because its soft texture carries heat, salt, and roasted aroma beautifully.',
        'For a premium-looking meal, begin with warm sticky rice, one bowl of chili paste, fresh or blanched vegetables, and a boiled egg for softness.',
        'The key is clarity. Choose three or four vegetables with different colors and leave clean space so the plate does not feel crowded.',
        'Nam Prik Ta Daeng Nuea suits a bolder roasted chili moment, while Northern curry paste can become a quick stir-fry or rustic curry.',
        'With balance and restraint, a simple sticky rice meal becomes a memorable Lanna table experience.',
      ],
    },
    lo: {
      title: 'ເຂົ້າໜຽວກັບນ້ຳພິກເໜືອ: ຈັດມື້ງ່າຍໆໃຫ້ດູພຣີມຽມ',
      excerpt: 'ໄອເດຍຈັດເຂົ້າໜຽວ ຜັກ ໄຂ່ຕົ້ມ ແລະນ້ຳພິກເໜືອໃຫ້ເປັນມື້ທີ່ກິນງ່າຍແລະດູດີ',
      category: 'ໄອເດຍຈັດໂຕະ',
      tags: ['ເຂົ້າໜຽວ', 'ນ້ຳພິກເໜືອ', 'ຈັດໂຕະອາຫານ', 'ອາຫານລ້ານນາ', 'ມື້ພຣີມຽມ'],
      highlights: [
        'ເຂົ້າໜຽວຮ້ອນຊ່ວຍໃຫ້ກິ່ນຄົ່ວຂອງນ້ຳພິກຊັດຂຶ້ນ',
        'ຈານທີ່ດີຄວນມີລົດເຜັດ ເຄັມ ຫວານທຳມະຊາດ ແລະຄວາມສົດ',
        'ການຈັດທີ່ຮຽບງ່າຍຊ່ວຍໃຫ້ມື້ເໜືອດູພຣີມຽມ',
      ],
      content: [
        'ເຂົ້າໜຽວເປັນຄູ່ທີ່ເຮັດໃຫ້ນ້ຳພິກເໜືອສົມບູນ ເພາະເນື້ອນຸ່ມຮັບລົດເຜັດ ເຄັມ ແລະກິ່ນຄົ່ວໄດ້ດີ',
        'ຖ້າຢາກໃຫ້ມື້ອາຫານດູດີ ໃຫ້ເລີ່ມຈາກເຂົ້າໜຽວຮ້ອນ ນ້ຳພິກໜຶ່ງຖ້ວຍ ຜັກສົດຫຼືຜັກລວກ ແລະໄຂ່ຕົ້ມ',
        'ຫົວໃຈຄືຄວາມຊັດເຈນ ບໍ່ຈຳເປັນຕ້ອງວາງຂອງຫຼາຍເກີນໄປ ເລືອກຜັກສາມຫຼືສີ່ຊະນິດທີ່ສີຕ່າງກັນ',
        'ນ້ຳພິກຕາແດງເໜືອເໝາະກັບມື້ທີ່ຢາກໄດ້ລົດຈັດ ສ່ວນເຄື່ອງແກງເໜືອຕໍ່ຍອດເປັນຜັດຫຼືແກງໄດ້',
        'ເມື່ອຈັດທຸກຢ່າງໃຫ້ພໍດີ ມື້ງ່າຍໆກໍກາຍເປັນປະສົບການລ້ານນາທີ່ນ່າຈື່ຈຳ',
      ],
    },
    zh: {
      title: '糯米与泰北辣椒酱：让简单一餐更有质感',
      excerpt: '用糯米、蔬菜、水煮蛋与泰北辣椒酱，搭配出清爽、有层次的兰纳餐桌。',
      category: '餐桌灵感',
      tags: ['糯米', '泰北辣椒酱', '餐桌搭配', '兰纳料理', '精致餐食'],
      highlights: [
        '热糯米能让烘烤辣椒香更集中。',
        '好的餐盘需要辣、咸、自然甜味与清新感。',
        '简洁构图会让泰北餐桌更显质感。',
      ],
      content: [
        '糯米让泰北辣椒酱更完整，因为柔软口感能承接辣度、咸味与烘烤香气。',
        '想让一餐看起来更精致，可以准备热糯米、一碗辣椒酱、新鲜或烫蔬菜，以及一颗水煮蛋。',
        '关键是清楚而不拥挤。选择三到四种颜色不同的蔬菜，并保留盘面空间。',
        '泰北红眼辣椒酱适合想要明显烘烤辣香的时刻，而泰北咖喱酱可延伸为快炒或乡土咖喱。',
        '只要比例得当，简单的糯米配辣椒酱也能成为值得记住的兰纳餐桌。',
      ],
    },
  },
  {
    key: 'roasted-chili-aroma',
    th: {
      title: 'กลิ่นพริกคั่ว: สัญญาณของน้ำพริกเหนือที่ทำอย่างพิถีพิถัน',
      excerpt: 'ทำไมกลิ่นพริกคั่วจึงเป็นตัวบอกคุณภาพของน้ำพริกเหนือ และควรสังเกตอะไรเมื่อเลือกน้ำพริกพะเยา',
      category: 'คุณภาพวัตถุดิบ',
      tags: ['พริกคั่ว', 'น้ำพริกเหนือ', 'น้ำพริกพะเยา', 'กลิ่นอาหาร', 'ครัวล้านนา'],
      highlights: [
        'พริกคั่วที่ดีควรมีกลิ่นหอมลึก ไม่ไหม้ขม',
        'กลิ่นคั่วช่วยเชื่อมรสเผ็ดกับสมุนไพรในน้ำพริก',
        'การเลือกน้ำพริกควรดูทั้งกลิ่น สี และเนื้อสัมผัส',
      ],
      content: [
        'กลิ่นพริกคั่วเป็นสิ่งแรกที่ทำให้หลายคนรู้ว่าน้ำพริกเหนือถ้วยนั้นตั้งใจทำเพียงใด กลิ่นที่ดีควรหอมลึกและอบอุ่น ไม่ใช่กลิ่นไหม้หรือขม',
        'พริกแห้งเมื่อคั่วอย่างพอดีจะเปิดกลิ่นและทำให้รสเผ็ดมีมิติ ไม่แหลมเกินไป เมื่อรวมกับหอม กระเทียม และเครื่องเทศ รสจะกลมขึ้น',
        'ถ้าน้ำพริกมีกลิ่นไหม้แรงหรือสีคล้ำผิดปกติ อาจทำให้รสปลายขมและกลบวัตถุดิบอื่น',
        'น้ำพริกพะเยาที่ดีควรมีสีเข้มเป็นธรรมชาติ มีเนื้อสัมผัสพอให้เห็นพริกและเครื่อง แต่ไม่แห้งจนเสียความหอม',
        'การเข้าใจกลิ่นพริกคั่วช่วยให้เลือกน้ำพริกได้ดีขึ้น และทำให้เห็นความละเอียดของครัวล้านนาในรายละเอียดเล็ก ๆ',
      ],
    },
    en: {
      title: 'Roasted Chili Aroma: A Sign of Carefully Made Northern Chili Paste',
      excerpt: 'Why roasted chili aroma signals quality, and what to notice when choosing Phayao chili paste.',
      category: 'Ingredient Quality',
      tags: ['roasted chili', 'Northern chili paste', 'Phayao chili paste', 'food aroma', 'Lanna kitchen'],
      highlights: [
        'Good roasted chilies smell deep and warm, not burnt.',
        'Roasted aroma connects chili heat with herbs.',
        'Choose chili paste by aroma, color, and texture together.',
      ],
      content: [
        'Roasted chili aroma is often the first sign of how carefully a Northern chili paste was made. It should smell deep and warm rather than burnt or bitter.',
        'When dried chilies are roasted with care, their heat becomes more layered and less sharp. Shallots, garlic, and spices then become rounder beside them.',
        'If the paste smells strongly burnt or looks unusually dark, the finish may become bitter and cover the other ingredients.',
        'Good Phayao chili paste should have a naturally deep color and a texture that still shows chili and aromatics without becoming dry.',
        'Understanding roasted chili aroma helps you choose better paste and notice the small details of Lanna cooking.',
      ],
    },
    lo: {
      title: 'ກິ່ນພິກຄົ່ວ: ສັນຍານຂອງນ້ຳພິກເໜືອທີ່ເຮັດຢ່າງພິຖີພິຖັນ',
      excerpt: 'ເປັນຫຍັງກິ່ນພິກຄົ່ວຈຶ່ງບອກຄຸນນະພາບຂອງນ້ຳພິກເໜືອ ແລະຄວນສັງເກດຫຍັງເມື່ອເລືອກນ້ຳພິກພະເຍົາ',
      category: 'ຄຸນນະພາບວັດຖຸດິບ',
      tags: ['ພິກຄົ່ວ', 'ນ້ຳພິກເໜືອ', 'ນ້ຳພິກພະເຍົາ', 'ກິ່ນອາຫານ', 'ຄົວລ້ານນາ'],
      highlights: [
        'ພິກຄົ່ວທີ່ດີຄວນຫອມລຶກ ບໍ່ໄໝ້ຂົມ',
        'ກິ່ນຄົ່ວຊ່ວຍເຊື່ອມລົດເຜັດກັບສະໝຸນໄພ',
        'ຄວນເລືອກນ້ຳພິກຈາກກິ່ນ ສີ ແລະເນື້ອສຳຜັດຮ່ວມກັນ',
      ],
      content: [
        'ກິ່ນພິກຄົ່ວເປັນສິ່ງທຳອິດທີ່ບອກວ່ານ້ຳພິກເໜືອຖືກເຮັດຢ່າງຕັ້ງໃຈແຄ່ໃດ ກິ່ນທີ່ດີຄວນຫອມລຶກ ບໍ່ແມ່ນກິ່ນໄໝ້',
        'ເມື່ອຄົ່ວພິກແຫ້ງຢ່າງພໍດີ ລົດເຜັດຈະມີມິຕິ ແລະເມື່ອລວມກັບຫອມ ກະທຽມ ແລະເຄື່ອງເທດ ລົດຈະກົມກ່ອມ',
        'ຖ້ານ້ຳພິກມີກິ່ນໄໝ້ແຮງ ຫຼືສີຄ້ຳຜິດປົກກະຕິ ອາດມີລົດຂົມທ້າຍ',
        'ນ້ຳພິກພະເຍົາທີ່ດີຄວນມີສີເຂັ້ມທຳມະຊາດ ແລະເນື້ອສຳຜັດທີ່ເຫັນພິກກັບເຄື່ອງຫອມ',
        'ການເຂົ້າໃຈກິ່ນພິກຄົ່ວຊ່ວຍໃຫ້ເລືອກນ້ຳພິກໄດ້ດີຂຶ້ນ',
      ],
    },
    zh: {
      title: '烘烤辣椒香：判断泰北辣椒酱是否用心的信号',
      excerpt: '为什么烘烤辣椒香能体现品质，以及选择帕尧辣椒酱时该观察什么。',
      category: '食材品质',
      tags: ['烘烤辣椒', '泰北辣椒酱', '帕尧辣椒酱', '食物香气', '兰纳厨房'],
      highlights: [
        '好的烘烤辣椒应香气深而温暖，不应焦苦。',
        '烘烤香能连接辣度与草本香。',
        '选择辣椒酱要同时看香气、颜色与质地。',
      ],
      content: [
        '烘烤辣椒香常常是判断泰北辣椒酱是否用心制作的第一信号。好的香气应深沉温暖，而不是焦苦。',
        '干辣椒被适度烘烤后，辣味会更有层次，不会过于尖锐。红葱、蒜与香料也会因此更圆润。',
        '如果辣椒酱有强烈焦味或颜色异常发黑，尾韵可能变苦，并盖过其他食材。',
        '好的帕尧辣椒酱应有自然深色，质地能看见辣椒与香料，但不应干到失去香气。',
        '理解烘烤辣椒香，能帮助你更好地选择辣椒酱，也能看见兰纳厨房的细节。',
      ],
    },
  },
  {
    key: 'quick-weeknight-northern-meal',
    th: {
      title: 'มื้อเหนือวันทำงาน: ใช้น้ำพริกให้ทำอาหารเร็วแต่ยังได้รสลึก',
      excerpt: 'วิธีใช้น้ำพริกเหนือเป็นตัวช่วยทำอาหารวันทำงาน ทั้งผัด แกงขลุกขลิก และจานข้าวเหนียวแบบไม่ยุ่งยาก',
      category: 'ทำอาหารเร็ว',
      tags: ['มื้อวันทำงาน', 'น้ำพริกเหนือ', 'อาหารเร็ว', 'เมนูพะเยา', 'ครัวบ้าน'],
      highlights: [
        'น้ำพริกช่วยย่นเวลาการเตรียมเครื่องแกงและสมุนไพร',
        'ผัดกับน้ำมันเล็กน้อยก่อนเติมเนื้อหรือผักจะทำให้กลิ่นเปิด',
        'มื้อเร็วควรมีข้าว ผัก และโปรตีนครบในจานเดียว',
      ],
      content: [
        'วันทำงานไม่จำเป็นต้องตัดรสเหนือออกจากโต๊ะอาหาร น้ำพริกที่ดีช่วยย่นเวลาการเตรียมพริก หอม กระเทียม และสมุนไพรหลายชนิด',
        'เริ่มจากผัดน้ำพริกกับน้ำมันเล็กน้อยให้กลิ่นเปิด แล้วใส่หมู ไก่ ไข่ เห็ด หรือผักพื้นบ้าน เติมน้ำเล็กน้อยถ้าต้องการให้จานฉ่ำขึ้น',
        'ถ้าอยากทำเป็นแกงขลุกขลิก ให้เติมน้ำซุปหรือน้ำเปล่าเล็กน้อย แล้วเคี่ยวสั้น ๆ จนรสซึมเข้าเนื้อหรือผัก',
        'สำหรับมื้อที่เร็วที่สุด จัดน้ำพริกคู่ข้าวเหนียว ผักสด ไข่ต้ม และโปรตีนง่าย ๆ เช่น หมูย่างหรือไก่ฉีก',
        'เมื่อน้ำพริกมีรสแน่นและกลิ่นดี มื้อวันทำงานก็ยังมีความลึกแบบครัวล้านนาได้โดยไม่ต้องใช้เวลานาน',
      ],
    },
    en: {
      title: 'Weeknight Northern Meals: Using Chili Paste for Fast Cooking with Deep Flavor',
      excerpt: 'How Northern chili paste can help with quick stir-fries, rustic curries, and simple sticky-rice meals.',
      category: 'Quick Cooking',
      tags: ['weeknight meals', 'Northern chili paste', 'quick cooking', 'Phayao menu', 'home kitchen'],
      highlights: [
        'Chili paste shortens the work of preparing aromatics.',
        'Frying it briefly in oil helps the aroma open.',
        'A quick meal should include rice, vegetables, and protein.',
      ],
      content: [
        'A busy weeknight does not need to lose Northern flavor. Good chili paste saves the time of preparing chilies, shallots, garlic, and herbs from scratch.',
        'Start by frying the paste in a little oil until fragrant. Add pork, chicken, egg, mushrooms, or local vegetables, then add a splash of water if the dish needs moisture.',
        'For a rustic curry, add a little stock or water and simmer briefly until the flavor coats the protein or vegetables.',
        'For the fastest meal, serve chili paste with sticky rice, fresh vegetables, boiled egg, and a simple protein such as grilled pork or shredded chicken.',
        'When the paste is flavorful and aromatic, weeknight cooking can still carry the depth of a Lanna kitchen.',
      ],
    },
    lo: {
      title: 'ມື້ເໜືອວັນເຮັດວຽກ: ໃຊ້ນ້ຳພິກໃຫ້ເຮັດອາຫານໄວແຕ່ລົດລຶກ',
      excerpt: 'ວິທີໃຊ້ນ້ຳພິກເໜືອເປັນຕົວຊ່ວຍເຮັດອາຫານວັນເຮັດວຽກ ທັງຜັດ ແກງ ແລະມື້ເຂົ້າໜຽວ',
      category: 'ເຮັດອາຫານໄວ',
      tags: ['ມື້ວັນເຮັດວຽກ', 'ນ້ຳພິກເໜືອ', 'ອາຫານໄວ', 'ເມນູພະເຍົາ', 'ຄົວບ້ານ'],
      highlights: [
        'ນ້ຳພິກຊ່ວຍຫຍໍ້ເວລາການກຽມເຄື່ອງແກງ',
        'ຜັດກັບນ້ຳມັນນ້ອຍໜຶ່ງກ່ອນຈະຊ່ວຍໃຫ້ກິ່ນເປີດ',
        'ມື້ໄວຄວນມີເຂົ້າ ຜັກ ແລະໂປຣຕີນຄົບ',
      ],
      content: [
        'ວັນເຮັດວຽກບໍ່ຈຳເປັນຕ້ອງຂາດລົດເໜືອ ນ້ຳພິກທີ່ດີຊ່ວຍຫຍໍ້ເວລາການກຽມພິກ ຫອມ ກະທຽມ ແລະສະໝຸນໄພ',
        'ເລີ່ມຈາກຜັດນ້ຳພິກກັບນ້ຳມັນນ້ອຍໜຶ່ງ ແລ້ວໃສ່ໝູ ໄກ່ ໄຂ່ ເຫັດ ຫຼືຜັກພື້ນບ້ານ',
        'ຖ້າຢາກເຮັດເປັນແກງຂຸກຂິກ ໃຫ້ເຕີມນ້ຳຊຸບນ້ອຍໜຶ່ງ ແລ້ວຕົ້ມສັ້ນໆ',
        'ສຳລັບມື້ໄວທີ່ສຸດ ຈັດນ້ຳພິກຄູ່ເຂົ້າໜຽວ ຜັກສົດ ໄຂ່ຕົ້ມ ແລະໂປຣຕີນງ່າຍໆ',
        'ເມື່ອນ້ຳພິກມີລົດແນ່ນແລະກິ່ນດີ ມື້ວັນເຮັດວຽກກໍຍັງມີຄວາມລຶກແບບຄົວລ້ານນາ',
      ],
    },
    zh: {
      title: '工作日晚餐的泰北味：用辣椒酱快速做出有深度的料理',
      excerpt: '用泰北辣椒酱快速完成热炒、乡土咖喱与简单糯米餐。',
      category: '快速料理',
      tags: ['工作日晚餐', '泰北辣椒酱', '快速料理', '帕尧菜单', '家庭厨房'],
      highlights: [
        '辣椒酱能节省准备香料的时间。',
        '先用少量油炒开，香气会更明显。',
        '快速一餐也应包含米饭、蔬菜与蛋白质。',
      ],
      content: [
        '忙碌的工作日也不必放弃泰北风味。好的辣椒酱能省去从头准备辣椒、红葱、蒜和香草的时间。',
        '先用少量油把辣椒酱炒香，再加入猪肉、鸡肉、鸡蛋、菇类或本地蔬菜，需要湿润口感时加一点水。',
        '若想做成乡土咖喱，可以加少量高汤或清水，短时间炖煮到味道包裹食材。',
        '最快的吃法是用辣椒酱搭配糯米、鲜蔬、水煮蛋，以及烤肉或手撕鸡等简单蛋白质。',
        '只要酱料味道扎实、香气清楚，工作日晚餐也能有兰纳厨房的深度。',
      ],
    },
  },
]

export function getGeneratedTopicCount() {
  return topics.length
}

export function todayBangkok() {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  return formatter.format(new Date())
}

export function addDays(date, amount) {
  const next = new Date(`${date}T00:00:00.000Z`)
  next.setUTCDate(next.getUTCDate() + amount)
  return next.toISOString().slice(0, 10)
}

function formatDate(date, locale) {
  const value = new Date(`${date}T00:00:00.000Z`)
  if (locale === 'th') {
    return new Intl.DateTimeFormat('th-TH', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Bangkok',
    }).format(value)
  }
  if (locale === 'lo') {
    return new Intl.DateTimeFormat('lo-LA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Bangkok',
    }).format(value)
  }
  if (locale === 'zh') {
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Bangkok',
    }).format(value)
  }
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'Asia/Bangkok',
  }).format(value)
}

function readData() {
  if (!fs.existsSync(outputPath)) {
    return structuredClone(fallback)
  }

  try {
    return { ...structuredClone(fallback), ...JSON.parse(fs.readFileSync(outputPath, 'utf8')) }
  } catch {
    return structuredClone(fallback)
  }
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return

  const lines = fs.readFileSync(filePath, 'utf8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const separator = trimmed.indexOf('=')
    if (separator === -1) continue
    const key = trimmed.slice(0, separator).trim()
    const value = trimmed.slice(separator + 1).trim().replace(/^['"]|['"]$/g, '')
    if (key && process.env[key] === undefined) {
      process.env[key] = value
    }
  }
}

function hasDbConfig() {
  return Boolean(
    process.env.MARIADB_HOST &&
      process.env.MARIADB_DATABASE &&
      process.env.MARIADB_USER &&
      process.env.MARIADB_PASSWORD,
  )
}

function dbConfig() {
  return {
    host: process.env.MARIADB_HOST,
    database: process.env.MARIADB_DATABASE,
    user: process.env.MARIADB_USER,
    password: process.env.MARIADB_PASSWORD,
    charset: 'utf8mb4',
    multipleStatements: false,
  }
}

async function connectDb() {
  if (!hasDbConfig()) return null
  try {
    return await mysql.createConnection(dbConfig())
  } catch (error) {
    console.warn('MariaDB unavailable. Falling back to local article generation.', error)
    return null
  }
}

async function ensureSchema(connection) {
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS articles (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      slug VARCHAR(255) NOT NULL,
      status ENUM('draft', 'published') NOT NULL DEFAULT 'published',
      cover_image_url VARCHAR(500) NULL,
      image_prompt TEXT NULL,
      published_at DATETIME NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY articles_slug_unique (slug),
      KEY articles_status_published_idx (status, published_at)
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `)

  await connection.execute(`
    CREATE TABLE IF NOT EXISTS article_translations (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      article_id BIGINT UNSIGNED NOT NULL,
      locale VARCHAR(10) NOT NULL,
      title VARCHAR(255) NOT NULL,
      excerpt TEXT NOT NULL,
      category VARCHAR(100) NOT NULL,
      date_label VARCHAR(100) NOT NULL,
      read_time VARCHAR(50) NOT NULL,
      tags_json JSON NOT NULL,
      highlights_json JSON NOT NULL,
      content_json JSON NOT NULL,
      meta_title VARCHAR(255) NULL,
      meta_description TEXT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY article_locale_unique (article_id, locale),
      KEY article_translations_locale_idx (locale),
      CONSTRAINT article_translations_article_id_fk
        FOREIGN KEY (article_id) REFERENCES articles(id)
        ON DELETE CASCADE
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `)
}

function hashString(value) {
  return [...String(value)].reduce((hash, char) => {
    const next = ((hash << 5) - hash + char.charCodeAt(0)) | 0
    return Math.abs(next)
  }, 0)
}

function pickBySeed(items, seed, offset = 0) {
  return items[(seed + offset) % items.length]
}

function buildTopicImageBrief(article) {
  const researchedImageBrief = String(article.researchImageBrief || article.visualBrief || '').trim()
  if (researchedImageBrief) {
    return [
      'Researched title-specific visual brief: use this verified food/topic research as the highest-priority image direction.',
      researchedImageBrief,
      'The researched brief overrides generic category styling. Make the named dish, ingredient, herb, technique, or table idea unmistakable.',
    ].join(' ')
  }

  const category = String(article.category || '').trim().toLowerCase()
  const searchable = [
    article.slug,
    article.title,
    article.category,
    ...(Array.isArray(article.tags) ? article.tags : []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  const categoryMatches = (...values) =>
    values.some((value) => category === String(value).toLowerCase())

  if (
    searchable.includes('saa-jin') ||
    searchable.includes('ส้าจิ้น') ||
    searchable.includes('ส้าจิ๊น') ||
    searchable.includes('ส้าเนื้อ') ||
    searchable.includes('northern raw beef salad')
  ) {
    return [
      'Title-specific visual brief: this article is specifically about Saa Jin or Sa Nuea, a Northern Thai beef salad/raw beef dish seasoned with Northern larb spice paste. It is not nam prik ong, not red chili dip, not a curry paste bowl, and not a generic Northern menu spread.',
      'The visual hero must be Saa Jin: very thin sliced or finely chopped fresh beef arranged in a refined dark ceramic bowl, mixed with coarse dark red-brown Northern larb spices, sliced shallots, sawtooth coriander, Vietnamese coriander, mint, fried dried chili, and subtle roasted spice texture.',
      'Show the correct eating context: a small cluster of fresh local vegetables may support the dish, and sticky rice may appear only as a small background cue. The beef salad must dominate the strongest focal point.',
      'Because raw meat can look unsafe if styled poorly, make it premium, clean, and intentional: jewel-toned fresh beef, dry spice coating, crisp herb edges, chilled serving feel, warm Lanna side light, precise plating, no wet tomato sauce.',
      'Strictly avoid a mortar crushing red paste, nam prik ong, tomato-like red sauce, pea eggplant-heavy chili paste, grilled skewers as hero, curry, packaged products, hands, people, and a generic bowl of chili paste.',
    ].join(' ')
  }

  if (
    searchable.includes('phak-khao-tong-local-vegetable') ||
    searchable.includes('ผักคาวตอง') ||
    searchable.includes('ผักคาวทอง') ||
    searchable.includes('พลูคาว') ||
    searchable.includes('fish mint') ||
    searchable.includes('houttuynia')
  ) {
    return [
      'Title-specific visual brief: this article is specifically about phak khao tong, also known as fish mint or Houttuynia cordata, as a Northern local vegetable. It is not about cooking chili paste, curry paste, nam prik ong, or a red sauce.',
      'The visual hero must be fresh phak khao tong leaves: heart-shaped green leaves with visible veins, tender stems, and a clean aromatic herb character, arranged in a premium identifiable cluster.',
      'Show how phak khao tong is eaten with Northern food: a very small bowl of Northern chili paste may appear as a supporting pairing cue only, clearly smaller than the herb hero. The herb must dominate the strongest focal point.',
      'Make it premium and editorial: crisp leaf texture, fresh water droplets, neat bunches, dark ceramic or woven tray, warm natural side light, shallow depth of field, calm negative space.',
      'Strictly avoid a pan, spoon stirring red paste, tomato sauce, minced meat, nam prik ong, curry paste preparation, large chili paste bowl as hero, generic mixed vegetable platter, or random herbs that do not show heart-shaped fish mint leaves.',
      'The image must answer the title and category: "ผักคาวตอง" in "ผักพื้นบ้าน" first, before any generic Northern Thai food styling.',
    ].join(' ')
  }

  if (
    searchable.includes('olive-shoots-local-vegetable') ||
    searchable.includes('ยอดมะกอก') ||
    searchable.includes('ใบมะกอก') ||
    searchable.includes('olive shoots') ||
    searchable.includes('hog plum shoots') ||
    searchable.includes('spondias')
  ) {
    return [
      'Title-specific visual brief: this article is specifically about yod makok, Thai olive or hog plum young shoots, as a Northern local vegetable. It is not about cooking chili paste, nam prik ong, curry paste, or a red sauce.',
      'The visual hero must be fresh yod makok young shoots: tender light-green leaves with slightly copper young tips, arranged in a premium clean cluster. The viewer should immediately understand this is a local vegetable article.',
      'Show how yod makok is eaten in Northern food: a refined small bowl of Northern chili paste may appear as a supporting object only, clearly smaller than the vegetable hero. Include cucumber or other local vegetables only as subtle comparison, not as the main subject.',
      'Make it premium and editorial: clean dark ceramic or woven tray, precise leaf grouping, fresh water droplets, crisp leaf texture, warm natural side light, shallow depth of field, calm negative space.',
      'Strictly avoid a pan, spoon stirring red paste, tomato sauce, minced meat, nam prik ong, curry paste preparation, large chili paste bowl as hero, random green beans, pea eggplants, or generic vegetable platter with no visible yod makok.',
      'The image must answer the title and category: "ยอดมะกอก" in "ผักพื้นบ้าน" first, before any generic Northern Thai food styling.',
    ].join(' ')
  }

  if (
    searchable.includes('northern-yam-gai-nam-prik-larb-recipe') ||
    searchable.includes('ยำไก่ทางเหนือ') ||
    searchable.includes('ยำไก่เหนือ') ||
    searchable.includes('น้ําพริกลาบ') ||
    searchable.includes('น้ำพริกลาบ') ||
    searchable.includes('northern thai yam gai') ||
    searchable.includes('northern chicken salad') ||
    searchable.includes('nam prik larb') ||
    searchable.includes('nam phrik larb')
  ) {
    return [
      'Title-specific visual brief: this article is exactly about making premium Northern Thai Yam Gai with Nam Prik Larb, not a generic chicken salad, not larb meat, and not a general Northern cooking scene.',
      'The visual hero must be the finished or actively mixed Yam Gai Nuea: tender shredded chicken clearly coated with reddish-brown roasted Nam Prik Larb seasoning, glossy but not wet, in a refined dark ceramic bowl.',
      'Show the title story in one glance: shredded chicken, a small ceramic bowl of coarse dark red roasted larb chili paste, sliced shallots, cilantro, sawtooth coriander, mint, fried dried chilies, and a small spoon or mixing gesture cue. These props must directly support the recipe title.',
      'Make it premium and editorial: one hero bowl placed in the strongest focal position, clean negative space, restrained Lanna craft props, precise herb placement, warm side light, crisp chicken texture, visible red-brown spice coating, no clutter.',
      'The supporting paste should look like roasted Nam Prik Larb, dark red-brown and textured, not tomato sauce, not curry paste, not nam prik ong, not generic chili oil.',
      'Strictly avoid noodles, pasta-like strands, raw chicken, whole chicken pieces, tomato-heavy red sauce, rice as the main subject, packaged product jars, labels, visible text, hands, people, and a messy table.',
      'The viewer should immediately understand "วิธีทำยำไก่ทางเหนือด้วยน้ำพริกลาบ" from the finished dish and recipe mise en place alone.',
    ].join(' ')
  }

  if (
    categoryMatches('ความรู้ครัวเหนือ', 'Northern Kitchen', 'ຄວາມຮູ້ຄົວເໜືອ', '泰北厨房知识')
  ) {
    return [
      'Category visual brief: Northern Kitchen knowledge. The image must teach or explain one clear Northern kitchen idea from the exact title, not show a generic meal.',
      'Hero subject should be an educational kitchen still life: the title-specific ingredient, tool, or process arranged like a premium culinary reference. Use a mortar, roasted aromatics, herbs, local vegetables, or a small finished chili paste only when they directly explain the title.',
      'Composition must feel like a high-end cookbook knowledge page: clean labeled-by-objects storytelling, strong focal hierarchy, tidy mise en place, warm craft lighting, and negative space. No visible text or labels.',
      'Supporting props should be minimal and meaningful: one tool, one ingredient cluster, one small result bowl. Avoid crowded spreads, random table decoration, full meal plates, rice as main subject, and unrelated red chili paste.',
      'Hard check: a viewer should understand the specific kitchen knowledge topic within two seconds, not just "Northern Thai food".',
    ].join(' ')
  }

  if (
    categoryMatches('คุณภาพวัตถุดิบ', 'Ingredient Quality', 'ຄຸນນະພາບວັດຖຸດິບ', '食材品质')
  ) {
    return [
      'Category visual brief: Ingredient Quality. The image must communicate freshness, selection, and inspection of the exact ingredient named by the title.',
      'Hero subject should be premium raw ingredients with visible quality cues: clean surfaces, natural color, dry roasted texture, fresh cut surfaces, intact herbs, or carefully selected local produce. Use macro detail or a refined inspection layout.',
      'Show quality through visual evidence: uniform size, crisp texture, clean sorting, gentle moisture on fresh produce, roasted depth on dried chilies, or careful handcraft tools without showing people or hands.',
      'Supporting props may include a small ceramic bowl, brass spoon, woven tray, or stone surface, but the ingredient must dominate. No finished dish should take over unless the title explicitly requires it.',
      'Strictly avoid messy market piles, random garnish, overly dark moody scenes that hide quality, fake labels, packaging, full meal plates, and generic chili paste bowls as the main subject.',
    ].join(' ')
  }

  if (
    categoryMatches('เทคนิคทำอาหาร', 'Cooking Technique', 'ເທັກນິກເຮັດອາຫານ', '料理技巧')
  ) {
    return [
      'Category visual brief: Cooking Technique. The image must show a specific technique or transformation named by the title, not only ingredients or a finished dish.',
      'Hero subject should be the active technique moment: blooming chili paste in oil, roasting dried chilies, draining blanched vegetables, pounding aromatics in a mortar, mixing seasoning into shredded meat, or arranging components in a controlled step.',
      'Use process cues without hands or people: spoon resting in pan, steam, glossy oil separation, crushed spices, measured ingredients in small bowls, mortar texture, and a small final result as support.',
      'Make it premium: one clear process action, uncluttered mise en place, controlled warm side light, crisp texture, visible before-and-after relationship.',
      'Strictly avoid static generic table spreads, raw ingredients with no technique, full meal plates, text, packaging, and unrelated chili paste as default filler.',
    ].join(' ')
  }

  if (
    categoryMatches('ผักพื้นบ้าน', 'Local Vegetables', 'ຜັກພື້ນບ້ານ', '本地蔬菜')
  ) {
    return [
      'Category visual brief: Local Vegetables. The vegetable or vegetables named by the title must be the visual hero. Chili paste can support the eating context but must never dominate.',
      'Hero subject should be fresh local vegetables with identifiable shapes and textures: young shoots, leafy herbs, cucumbers, long beans, eggplants, blanched pumpkin, cabbage, mustard greens, or the exact vegetable in the title.',
      'Show freshness and local character: tidy clusters, fresh water droplets, crisp leaf edges, natural woven tray or dark ceramic, subtle small chili paste bowl only as scale and pairing context.',
      'Make it premium: clean negative space, precise grouping, no random mixed vegetable chaos, no cooking pan, no red paste as main subject, no meat, no rice, no generic table spread.',
      'Hard check: if the title names one vegetable such as yod makok, that vegetable must be unmistakable and occupy the strongest focal point.',
    ].join(' ')
  }

  if (
    categoryMatches('เมนูอาหารเหนือ', 'Northern Food Menu', 'ເມນູອາຫານເໜືອ', '泰北美食菜单')
  ) {
    return [
      'Category visual brief: Northern Food Menu. The image must communicate a curated Northern meal or the exact menu named in the title, not an ingredient close-up unless the title is one ingredient.',
      'Hero subject should be the named dish or a refined multi-dish Lanna menu with clear hierarchy: one main dish in focus, two or three supporting dishes smaller, local vegetables, and chili paste only if relevant.',
      'For menu-guide articles, show variety with restraint: curry, chili paste with vegetables, grilled or herbed protein, and a small rice cue only as support. For a specific menu, make that menu dominate.',
      'Make it premium: restaurant-level plating, dark ceramics, warm Lanna table mood, balanced negative space, no buffet clutter, no random props, no market pile.',
      'Strictly avoid one generic bowl of chili paste pretending to represent all Northern food, oversized rice, unreadable signage, packaging, and messy full-table spreads.',
    ].join(' ')
  }

  if (
    categoryMatches('วัตถุดิบล้านนา', 'Lanna Ingredients', 'ວັດຖຸດິບລ້ານນາ', '兰纳食材')
  ) {
    return [
      'Category visual brief: Lanna Ingredients. The image must make the exact Lanna ingredient named by the title visually obvious and culturally grounded.',
      'Hero subject should be identifiable raw or prepared Lanna ingredients: ma-khwaen, dried chilies, shallots, garlic, lemongrass, galangal, turmeric, fermented soybean, local herbs, or the title-specific ingredient.',
      'Show ingredient identity through premium detail: macro texture, organized ingredient families, mortar or woven tray as context, clean separation between each ingredient, natural color accuracy.',
      'Supporting finished paste or dish may appear only as a small result cue. The raw ingredient story must dominate.',
      'Strictly avoid generic red paste close-ups, full meals, rice bowls, unlabeled jars, random herbs that do not match the title, and dark scenes that hide ingredient detail.',
    ].join(' ')
  }

  if (
    categoryMatches('วิธีทำอาหารเหนือ', 'Northern Cooking Methods', 'ວິທີເຮັດອາຫານເໜືອ', '泰北菜做法')
  ) {
    return [
      'Category visual brief: Northern Cooking Methods. The image must show how the title-specific dish is made, with the named dish or method as the hero.',
      'If the title names a specific dish, show that exact dish in process or finished-with-process context. If the title names an ingredient paste, show it being used in a clear cooking step.',
      'Hero subject should be an active recipe scene: a refined pan or bowl with the dish being mixed, simmered, pounded, or assembled; supporting ingredients arranged neatly beside it.',
      'Make it premium and instructional: visible transformation, clean mise en place, one spoon/tool cue, warm side light, crisp texture, restrained props, no people or hands.',
      'Strictly avoid generic Northern table spreads, unrelated chili paste bowls, random vegetables, rice as main subject, packaged product labels, and images that could fit any article title.',
    ].join(' ')
  }

  if (
    categoryMatches('สมุนไพรเหนือ', 'Northern Herbs', 'ສະໝຸນໄພເໜືອ', '泰北香草')
  ) {
    return [
      'Category visual brief: Northern Herbs. The named herb, spice, or aromatic must dominate the image with clear botanical identity.',
      'Hero subject should be identifiable Northern herbs or spices: ma-khwaen clusters, lemongrass, galangal, kaffir lime leaf, Vietnamese coriander, sawtooth coriander, dill, shallots, garlic, or the exact herb in the title.',
      'Use macro or premium ingredient portrait styling: crisp leaves, seed clusters, cut aromatics, small mortar texture, dark ceramic or stone, clean negative space.',
      'Supporting chili paste or finished dish should be tiny or absent unless the title explicitly mentions using the herb in a dish.',
      'Strictly avoid generic green herb piles, full meal plates, rice, red chili paste as hero, and any composition where the herb cannot be identified.',
    ].join(' ')
  }

  if (
    categoryMatches('ไอเดียจัดโต๊ะ', 'Table Ideas', 'ໄອເດຍຈັດໂຕະ', '餐桌灵感')
  ) {
    return [
      'Category visual brief: Table Ideas. The image must show premium table styling, serving composition, or plating arrangement based on the exact title.',
      'Hero subject should be the table arrangement itself: balanced placement of bowls, local vegetables, chili paste, servingware, textiles, and Lanna craft material. The layout must feel intentional and usable.',
      'Make it premium: editorial overhead or three-quarter table composition, harmonious ceramic set, linen or woven texture, refined spacing, clear focal path, warm inviting light, and visible negative space.',
      'Food items should support the table idea, not become a messy buffet. Use fewer dishes with better spacing and polished serving details.',
      'Strictly avoid crowded banquet spreads, random props, package labels, fake signage, overly dark scenes, and close-ups that do not show the table-setting idea.',
    ].join(' ')
  }

  if (
    searchable.includes('northern-cooking-methods') ||
    searchable.includes('วิธีทำอาหารเหนือ') ||
    searchable.includes('สูตรอาหารเหนือ') ||
    searchable.includes('how to cook') ||
    searchable.includes('cooking methods') ||
    searchable.includes('泰北菜做法')
  ) {
    return [
      'Title-specific visual brief: this article is a practical how-to guide for cooking different Northern Thai dishes.',
      'The image must show cooking method and transformation, not only a finished dish: curry paste blooming in oil, aromatics beside a pan, measured herbs, vegetables, and a small finished dish or chili paste bowl as the result.',
      'Use process cues such as a pan, spoon, mortar, prepared ingredients, and steam or glossy fried paste, but keep the scene clean, premium, and editorial.',
      'The viewer should immediately understand this is about how to cook Northern Thai food and how to use chili paste or curry paste across menus.',
      'Avoid a static generic Lanna table spread with no visible cooking action or method.',
    ].join(' ')
  }

  if (
    searchable.includes('northern-food-menu-guide') ||
    searchable.includes('เมนูอาหารเหนือ') ||
    searchable.includes('ยอดนิยม') ||
    searchable.includes('popular northern thai food') ||
    searchable.includes('food menu')
  ) {
    return [
      'Title-specific visual brief: this article is a Northern Thai menu guide.',
      'Show a curated spread with multiple Northern dishes or meal components, not one ingredient close-up and not a single bowl of chili paste.',
      'Include distinct menu variety such as a curry, a chili paste with vegetables, grilled protein, herbs, and a small rice element only as one supporting component.',
      'Avoid making any one prop dominate unless it clearly represents the menu guide. No text, no signs, no labels, no poster composition.',
      'The viewer should immediately understand this is a guide to what to eat in Northern Thai cuisine.',
    ].join(' ')
  }

  if (
    searchable.includes('roasted-chili-aroma') ||
    searchable.includes('กลิ่นพริกคั่ว') ||
    searchable.includes('พริกคั่ว') ||
    searchable.includes('roasted chili')
  ) {
    return [
      'Title-specific visual brief: this article is about roasted chili aroma as a quality signal for carefully made Northern chili paste.',
      'The visual hero must be roasted dried chilies and their aroma: wrinkled glossy red-brown chili skin, gentle smoke or heat haze, toasted surface texture, and warm roasted depth.',
      'Show the quality inspection mood: chilies being roasted, a small amount of finished chili paste, or aromatics such as shallot and garlic only as subtle supporting context.',
      'Strictly exclude sticky rice, plain rice, cooked rice bowls, full meal plates, boiled eggs, and vegetable side dishes. This is not an eating-pairing article.',
      'Avoid making a generic serving scene. The viewer should immediately think "roasted chili aroma" and "quality of Northern chili paste," not "meal with rice."',
    ].join(' ')
  }

  if (
    searchable.includes('seasonal-vegetables') ||
    searchable.includes('ผักพื้นบ้านกับน้ำพริก') ||
    searchable.includes('seasonal vegetables')
  ) {
    return [
      'Title-specific visual brief: this article is about choosing local vegetables to balance Northern chili paste.',
      'The visual hero must be a clean pairing of varied local vegetables and a small bowl of finished Northern chili paste, arranged to show balance and freshness.',
      'Show both fresh and blanched vegetable textures, with the chili paste as a supporting anchor rather than the only subject.',
      'Exclude plain rice bowls, sticky rice baskets, full meal plates, and unrelated roasted chilies. This is a vegetable-pairing guide, not a rice meal article.',
      'The viewer should immediately understand "local vegetables paired with Northern chili paste."',
    ].join(' ')
  }

  if (
    searchable.includes('local-vegetables') ||
    searchable.includes('ผักพื้นบ้าน') ||
    searchable.includes('ผักกินกับน้ำพริก') ||
    searchable.includes('local vegetables')
  ) {
    return [
      'Title-specific visual brief: this article is a practical list of Northern local vegetables served with Northern chili paste.',
      'The visual hero must be a clearly varied assortment of local vegetables, not a single pile of green herbs.',
      'Show at least six distinct vegetable types in tidy, recognizable groups: cucumber wedges, long beans, blanched pumpkin, Thai eggplant, cabbage or mustard greens, dill or Vietnamese coriander, and one seasonal leafy local green.',
      'Include a small bowl of finished Northern chili paste as the supporting subject so the viewer understands these are vegetables to eat with nam prik. The chili paste should be visible and appetizing, but smaller than the vegetables.',
      'Avoid making dried chilies, raw chili pods, a mortar, or plain rice the main subject. They may appear only as tiny supporting context if needed.',
      'The image should answer the title question "what local vegetables are there?" through visual variety and clear grouping.',
    ].join(' ')
  }

  if (
    searchable.includes('northern-curry-base') ||
    searchable.includes('เครื่องแกงเหนือ') ||
    searchable.includes('น้ำพริกแกงเหนือ') ||
    searchable.includes('curry paste')
  ) {
    return [
      'Title-specific visual brief: this article is about the foundation of Northern curry paste and why roasted aroma defines Lanna cooking.',
      'The visual hero must be curry paste preparation: roasted dried chilies, shallots, garlic, coriander root, herbs, and a mortar or stone bowl with coarse red curry paste.',
      'Show ingredient transformation from roasted aromatics into paste; use process texture, oil sheen, and spice depth.',
      'Strictly exclude sticky rice, plain rice, cooked rice bowls, full serving plates, and unrelated meal pairings. This is a curry-paste technique article.',
      'The viewer should immediately think "Northern curry paste base" rather than "meal ready to eat."',
    ].join(' ')
  }

  if (
    searchable.includes('northern-herbs') ||
    searchable.includes('สมุนไพรเหนือ')
  ) {
    return [
      'Title-specific visual brief: this article is about Northern Thai herbs and spices.',
      'The visual hero must be identifiable herbs and aromatics such as ma-khwaen, Vietnamese coriander, lemongrass, galangal, kaffir lime leaf, shallots, and garlic.',
      'Do not turn this into a generic chili paste meal; herbs and spices must dominate the frame.',
    ].join(' ')
  }

  if (
    searchable.includes('ma-khwaen-knowledge') ||
    searchable.includes('มะแขว่น') ||
    searchable.includes('ma-khwaen')
  ) {
    return [
      'Title-specific visual brief: this article is specifically about ma-khwaen as the Lanna spice that makes Northern flavor distinct.',
      'The visual hero must be ma-khwaen pepper clusters or dried ma-khwaen spice, sharply focused and clearly identifiable, with subtle Northern spice context.',
      'Supporting objects may include a small spice spoon, dried chili fragments, or a mortar texture, but ma-khwaen must dominate.',
      'Strictly exclude sticky rice, plain rice, cooked rice bowls, full meal plates, vegetable side dishes, and generic chili paste bowls as the main subject.',
      'The viewer should immediately think "ma-khwaen spice" and not a general Northern meal.',
    ].join(' ')
  }

  if (
    searchable.includes('quick-weeknight-northern-meal') ||
    searchable.includes('มื้อเหนือวันทำงาน') ||
    searchable.includes('weeknight')
  ) {
    return [
      'Title-specific visual brief: this article is about using Northern chili paste to cook a fast weeknight meal with deep flavor.',
      'The visual hero must be quick cooking action: chili paste being stirred into a pan with pork, egg, mushrooms, or vegetables, with a clean prepared-ingredients setup nearby.',
      'Show speed and depth through process cues such as a spoon, pan, glossy paste, steam, and organized mise en place; keep it premium and not busy.',
      'A small serving of rice may appear only as a minor background cue for a complete weeknight meal, never as a large foreground subject.',
      'Strictly exclude title text, poster layout, big rice bowls, a static chili-paste serving tray, and generic decorative herbs that do not show quick cooking.',
      'The viewer should immediately think "fast Northern cooking using chili paste," not "served rice and dip."',
    ].join(' ')
  }

  if (
    searchable.includes('travel') ||
    searchable.includes('ท่องเที่ยว') ||
    searchable.includes('ของฝาก') ||
    searchable.includes('souvenir')
  ) {
    return [
      'Title-specific visual brief: this article is about Northern travel, Phayao, local markets, and food souvenirs.',
      'The visual hero must be a premium travel-souvenir gift scene, not a meal and not a raw market pile: an elegant woven gift basket or natural cloth travel tote arranged like a luxury Northern Thai food hamper.',
      'Show gift-ready, take-home objects without any text or labels: sealed unbranded ceramic crocks, small cloth-wrapped bundles, neat clear spice sachets tied with plain natural cord, dried chili bundles, local herbs tucked as accents, and one small bowl of finished chili paste only as a tasting cue.',
      'Make the styling feel curated and high-end: fewer objects, precise spacing, clean hierarchy, refined negative space, no clutter, no random loose ingredients, no cheap souvenir look, no crowded market pile.',
      'Add clear Phayao travel context through non-text visual cues: soft Kwan Phayao lakeside water, distant mountain silhouette, warm morning light, local craft texture, woven basket handle, and the feeling of choosing a special food gift before returning home.',
      'Strictly exclude sticky rice, plain rice, cooked rice bowls, eating plates, full meal spreads, and a single bowl of chili paste as the main subject. This is not a serving suggestion or dinner article.',
      'Strictly avoid scattered raw chilies outside the basket, oversized herbs, large empty jars, unlidded containers that feel unfinished, or any object that looks like a product package with missing label space.',
      'Do not use signs, maps with writing, labels, package text, shop names, price tags, stamps, seals with text, or any readable typography. Use only objects and place atmosphere to communicate travel and souvenir.',
      'The viewer should immediately think "premium Phayao food souvenir basket" and "Northern travel gift" rather than "Northern chili paste meal" or "ingredient shopping."',
    ].join(' ')
  }

  if (
    searchable.includes('sticky-rice-pairing') ||
    searchable.includes('ข้าวเหนียว') ||
    searchable.includes('sticky rice')
  ) {
    return [
      'Title-specific visual brief: this article is specifically about sticky rice and Northern chili paste pairing.',
      'The visual hero may include warm sticky rice because it is named in the title, but it must be paired clearly with Northern chili paste and a small selection of vegetables.',
      'Show a simple premium meal pairing, not a cooking-process scene and not a generic ingredient pile.',
      'Avoid travel souvenirs, market baskets, curry-paste technique props, and unrelated raw spice close-ups.',
      'The viewer should immediately think "sticky rice with Northern chili paste."',
    ].join(' ')
  }

  return 'Title-specific visual brief: make the exact title visually obvious through the main subject and supporting props. Do not rely on generic Northern Thai food styling.'
}

export function buildImagePrompt(article, seedValue = article.slug || article.title || '') {
  const tags = Array.isArray(article.tags) ? article.tags.slice(0, 6).join(', ') : ''
  const highlights = Array.isArray(article.highlights) ? article.highlights.slice(0, 3).join(' | ') : ''
  const opening = Array.isArray(article.content) ? article.content[0] : ''
  const topicBrief = buildTopicImageBrief(article)
  const seed = hashString(`${seedValue}-${article.title}-${article.category}`)
  const composition = pickBySeed([
    'top-down editorial flat lay with a strong diagonal arrangement and generous clean negative space in the upper third',
    'low 45-degree three-quarter table scene with a single hero bowl in the foreground and soft layered depth behind it',
    'tight macro ingredient portrait with one premium focal ingredient, supporting textures, and creamy blurred background',
    'asymmetrical magazine cover composition with the hero subject placed off-center and refined empty space for overlay text',
    'vertical culinary still life cropped like a luxury cookbook cover, with tall foreground layers and a calm background plane',
    'minimal museum-style food study on stone or dark ceramic, one precise focal point, restrained props, and elegant shadows',
    'market-to-table editorial scene showing carefully selected local ingredients arranged in neat clusters with natural rhythm',
    'process-focused composition with roasted aromatics, mortar texture, and finished paste implied without using packaging',
  ], seed)
  const surface = pickBySeed([
    'handmade dark ceramic on warm teak',
    'matte charcoal stone with a small linen accent',
    'aged Lanna wooden tray with subtle grain',
    'brushed brass spoon against deep brown ceramic',
    'banana leaf and natural fiber mat used sparingly',
    'unglazed clay bowl on a clean neutral plaster surface',
  ], seed, 3)
  const lighting = pickBySeed([
    'soft morning side light from the left with long gentle shadows',
    'late afternoon golden window light with warm highlights and controlled contrast',
    'diffused overhead studio light with crisp texture and minimal glare',
    'moody directional restaurant light with deep background falloff and sharp food detail',
    'bright premium cookbook light, natural color, airy but not washed out',
  ], seed, 7)
  const lens = pickBySeed([
    '50mm editorial lens feel, natural perspective',
    '85mm food portrait compression, shallow depth of field',
    '35mm environmental food photography with controlled context',
    'macro lens detail for herbs, chili texture, and roasted aromatics',
  ], seed, 11)
  const colorMood = pickBySeed([
    'deep chili red, fresh herb green, soft ivory highlights, and muted gold accents',
    'earthy charcoal, roasted red, turmeric gold, and fresh vegetable green',
    'soft ivory, dark wood, clay brown, and precise red-orange highlights',
    'premium natural palette with balanced greens, warm browns, and restrained red accents',
  ], seed, 17)

  return [
    'Create a premium professional text-free editorial food photograph for a Northern Thai culinary article.',
    `Internal semantic reference only, never render as text: article title is "${article.title}".`,
    `Absolute priority: the image concept must be built from the exact article title idea first, before category, mood, or generic Northern Thai styling. The title must never appear as visible text. A viewer should be able to infer the article topic from the food, ingredients, cooking action, and composition only.`,
    `Most important requirement: the image must clearly support this exact article topic, not a generic Northern Thai food scene. Category: ${article.category || 'Northern Thai food'}. Excerpt: ${article.excerpt || ''}. Tags: ${tags}. Key points: ${highlights}. Opening idea: ${opening}.`,
    topicBrief,
    'Translate the article title into simple, instantly understandable visual storytelling: choose the main subject, supporting ingredient, prop, setting, and mood only if they directly explain the title and key points.',
    'Before composing the image, identify the exact title keyword and make it the visual hero. If the title names a specific dish, that exact dish must dominate the image. If the title names a cooking method, show that method and the transformation. If the title is about herbs, herbs must dominate; if it is about local vegetables, vegetables must dominate; if it is about travel, show a food-travel souvenir or local-market story; if it is about a menu guide, show a curated Northern Thai menu spread. The title-specific visual brief overrides all generic styling suggestions.',
    'Do not make a beautiful but unrelated Lanna table scene. Do not use chili paste, sticky rice, dried chilies, bowls, or vegetables as default filler unless they directly support the article title.',
    'Premium requirement for every category: no crowded table, no random garnish scatter, no unclear main subject. Use fewer objects, stronger focal hierarchy, cleaner negative space, refined ceramic or natural material props, and commercial cookbook-level lighting.',
    `Use this specific visual direction for this generation: ${composition}.`,
    `Surface and prop language: ${surface}. Avoid repeating the same default wooden-table setup unless it is essential to the selected direction.`,
    `Lighting: ${lighting}. Lens and camera language: ${lens}. Color palette: ${colorMood}.`,
    'Use one clear main subject, one supporting subject, and clean negative space. The viewer should understand the article theme within two seconds.',
    'Photorealistic commercial food photography for a high-end Northern Thai chili paste brand.',
    'Composition must look professionally art-directed and easy to read: clear focal point, balanced foreground/midground/background, refined negative space, strong depth, elegant visual hierarchy, no random clutter, no scattered props that do not serve the article.',
    'Use a warm Lanna craft mood, but vary the food styling and camera setup for every generated image. Choose only the props that serve this article topic: roasted dried chilies, herbs, fresh vegetables, small ceramic bowls, mortar texture, market ingredients, cooking tools, or finished dish details as explicitly appropriate.',
    'Sticky rice, plain rice, or cooked rice may appear only when the article title explicitly mentions rice, sticky rice, a meal pairing, or a complete meal. Otherwise exclude rice completely.',
    'Do not generate product packaging, jars, boxes, pouches, product labels, blank labels, fake labels, or any branded objects. If a product shot is needed, it will be added later from real website product assets, not generated by AI.',
    'CRITICAL: generate a pure photograph only. No poster design, no title overlay, no headline, no caption, no UI, no menu board, no sign, no label, no watermark, no written characters, no Thai text, no English text, no letters, no numbers, no glyphs anywhere in the image.',
    'CRITICAL: do not generate any logo, brand mark, flame icon, KHUA word, fake badge, or typography. The website badge will be composited separately after generation.',
    'Leave clean negative space for article text overlay on the website.',
    'Premium magazine quality, realistic shadows, crisp food texture, shallow depth of field when appropriate but main objects sharp.',
    'Final hard check before output: the image must contain zero readable text and zero logo-like marks. If any text or logo would appear, remove it and replace that area with plain food photography background.',
    'No people, no hands, no messy background, no low-end stock photo look.',
  ].join(' ')
}

async function transparentWebsiteLogo(width, height) {
  const source = sharp(websiteLogoPath)
  const metadata = await source.metadata()
  const sourceWidth = metadata.width ?? 1024
  const sourceHeight = metadata.height ?? 1024
  const cropLeft = Math.round(sourceWidth * 0.08)
  const cropTop = Math.round(sourceHeight * 0.12)
  const cropWidth = Math.round(sourceWidth * 0.7)
  const cropHeight = Math.round(sourceHeight * 0.64)

  const { data, info } = await sharp(websiteLogoPath)
    .extract({ left: cropLeft, top: cropTop, width: cropWidth, height: cropHeight })
    .resize(width, height, { fit: 'contain' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  for (let index = 0; index < data.length; index += 4) {
    const sourceAlpha = data[index + 3]
    if (sourceAlpha < 10) {
      data[index + 3] = 0
      continue
    }

    const red = data[index]
    const green = data[index + 1]
    const blue = data[index + 2]
    const max = Math.max(red, green, blue)
    const min = Math.min(red, green, blue)
    const saturation = max - min

    if (max < 18 && saturation < 10) {
      data[index + 3] = 0
      continue
    }

    const darkInk = Math.max(0, 120 - max) * 3.2
    const warmInk = Math.max(0, red - green - 18) * 3 + Math.max(0, red - blue - 24) * 2.4
    const brightStroke = max > 222 && saturation < 42 ? (max - 222) * 3 : 0
    const alpha = Math.max(darkInk, warmInk, brightStroke)

    data[index + 3] = alpha < 28 ? 0 : Math.min(255, Math.round(alpha))
  }

  return sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  })
    .png()
    .toBuffer()
}

export async function addWebsiteLogoToImage(imagePath) {
  if (!fs.existsSync(websiteLogoPath)) return

  const metadata = await sharp(imagePath).metadata()
  const width = metadata.width ?? 1536
  const height = metadata.height ?? 1024

  const badgeSize = Math.round(width * 0.095)
  const badgeLogoSize = Math.round(badgeSize * 0.72)
  const badgeMargin = Math.round(width * 0.032)
  const badgeRadius = Math.round(badgeSize * 0.16)

  const websiteBadge = Buffer.from(`
    <svg width="${badgeSize}" height="${badgeSize}" viewBox="0 0 ${badgeSize} ${badgeSize}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${badgeSize}" height="${badgeSize}" rx="${badgeRadius}" fill="rgba(255,248,232,0.88)"/>
      <rect x="1" y="1" width="${badgeSize - 2}" height="${badgeSize - 2}" rx="${badgeRadius}" fill="none" stroke="rgba(168,120,36,0.28)" stroke-width="2"/>
    </svg>
  `)

  const websiteLogo = await transparentWebsiteLogo(badgeLogoSize, badgeLogoSize)

  const output = await sharp(imagePath)
    .composite([
      {
        input: websiteBadge,
        left: width - badgeSize - badgeMargin,
        top: badgeMargin,
      },
      {
        input: websiteLogo,
        left: width - badgeSize - badgeMargin + Math.round((badgeSize - badgeLogoSize) / 2),
        top: badgeMargin + Math.round((badgeSize - badgeLogoSize) / 2),
      },
    ])
    .png()
    .toBuffer()

  fs.writeFileSync(imagePath, output)
}

export async function generateCoverImage(slug, article, options = {}) {
  const fileSlug = options.variant ? `${slug}-${options.variant}` : slug
  const existingPath = path.join(uploadsDir, `${fileSlug}.png`)
  const publicPath = `/uploads/articles/${fileSlug}.png`
  const prompt = buildImagePrompt(article, fileSlug)

  if (!options.force && fs.existsSync(existingPath)) {
    return { coverImageUrl: publicPath, imagePrompt: prompt, generated: false, reused: true }
  }

  if (!process.env.OPENAI_API_KEY) {
    console.warn('Article image generation skipped: OPENAI_API_KEY is not set.')
    return {
      coverImageUrl: '/khua-lanna-table-scene.png',
      imagePrompt: prompt,
      generated: false,
      fallback: true,
      reason: 'OPENAI_API_KEY is not set',
    }
  }

  if (options.skipRemote) {
    return {
      coverImageUrl: '/khua-lanna-table-scene.png',
      imagePrompt: prompt,
      generated: false,
      fallback: true,
      reason: 'Remote image generation skipped for fast article draft creation',
    }
  }

  try {
    const response = await fetchWithTimeout('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1',
        prompt,
        size: '1536x1024',
        quality: process.env.OPENAI_IMAGE_QUALITY || 'medium',
        output_format: 'png',
      }),
    }, options.timeoutMs || envInt('OPENAI_IMAGE_TIMEOUT_MS', 25000))

    if (!response.ok) {
      const body = await response.text()
      throw new Error(`OpenAI image generation failed: ${response.status} ${body.slice(0, 500)}`)
    }

    const data = await response.json()
    const base64 = data?.data?.[0]?.b64_json
    if (!base64) {
      throw new Error('OpenAI image generation returned no image data')
    }

    fs.mkdirSync(uploadsDir, { recursive: true })
    fs.writeFileSync(existingPath, Buffer.from(base64, 'base64'))
    await addWebsiteLogoToImage(existingPath)
    return { coverImageUrl: publicPath, imagePrompt: prompt, generated: true, fallback: false }
  } catch (error) {
    console.warn('Article image generation failed:', error)
    return {
      coverImageUrl: '/khua-lanna-table-scene.png',
      imagePrompt: prompt,
      generated: false,
      fallback: true,
      reason: error instanceof Error ? error.message : String(error),
    }
  }
}

async function latestGeneratedDateFromDb(connection) {
  const [rows] = await connection.execute(`
    SELECT slug FROM articles
    WHERE slug LIKE 'daily-%'
    ORDER BY published_at DESC, id DESC
    LIMIT 1
  `)
  const slug = rows?.[0]?.slug
  return slug?.match(/^daily-(\d{4}-\d{2}-\d{2})-/)?.[1]
}

async function upsertArticle(connection, date, localizedArticles) {
  const primary = localizedArticles.th ?? Object.values(localizedArticles)[0]
  const slug = primary.slug
  const { coverImageUrl, imagePrompt } = await generateCoverImage(slug, primary)

  await connection.execute(
    `
      INSERT INTO articles (slug, status, cover_image_url, image_prompt, published_at)
      VALUES (?, 'published', ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        status = VALUES(status),
        cover_image_url = VALUES(cover_image_url),
        image_prompt = VALUES(image_prompt),
        published_at = VALUES(published_at)
    `,
    [slug, coverImageUrl, imagePrompt, `${date} 08:00:00`],
  )

  const [articleRows] = await connection.execute('SELECT id FROM articles WHERE slug = ? LIMIT 1', [slug])
  const articleId = articleRows?.[0]?.id
  if (!articleId) throw new Error(`Could not resolve article id for ${slug}`)

  for (const locale of locales) {
    const article = localizedArticles[locale]
    await connection.execute(
      `
        INSERT INTO article_translations (
          article_id,
          locale,
          title,
          excerpt,
          category,
          date_label,
          read_time,
          tags_json,
          highlights_json,
          content_json,
          meta_title,
          meta_description
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          title = VALUES(title),
          excerpt = VALUES(excerpt),
          category = VALUES(category),
          date_label = VALUES(date_label),
          read_time = VALUES(read_time),
          tags_json = VALUES(tags_json),
          highlights_json = VALUES(highlights_json),
          content_json = VALUES(content_json),
          meta_title = VALUES(meta_title),
          meta_description = VALUES(meta_description)
      `,
      [
        articleId,
        locale,
        article.title,
        article.excerpt,
        article.category,
        article.date,
        article.readTime,
        JSON.stringify(article.tags),
        JSON.stringify(article.highlights),
        JSON.stringify(article.content),
        article.title,
        article.excerpt,
      ],
    )
  }
}

async function seedLegacyGeneratedArticles(connection, data) {
  const slugs = new Set()

  for (const locale of locales) {
    for (const article of data[locale] ?? []) {
      slugs.add(article.slug)
    }
  }

  for (const slug of slugs) {
    const match = slug.match(/^daily-(\d{4}-\d{2}-\d{2})-/)
    if (!match) continue
    const localizedArticles = {}
    for (const locale of locales) {
      const found = data[locale]?.find((article) => article.slug === slug)
      if (found) localizedArticles[locale] = found
    }
    if (locales.every((locale) => localizedArticles[locale])) {
      await upsertArticle(connection, match[1], localizedArticles)
    }
  }
}

function latestGeneratedDate(data) {
  const dates = locales.flatMap((locale) =>
    data[locale]
      .map((article) => article.slug.match(/^daily-(\d{4}-\d{2}-\d{2})-/)?.[1])
      .filter(Boolean),
  )
  return dates.sort().at(-1)
}

function briefSlug(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
}

function isNamPrikOngRecipe(brief = '', category = '') {
  const searchable = `${brief} ${category}`.toLowerCase()
  return (
    searchable.includes('น้ำพริกอ่อง') ||
    searchable.includes('น้ําพริกอ่อง') ||
    searchable.includes('nam prik ong') ||
    searchable.includes('nam phrik ong')
  )
}

function isNorthernYamGaiNamPrikLarbRecipe(brief = '', category = '') {
  const searchable = `${brief} ${category}`.toLowerCase()
  const hasChickenSalad =
    searchable.includes('ยำไก่') ||
    searchable.includes('ยําไก่') ||
    searchable.includes('yam gai') ||
    searchable.includes('yum gai') ||
    searchable.includes('northern chicken salad')
  const hasLarbPaste =
    searchable.includes('น้ำพริกลาบ') ||
    searchable.includes('น้ําพริกลาบ') ||
    searchable.includes('nam prik larb') ||
    searchable.includes('nam phrik larb') ||
    searchable.includes('larb paste') ||
    searchable.includes('laab paste')

  return hasChickenSalad && hasLarbPaste
}

function isYodMakokLocalVegetable(brief = '', category = '') {
  const searchable = `${brief} ${category}`.toLowerCase()
  const hasYodMakok =
    searchable.includes('ยอดมะกอก') ||
    searchable.includes('ใบมะกอก') ||
    searchable.includes('olive shoots') ||
    searchable.includes('hog plum shoots') ||
    searchable.includes('spondias')
  const hasVegetableContext =
    searchable.includes('ผักพื้นบ้าน') ||
    searchable.includes('ผัก') ||
    searchable.includes('local vegetable') ||
    searchable.includes('local vegetables') ||
    searchable.includes('seasonal vegetable') ||
    searchable.includes('vegetable')

  return hasYodMakok && hasVegetableContext
}

function isPhakKhaoTongLocalVegetable(brief = '', category = '') {
  const searchable = `${brief} ${category}`.toLowerCase()
  const hasPhakKhaoTong =
    searchable.includes('ผักคาวตอง') ||
    searchable.includes('ผักคาวทอง') ||
    searchable.includes('พลูคาว') ||
    searchable.includes('fish mint') ||
    searchable.includes('houttuynia') ||
    searchable.includes('heartleaf')
  const hasVegetableContext =
    searchable.includes('ผักพื้นบ้าน') ||
    searchable.includes('ผัก') ||
    searchable.includes('สมุนไพร') ||
    searchable.includes('local vegetable') ||
    searchable.includes('local vegetables') ||
    searchable.includes('herb') ||
    searchable.includes('vegetable')

  return hasPhakKhaoTong && hasVegetableContext
}

function localizedCookingCategory(locale, category = '') {
  const cleanedCategory = String(category || '').trim()
  const cookingCategories = [
    'วิธีทำอาหารเหนือ',
    'Northern Cooking Methods',
    'ວິທີເຮັດອາຫານເໜືອ',
    '泰北菜做法',
  ]

  if (!cleanedCategory || cookingCategories.includes(cleanedCategory)) {
    return {
      th: 'วิธีทำอาหารเหนือ',
      en: 'Northern Cooking Methods',
      lo: 'ວິທີເຮັດອາຫານເໜືອ',
      zh: '泰北菜做法',
    }[locale] || 'Northern Cooking Methods'
  }

  return cleanedCategory
}

function localizedLocalVegetableCategory(locale, category = '') {
  const cleanedCategory = String(category || '').trim()
  const localVegetableCategories = [
    'ผักพื้นบ้าน',
    'Local Vegetables',
    'ຜັກພື້ນບ້ານ',
    '本地蔬菜',
  ]

  if (!cleanedCategory || localVegetableCategories.includes(cleanedCategory)) {
    return {
      th: 'ผักพื้นบ้าน',
      en: 'Local Vegetables',
      lo: 'ຜັກພື້ນບ້ານ',
      zh: '本地蔬菜',
    }[locale] || 'Local Vegetables'
  }

  return cleanedCategory
}

function isLannaIngredientsCategory(category = '') {
  const cleanedCategory = String(category || '').trim()
  return [
    'วัตถุดิบล้านนา',
    'Lanna Ingredients',
    'ວັດຖຸດິບລ້ານນາ',
    '兰纳食材',
  ].includes(cleanedCategory)
}

function localizedLannaIngredientCategory(locale, category = '') {
  const cleanedCategory = String(category || '').trim()
  if (!cleanedCategory || isLannaIngredientsCategory(cleanedCategory)) {
    return {
      th: 'วัตถุดิบล้านนา',
      en: 'Lanna Ingredients',
      lo: 'ວັດຖຸດິບລ້ານນາ',
      zh: '兰纳食材',
    }[locale] || 'Lanna Ingredients'
  }

  return cleanedCategory
}

function cleanBriefSubject(brief = '') {
  return String(brief || '')
    .replace(/อยากได้/g, '')
    .replace(/บทความ/g, '')
    .replace(/เกี่ยวกับ/g, '')
    .replace(/ขอ/g, '')
    .replace(/เน้น\s*seo/gi, '')
    .replace(/seo/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80)
}

function lannaIngredientSlug(subject = '') {
  const value = String(subject || '').toLowerCase()
  const mappings = [
    ['มะแขว่น', 'ma-khwaen'],
    ['มะแข่น', 'ma-khwaen'],
    ['ถั่วเน่า', 'thua-nao'],
    ['ดีปลี', 'long-pepper'],
    ['ข่า', 'galangal'],
    ['ตะไคร้', 'lemongrass'],
    ['ขมิ้น', 'turmeric'],
    ['พริกแห้ง', 'dried-chili'],
    ['พริกคั่ว', 'roasted-chili'],
    ['หอมแดง', 'shallot'],
    ['กระเทียม', 'garlic'],
    ['ใบมะกรูด', 'kaffir-lime-leaf'],
    ['ผักชีฝรั่ง', 'sawtooth-coriander'],
    ['ผักแพว', 'vietnamese-coriander'],
    ['kaffir', 'kaffir-lime-leaf'],
    ['galangal', 'galangal'],
    ['lemongrass', 'lemongrass'],
    ['turmeric', 'turmeric'],
    ['garlic', 'garlic'],
    ['shallot', 'shallot'],
    ['long pepper', 'long-pepper'],
    ['ma-khwaen', 'ma-khwaen'],
    ['makhwaen', 'ma-khwaen'],
    ['thua nao', 'thua-nao'],
  ]
  const found = mappings.find(([keyword]) => value.includes(keyword))
  return found?.[1] || briefSlug(subject) || 'lanna-ingredient'
}

function focusedSubjectSlug(subject = '', fallback = 'custom-topic') {
  const value = String(subject || '').toLowerCase()
  const mappings = [
    ['ภูมิปัญญาครัวเหนือ', 'northern-kitchen-wisdom'],
    ['ครัวเหนือ', 'northern-kitchen'],
    ['พริกแห้ง', 'dried-chili'],
    ['พริกคั่ว', 'roasted-chili'],
    ['เลือกพริก', 'chili-selection'],
    ['คั่วพริกแกง', 'roasted-curry-paste-technique'],
    ['คั่วเครื่องแกง', 'roasted-curry-paste-technique'],
    ['เครื่องแกง', 'curry-paste'],
    ['แกงฮังเล', 'gaeng-hung-lay'],
    ['ส้าจิ๊น', 'saa-jin'],
    ['ส้าจิ้น', 'saa-jin'],
    ['ส้าเนื้อ', 'saa-jin'],
    ['ข้าวซอย', 'khao-soi'],
    ['ไส้อั่ว', 'sai-ua'],
    ['น้ำพริกหนุ่ม', 'nam-prik-num'],
    ['น้ำพริกอ่อง', 'nam-prik-ong'],
    ['หัวปลี', 'banana-blossom'],
    ['ผักชีฝรั่ง', 'sawtooth-coriander'],
    ['ผักแพว', 'vietnamese-coriander'],
    ['มะแขว่น', 'ma-khwaen'],
    ['ตะไคร้', 'lemongrass'],
    ['ข่า', 'galangal'],
    ['ขมิ้น', 'turmeric'],
    ['ดีปลี', 'long-pepper'],
    ['ถั่วเน่า', 'thua-nao'],
    ['หอมแดง', 'shallot'],
    ['กระเทียม', 'garlic'],
    ['ใบมะกรูด', 'kaffir-lime-leaf'],
    ['ขันโตก', 'khantoke-table'],
    ['จัดโต๊ะ', 'table-setting'],
    ['hung lay', 'gaeng-hung-lay'],
    ['khao soi', 'khao-soi'],
    ['sai ua', 'sai-ua'],
    ['khantoke', 'khantoke-table'],
  ]
  const found = mappings.find(([keyword]) => value.includes(keyword))
  return found?.[1] || briefSlug(subject) || fallback
}

function localizedSubjectName(slug = '', fallback = '', locale = 'th') {
  const names = {
    'northern-kitchen-wisdom': {
      th: 'ภูมิปัญญาครัวเหนือ',
      en: 'Northern kitchen wisdom',
      lo: 'ພູມປັນຍາຄົວເໜືອ',
      zh: '泰北厨房智慧',
    },
    'northern-kitchen': {
      th: 'ครัวเหนือ',
      en: 'Northern kitchen',
      lo: 'ຄົວເໜືອ',
      zh: '泰北厨房',
    },
    'dried-chili': {
      th: 'พริกแห้ง',
      en: 'Dried chili',
      lo: 'ໝາກເຜັດແຫ້ງ',
      zh: '干辣椒',
    },
    'roasted-chili': {
      th: 'พริกคั่ว',
      en: 'Roasted chili',
      lo: 'ໝາກເຜັດຄົ່ວ',
      zh: '烘烤辣椒',
    },
    'chili-selection': {
      th: 'วิธีเลือกพริก',
      en: 'Chili selection',
      lo: 'ວິທີເລືອກໝາກເຜັດ',
      zh: '辣椒挑选',
    },
    'roasted-curry-paste-technique': {
      th: 'เทคนิคคั่วพริกแกงให้หอม',
      en: 'Roasting curry paste aromatics',
      lo: 'ເທັກນິກຄົ່ວເຄື່ອງແກງໃຫ້ຫອມ',
      zh: '炒香咖喱酱香料技巧',
    },
    'curry-paste': {
      th: 'เครื่องแกง',
      en: 'Curry paste',
      lo: 'ເຄື່ອງແກງ',
      zh: '咖喱酱',
    },
    'gaeng-hung-lay': {
      th: 'แกงฮังเล',
      en: 'Gaeng Hung Lay',
      lo: 'ແກງຮັງເລ',
      zh: '泰北杭莱咖喱',
    },
    'saa-jin': {
      th: 'ส้าจิ้น',
      en: 'Saa Jin Northern beef salad',
      lo: 'ສ້າຊີ້ນ',
      zh: '泰北生牛肉香料沙拉',
    },
    'khao-soi': {
      th: 'ข้าวซอย',
      en: 'Khao Soi',
      lo: 'ເຂົ້າຊອຍ',
      zh: '泰北咖喱面',
    },
    'sai-ua': {
      th: 'ไส้อั่ว',
      en: 'Sai Ua',
      lo: 'ໄສ້ອົ່ວ',
      zh: '泰北香肠',
    },
    'nam-prik-num': {
      th: 'น้ำพริกหนุ่ม',
      en: 'Nam Prik Num',
      lo: 'ນ້ຳພິກໜຸ່ມ',
      zh: '泰北青辣椒酱',
    },
    'nam-prik-ong': {
      th: 'น้ำพริกอ่อง',
      en: 'Nam Prik Ong',
      lo: 'ນ້ຳພິກອ່ອງ',
      zh: '泰北番茄肉末辣椒酱',
    },
    'banana-blossom': {
      th: 'หัวปลี',
      en: 'Banana blossom',
      lo: 'ຫົວປີ',
      zh: '香蕉花',
    },
    'sawtooth-coriander': {
      th: 'ผักชีฝรั่ง',
      en: 'Sawtooth coriander',
      lo: 'ຜັກຫອມເປ',
      zh: '刺芫荽',
    },
    'vietnamese-coriander': {
      th: 'ผักแพว',
      en: 'Vietnamese coriander',
      lo: 'ຜັກແພວ',
      zh: '越南香菜',
    },
    'ma-khwaen': {
      th: 'มะแขว่น',
      en: 'Ma-khwaen',
      lo: 'ໝາກແຂວ່ນ',
      zh: '泰北花椒',
    },
    'thua-nao': {
      th: 'ถั่วเน่า',
      en: 'Thua Nao fermented soybean',
      lo: 'ຖົ່ວເນົ່າ',
      zh: '泰北发酵大豆',
    },
    'long-pepper': {
      th: 'ดีปลี',
      en: 'Long pepper',
      lo: 'ດີປີ',
      zh: '荜茇',
    },
    galangal: {
      th: 'ข่า',
      en: 'Galangal',
      lo: 'ຂ່າ',
      zh: '南姜',
    },
    lemongrass: {
      th: 'ตะไคร้',
      en: 'Lemongrass',
      lo: 'ຕະໄຄ້',
      zh: '香茅',
    },
    turmeric: {
      th: 'ขมิ้น',
      en: 'Turmeric',
      lo: 'ຂີ້ໝິ້ນ',
      zh: '姜黄',
    },
    shallot: {
      th: 'หอมแดง',
      en: 'Shallot',
      lo: 'ຫອມແດງ',
      zh: '红葱头',
    },
    garlic: {
      th: 'กระเทียม',
      en: 'Garlic',
      lo: 'ກະທຽມ',
      zh: '大蒜',
    },
    'kaffir-lime-leaf': {
      th: 'ใบมะกรูด',
      en: 'Kaffir lime leaf',
      lo: 'ໃບໝາກຂີ້ຫູດ',
      zh: '泰国青柠叶',
    },
    'khantoke-table': {
      th: 'จัดโต๊ะอาหารเหนือแบบขันโตก',
      en: 'Khantoke-style Northern table setting',
      lo: 'ຈັດໂຕະອາຫານເໜືອແບບຂັນໂຕກ',
      zh: '康托克式泰北餐桌布置',
    },
    'table-setting': {
      th: 'จัดโต๊ะ',
      en: 'Table setting',
      lo: 'ຈັດໂຕະ',
      zh: '餐桌布置',
    },
  }

  if (locale === 'th') return String(fallback || names[slug]?.th || '').trim()
  return names[slug]?.[locale] || String(fallback || names[slug]?.en || '').trim()
}

function categoryKind(category = '') {
  const value = String(category || '').trim().toLowerCase()
  const groups = {
    northernKitchen: ['ความรู้ครัวเหนือ', 'northern kitchen', 'ຄວາມຮູ້ຄົວເໜືອ', '泰北厨房知识'],
    ingredientQuality: ['คุณภาพวัตถุดิบ', 'ingredient quality', 'ຄຸນນະພາບວັດຖຸດິບ', '食材品质'],
    cookingTechnique: ['เทคนิคทำอาหาร', 'cooking technique', 'ເທັກນິກເຮັດອາຫານ', '料理技巧'],
    localVegetables: ['ผักพื้นบ้าน', 'local vegetables', 'ຜັກພື້ນບ້ານ', '本地蔬菜'],
    northernMenu: ['เมนูอาหารเหนือ', 'northern food menu', 'ເມນູອາຫານເໜືອ', '泰北美食菜单'],
    lannaIngredients: ['วัตถุดิบล้านนา', 'lanna ingredients', 'ວັດຖຸດິບລ້ານນາ', '兰纳食材'],
    northernCookingMethods: ['วิธีทำอาหารเหนือ', 'northern cooking methods', 'ວິທີເຮັດອາຫານເໜືອ', '泰北菜做法'],
    northernHerbs: ['สมุนไพรเหนือ', 'northern herbs', 'ສະໝຸນໄພເໜືອ', '泰北香草'],
    tableIdeas: ['ไอเดียจัดโต๊ะ', 'table ideas', 'ໄອເດຍຈັດໂຕະ', '餐桌灵感'],
  }
  return Object.entries(groups).find(([, values]) =>
    values.some((item) => value === item.toLowerCase())
  )?.[0] || ''
}

function localizedFocusedCategory(locale, kind, category = '') {
  const cleanedCategory = String(category || '').trim()
  const labels = {
    northernKitchen: { th: 'ความรู้ครัวเหนือ', en: 'Northern Kitchen', lo: 'ຄວາມຮູ້ຄົວເໜືອ', zh: '泰北厨房知识' },
    ingredientQuality: { th: 'คุณภาพวัตถุดิบ', en: 'Ingredient Quality', lo: 'ຄຸນນະພາບວັດຖຸດິບ', zh: '食材品质' },
    cookingTechnique: { th: 'เทคนิคทำอาหาร', en: 'Cooking Technique', lo: 'ເທັກນິກເຮັດອາຫານ', zh: '料理技巧' },
    localVegetables: { th: 'ผักพื้นบ้าน', en: 'Local Vegetables', lo: 'ຜັກພື້ນບ້ານ', zh: '本地蔬菜' },
    northernMenu: { th: 'เมนูอาหารเหนือ', en: 'Northern Food Menu', lo: 'ເມນູອາຫານເໜືອ', zh: '泰北美食菜单' },
    lannaIngredients: { th: 'วัตถุดิบล้านนา', en: 'Lanna Ingredients', lo: 'ວັດຖຸດິບລ້ານນາ', zh: '兰纳食材' },
    northernCookingMethods: { th: 'วิธีทำอาหารเหนือ', en: 'Northern Cooking Methods', lo: 'ວິທີເຮັດອາຫານເໜືອ', zh: '泰北菜做法' },
    northernHerbs: { th: 'สมุนไพรเหนือ', en: 'Northern Herbs', lo: 'ສະໝຸນໄພເໜືອ', zh: '泰北香草' },
    tableIdeas: { th: 'ไอเดียจัดโต๊ะ', en: 'Table Ideas', lo: 'ໄອເດຍຈັດໂຕະ', zh: '餐桌灵感' },
  }
  return labels[kind]?.[locale] || cleanedCategory || labels[kind]?.en || 'Northern Thai Food'
}

function buildFocusedCategoryArticle(date, locale, brief = '', category = '') {
  const requestedSubject = cleanBriefSubject(brief)
  const kind = categoryKind(category)
  if (!requestedSubject || !kind || kind === 'lannaIngredients') return null

  const slug = focusedSubjectSlug(requestedSubject, kind.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`))
  const subject = localizedSubjectName(slug, requestedSubject, locale)
  const categoryLabel = localizedFocusedCategory(locale, kind, category)
  const subjectTag = subject.length > 32 ? subject.slice(0, 32).trim() : subject
  const configs = {
    northernKitchen: {
      slugSuffix: 'northern-kitchen-knowledge',
      thTitle: `${subject}: ความรู้ครัวเหนือที่ควรเล่าให้ตรงประเด็น`,
      thExcerpt: `อธิบาย ${subject} ในมุมความรู้ครัวเหนือ ทั้งบริบทล้านนา เหตุผลการใช้จริง และคำตอบที่คนค้นหาต้องการ`,
      thTags: [subjectTag, 'ความรู้ครัวเหนือ', 'ครัวล้านนา', 'อาหารเหนือ', 'ภูมิปัญญาอาหารเหนือ'],
      thHighlights: [
        `${subject} ต้องเป็นแกนหลักของบทความ ไม่เปลี่ยนไปเป็นสูตรหรือเมนูอื่น`,
        'อธิบายบริบทครัวเหนือ เหตุผล และการใช้งานจริงให้ชัด',
        'โยงสินค้า KHUA เฉพาะเมื่อสัมพันธ์กับหัวข้อจริง',
        'วางคำค้น SEO แบบธรรมชาติ ไม่ยัดคำซ้ำ',
      ],
      thContent: [
        `${subject} ควรถูกอธิบายในฐานะความรู้ครัวเหนือโดยตรง เพราะผู้อ่านที่ค้นหาหัวข้อนี้ต้องการเข้าใจบริบท วิธีคิด และเหตุผลของครัวล้านนา ไม่ใช่ถูกพาไปอ่านเมนูที่ไม่เกี่ยวข้อง`,
        `บทความควรเริ่มจากการตอบว่า ${subject} คืออะไร เกี่ยวข้องกับอาหารเหนืออย่างไร และทำไมจึงสำคัญกับรส กลิ่น หรือวิธีจัดมื้อแบบเหนือ`,
        'เนื้อหาที่ดีควรมีตัวอย่างใช้งานจริง เช่น จับคู่กับน้ำพริก เครื่องแกง ผักพื้นบ้าน หรือวิธีเตรียมวัตถุดิบ โดยให้ตัวอย่างเป็นส่วนสนับสนุน ไม่ใช่เปลี่ยนหัวข้อหลัก',
        'ถ้าหัวข้อเกี่ยวข้องกับสินค้า KHUA ให้กล่าวถึงอย่างพอดี เช่น น้ำพริกหรือเครื่องแกงที่ช่วยให้เข้าใจรสเหนือชัดขึ้น แต่ไม่ควรเขียนเหมือนโฆษณาทั้งบทความ',
        `สำหรับ SEO ให้ใช้คำว่า ${subject}, ความรู้ครัวเหนือ, ครัวล้านนา, อาหารเหนือ และภูมิปัญญาอาหารเหนืออย่างเป็นธรรมชาติ พร้อมตอบคำถามที่ผู้อ่านน่าจะค้นจริง`,
      ],
    },
    ingredientQuality: {
      slugSuffix: 'ingredient-quality',
      thTitle: `${subject}: วิธีดูคุณภาพวัตถุดิบให้เหมาะกับอาหารเหนือ`,
      thExcerpt: `คู่มือดูคุณภาพ ${subject} สำหรับอาหารเหนือ ทั้งสี กลิ่น ผิวสัมผัส ความสด และข้อควรระวังก่อนนำไปปรุง`,
      thTags: [subjectTag, 'คุณภาพวัตถุดิบ', 'วัตถุดิบอาหารเหนือ', 'วิธีเลือกวัตถุดิบ', 'ครัวล้านนา'],
      thHighlights: [
        `โฟกัสคุณภาพของ ${subject} เป็นหลัก`,
        'บอกสัญญาณของวัตถุดิบที่ดีและวัตถุดิบที่ควรเลี่ยง',
        'เชื่อมผลของคุณภาพกับรส กลิ่น และเนื้อสัมผัสของอาหารเหนือ',
        'ภาพต้องเป็นวัตถุดิบคุณภาพ ไม่ใช่จานอาหารทั่วไป',
      ],
      thContent: [
        `การเลือก ${subject} ให้ดีเป็นจุดเริ่มต้นของอาหารเหนือที่มีรสชัดและกลิ่นสะอาด บทความหมวดคุณภาพวัตถุดิบจึงต้องพูดถึงตัววัตถุดิบโดยตรง ไม่ควรเปลี่ยนไปเป็นบทความเมนูอื่น`,
        `ให้ดูสี กลิ่น ผิวสัมผัส และความสะอาดของ ${subject} เป็นหลัก วัตถุดิบที่ดีควรมีลักษณะตรงตามธรรมชาติ ไม่ชื้น ไม่ช้ำ ไม่มีกลิ่นอับ และไม่ถูกเก็บจนเสียกลิ่น`,
        `ถ้า ${subject} เป็นของแห้ง ควรดูความแห้งสนิทและกลิ่นที่ยังชัด ถ้าเป็นของสดควรดูความกรอบ สด และสีที่ไม่หม่น เพราะคุณภาพเหล่านี้ส่งผลต่อกลิ่นและรสของอาหารเหนือทันที`,
        'การใช้สินค้า KHUA ในบทความควรโยงเฉพาะเมื่อช่วยอธิบายคุณภาพ เช่น เครื่องแกงหรือน้ำพริกที่ต้องพึ่งวัตถุดิบคั่ว หอมแดง กระเทียม หรือพริกแห้งคุณภาพดี',
        `สำหรับ SEO ให้ตอบคำถามว่า ${subject} ที่ดีดูอย่างไร เก็บอย่างไร และมีผลต่อรสอาหารเหนืออย่างไร พร้อมใช้คำว่า คุณภาพวัตถุดิบ และวัตถุดิบอาหารเหนืออย่างเป็นธรรมชาติ`,
      ],
    },
    cookingTechnique: {
      slugSuffix: 'cooking-technique',
      thTitle: `${subject}: เทคนิคทำอาหารเหนือให้กลิ่นหอมและรสชัดขึ้น`,
      thExcerpt: `อธิบายเทคนิค ${subject} แบบใช้งานจริง ตั้งแต่จังหวะไฟ กลิ่นคั่ว การเตรียมวัตถุดิบ และข้อผิดพลาดที่ควรเลี่ยง`,
      thTags: [subjectTag, 'เทคนิคทำอาหาร', 'เทคนิคอาหารเหนือ', 'ครัวล้านนา', 'เครื่องแกงเหนือ'],
      thHighlights: [
        `${subject} ต้องเป็นขั้นตอนหรือเทคนิคหลักของบทความ`,
        'อธิบายก่อนทำ ระหว่างทำ และสัญญาณว่าสำเร็จ',
        'บอกข้อผิดพลาดที่ทำให้กลิ่นหรือรสเพี้ยน',
        'ภาพต้องเห็น action หรือ process ของเทคนิค',
      ],
      thContent: [
        `${subject} เป็นหัวข้อที่ควรเขียนแบบลงมือทำได้จริง บทความหมวดเทคนิคทำอาหารต้องเห็นขั้นตอน จังหวะ และสัญญาณสำเร็จ ไม่ใช่เล่าเป็นบทความอาหารเหนือทั่วไป`,
        `ก่อนเริ่ม ${subject} ควรเตรียมวัตถุดิบให้พร้อมและควบคุมไฟให้เหมาะ เพราะอาหารเหนือหลายเมนูพึ่งกลิ่นคั่ว กลิ่นสมุนไพร และความพอดีของน้ำมันหรือความร้อน`,
        `ระหว่างทำให้สังเกตกลิ่น สี และผิวสัมผัส ถ้ากลิ่นเริ่มหอมลึกแต่ยังไม่ไหม้ แปลว่าเทคนิคกำลังไปถูกทาง ถ้ากลิ่นฉุนไหม้หรือสีดำเกินไปควรลดไฟทันที`,
        'สินค้า KHUA สามารถถูกกล่าวถึงเมื่อเกี่ยวข้องกับเทคนิค เช่น การผัดน้ำพริกหรือเครื่องแกงให้หอมก่อนนำไปต่อยอดเป็นเมนู ไม่ควรแทรกถ้าไม่เกี่ยวกับขั้นตอน',
        `สำหรับ SEO ให้ใช้คำว่า ${subject}, เทคนิคทำอาหาร, เทคนิคอาหารเหนือ และครัวล้านนา พร้อมเขียนเป็นขั้นตอนที่ผู้อ่านทำตามได้จริง`,
      ],
    },
    localVegetables: {
      slugSuffix: 'local-vegetable',
      thTitle: `${subject}: ผักพื้นบ้านที่ควรรู้จัก วิธีเลือก ล้าง และกินกับอาหารเหนือ`,
      thExcerpt: `รู้จัก ${subject} ในฐานะผักพื้นบ้าน ทั้งรสชาติ วิธีเลือก วิธีล้าง และการจับคู่กับน้ำพริกหรือเมนูอาหารเหนือ`,
      thTags: [subjectTag, 'ผักพื้นบ้าน', 'ผักกินกับน้ำพริก', 'อาหารเหนือเพื่อสุขภาพ', 'น้ำพริกเหนือ'],
      thHighlights: [
        `${subject} ต้องเป็นผักตัวเอก ไม่ใช่น้ำพริกหรือเมนูอื่น`,
        'บอกลักษณะ รสชาติ และวิธีเลือกให้ชัด',
        'แนะนำวิธีล้างและจัดเสิร์ฟอย่างปลอดภัย',
        'ภาพต้องเห็นผักชนิดนั้นเป็น focal point',
      ],
      thContent: [
        `${subject} ควรถูกเขียนเป็นผักพื้นบ้านตัวเอกของบทความ เพราะคนที่พิมพ์ชื่อนี้ต้องการรู้จักผัก วิธีเลือก วิธีล้าง รสชาติ และกินกับอะไร ไม่ใช่ต้องการสูตรน้ำพริกที่ไม่เกี่ยวข้อง`,
        `ให้เริ่มจากอธิบายลักษณะของ ${subject} เช่น ใบ ก้าน สี กลิ่น รส และสัมผัสเวลากิน เพื่อให้ผู้อ่านแยกออกจากผักพื้นบ้านชนิดอื่นได้`,
        `วิธีเลือก ${subject} ควรดูความสด ไม่เหี่ยว ไม่ช้ำ ไม่มีกลิ่นเสีย และเลือกส่วนที่เหมาะกับการกินสดหรือลวกตามลักษณะของผัก`,
        'ก่อนเสิร์ฟควรล้างหลายครั้ง แช่น้ำเย็นสั้น ๆ แล้วสะเด็ดน้ำให้แห้ง ถ้าเป็นผักที่มีก้านแข็งควรตัดส่วนแข็งออกเพื่อให้กินง่าย',
        `ถ้าเกี่ยวกับสินค้า KHUA ให้จับคู่ ${subject} กับน้ำพริกเหนือที่เหมาะ เช่น น้ำพริกตาแดงหรือน้ำพริกลาบ เมื่อรสของผักช่วยตัดเผ็ด เค็ม หรือกลิ่นคั่วได้จริง`,
      ],
    },
    northernMenu: {
      slugSuffix: 'northern-menu',
      thTitle: `${subject}: เมนูอาหารเหนือที่ควรรู้จัก พร้อมรสชาติและวิธีจัดมื้อให้น่ากิน`,
      thExcerpt: `พาไปรู้จัก ${subject} ในฐานะเมนูอาหารเหนือ ทั้งรสหลัก วัตถุดิบที่เกี่ยวข้อง วิธีเสิร์ฟ และการจับคู่กับผักหรือน้ำพริก`,
      thTags: [subjectTag, 'เมนูอาหารเหนือ', 'อาหารเหนือ', 'อาหารล้านนา', 'ของกินภาคเหนือ'],
      thHighlights: [
        `${subject} เป็นหนึ่งในเมนูอาหารเหนือที่เล่าได้ทั้งรส กลิ่น และบริบทบนโต๊ะอาหาร`,
        'รสเหนือชัดขึ้นเมื่อเข้าใจเครื่องแกง สมุนไพร และวัตถุดิบหลักของเมนู',
        'การจัดมื้อให้อร่อยควรดูทั้งข้าว ผัก เครื่องเคียง และรสที่ช่วยตัดกัน',
      ],
      thContent: [
        `${subject} เป็นเมนูอาหารเหนือที่ควรเริ่มทำความรู้จักจากรสหลักก่อน ไม่ว่าจะเป็นความเผ็ด หอมเครื่องเทศ ความมัน ความเค็มนัว หรือกลิ่นสมุนไพรที่ทำให้จานนั้นมีเอกลักษณ์แบบล้านนา`,
        `วัตถุดิบสำคัญของ ${subject} มักไม่ได้ทำหน้าที่แค่เพิ่มปริมาณ แต่เป็นตัวกำหนดกลิ่น รส และสัมผัสของเมนู เครื่องแกง สมุนไพร เนื้อสัตว์ ผัก หรือของดองแต่ละอย่างจึงควรถูกเลือกให้เข้ากับรสเหนือของจานนั้น`,
        `เวลากิน ${subject} ให้อร่อย ควรคิดถึงเครื่องเคียงและจังหวะบนโต๊ะด้วย ข้าวเหนียว ผักสด ผักลวก หรือเมนูรสอ่อนสามารถช่วยรับรสจัดและทำให้มื้ออาหารสมดุลขึ้น`,
        'ถ้าเมนูนั้นใช้เครื่องแกงหรือน้ำพริกเป็นฐานรส การเลือกเครื่องปรุงที่มีกลิ่นคั่วและสมุนไพรชัดจะช่วยให้รสเหนือออกมาชัดกว่าเดิม แต่ควรใช้เฉพาะกับเมนูที่เข้ากันจริง',
      ],
    },
    northernCookingMethods: {
      slugSuffix: 'northern-recipe',
      thTitle: `${subject}: วิธีทำอาหารเหนือแบบเป็นขั้นตอนให้รสตรงและหอมเครื่อง`,
      thExcerpt: `คู่มือทำ ${subject} แบบจับต้องได้ ตั้งแต่เตรียมวัตถุดิบ จังหวะปรุง เทคนิคกลิ่นหอม และการชิมรสให้สมดุล`,
      thTags: [subjectTag, 'วิธีทำอาหารเหนือ', 'สูตรอาหารเหนือ', 'เทคนิคอาหารเหนือ', 'ครัวล้านนา'],
      thHighlights: [
        `${subject} ต้องเป็นสูตรหรือวิธีทำหลัก`,
        'มีวัตถุดิบ ขั้นตอน และจังหวะชิมรสครบ',
        'บอกเทคนิคกลิ่นคั่วหรือสมุนไพรที่เกี่ยวข้อง',
        'โยงสินค้า KHUA เฉพาะเมื่อใช้จริงในเมนู',
      ],
      thContent: [
        `${subject} ควรถูกเขียนเป็นวิธีทำที่ทำตามได้จริง โดยเริ่มจากวัตถุดิบหลัก เครื่องปรุง เครื่องสมุนไพร และจังหวะการปรุง ไม่ควรออกนอกเรื่องไปเป็นบทความความรู้ทั่วไป`,
        `เตรียมวัตถุดิบของ ${subject} ให้ครบก่อนเริ่ม โดยแยกของที่ต้องคั่ว ตำ ผัด ลวก หรือคลุก เพื่อให้ขั้นตอนอ่านง่ายและทำตามได้จริง`,
        'เริ่มทำจากขั้นตอนที่สร้างกลิ่น เช่น คั่วพริก ผัดเครื่องแกง หรือตำสมุนไพร จากนั้นค่อยใส่วัตถุดิบหลักและปรับรสตามลำดับ',
        'ระหว่างปรุงควรชิมรสให้สมดุลระหว่างเผ็ด เค็ม หอม และมันเล็กน้อย ถ้าใช้ผลิตภัณฑ์ KHUA ที่ตรงกับเมนู ให้ระบุว่าช่วยลดขั้นตอนใดและใช้ในจังหวะไหน',
        `สำหรับ SEO ให้มีคำว่า ${subject}, วิธีทำอาหารเหนือ, สูตรอาหารเหนือ และเครื่องแกงเหนือ พร้อมแบ่งหัวข้อวัตถุดิบ วิธีทำ เคล็ดลับ และการเสิร์ฟให้ชัดเจน`,
      ],
    },
    northernHerbs: {
      slugSuffix: 'northern-herb',
      thTitle: `${subject}: สมุนไพรเหนือที่ให้กลิ่นรสเฉพาะตัวและใช้กับอาหารล้านนา`,
      thExcerpt: `รู้จัก ${subject} ในฐานะสมุนไพรเหนือ ทั้งกลิ่น รส วิธีเลือก วิธีเตรียม และการใช้กับน้ำพริก ลาบ หรือเมนูอาหารเหนือ`,
      thTags: [subjectTag, 'สมุนไพรเหนือ', 'สมุนไพรอาหารเหนือ', 'ครัวล้านนา', 'วัตถุดิบล้านนา'],
      thHighlights: [
        `${subject} ต้องเป็นสมุนไพรตัวเอก`,
        'อธิบายกลิ่น รส รูปทรง และวิธีเลือก',
        'บอกวิธีใช้กับอาหารเหนือแบบไม่กลบรส',
        'ภาพต้องเป็น herb portrait ที่ระบุชนิดได้',
      ],
      thContent: [
        `${subject} ควรถูกอธิบายในฐานะสมุนไพรเหนือโดยตรง เพราะผู้อ่านต้องการรู้ว่ามีกลิ่นอย่างไร ใช้กับเมนูไหน และต่างจากสมุนไพรทั่วไปอย่างไร`,
        `ให้เริ่มจากลักษณะของ ${subject} ทั้งรูปทรง สี กลิ่น และรสสัมผัส เพื่อให้ผู้อ่านจำแนกได้ชัดและไม่สับสนกับผักหรือสมุนไพรชนิดอื่น`,
        `วิธีเลือก ${subject} ให้ดูความสด สีธรรมชาติ ไม่มีรอยช้ำหรือกลิ่นเสีย ถ้าเป็นสมุนไพรแห้งต้องแห้งสนิทและยังมีกลิ่นหอมชัด`,
        `การใช้ ${subject} ในอาหารเหนือควรใส่ในปริมาณพอดีและเลือกจังหวะที่รักษากลิ่น เช่น ใส่ตอนท้าย ตำกับเครื่องแกง หรือโรยก่อนเสิร์ฟตามลักษณะของสมุนไพร`,
        'ถ้าโยงสินค้า KHUA ให้เชื่อมเฉพาะเมนูที่สมุนไพรนั้นช่วยจริง เช่น น้ำพริกลาบ ลาบเหนือ หรือเครื่องแกงที่ใช้สมุนไพรกลิ่นชัด',
      ],
    },
    tableIdeas: {
      slugSuffix: 'table-idea',
      thTitle: `${subject}: ไอเดียจัดโต๊ะอาหารเหนือให้ดูพรีเมียมและกินง่าย`,
      thExcerpt: `แนวทางจัดโต๊ะตามหัวข้อ ${subject} ให้สวย มีลำดับสายตา ใช้งานจริง และเข้ากับอาหารเหนือ น้ำพริก ผัก และภาชนะล้านนา`,
      thTags: [subjectTag, 'ไอเดียจัดโต๊ะ', 'จัดโต๊ะอาหารเหนือ', 'ขันโตก', 'โต๊ะอาหารล้านนา'],
      thHighlights: [
        `${subject} ต้องเป็นแนวคิดการจัดโต๊ะหลัก`,
        'อธิบาย layout ภาชนะ สี วัสดุ และลำดับสายตา',
        'เน้นใช้งานจริง ไม่ใช่แค่ภาพสวย',
        'ภาพต้องเห็นการจัดโต๊ะ ไม่ใช่ close-up อาหารอย่างเดียว',
      ],
      thContent: [
        `${subject} ควรถูกเขียนเป็นไอเดียจัดโต๊ะโดยตรง โดยโฟกัสการวางจาน ชาม ผัก น้ำพริก เครื่องเคียง และพื้นที่ว่างบนโต๊ะ ไม่ควรเปลี่ยนไปเป็นบทความสูตรอาหาร`,
        'เริ่มจากเลือกจุดเด่นหนึ่งจุด เช่น ถาดขันโตก ชามน้ำพริก หรือเมนูหลัก จากนั้นจัดของรองให้เล็กลงเพื่อให้สายตาอ่านโต๊ะได้ง่าย',
        'ใช้ภาชนะที่เข้ากับอาหารเหนือ เช่น เซรามิกสีเข้ม ไม้ ผ้าทอ หรือถาดสาน แต่ควรใช้เท่าที่จำเป็นเพื่อไม่ให้โต๊ะรก',
        'การจัดผักพื้นบ้าน น้ำพริก และข้าวเหนียวควรมีระยะห่างพอดี หยิบง่าย และเห็นความสดของวัตถุดิบ ไม่ควรซ้อนของจนภาพอ่านยาก',
        `สำหรับ SEO ให้ใช้คำว่า ${subject}, ไอเดียจัดโต๊ะ, จัดโต๊ะอาหารเหนือ, ขันโตก และโต๊ะอาหารล้านนา พร้อมให้คำแนะนำที่ทำตามได้จริง`,
      ],
    },
  }
  const config = configs[kind]
  if (!config) return null

  const genericByLocale = {
    en: {
      title: `${subject}: A Focused ${categoryLabel} Guide for Northern Thai Food`,
      excerpt: `A focused guide to ${subject} in the ${categoryLabel} category, keeping the article, SEO angle, and image direction aligned with the requested topic.`,
      tags: [subjectTag, categoryLabel, 'Northern Thai food', 'Lanna cooking', 'KHUA'],
      highlights: [
        `${subject} is the main topic and should not be replaced by another dish or generic article.`,
        'The article must answer the selected category intent directly.',
        'Product mentions should appear only when they genuinely support the topic.',
        'The image brief must make the exact topic visually obvious.',
      ],
      content: [
        `${subject} should remain the main subject of this ${categoryLabel} article. The content should answer the reader's exact intent instead of drifting into a generic Northern Thai food article.`,
        `A useful structure explains what ${subject} is, why it matters in Northern Thai cooking, how to select or use it, and what practical detail the reader can apply.`,
        'Mention KHUA products only when the topic naturally connects to chili paste, curry paste, herbs, vegetables, or a real cooking use case.',
        `For SEO, use ${subject}, ${categoryLabel}, Northern Thai food, and Lanna cooking naturally while keeping the title, content, and image direction aligned.`,
      ],
    },
    lo: {
      title: `${subject}: ບົດຄວາມ${categoryLabel}ທີ່ໂຟກັສຫົວຂໍ້ໂດຍກົງ`,
      excerpt: `ບົດຄວາມກ່ຽວກັບ ${subject} ໃນໝວດ ${categoryLabel} ໃຫ້ຫົວຂໍ້ ເນື້ອຫາ ແລະຮູບພາບໄປທາງດຽວກັນ`,
      tags: [subjectTag, categoryLabel, 'ອາຫານເໜືອ', 'ຄົວລ້ານນາ'],
      highlights: [
        `${subject} ຕ້ອງເປັນຫົວຂໍ້ຫຼັກ`,
        'ເນື້ອຫາຕ້ອງຕອບເຈດຕະນາຂອງໝວດໝູ່',
        'ກ່າວເຖິງສິນຄ້າເມື່ອກ່ຽວຂ້ອງແທ້',
      ],
      content: [
        `${subject} ຄວນເປັນແກນຫຼັກຂອງບົດຄວາມໝວດ ${categoryLabel} ໂດຍບໍ່ປ່ຽນໄປເປັນຫົວຂໍ້ອື່ນ.`,
        `ເນື້ອຫາຄວນອະທິບາຍວ່າ ${subject} ແມ່ນຫຍັງ ໃຊ້ຢ່າງໃດ ແລະກ່ຽວກັບອາຫານເໜືອແນວໃດ.`,
        'ຖ້າກ່າວເຖິງ KHUA ຄວນເຊື່ອມກັບການໃຊ້ງານຈິງເທົ່ານັ້ນ.',
      ],
    },
    zh: {
      title: `${subject}：聚焦${categoryLabel}的泰北料理文章`,
      excerpt: `围绕 ${subject} 撰写 ${categoryLabel} 内容，让标题、正文、SEO 与图片方向保持一致。`,
      tags: [subjectTag, categoryLabel, '泰北料理', '兰纳料理'],
      highlights: [
        `${subject} 必须是文章主角。`,
        '内容必须回应所选分类的搜索意图。',
        '只有在真正相关时才提到 KHUA 产品。',
      ],
      content: [
        `${subject} 应是这篇 ${categoryLabel} 文章的核心，不应转成无关菜色或泛泛的泰北料理介绍。`,
        `内容应说明 ${subject} 是什么、为什么重要、如何挑选或使用，以及它与泰北料理的关系。`,
        '如提到 KHUA 产品，应只在与辣椒酱、咖喱酱、香草、蔬菜或实际烹饪场景相关时出现。',
      ],
    },
  }

  const text = locale === 'th'
    ? {
        title: config.thTitle,
        excerpt: config.thExcerpt,
        tags: config.thTags,
        highlights: config.thHighlights,
        content: config.thContent,
      }
    : genericByLocale[locale] || genericByLocale.en

  return {
    slug: `daily-${date}-${slug}-${config.slugSuffix}`,
    title: text.title,
    excerpt: text.excerpt,
    category: categoryLabel,
    date: formatDate(date, locale),
    readTime: locale === 'en' ? '6 min read' : locale === 'zh' ? '6 分钟阅读' : locale === 'lo' ? '6 ນາທີ' : '6 นาที',
    tags: text.tags,
    highlights: text.highlights,
    content: text.content,
  }
}

function isSaaJinMenu(brief = '', category = '') {
  const searchable = `${brief} ${category}`.toLowerCase()
  return (
    categoryKind(category) === 'northernMenu' &&
    (
      searchable.includes('ส้าจิ้น') ||
      searchable.includes('ส้าจิ๊น') ||
      searchable.includes('ส้าเนื้อ') ||
      searchable.includes('saa jin') ||
      searchable.includes('sa jin') ||
      searchable.includes('sa nuea')
    )
  )
}

function buildSaaJinMenuArticle(date, locale, category = '') {
  const contentByLocale = {
    th: {
      title: 'ส้าจิ้น: เมนูอาหารเหนือจากเนื้อสด พริกลาบ และสมุนไพรล้านนา',
      excerpt:
        'รู้จักส้าจิ้นหรือส้าเนื้อ เมนูอาหารเหนือที่ใช้เนื้อวัวหรือเนื้อควายสด คลุกพริกลาบ เครื่องในบางส่วน และสมุนไพร กินกับผักสดเพื่อลดกลิ่นคาวและบาลานซ์รสเผ็ดขม',
      tags: ['ส้าจิ้น', 'ส้าเนื้อ', 'เมนูอาหารเหนือ', 'พริกลาบเหนือ', 'อาหารล้านนา'],
      highlights: [
        'ส้าจิ้นเป็นเมนูส้าเนื้อ ไม่ใช่น้ำพริกอ่องหรือน้ำพริกแดง',
        'วัตถุดิบหลักคือเนื้อวัวหรือเนื้อควายสด เครื่องในบางส่วนมักต้มก่อนปรุง',
        'รสหลักคือเผ็ด หอมเครื่องลาบเหนือ และอาจมีรสขมตามสูตรท้องถิ่น',
        'ควรจัดภาพให้เห็นเนื้อ สมุนไพร พริกลาบ และผักเคียงอย่างชัดเจน',
      ],
      content: [
        'ส้าจิ้นหรือส้าเนื้อเป็นเมนูอาหารเหนือที่อยู่ในกลุ่มอาหารคลุกเครื่องลาบ จุดสำคัญคือใช้เนื้อวัวหรือเนื้อควายสดเป็นวัตถุดิบหลัก แล้วคลุกกับพริกลาบและสมุนไพรเหนือให้มีกลิ่นหอมจัด รสเผ็ด และบางสูตรมีรสขมอ่อนตามแบบพื้นบ้าน',
        'ถ้าพูดถึงส้าจิ้น เนื้อหาต้องไม่เปลี่ยนไปเป็นน้ำพริกอ่อง น้ำพริกแดง หรือเมนูลาบคั่วทั่วไป เพราะเจตนาของคำค้นคืออยากรู้จักเมนูส้าเนื้อโดยตรง ทั้งหน้าตา รสชาติ วัตถุดิบ และวิธีกิน',
        'ส่วนผสมที่พบได้บ่อยคือเนื้อสดหั่นบางหรือสับละเอียด พริกลาบเหนือ หอมแดง กระเทียม สมุนไพรอย่างผักแพว ผักชีฝรั่ง สะระแหน่ และเครื่องในบางอย่าง โดยเครื่องในมักนำไปต้มก่อนเพื่อให้กินง่ายและลดกลิ่นคาว',
        'รสของส้าจิ้นควรเผ็ดหอมจากพริกลาบ มีกลิ่นเครื่องเทศเหนือ เช่น มะแขว่น ดีปลี หรือเครื่องคั่วในพริกลาบ เนื้อควรเป็นตัวเอก ไม่ควรถูกกลบด้วยซอสแดงหรือสีมะเขือเทศ',
        'การจัดเสิร์ฟนิยมกินกับผักสด เช่น แตงกวา ถั่วฝักยาว ผักกาด กะหล่ำปลี หรือผักพื้นบ้าน เพื่อช่วยลดความคาวและทำให้รสเผ็ดขมสมดุลขึ้น ถ้าต้องการโยงสินค้า KHUA สามารถกล่าวถึง KHUA น้ำพริกลาบเหนือในฐานะเครื่องปรุงที่ช่วยให้กลิ่นลาบเหนือชัดขึ้นเมื่อใช้กับเมนูที่เหมาะสม',
      ],
    },
    en: {
      title: 'Saa Jin: Northern Thai Beef Salad with Larb Spices and Lanna Herbs',
      excerpt:
        'A focused guide to Saa Jin, also known as Sa Nuea, a Northern Thai beef dish seasoned with larb spice paste, fresh herbs, and local vegetables.',
      tags: ['Saa Jin', 'Sa Nuea', 'Northern Thai beef salad', 'Northern Thai menu', 'Nam Prik Larb'],
      highlights: [
        'Saa Jin is a Northern beef salad-style dish, not Nam Prik Ong or a red chili dip.',
        'The main ingredient is fresh beef or buffalo meat; some offal components may be cooked first.',
        'The flavor is spicy, aromatic, herb-forward, and sometimes lightly bitter depending on local style.',
        'The image should show beef, larb spices, herbs, and vegetable accompaniments clearly.',
      ],
      content: [
        'Saa Jin, also called Sa Nuea, is a Northern Thai dish built around fresh beef or buffalo meat seasoned with Northern larb spices and aromatic herbs. It belongs to the family of Lanna meat salads rather than chili dips or tomato-based dishes.',
        'An article about Saa Jin must keep the dish as the main subject. Readers searching for this name want to understand what the dish is, how it looks, what ingredients define it, and how it is served.',
        'Typical components include thinly sliced or finely chopped fresh beef, Northern larb spice paste, shallots, garlic, Vietnamese coriander, sawtooth coriander, mint, and sometimes offal that is cooked before mixing.',
        'The correct flavor direction is spicy, roasted-spice aromatic, herbal, and sometimes lightly bitter. It should not look like Nam Prik Ong, curry paste, or a bowl of red tomato sauce.',
        'Serve Saa Jin with fresh local vegetables such as cucumber, long beans, cabbage, mustard greens, or other crisp greens. KHUA Nam Prik Larb Nuea can be mentioned only as a relevant seasoning base for a dish that uses Northern larb spices.',
      ],
    },
    lo: {
      title: 'ສ້າຊີ້ນ: ເມນູອາຫານເໜືອຈາກຊີ້ນສົດ ເຄື່ອງລາບ ແລະສະໝຸນໄພລ້ານນາ',
      excerpt:
        'ຮູ້ຈັກສ້າຊີ້ນ ເມນູອາຫານເໜືອທີ່ໃຊ້ຊີ້ນສົດ ເຄື່ອງລາບ ສະໝຸນໄພ ແລະຜັກສົດເປັນຄູ່ກິນ',
      tags: ['ສ້າຊີ້ນ', 'ເມນູອາຫານເໜືອ', 'ເຄື່ອງລາບເໜືອ', 'ອາຫານລ້ານນາ'],
      highlights: [
        'ສ້າຊີ້ນແມ່ນເມນູຊີ້ນເໜືອ ບໍ່ແມ່ນນ້ຳພິກແດງ',
        'ໃຊ້ຊີ້ນງົວ ຫຼືຊີ້ນຄວາຍ ແລະເຄື່ອງລາບ',
        'ກິນກັບຜັກສົດເພື່ອປັບສົມດຸນກິ່ນແລະລົດ',
      ],
      content: [
        'ສ້າຊີ້ນເປັນເມນູອາຫານເໜືອທີ່ໃຊ້ຊີ້ນສົດ ຄຸກກັບເຄື່ອງລາບ ແລະສະໝຸນໄພລ້ານນາ.',
        'ບົດຄວາມຄວນໂຟກັສທີ່ສ້າຊີ້ນໂດຍກົງ ບໍ່ຄວນປ່ຽນໄປເປັນນ້ຳພິກ ຫຼືແກງ.',
        'ຈຸດເດັ່ນຄືກິ່ນເຄື່ອງລາບ ສະໝຸນໄພສົດ ແລະຜັກຄຽງທີ່ຊ່ວຍໃຫ້ກິນງ່າຍຂຶ້ນ.',
      ],
    },
    zh: {
      title: '泰北生牛肉香料沙拉：认识 Saa Jin 的牛肉、拉布香料与兰纳香草',
      excerpt:
        '认识 Saa Jin 或 Sa Nuea，这是一道以牛肉、泰北拉布香料、香草和本地蔬菜构成的泰北菜。',
      tags: ['Saa Jin', '泰北生牛肉香料沙拉', '泰北菜单', '拉布香料', '兰纳料理'],
      highlights: [
        'Saa Jin 是泰北牛肉香料沙拉，不是番茄辣椒酱或红色蘸酱。',
        '主体应是牛肉、拉布香料、香草与新鲜蔬菜。',
        '味道方向是辛香、草本、带烘烤香，部分做法会有微苦。',
      ],
      content: [
        'Saa Jin 又称 Sa Nuea，是泰北以牛肉或水牛肉为主体的香料拌菜，使用泰北拉布香料和新鲜香草调味。',
        '写这道菜时，内容应集中在 Saa Jin 本身，而不是转成 Nam Prik Ong、咖喱酱或普通红辣椒酱。',
        '常见元素包括切薄或剁细的牛肉、泰北拉布香料、红葱头、大蒜、越南香菜、刺芫荽、薄荷，以及用于搭配的本地蔬菜。',
        '图片方向也应清楚表现牛肉、香料与香草，而不是一碗红色辣椒酱。',
      ],
    },
  }
  const text = contentByLocale[locale] || contentByLocale.en

  return stripEditorialInstructions({
    slug: `daily-${date}-saa-jin-northern-menu`,
    title: text.title,
    excerpt: text.excerpt,
    category: localizedFocusedCategory(locale, 'northernMenu', category),
    date: formatDate(date, locale),
    readTime: locale === 'en' ? '6 min read' : locale === 'zh' ? '6 分钟阅读' : locale === 'lo' ? '6 ນາທີ' : '6 นาที',
    tags: text.tags,
    highlights: text.highlights,
    content: text.content,
  })
}

function buildLannaIngredientArticle(date, locale, brief = '', category = '') {
  const requestedSubject = cleanBriefSubject(brief) || {
    th: 'วัตถุดิบล้านนา',
    en: 'Lanna ingredient',
    lo: 'ວັດຖຸດິບລ້ານນາ',
    zh: '兰纳食材',
  }[locale] || 'Lanna ingredient'
  const slug = lannaIngredientSlug(requestedSubject)
  const subject = localizedSubjectName(slug, requestedSubject, locale)
  const profiles = {
    'ma-khwaen': {
      flavor: 'กลิ่นหอมซ่าแบบเปลือกส้มปนพริกไทย มีความเผ็ดชาเบา ๆ และเป็นกลิ่นจำของลาบเหนือกับน้ำพริกลาบ',
      selection: 'เลือกเม็ดแห้งที่สีเข้มสม่ำเสมอ เปลือกไม่ชื้น ไม่มีกลิ่นอับ และเมื่อบี้เบา ๆ ต้องมีกลิ่นหอมซ่าชัด',
      usage: 'เหมาะกับลาบเหนือ น้ำพริกลาบ เครื่องเทศคั่ว และเมนูที่ต้องการกลิ่นเหนือชัด ควรคั่วหรือบดก่อนใช้เพื่อเปิดกลิ่น',
    },
    'thua-nao': {
      flavor: 'กลิ่นหมักถั่วเหลืองเข้ม เค็มนัว และให้รสอูมามิแบบพื้นบ้านล้านนา',
      selection: 'เลือกแผ่นที่แห้งสนิท สีสม่ำเสมอ ไม่ชื้น ไม่ขึ้นรา และมีกลิ่นหมักสะอาดไม่ฉุนเสีย',
      usage: 'ใช้เพิ่มความนัวในน้ำพริก แกง หรือเมนูผัดแบบเหนือ ควรย่างหรือคั่วให้หอมก่อนตำหรือบด',
    },
    turmeric: {
      flavor: 'กลิ่นดินอุ่น ๆ สีเหลืองทอง และรสขมนวลที่ช่วยให้เครื่องแกงเหนือมีสีและมิติ',
      selection: 'เลือกเหง้าสดเนื้อแน่น ผิวไม่เหี่ยว ไม่ช้ำ และสีเหลืองเข้มตามธรรมชาติ',
      usage: 'เหมาะกับเครื่องแกงเหนือ แกงปลา แกงไก่ และเมนูที่ต้องการสีเหลืองธรรมชาติ ใช้พอดีเพื่อไม่ให้ขมนำ',
    },
    galangal: {
      flavor: 'กลิ่นหอมคม สด และเผ็ดอ่อน ช่วยยกฐานเครื่องแกงให้ชัด',
      selection: 'เลือกแง่งสด เนื้อแน่น ผิวไม่แห้งเกินไป และมีกลิ่นหอมเมื่อหั่น',
      usage: 'เหมาะกับเครื่องแกงเหนือ แกงสมุนไพร และเมนูต้ม ใช้หั่นบางหรือโขลกกับเครื่องแกง',
    },
    lemongrass: {
      flavor: 'กลิ่นหอมสดแบบตะไคร้ ช่วยลดกลิ่นคาวและทำให้เครื่องแกงมีความโปร่ง',
      selection: 'เลือกต้นอวบ โคนแน่น ไม่แห้ง ใบไม่เหลือง และมีกลิ่นหอมเมื่อทุบ',
      usage: 'ใช้ในเครื่องแกง แกงเหนือ และเมนูต้ม ควรซอยบางก่อนโขลกเพื่อให้ละเอียดง่าย',
    },
    'dried-chili': {
      flavor: 'กลิ่นพริกแห้งคั่วให้ความเผ็ดลึก สีแดงเข้ม และกลิ่นควันอ่อนของครัวเหนือ',
      selection: 'เลือกพริกแห้งสีแดงเข้ม ผิวไม่ดำไหม้ ไม่ชื้น และไม่มีกลิ่นรา',
      usage: 'เหมาะกับน้ำพริกตาแดง น้ำพริกลาบ และเครื่องแกงเหนือ คั่วไฟอ่อนก่อนใช้เพื่อเปิดกลิ่น',
    },
    'long-pepper': {
      flavor: 'กลิ่นเผ็ดร้อนลึก คล้ายพริกไทยแต่มีความหวานเครื่องเทศและกลิ่นสมุนไพรชัด',
      selection: 'เลือกฝักแห้งที่สีเข้มสม่ำเสมอ ผิวไม่ชื้น ไม่มีกลิ่นอับ และยังมีกลิ่นเผ็ดหอมเมื่อบี้เบา ๆ',
      usage: 'เหมาะกับเครื่องแกง น้ำพริก เมนูต้มสมุนไพร หรือเมนูที่ต้องการความเผ็ดร้อนแบบเครื่องเทศ ใช้แต่น้อยเพื่อไม่ให้กลบรสหลัก',
    },
    shallot: {
      flavor: 'กลิ่นหวานฉุนอ่อน ๆ เมื่อสด และหอมลึกขึ้นเมื่อคั่วหรือเจียว เป็นฐานกลิ่นสำคัญของน้ำพริกและเครื่องแกงเหนือ',
      selection: 'เลือกหัวแน่น เปลือกแห้ง สีสม่ำเสมอ ไม่มีรากงอก ไม่มีเชื้อรา และไม่มีกลิ่นชื้น',
      usage: 'เหมาะกับน้ำพริก เครื่องแกง ลาบ และเมนูผัดเครื่อง ควรคั่วหรือผัดให้หอมเพื่อสร้างฐานรสที่นุ่มขึ้น',
    },
    garlic: {
      flavor: 'กลิ่นฉุนหอมและความหวานเมื่อผ่านความร้อน ช่วยยกกลิ่นคั่วของอาหารเหนือ',
      selection: 'เลือกกลีบแน่น เปลือกแห้ง ไม่ฝ่อ ไม่ขึ้นรา และไม่มีกลิ่นอับ',
      usage: 'ใช้เป็นฐานน้ำพริก เครื่องแกง และเมนูคั่ว ควรคั่วหรือผัดจนหอมก่อนโขลกหรือปรุงต่อ',
    },
    'kaffir-lime-leaf': {
      flavor: 'กลิ่นซิตรัสสดชัด ช่วยตัดความมันและเพิ่มความหอมสดให้เมนูสมุนไพร',
      selection: 'เลือกใบสีเขียวเข้ม ผิวใบเงา ไม่เหลือง ไม่ช้ำ และมีกลิ่นหอมเมื่อฉีก',
      usage: 'เหมาะกับเมนูต้ม แกง และอาหารสมุนไพร ใช้ฉีกหรือซอยฝอยตามลักษณะเมนูเพื่อเปิดกลิ่น',
    },
  }
  const profile = profiles[slug] || {
    flavor: `กลิ่นและรสของ ${subject} คือจุดที่ทำให้บทความต้องโฟกัสตัววัตถุดิบ ไม่ใช่พาไปเป็นเมนูอื่น`,
    selection: `เลือก ${subject} ที่สะอาด สีเป็นธรรมชาติ ไม่ชื้น ไม่ช้ำ และมีกลิ่นตรงตามชนิดของวัตถุดิบ`,
    usage: `${subject} ควรถูกอธิบายว่าช่วยอาหารเหนือในด้านใด เช่น เพิ่มกลิ่น เพิ่มรส หรือช่วยให้เครื่องแกงและน้ำพริกมีมิติขึ้น`,
  }

  const contentByLocale = {
    th: {
      title: `${subject}: วัตถุดิบล้านนาที่ช่วยสร้างกลิ่นและรสอาหารเหนือให้ชัดขึ้น`,
      excerpt:
        `รู้จัก ${subject} ในฐานะวัตถุดิบล้านนา ทั้งเอกลักษณ์กลิ่นรส วิธีเลือก คุณภาพที่ควรมองหา และการนำไปใช้กับน้ำพริก เครื่องแกง หรือเมนูอาหารเหนือให้เหมาะสม`,
      tags: [subject, 'วัตถุดิบล้านนา', 'วัตถุดิบอาหารเหนือ', 'เครื่องเทศเหนือ', 'อาหารเหนือ', 'ครัวล้านนา'],
      highlights: [
        `${subject} ควรถูกอธิบายเป็นวัตถุดิบหลัก ไม่ใช่เปลี่ยนไปเป็นเมนูอื่น`,
        'ภาพและเนื้อหาต้องทำให้เห็นเอกลักษณ์ กลิ่น สี ผิวสัมผัส หรือรูปทรงของวัตถุดิบชัดเจน',
        'ควรบอกวิธีเลือกวัตถุดิบที่ดีและข้อควรระวังในการใช้',
        'เชื่อมโยงการใช้งานกับน้ำพริก เครื่องแกง หรืออาหารเหนืออย่างเป็นธรรมชาติ',
      ],
      content: [
        `${subject} เป็นวัตถุดิบล้านนาที่ควรถูกเล่าในฐานะตัวเอกของบทความ เพราะคนที่ค้นหาชื่อนี้ต้องการรู้ว่าวัตถุดิบคืออะไร มีกลิ่นรสแบบไหน ใช้อย่างไร และเกี่ยวข้องกับอาหารเหนืออย่างไร ไม่ควรพาเนื้อหาออกไปเป็นสูตรอาหารอื่นที่ไม่ตรงกับคำค้น`,
        `เอกลักษณ์ของ ${subject} คือ ${profile.flavor} รายละเอียดนี้ควรอยู่ในเนื้อหาเพื่อให้บทความวัตถุดิบล้านนาแตกต่างจากบทความเมนูอาหารทั่วไป`,
        `วิธีเลือก ${subject}: ${profile.selection} เพราะคุณภาพของวัตถุดิบมีผลโดยตรงต่อกลิ่นและรสของอาหารเหนือ`,
        `การใช้ ${subject} ในอาหารเหนือควรเริ่มจากปริมาณพอดี เพราะวัตถุดิบล้านนาหลายชนิดมีกลิ่นชัด ถ้าใช้มากเกินไปอาจกลบรสหลักของจานอาหารได้ ควรค่อย ๆ เพิ่มและชิมระหว่างปรุง`,
        `การนำ ${subject} ไปใช้: ${profile.usage} ถ้าบทความเกี่ยวกับสินค้า KHUA ควรกล่าวถึงเฉพาะเมื่อวัตถุดิบนั้นสัมพันธ์กับน้ำพริกหรือเครื่องแกงจริง ไม่ควรแทรกแบบขายของเกินจำเป็น`,
        `สำหรับ SEO ให้ใช้คำว่า ${subject}, วัตถุดิบล้านนา, วัตถุดิบอาหารเหนือ, เครื่องเทศเหนือ และครัวล้านนาอย่างเป็นธรรมชาติ พร้อมตอบคำถามหลักว่า ${subject} คืออะไร ใช้ทำอะไร เลือกอย่างไร และทำไมจึงสำคัญกับรสอาหารเหนือ`,
      ],
    },
    en: {
      title: `${subject}: A Lanna Ingredient That Builds Northern Thai Aroma and Flavor`,
      excerpt:
        `A focused guide to ${subject} as a Lanna ingredient, including flavor identity, quality cues, selection, and how it supports Northern Thai chili paste, curry paste, and cooking.`,
      tags: [subject, 'Lanna ingredients', 'Northern Thai ingredients', 'Northern Thai spices', 'Lanna cooking'],
      highlights: [
        `${subject} should be treated as the main ingredient, not replaced by an unrelated dish.`,
        'The article and image should make its aroma, color, texture, or shape clear.',
        'Quality cues and selection tips are essential for ingredient-focused content.',
        'Usage should connect naturally to chili paste, curry paste, or Northern Thai cooking.',
      ],
      content: [
        `${subject} should be the hero of a Lanna ingredient article. Readers searching for this term want to know what it is, how it tastes or smells, how to choose it, and why it matters in Northern Thai cooking.`,
        `Explain ${subject} through sensory details such as aroma, color, texture, and culinary role. A strong ingredient article should help the reader recognize the ingredient before showing how it is used.`,
        `For quality, look for clean appearance, natural color, and a clear fresh or roasted aroma. Dried ingredients should be fully dry with no musty smell; fresh ingredients should not be bruised or wilted.`,
        `Use ${subject} with restraint because many Lanna ingredients are aromatic and can dominate a dish. Add gradually and balance with salt, chili, herbs, or fat depending on the recipe.`,
        `${subject} can support Northern chili paste, curry paste, larb, or herb-forward dishes when it fits the flavor goal. Mention KHUA products only when the ingredient genuinely connects to a chili paste or curry paste use case.`,
        `For SEO, use terms such as ${subject}, Lanna ingredients, Northern Thai ingredients, Northern Thai spices, and Lanna cooking while answering what it is, how to select it, and how to use it.`,
      ],
    },
    lo: {
      title: `${subject}: ວັດຖຸດິບລ້ານນາທີ່ຊ່ວຍສ້າງກິ່ນແລະລົດອາຫານເໜືອ`,
      excerpt:
        `ຮູ້ຈັກ ${subject} ໃນຖານະວັດຖຸດິບລ້ານນາ ທັງກິ່ນລົດ ວິທີເລືອກ ແລະການນຳໄປໃຊ້ກັບອາຫານເໜືອ`,
      tags: [subject, 'ວັດຖຸດິບລ້ານນາ', 'ອາຫານເໜືອ', 'ເຄື່ອງເທດເໜືອ'],
      highlights: [
        `${subject} ຄວນເປັນຫົວຂໍ້ຫຼັກຂອງບົດຄວາມ`,
        'ຕ້ອງອະທິບາຍກິ່ນ ສີ ແລະລັກສະນະໃຫ້ຊັດ',
        'ຄວນບອກວິທີເລືອກວັດຖຸດິບທີ່ດີ',
        'ເຊື່ອມກັບນ້ຳພິກ ເຄື່ອງແກງ ຫຼືອາຫານເໜືອຢ່າງເໝາະສົມ',
      ],
      content: [
        `${subject} ເປັນວັດຖຸດິບລ້ານນາທີ່ຄວນໂຟກັສໂດຍກົງ ເພາະຜູ້ອ່ານຕ້ອງການຮູ້ວ່າແມ່ນຫຍັງ ມີກິ່ນລົດແນວໃດ ແລະໃຊ້ກັບອາຫານເໜືອແນວໃດ.`,
        `ການເລືອກ ${subject} ຄວນເບິ່ງຄວາມສົດ ສີທຳມະຊາດ ແລະກິ່ນທີ່ຊັດແຕ່ບໍ່ອັບ.`,
        `${subject} ສາມາດໃຊ້ກັບນ້ຳພິກ ເຄື່ອງແກງ ຫຼືອາຫານເໜືອທີ່ຕ້ອງການກິ່ນເຄື່ອງເທດ.`,
      ],
    },
    zh: {
      title: `${subject}：塑造泰北香气与味道的兰纳食材`,
      excerpt:
        `认识 ${subject} 这种兰纳食材，包括香气、风味、品质判断、挑选方式，以及它如何用于泰北辣椒酱、咖喱酱和料理。`,
      tags: [subject, '兰纳食材', '泰北食材', '泰北香料', '兰纳料理'],
      highlights: [
        `${subject} 必须是文章主角，而不是被替换成无关菜色。`,
        '内容和图片应清楚呈现它的香气、颜色、质地或形态。',
        '应说明如何判断品质与挑选。',
        '用法应自然连接到泰北辣椒酱、咖喱酱或兰纳料理。',
      ],
      content: [
        `${subject} 应作为兰纳食材文章的核心。搜索这个词的读者通常想知道它是什么、什么味道、如何挑选，以及为什么它对泰北料理重要。`,
        `描述 ${subject} 时应聚焦香气、颜色、质地和料理作用，让读者先认识食材，再理解如何使用。`,
        `挑选 ${subject} 时要看外观是否干净、颜色是否自然、香气是否清楚。干货不应潮湿或有霉味，鲜品不应萎蔫或压伤。`,
        `${subject} 可用于泰北辣椒酱、咖喱酱、拉布或香草风味菜色，但用量要适中，避免盖过主味。`,
        `SEO 可自然使用 ${subject}、兰纳食材、泰北食材、泰北香料、兰纳料理等关键词，并回答它是什么、怎么选、怎么用。`,
      ],
    },
  }

  const text = contentByLocale[locale] || contentByLocale.en
  return {
    slug: `daily-${date}-${slug}-lanna-ingredient`,
    title: text.title,
    excerpt: text.excerpt,
    category: localizedLannaIngredientCategory(locale, category),
    date: formatDate(date, locale),
    readTime: locale === 'en' ? '6 min read' : locale === 'zh' ? '6 分钟阅读' : locale === 'lo' ? '6 ນາທີ' : '6 นาที',
    tags: text.tags,
    highlights: text.highlights,
    content: text.content,
  }
}

function buildNamPrikOngRecipe(date, locale, category = '') {
  const contentByLocale = {
    th: {
      title: 'วิธีทำน้ำพริกอ่องให้อร่อยแบบเหนือ: เตรียมวัตถุดิบ ผัดเครื่อง และเคี่ยวให้รสกลมกล่อม',
      excerpt:
        'สูตรน้ำพริกอ่องแบบเข้าใจง่าย ตั้งแต่เตรียมหมูสับ มะเขือเทศ เครื่องแกง ไปจนถึงเทคนิคผัดและเคี่ยวให้หอมเครื่อง รสเปรี้ยวหวานพอดี',
      tags: ['วิธีทำน้ำพริกอ่อง', 'น้ำพริกอ่อง', 'อาหารเหนือ', 'สูตรอาหารเหนือ', 'เครื่องแกงเหนือ'],
      highlights: [
        'เลือกมะเขือเทศสุกฉ่ำและหมูสับติดมันเล็กน้อยเพื่อให้รสนุ่ม',
        'ผัดเครื่องแกงกับน้ำมันจนหอมก่อนใส่หมู เพื่อเปิดกลิ่นพริกแห้ง หอมแดง และกระเทียม',
        'เคี่ยวไฟกลางค่อนอ่อนจนมะเขือเทศแตกตัวและน้ำพริกงวด ไม่แฉะเกินไป',
        'ชิมให้ได้รสเปรี้ยวหวานเค็มพอดี แล้วเสิร์ฟกับผักสด ผักลวก และแคบหมู',
      ],
      content: [
        'น้ำพริกอ่องเป็นอาหารเหนือที่เด่นจากรสมะเขือเทศสุก หมูสับ และเครื่องแกงหอม ๆ เนื้อสัมผัสควรฉ่ำแต่ไม่แฉะ มีรสเปรี้ยวหวานธรรมชาติ เค็มพอดี และมีกลิ่นพริกแห้งคั่วกับหอมแดงกระเทียมชัดเจน',
        'วัตถุดิบหลักสำหรับ 3-4 ที่ ได้แก่ หมูสับ 250 กรัม มะเขือเทศสีดาหรือมะเขือเทศลูกเล็ก 300 กรัม พริกแห้งเม็ดใหญ่แช่น้ำ 5-7 เม็ด หอมแดง 5 หัว กระเทียมไทย 8-10 กลีบ กะปิเล็กน้อยหรือถั่วเน่าแผ่นตามชอบ เกลือ น้ำปลา และน้ำมันสำหรับผัด',
        'เตรียมเครื่องแกงโดยแกะเมล็ดพริกแห้งออกบางส่วนแล้วแช่น้ำให้นิ่ม จากนั้นโขลกพริกแห้งกับเกลือ หอมแดง กระเทียม และกะปิให้ละเอียดพอประมาณ ส่วนมะเขือเทศให้หั่นชิ้นเล็กเพื่อให้แตกตัวง่ายตอนเคี่ยว',
        'ตั้งกระทะไฟกลาง ใส่น้ำมันเล็กน้อยแล้วผัดเครื่องแกงจนกลิ่นหอมและสีเข้มขึ้น ใส่หมูสับลงไปยีให้กระจาย ผัดจนหมูเริ่มสุกและเคลือบเครื่องแกงทั่วถึง ขั้นตอนนี้เป็นจุดสำคัญที่ทำให้น้ำพริกไม่มีกลิ่นดิบ',
        'ใส่มะเขือเทศลงไปผัดให้เข้ากัน เติมน้ำเล็กน้อยถ้ากระทะแห้งเกินไป แล้วเคี่ยวไฟกลางค่อนอ่อน 10-15 นาที จนมะเขือเทศนิ่ม แตกตัว และน้ำพริกข้นขึ้น ระหว่างเคี่ยวให้คนเป็นระยะเพื่อไม่ให้ติดก้นกระทะ',
        'ปรุงรสด้วยน้ำปลาและเกลือทีละน้อย ถ้ามะเขือเทศเปรี้ยวน้อยสามารถเติมน้ำตาลเล็กน้อยได้ แต่ไม่ควรให้หวานนำ น้ำพริกอ่องที่ดีควรมีรสเปรี้ยวหวานจากมะเขือเทศ ตามด้วยเค็มกลมกล่อมและกลิ่นเครื่องแกง',
        'เมื่อได้ความข้นที่ต้องการ ปิดไฟแล้วพักให้น้ำพริกเซ็ตตัวสักครู่ เสิร์ฟกับแตงกวา ถั่วฝักยาว กะหล่ำปลี ผักลวก แคบหมู หรือข้าวเหนียวร้อน ๆ ถ้าทำขายหรือทำเป็นของฝาก ควรรอให้เย็นก่อนบรรจุและเก็บในตู้เย็น',
      ],
    },
    en: {
      title: 'How to Make Nam Prik Ong: Ingredients, Curry Paste, and Northern Thai Cooking Steps',
      excerpt:
        'A practical Nam Prik Ong recipe with minced pork, tomatoes, curry paste, and step-by-step simmering tips for balanced Northern Thai flavor.',
      tags: ['Nam Prik Ong recipe', 'Northern Thai chili dip', 'Northern Thai food', 'curry paste', 'Thai cooking'],
      highlights: [
        'Use ripe tomatoes and slightly fatty minced pork for a soft, rounded texture.',
        'Fry the curry paste first to release dried chili, shallot, and garlic aroma.',
        'Simmer until the tomatoes break down and the relish becomes thick, not watery.',
        'Serve with fresh vegetables, blanched greens, pork crackling, or sticky rice.',
      ],
      content: [
        'Nam Prik Ong is a Northern Thai tomato and minced pork chili relish. A good version should taste naturally sweet and tangy from ripe tomatoes, savory from pork, and aromatic from dried chilies, shallots, garlic, and fermented seasoning.',
        'For 3-4 servings, prepare 250 g minced pork, 300 g small ripe tomatoes, 5-7 soaked dried chilies, 5 shallots, 8-10 cloves Thai garlic, a little shrimp paste or fermented soybean sheet, salt, fish sauce, and a small amount of oil.',
        'Make the curry paste by pounding soaked dried chilies with salt, shallots, garlic, and shrimp paste until fairly fine. Cut the tomatoes into small pieces so they soften and release their juice quickly while cooking.',
        'Heat a pan over medium heat, add a little oil, and fry the paste until fragrant and deeper in color. Add minced pork and break it up as it cooks so every piece is coated with the paste.',
        'Add tomatoes and stir well. If the pan is too dry, add a small splash of water. Simmer over medium-low heat for 10-15 minutes until the tomatoes collapse and the relish thickens.',
        'Season gradually with fish sauce and salt. If the tomatoes are not sweet enough, add a tiny amount of sugar, but the flavor should stay tomato-led rather than sweet.',
        'Rest briefly before serving. Pair with cucumber, long beans, cabbage, blanched greens, pork crackling, or warm sticky rice. For storage, cool completely before chilling.',
      ],
    },
    lo: {
      title: 'ວິທີເຮັດນ້ຳພິກອ່ອງ: ກຽມວັດຖຸດິບ ຜັດເຄື່ອງ ແລະຕົ້ມໃຫ້ລົດກົມກ່ອມ',
      excerpt:
        'ສູດນ້ຳພິກອ່ອງແບບເຂົ້າໃຈງ່າຍ ມີໝູສັບ ໝາກເລັ່ນ ເຄື່ອງແກງ ແລະຂັ້ນຕອນຕົ້ມໃຫ້ຫອມ',
      tags: ['ວິທີເຮັດນ້ຳພິກອ່ອງ', 'ນ້ຳພິກອ່ອງ', 'ອາຫານເໜືອ', 'ສູດອາຫານເໜືອ', 'ເຄື່ອງແກງເໜືອ'],
      highlights: [
        'ໃຊ້ໝາກເລັ່ນສຸກ ແລະໝູສັບມີມັນນ້ອຍໜຶ່ງໃຫ້ເນື້ອນຸ່ມ',
        'ຜັດເຄື່ອງແກງກ່ອນໃຫ້ຫອມ ແລ້ວຈຶ່ງໃສ່ໝູ',
        'ຕົ້ມໄຟອ່ອນໃຫ້ໝາກເລັ່ນແຕກຕົວ ແລະນ້ຳພິກຂົ້ນ',
        'ກິນຄູ່ກັບຜັກສົດ ຜັກລວກ ແລະເຂົ້າໜຽວ',
      ],
      content: [
        'ນ້ຳພິກອ່ອງເປັນອາຫານເໜືອທີ່ມີລົດເປັ້ນຫວານຈາກໝາກເລັ່ນ ມີໝູສັບ ແລະກິ່ນເຄື່ອງແກງຫອມ.',
        'ກຽມໝູສັບ 250 ກຣາມ ໝາກເລັ່ນ 300 ກຣາມ ພິກແຫ້ງແຊ່ນ້ຳ 5-7 ເມັດ ຫອມແດງ 5 ຫົວ ກະທຽມ 8-10 ກີບ ກະປິນ້ອຍໜຶ່ງ ເກືອ ນ້ຳປາ ແລະນ້ຳມັນ.',
        'ໂຂລກພິກແຫ້ງກັບເກືອ ຫອມແດງ ກະທຽມ ແລະກະປິໃຫ້ລະອຽດພໍດີ ຫັ່ນໝາກເລັ່ນເປັນຊິ້ນນ້ອຍ.',
        'ຕັ້ງກະທະໄຟກາງ ໃສ່ນ້ຳມັນ ຜັດເຄື່ອງແກງຈົນຫອມ ແລ້ວໃສ່ໝູສັບ ຜັດໃຫ້ໝູແຕກຕົວແລະເຄືອບເຄື່ອງ.',
        'ໃສ່ໝາກເລັ່ນ ຜັດໃຫ້ເຂົ້າກັນ ແລ້ວຕົ້ມ 10-15 ນາທີ ຈົນໝາກເລັ່ນນຸ່ມ ແລະນ້ຳພິກຂົ້ນ.',
        'ປຸງດ້ວຍນ້ຳປາ ແລະເກືອທີລະນ້ອຍ ຖ້າໝາກເລັ່ນບໍ່ຫວານ ເພີ່ມນ້ຳຕານໄດ້ນ້ອຍໜຶ່ງ.',
        'ພັກໃຫ້ເຢັນລົງນ້ອຍໜຶ່ງ ແລ້ວເສີບກັບຜັກສົດ ຜັກລວກ ແລະເຂົ້າໜຽວຮ້ອນ.',
      ],
    },
    zh: {
      title: '泰北番茄猪肉辣酱 Nam Prik Ong 做法：食材准备、炒酱与慢煮步骤',
      excerpt:
        '一篇实用的 Nam Prik Ong 做法，从猪肉末、番茄、咖喱酱准备到慢煮收浓，做出平衡的泰北风味。',
      tags: ['Nam Prik Ong 做法', '泰北辣椒酱', '泰北料理', '泰国食谱', '咖喱酱'],
      highlights: [
        '使用成熟番茄与带少许脂肪的猪肉末，口感更柔和。',
        '先炒香辣椒酱，释放干辣椒、红葱和蒜的香气。',
        '小火慢煮到番茄软化、酱汁浓稠但不水。',
        '可搭配鲜蔬、烫蔬菜、猪皮脆片或糯米。',
      ],
      content: [
        'Nam Prik Ong 是泰北番茄猪肉辣酱，特色是番茄的自然酸甜、猪肉末的鲜味，以及干辣椒、红葱、蒜和发酵调味带来的香气。',
        '准备 3-4 人份：猪肉末 250 克、小番茄 300 克、泡软干辣椒 5-7 条、红葱 5 个、泰国蒜 8-10 瓣、少量虾酱或发酵黄豆片、盐、鱼露和少量油。',
        '先把泡软干辣椒、盐、红葱、蒜和虾酱捣成较细的酱。番茄切小块，方便烹煮时快速软化出汁。',
        '锅中用中火加少量油，先炒香辣椒酱，颜色变深后加入猪肉末，边炒边压散，让肉末均匀裹上酱料。',
        '加入番茄翻炒，如果锅太干可加少量水。转中小火煮 10-15 分钟，直到番茄软烂、酱汁变浓。',
        '用鱼露和盐少量多次调味。若番茄甜度不足，可加一点糖，但整体仍应以番茄酸甜和香辣味为主。',
        '关火后稍微静置，再搭配黄瓜、长豆、卷心菜、烫青菜、猪皮脆片或热糯米食用。',
      ],
    },
  }
  const text = contentByLocale[locale] || contentByLocale.en

  return {
    slug: `daily-${date}-nam-prik-ong-recipe`,
    title: text.title,
    excerpt: text.excerpt,
    category: localizedCookingCategory(locale, category),
    date: formatDate(date, locale),
    readTime: locale === 'en' ? '7 min read' : locale === 'zh' ? '7 分钟阅读' : locale === 'lo' ? '7 ນາທີ' : '7 นาที',
    tags: text.tags,
    highlights: text.highlights,
    content: text.content,
  }
}

function buildNorthernYamGaiNamPrikLarbRecipe(date, locale, category = '') {
  const contentByLocale = {
    th: {
      title: 'วิธีทำยำไก่ทางเหนือด้วยน้ำพริกลาบ: เตรียมไก่ เครื่องสมุนไพร และคลุกให้หอมแบบล้านนา',
      excerpt:
        'สูตรยำไก่ของทางเหนือแบบละเอียด ใช้น้ำพริกลาบเป็นฐานรส อธิบายตั้งแต่วิธีต้มไก่ เตรียมสมุนไพร คั่วเครื่อง และคลุกยำให้หอมจัดจ้าน เหมาะสำหรับบทความ SEO อาหารเหนือ',
      tags: [
        'วิธีทำยำไก่ทางเหนือ',
        'ยำไก่เหนือ',
        'น้ำพริกลาบ',
        'สูตรอาหารเหนือ',
        'อาหารเหนือ',
        'เมนูไก่',
        'ครัวล้านนา',
      ],
      highlights: [
        'ต้มไก่ให้สุกนุ่มแล้วฉีกเป็นชิ้นพอดีคำ เพื่อให้คลุกน้ำพริกลาบได้ทั่ว',
        'ใช้ KHUA น้ำพริกลาบเหนือเป็นหัวใจของรส ช่วยให้ยำไก่มีกลิ่นมะแขว่น พริกแห้ง และเครื่องเทศคั่ว',
        'เตรียมหอมแดง ต้นหอม ผักชี ผักชีฝรั่ง ใบสะระแหน่ และพริกทอด เพื่อเพิ่มกลิ่นสดและเนื้อสัมผัส',
        'คลุกตอนเครื่องยังอุ่นเล็กน้อย รสจะซึมเข้าเนื้อไก่และหอมกว่ายำแบบเย็น',
      ],
      content: [
        'ยำไก่ทางเหนือเป็นเมนูอาหารเหนือที่ใช้ไก่ต้มฉีกหรือสับ คลุกกับน้ำพริกลาบและสมุนไพรสด รสชาติควรเผ็ดหอม เค็มพอดี มีกลิ่นมะแขว่น พริกแห้งคั่ว และสมุนไพรล้านนาชัดเจน เมนูนี้เหมาะกับ KHUA น้ำพริกลาบเหนือ เพราะเป็นสินค้าที่มีเครื่องเทศลาบเหนือพร้อมใช้ ช่วยให้ทำยำไก่เหนือได้ตรงรสขึ้นโดยไม่ต้องคั่วและโขลกเครื่องเองทั้งหมด',
        'วัตถุดิบสำหรับ 3-4 ที่ ได้แก่ อกไก่หรือสะโพกไก่ต้มสุก 400 กรัม KHUA น้ำพริกลาบเหนือ 2-3 ช้อนโต๊ะ น้ำต้มไก่ 3-4 ช้อนโต๊ะ หอมแดงซอย 5 หัว ต้นหอมซอย 3 ต้น ผักชีซอย 2 ต้น ผักชีฝรั่งซอย 2 ใบ ใบสะระแหน่หนึ่งกำมือ พริกแห้งทอดตามชอบ น้ำปลา น้ำมะนาวเล็กน้อย และข้าวคั่วหรือถั่วเน่าป่นถ้าต้องการกลิ่นเหนือเข้มขึ้น',
        'เริ่มจากต้มไก่ในน้ำเดือดอ่อน ๆ ใส่เกลือเล็กน้อยและรากผักชีถ้ามี ต้มจนไก่สุกแต่นุ่ม ไม่แห้ง จากนั้นพักให้พออุ่นแล้วฉีกเป็นเส้นหรือสับหยาบ ชิ้นไก่ควรไม่เล็กเกินไป เพราะต้องรับรสน้ำพริกลาบและยังมีเนื้อสัมผัสเมื่อคลุกยำ',
        'เตรียมน้ำปรุงโดยผสม KHUA น้ำพริกลาบเหนือกับน้ำต้มไก่อุ่น ๆ คนให้ละลายเป็นซอสข้น ชิมก่อนเติมน้ำปลาเพราะน้ำพริกมีรสและกลิ่นเครื่องเทศอยู่แล้ว ถ้าต้องการมิติสดขึ้นให้เติมน้ำมะนาวเล็กน้อย แต่ไม่ควรให้เปรี้ยวนำ เพราะยำไก่เหนือควรเด่นที่กลิ่นเครื่องเทศและความหอมคั่ว',
        'ใส่ไก่ฉีกลงในชามผสม เทน้ำพริกลาบที่ละลายไว้ลงไป คลุกให้เคลือบทุกชิ้น ถ้าส่วนผสมแห้งเกินไปเติมน้ำต้มไก่ทีละช้อน เนื้อยำควรชุ่มแต่ไม่แฉะ เพื่อให้รสน้ำพริกลาบเกาะไก่และไม่ไหลลงก้นชาม',
        'ใส่หอมแดง ต้นหอม ผักชี ผักชีฝรั่ง ใบสะระแหน่ และพริกทอด คลุกเบา ๆ ในช่วงท้ายเพื่อไม่ให้ผักช้ำ ชิมรสอีกครั้งให้ได้เผ็ดหอม เค็มกลมกล่อม และมีเปรี้ยวบาง ๆ เท่านั้น ถ้าต้องการความหอมแบบเหนือชัดขึ้นให้โรยมะแขว่นคั่วป่นหรือข้าวคั่วเล็กน้อย',
        'เคล็ดลับคือคลุกตอนเนื้อไก่ยังอุ่นเล็กน้อย เพราะน้ำพริกลาบจะซึมเข้าเนื้อและกลิ่นเครื่องเทศจะเปิดตัวดีกว่า ถ้าทำล่วงหน้าให้แยกสมุนไพรสดไว้ แล้วคลุกก่อนเสิร์ฟเพื่อให้ใบผักยังหอมและสีสวย',
        'เสิร์ฟยำไก่เหนือคู่กับผักสด แตงกวา กะหล่ำปลี ถั่วฝักยาว ข้าวเหนียวร้อน ๆ หรือแคบหมู เมนูนี้เหมาะสำหรับคนที่อยากทำอาหารเหนือจาก KHUA น้ำพริกลาบเหนือให้เป็นจานหลัก และเหมาะกับบทความ SEO ที่ต้องตอบคำถามว่า ยำไก่เหนือทำอย่างไร น้ำพริกลาบทำเมนูอะไรได้บ้าง และอาหารเหนือเมนูไก่มีอะไรน่าทำ',
      ],
    },
    en: {
      title: 'How to Make Northern Thai Yam Gai with Nam Prik Larb: Chicken, Herbs, and Lanna Spice Steps',
      excerpt:
        'A clear Northern Thai chicken salad recipe using Nam Prik Larb as the seasoning base, with boiled chicken, herbs, roasted spices, and SEO-focused cooking guidance.',
      tags: [
        'Northern Thai Yam Gai recipe',
        'Northern chicken salad',
        'Nam Prik Larb',
        'Northern Thai food',
        'Lanna cooking',
        'Thai chicken recipe',
      ],
      highlights: [
        'Boil chicken until tender, then shred it so the larb paste coats every piece.',
        'KHUA Nam Prik Larb Nuea gives the dish roasted chili, ma-khwaen, and Northern spice aroma.',
        'Fresh shallots, herbs, mint, and fried chilies add lift and texture.',
        'Mix while the chicken is slightly warm so the seasoning absorbs better.',
      ],
      content: [
        'Northern Thai Yam Gai is a warm chicken salad seasoned with Nam Prik Larb and fresh herbs. KHUA Nam Prik Larb Nuea fits this recipe because it already carries the roasted dried chili, ma-khwaen, and Lanna spice base needed for a clear Northern flavor.',
        'For 3-4 servings, prepare 400 g boiled chicken breast or thigh, 2-3 tablespoons KHUA Nam Prik Larb Nuea, 3-4 tablespoons warm chicken broth, 5 sliced shallots, sliced spring onion, cilantro, sawtooth coriander, mint leaves, fried dried chilies, fish sauce, a little lime juice, and optional toasted rice powder.',
        'Simmer the chicken gently with a little salt until just cooked and tender. Rest until warm, then shred or roughly chop. The pieces should be large enough to hold texture after mixing.',
        'Make the seasoning by loosening KHUA Nam Prik Larb Nuea with warm chicken broth until thick and spoonable. Taste before adding fish sauce because the paste already has seasoning and spice depth. Add a small amount of lime only for brightness.',
        'Add shredded chicken to a mixing bowl, pour in the larb paste seasoning, and toss until every piece is coated. Add more broth one spoon at a time if it feels too dry; the salad should be moist, not watery.',
        'Fold in shallots, spring onion, cilantro, sawtooth coriander, mint, and fried chilies at the end. Taste for a balance of spice, salt, roasted aroma, and light freshness.',
        'The professional trick is to season the chicken while it is still slightly warm. The paste absorbs more deeply and the spice aroma opens better than in a cold salad.',
        'Serve with cucumber, cabbage, long beans, sticky rice, or pork crackling. This dish is ideal for searches such as how to make Northern Thai Yam Gai, what to cook with KHUA Nam Prik Larb Nuea, and Northern Thai chicken recipes.',
      ],
    },
    lo: {
      title: 'ວິທີເຮັດຍຳໄກ່ເໜືອດ້ວຍນ້ຳພິກລາບ: ກຽມໄກ່ ສະໝຸນໄພ ແລະຄຸກໃຫ້ຫອມ',
      excerpt:
        'ສູດຍຳໄກ່ເໜືອທີ່ໃຊ້ນ້ຳພິກລາບເປັນຖານລົດ ອະທິບາຍການຕົ້ມໄກ່ ກຽມຜັກຫອມ ແລະຄຸກໃຫ້ຫອມແບບລ້ານນາ',
      tags: ['ວິທີເຮັດຍຳໄກ່ເໜືອ', 'ຍຳໄກ່ເໜືອ', 'ນ້ຳພິກລາບ', 'ອາຫານເໜືອ', 'ຄົວລ້ານນາ'],
      highlights: [
        'ຕົ້ມໄກ່ໃຫ້ນຸ່ມ ແລ້ວສີກເປັນຊິ້ນພໍດີ',
        'KHUA ນ້ຳພິກລາບເໜືອເປັນຫົວໃຈຂອງກິ່ນພິກຄົ່ວ ໝາກແຂ່ວ ແລະເຄື່ອງເທດ',
        'ໃສ່ຫອມແດງ ຕົ້ນຫອມ ຜັກຊີ ສະລະແໜ່ ແລະພິກທອດໃຫ້ຫອມ',
        'ຄຸກຕອນໄກ່ຍັງອຸ່ນເລັກນ້ອຍ ເພື່ອໃຫ້ລົດຊຶມເຂົ້າເນື້ອ',
      ],
      content: [
        'ຍຳໄກ່ເໜືອເປັນເມນູທີ່ໃຊ້ໄກ່ຕົ້ມສີກ ຄຸກກັບນ້ຳພິກລາບ ແລະສະໝຸນໄພສົດ KHUA ນ້ຳພິກລາບເໜືອເໝາະກັບເມນູນີ້ ເພາະມີກິ່ນພິກຄົ່ວ ໝາກແຂ່ວ ແລະເຄື່ອງເທດເໜືອພ້ອມໃຊ້.',
        'ກຽມໄກ່ຕົ້ມ 400 ກຣາມ KHUA ນ້ຳພິກລາບເໜືອ 2-3 ບ່ວງໂຕະ ນ້ຳຕົ້ມໄກ່ 3-4 ບ່ວງໂຕະ ຫອມແດງ ຕົ້ນຫອມ ຜັກຊີ ຜັກຊີຝຣັ່ງ ສະລະແໜ່ ພິກແຫ້ງທອດ ນ້ຳປາ ແລະນ້ຳໝາກນາວນ້ອຍໜຶ່ງ.',
        'ຕົ້ມໄກ່ດ້ວຍໄຟອ່ອນໃຫ້ສຸກນຸ່ມ ພັກໃຫ້ອຸ່ນ ແລ້ວສີກຫຼືສັບຫຍາບ.',
        'ຜສົມ KHUA ນ້ຳພິກລາບເໜືອກັບນ້ຳຕົ້ມໄກ່ອຸ່ນໃຫ້ເປັນຊອດຂົ້ນ ຊິມກ່ອນປຸງເພາະນ້ຳພິກມີລົດແລະກິ່ນເຄື່ອງເທດຢູ່ແລ້ວ.',
        'ໃສ່ໄກ່ລົງຊາມ ລາດນ້ຳພິກລາບ ແລ້ວຄຸກໃຫ້ທົ່ວ ຖ້າແຫ້ງເກີນໄປເຕີມນ້ຳຕົ້ມໄກ່ທີລະນ້ອຍ.',
        'ໃສ່ຫອມແດງ ຕົ້ນຫອມ ຜັກຊີ ສະລະແໜ່ ແລະພິກທອດ ຄຸກເບົາໆ ໃຫ້ຜັກຍັງຫອມສົດ.',
        'ເສີບກັບຜັກສົດ ເຂົ້າໜຽວ ຫຼືແຄບໝູ ເປັນເມນູໄກ່ອາຫານເໜືອທີ່ເຮັດໄດ້ຈາກ KHUA ນ້ຳພິກລາບເໜືອ.',
      ],
    },
    zh: {
      title: '泰北香料鸡肉凉拌 Yam Gai 做法：用 Nam Prik Larb 调味的清晰步骤',
      excerpt:
        '一篇清楚的泰北鸡肉凉拌做法，以 Nam Prik Larb 为调味基础，说明煮鸡、准备香草、拌入香料与 SEO 关键词方向。',
      tags: ['泰北鸡肉凉拌做法', 'Yam Gai', 'Nam Prik Larb', '泰北料理', '兰纳料理', '鸡肉食谱'],
      highlights: [
        '鸡肉煮到软嫩后撕成适口大小，方便吸附辣拌酱。',
        'KHUA Nam Prik Larb Nuea 带来干辣椒、马告与泰北香料香气。',
        '红葱、香草、薄荷与炸干辣椒增加清香和口感。',
        '鸡肉微温时拌入调味，味道更容易进入肉里。',
      ],
      content: [
        '泰北 Yam Gai 是用煮熟鸡肉、Nam Prik Larb 和新鲜香草拌成的鸡肉料理。KHUA Nam Prik Larb Nuea 很适合这个食谱，因为它已经带有干辣椒、马告与兰纳香料的基础香气。',
        '准备 3-4 人份：熟鸡胸或鸡腿肉 400 克、KHUA Nam Prik Larb Nuea 2-3 汤匙、温鸡汤 3-4 汤匙、红葱、青葱、香菜、锯齿香菜、薄荷叶、炸干辣椒、鱼露和少量青柠汁。',
        '先用小火把鸡肉煮到刚熟且软嫩，稍微放凉至温热后撕成条或粗切。鸡肉不要切得太碎，拌好后才有口感。',
        '把 KHUA Nam Prik Larb Nuea 与温鸡汤调开成浓稠酱汁。因为辣拌酱本身已有调味与香料深度，调鱼露前要先试味。青柠汁只需少量，用来提亮香气。',
        '把鸡肉放入大碗，倒入调好的 Nam Prik Larb 酱汁，轻轻拌到每块鸡肉都裹上调味。如果太干，可一匙一匙加入鸡汤。',
        '最后加入红葱、青葱、香菜、锯齿香菜、薄荷和炸干辣椒，轻轻拌匀，保持香草的清新和颜色。',
        '这道菜适合搭配黄瓜、卷心菜、长豆、糯米或猪皮脆片，也适合 SEO 搜索主题：泰北 Yam Gai 怎么做、KHUA Nam Prik Larb Nuea 能做什么、泰北鸡肉料理。',
      ],
    },
  }
  const text = contentByLocale[locale] || contentByLocale.en

  return {
    slug: `daily-${date}-northern-yam-gai-nam-prik-larb-recipe`,
    title: text.title,
    excerpt: text.excerpt,
    category: localizedCookingCategory(locale, category),
    date: formatDate(date, locale),
    readTime: locale === 'en' ? '8 min read' : locale === 'zh' ? '8 分钟阅读' : locale === 'lo' ? '8 ນາທີ' : '8 นาที',
    tags: text.tags,
    highlights: text.highlights,
    content: text.content,
  }
}

function buildPhakKhaoTongLocalVegetableArticle(date, locale, category = '') {
  const contentByLocale = {
    th: {
      title: 'ผักคาวตอง ผักพื้นบ้านกลิ่นชัดที่กินกับน้ำพริกเหนือและอาหารรสจัดได้ลงตัว',
      excerpt:
        'รู้จักผักคาวตองหรือพลูคาว ผักพื้นบ้านใบรูปหัวใจ กลิ่นเฉพาะ รสสดซ่า เหมาะกับน้ำพริกเหนือ ลาบ และอาหารรสจัด พร้อมวิธีเลือก ล้าง จัดเสิร์ฟ และแนวทาง SEO',
      tags: ['ผักคาวตอง', 'พลูคาว', 'ผักพื้นบ้าน', 'ผักกินกับน้ำพริก', 'สมุนไพรพื้นบ้าน', 'น้ำพริกเหนือ'],
      highlights: [
        'ผักคาวตองมีใบรูปหัวใจ กลิ่นชัด และรสสดซ่าที่ช่วยตัดความเผ็ดมันของน้ำพริก',
        'เลือกใบอ่อนสด ไม่ช้ำ ไม่เหลือง และก้านยังกรอบ',
        'ล้างให้สะอาด แช่น้ำเย็นสั้น ๆ แล้วเสิร์ฟสดเป็นผักแนม',
        'เหมาะกับน้ำพริกตาแดง น้ำพริกลาบ ลาบเหนือ และอาหารรสจัด',
      ],
      content: [
        'ผักคาวตองหรือพลูคาวเป็นผักพื้นบ้านที่มีเอกลักษณ์ชัด ใบมักเป็นรูปหัวใจ สีเขียวสด มีกลิ่นเฉพาะตัวและรสสดซ่า จึงเหมาะกับอาหารเหนือที่มีรสเผ็ด เค็ม หอมเครื่องเทศ หรือมีความมันจากน้ำพริกและลาบ',
        'ถ้าผู้ใช้เลือกหมวดผักพื้นบ้านและพิมพ์ว่า “ผักคาวตอง” บทความควรโฟกัสที่ตัวผักเป็นหลัก ไม่ควรเปลี่ยนไปเป็นสูตรน้ำพริกหรือภาพน้ำพริกแดง เพราะเจตนาของคำค้นคืออยากรู้จักผักชนิดนี้ วิธีเลือก วิธีเตรียม และกินกับอะไร',
        'วิธีเลือกผักคาวตองให้ดูที่ใบอ่อนและยอดสด ใบควรไม่ช้ำ ไม่เหลือง ไม่มีรอยดำ และก้านยังกรอบ ถ้ากลิ่นแรงเกินไปสำหรับบางคน ให้เลือกใบอ่อนมากกว่าส่วนใบแก่ เพราะกลิ่นจะนุ่มกว่าและกินง่ายกว่า',
        'ก่อนกินให้ล้างผ่านน้ำสะอาดหลายครั้ง โดยเฉพาะซอกใบและก้าน จากนั้นแช่น้ำเย็น 3-5 นาทีแล้วสะเด็ดน้ำให้แห้ง เด็ดเป็นช่อเล็กหรือแยกใบเพื่อจัดเสิร์ฟ คู่กับแตงกวา ถั่วฝักยาว หรือผักพื้นบ้านอื่นได้',
        'ผักคาวตองเข้ากับน้ำพริกตาแดงเหนือ น้ำพริกลาบเหนือ และลาบเหนือ เพราะกลิ่นสดของใบช่วยตัดความเผ็ด ความเค็ม และกลิ่นคั่วของพริกกับเครื่องเทศ ทำให้มื้ออาหารไม่หนักจนเกินไป',
        'ถ้าใช้สินค้า KHUA สามารถจัดผักคาวตองเป็นผักสดคู่กับ KHUA น้ำพริกตาแดงเหนือหรือ KHUA น้ำพริกลาบเหนือได้ดี โดยให้ผักเป็นตัวเพิ่มความสดและช่วยบาลานซ์รสจัดของน้ำพริก ไม่จำเป็นต้องปรุงผักเพิ่มเติม',
        'สำหรับ SEO ควรใช้คำว่า ผักคาวตอง, พลูคาว, ผักพื้นบ้าน, ผักกินกับน้ำพริก, สมุนไพรพื้นบ้าน และน้ำพริกเหนืออย่างเป็นธรรมชาติ พร้อมตอบคำถามหลักว่า ผักคาวตองคืออะไร รสชาติเป็นอย่างไร กินกับอะไร และเตรียมก่อนกินอย่างไร',
      ],
    },
    en: {
      title: 'Phak Khao Tong: Fish Mint, the Aromatic Local Vegetable for Northern Chili Paste',
      excerpt:
        'A practical guide to phak khao tong, or fish mint, including its heart-shaped leaves, bold aroma, preparation, pairing with Northern chili paste, and SEO-friendly content angles.',
      tags: ['phak khao tong', 'fish mint', 'Houttuynia cordata', 'local vegetables', 'Northern Thai chili paste', 'vegetables with nam prik'],
      highlights: [
        'Fish mint has heart-shaped leaves, a bold aroma, and a fresh bite that balances spicy chili paste.',
        'Choose young fresh leaves with no yellowing or bruising.',
        'Rinse carefully, chill briefly, drain well, and serve fresh.',
        'Pair with Nam Prik Ta Daeng, Nam Prik Larb, larb, and bold Northern dishes.',
      ],
      content: [
        'Phak khao tong, also known as fish mint or Houttuynia cordata, is a local vegetable with heart-shaped green leaves and a distinctive aroma. Its fresh, sharp character helps balance spicy and savory Northern Thai food.',
        'When the article brief names phak khao tong, the content should focus on the vegetable itself: what it is, how it tastes, how to choose it, how to prepare it, and what Northern dishes it works with.',
        'Choose young leaves with a fresh green color, crisp stems, no yellowing, and no bruising. Younger leaves are usually easier to eat because their aroma is gentler than older leaves.',
        'To prepare, rinse thoroughly, especially around stems and leaf folds. Soak briefly in cold water, drain well, then serve as small clusters or individual leaves with chili paste.',
        'Fish mint pairs well with Nam Prik Ta Daeng, Nam Prik Larb, Northern larb, and other spicy dishes. Its fresh aroma cuts through heat, salt, and richness.',
        'For KHUA products, serve phak khao tong as a fresh side vegetable with KHUA Nam Prik Ta Daeng Nuea or KHUA Nam Prik Larb Nuea. The vegetable brings brightness while the chili paste carries roasted depth.',
        'For SEO, use terms such as phak khao tong, fish mint, Houttuynia cordata, local vegetables, vegetables with nam prik, and Northern Thai chili paste while answering practical questions about flavor and preparation.',
      ],
    },
    lo: {
      title: 'ຜັກຄາວຕອງ ຜັກພື້ນບ້ານກິ່ນຊັດ ກິນກັບນ້ຳພິກເໜືອໄດ້ສົດຊື່ນ',
      excerpt:
        'ຮູ້ຈັກຜັກຄາວຕອງ ຜັກໃບຮູບຫົວໃຈ ກິ່ນຊັດ ເໝາະກັບນ້ຳພິກເໜືອ ພ້ອມວິທີເລືອກ ລ້າງ ແລະຈັດເສີບ',
      tags: ['ຜັກຄາວຕອງ', 'ຜັກພື້ນບ້ານ', 'ຜັກກິນກັບນ້ຳພິກ', 'ນ້ຳພິກເໜືອ', 'ສະໝຸນໄພພື້ນບ້ານ'],
      highlights: [
        'ຜັກຄາວຕອງມີໃບຮູບຫົວໃຈ ແລະກິ່ນສົດຊັດ',
        'ເລືອກໃບອ່ອນສົດ ບໍ່ເຫຼືອງ ບໍ່ຊ້ຳ',
        'ລ້າງໃຫ້ສະອາດ ແຊ່ນ້ຳເຢັນສັ້ນໆ ແລ້ວເສີບສົດ',
        'ເໝາະກັບນ້ຳພິກຕາແດງ ນ້ຳພິກລາບ ແລະລາບເໜືອ',
      ],
      content: [
        'ຜັກຄາວຕອງເປັນຜັກພື້ນບ້ານໃບຮູບຫົວໃຈ ມີກິ່ນຊັດ ແລະລົດສົດ ຊ່ວຍຕັດຄວາມເຜັດແລະຄວາມມັນຂອງອາຫານເໜືອ.',
        'ຖ້າຜູ້ອ່ານຄົ້ນຫາຜັກຄາວຕອງ ບົດຄວາມຄວນໂຟກັສທີ່ຜັກນີ້ໂດຍກົງ ບໍ່ແມ່ນສູດນ້ຳພິກ ຫຼືອາຫານອື່ນ.',
        'ເລືອກໃບອ່ອນສົດ ບໍ່ເຫຼືອງ ບໍ່ຊ້ຳ ແລະກ້ານຍັງກອບ. ໃບອ່ອນຈະກິນງ່າຍກວ່າໃບແກ່.',
        'ລ້າງຜັກຫຼາຍນ້ຳ ແຊ່ນ້ຳເຢັນ 3-5 ນາທີ ແລ້ວສະເດັດນ້ຳ ຈັດເປັນຊໍ່ນ້ອຍກິນກັບນ້ຳພິກ.',
        'ຜັກຄາວຕອງເໝາະກັບນ້ຳພິກຕາແດງ ນ້ຳພິກລາບ ແລະອາຫານເຜັດ ເພາະຊ່ວຍໃຫ້ມື້ອາຫານສົດຂຶ້ນ.',
      ],
    },
    zh: {
      title: '鱼腥草 Phak Khao Tong：适合搭配泰北辣椒酱的本地香草蔬菜',
      excerpt:
        '认识 Phak Khao Tong 鱼腥草，了解心形叶、特殊香气、挑选清洗方法，以及如何搭配泰北辣椒酱与 SEO 写作方向。',
      tags: ['Phak Khao Tong', '鱼腥草', 'Houttuynia cordata', '泰北本地蔬菜', '泰北辣椒酱', 'Nam Prik'],
      highlights: [
        '鱼腥草有心形绿叶和鲜明香气，能平衡辣椒酱的厚重味。',
        '选择嫩叶新鲜、不发黄、不压伤的叶束。',
        '充分清洗、短暂冰镇、沥干后作为鲜蔬搭配。',
        '适合搭配泰北红辣椒酱、Nam Prik Larb 与拉布。',
      ],
      content: [
        'Phak Khao Tong，也就是鱼腥草，是一种带有特殊香气的本地蔬菜。它的心形叶和清爽味道适合搭配泰北辣椒酱、拉布和重香料菜。',
        '当主题写的是鱼腥草，内容应集中回答它是什么、什么味道、如何挑选、如何清洗，以及适合搭配什么，而不是转成辣椒酱食谱。',
        '挑选时看嫩叶是否鲜绿、无发黄、无压伤，茎部是否仍然脆。嫩叶通常比老叶更容易入口。',
        '食用前用清水充分冲洗，短暂泡冷水后沥干，再摘成小束或单片叶摆盘。',
        '鱼腥草适合搭配泰北红辣椒酱、Nam Prik Larb 和泰北拉布，能用清新香气平衡辣、咸和油脂感。',
        '搭配 KHUA 产品时，可作为 KHUA Nam Prik Ta Daeng Nuea 或 KHUA Nam Prik Larb Nuea 的鲜蔬配菜。',
      ],
    },
  }
  const text = contentByLocale[locale] || contentByLocale.en

  return {
    slug: `daily-${date}-phak-khao-tong-local-vegetable`,
    title: text.title,
    excerpt: text.excerpt,
    category: localizedLocalVegetableCategory(locale, category),
    date: formatDate(date, locale),
    readTime: locale === 'en' ? '6 min read' : locale === 'zh' ? '6 分钟阅读' : locale === 'lo' ? '6 ນາທີ' : '6 นาที',
    tags: text.tags,
    highlights: text.highlights,
    content: text.content,
  }
}

function buildYodMakokLocalVegetableArticle(date, locale, category = '') {
  const contentByLocale = {
    th: {
      title: 'ยอดมะกอก ผักพื้นบ้านรสเปรี้ยวฝาดที่กินกับน้ำพริกเหนือให้อร่อยและสดชื่น',
      excerpt:
        'รู้จักยอดมะกอก ผักพื้นบ้านภาคเหนือที่มีรสเปรี้ยวฝาดหอมสด เหมาะกับน้ำพริกเหนือ ลาบ และอาหารรสจัด พร้อมวิธีเลือก ล้าง จัดเสิร์ฟ และแนวทางเขียน SEO ให้ตรงคำค้น',
      tags: ['ยอดมะกอก', 'ผักพื้นบ้าน', 'ผักกินกับน้ำพริก', 'น้ำพริกเหนือ', 'อาหารเหนือเพื่อสุขภาพ', 'ผักพื้นบ้านภาคเหนือ'],
      highlights: [
        'ยอดมะกอกมีรสเปรี้ยวฝาดสด ช่วยตัดความเผ็ดและความมันของน้ำพริกเหนือ',
        'เลือกยอดอ่อนใบไม่ช้ำ สีเขียวสดหรือมีปลายอ่อนอมทองแดงเล็กน้อย',
        'ล้างให้สะอาดแล้วเด็ดเป็นช่อเล็ก เสิร์ฟสดกับน้ำพริกตาแดง น้ำพริกลาบ หรือเมนูลาบเหนือ',
        'บทความ SEO ควรตอบให้ชัดว่ายอดมะกอกคืออะไร กินกับอะไร และต่างจากผักพื้นบ้านอื่นอย่างไร',
      ],
      content: [
        'ยอดมะกอกเป็นผักพื้นบ้านที่พบได้ในหลายพื้นที่ของภาคเหนือ จุดเด่นคือรสเปรี้ยวฝาดเบา ๆ และกลิ่นเขียวสดที่ช่วยให้มื้ออาหารเหนือมีความสดชื่นขึ้น โดยเฉพาะเมนูน้ำพริกเหนือ ลาบเหนือ หรืออาหารที่มีรสเผ็ดและกลิ่นเครื่องเทศชัด',
        'ถ้าเขียนบทความในหมวดผักพื้นบ้าน หัวข้อยอดมะกอกควรโฟกัสที่ตัวผักเป็นหลัก ไม่ใช่เปลี่ยนไปเป็นสูตรน้ำพริกหรือเมนูผัด เพราะผู้อ่านที่ค้นหา “ยอดมะกอก” ต้องการรู้ว่าผักนี้คืออะไร กินอย่างไร รสชาติเป็นแบบไหน และเหมาะกับอาหารเหนือจานใด',
        'วิธีเลือกยอดมะกอกให้ดูที่ยอดอ่อนและใบอ่อน ใบควรสด ไม่เหี่ยว ไม่ช้ำ และไม่แก่จนเหนียว บางยอดอาจมีสีเขียวอ่อนหรือปลายใบอมแดงทองแดงเล็กน้อย ซึ่งเป็นลักษณะของยอดอ่อนที่น่ากินและมีกลิ่นสด',
        'ก่อนเสิร์ฟให้ล้างยอดมะกอกผ่านน้ำสะอาดหลายครั้ง แช่น้ำเย็นสั้น ๆ แล้วสะเด็ดน้ำให้แห้ง จากนั้นเด็ดเป็นช่อเล็กหรือเด็ดเฉพาะใบอ่อนเพื่อให้หยิบกินง่าย ถ้ายอดมีส่วนก้านแข็งควรตัดออกเพื่อไม่ให้เสียสัมผัสตอนกิน',
        'ยอดมะกอกเหมาะกับน้ำพริกตาแดงเหนือ น้ำพริกลาบเหนือ น้ำพริกปลาร้า หรืออาหารรสจัด เพราะรสเปรี้ยวฝาดจะช่วยตัดความเค็ม เผ็ด และมัน ทำให้กินได้ต่อเนื่องขึ้น ถ้าจัดจานกับแตงกวา ถั่วฝักยาว และกะหล่ำปลี จะได้ชุดผักที่มีทั้งกรอบ สด และรสเปรี้ยวจากธรรมชาติ',
        'สำหรับคนที่อยากใช้สินค้า KHUA ในมื้ออาหาร ยอดมะกอกเข้ากับ KHUA น้ำพริกตาแดงเหนือและ KHUA น้ำพริกลาบเหนือได้ดี โดยใช้ยอดมะกอกเป็นผักสดคู่จาน ช่วยยกกลิ่นคั่วของพริกและเครื่องเทศให้ชัดขึ้นโดยไม่ต้องปรุงเพิ่ม',
        'ในเชิง SEO ควรใช้คำสำคัญอย่าง ยอดมะกอก, ผักพื้นบ้าน, ผักกินกับน้ำพริก, ผักพื้นบ้านภาคเหนือ และน้ำพริกเหนืออย่างเป็นธรรมชาติ พร้อมตอบคำถามที่คนค้นหาจริง เช่น ยอดมะกอกกินกับอะไร ยอดมะกอกรสชาติเป็นอย่างไร และต้องเตรียมก่อนกินอย่างไร',
      ],
    },
    en: {
      title: 'Yod Makok: The Tangy Northern Local Vegetable for Chili Paste and Lanna Meals',
      excerpt:
        'A clear guide to yod makok, or Thai olive young shoots, including flavor, selection, preparation, pairing with Northern chili paste, and SEO-friendly article angles.',
      tags: ['yod makok', 'Thai olive shoots', 'local vegetables', 'Northern Thai chili paste', 'Northern Thai food', 'vegetables with nam prik'],
      highlights: [
        'Yod makok has a fresh tangy-astringent flavor that balances spicy Northern chili paste.',
        'Choose tender young shoots with fresh leaves and no bruising.',
        'Serve fresh with Nam Prik Ta Daeng, Nam Prik Larb, larb, or other bold Northern dishes.',
        'A useful SEO article should explain what yod makok is, how it tastes, and what to eat it with.',
      ],
      content: [
        'Yod makok, often described as Thai olive or hog plum young shoots, is a Northern local vegetable valued for its fresh tangy and lightly astringent taste. It works beautifully beside spicy chili paste, larb, and dishes with roasted herbs.',
        'An article about yod makok should keep the vegetable as the main subject. Readers searching for this ingredient want to know what it is, how it tastes, how to prepare it, and which Northern Thai dishes it supports.',
        'Choose tender young shoots with fresh leaves, no bruising, and no dry edges. Young tips may appear light green or slightly copper-toned. Avoid older tough leaves if serving the vegetable raw.',
        'To prepare, rinse several times, briefly soak in cold water, drain well, and trim away hard stems. Serve as small clusters so the vegetable is easy to pick up with chili paste or a bite of sticky rice.',
        'Yod makok pairs well with Northern red chili paste, Nam Prik Larb, fermented fish chili paste, and spicy larb. Its tangy edge cuts through salt, heat, and richness, making the meal feel fresher.',
        'For KHUA products, yod makok is a natural fresh vegetable side for KHUA Nam Prik Ta Daeng Nuea and KHUA Nam Prik Larb Nuea. The vegetable brightens the roasted chili and spice notes without needing extra seasoning.',
        'For SEO, use terms such as yod makok, Thai olive shoots, local vegetables, vegetables with nam prik, and Northern Thai chili paste naturally while answering practical questions about taste, preparation, and pairing.',
      ],
    },
    lo: {
      title: 'ຍອດໝາກກອກ ຜັກພື້ນບ້ານລົດສົ້ມຝາດ ກິນກັບນ້ຳພິກເໜືອໃຫ້ສົດຊື່ນ',
      excerpt:
        'ຮູ້ຈັກຍອດໝາກກອກ ຜັກພື້ນບ້ານທີ່ມີລົດສົ້ມຝາດ ເໝາະກັບນ້ຳພິກເໜືອ ພ້ອມວິທີເລືອກ ລ້າງ ແລະຈັດເສີບ',
      tags: ['ຍອດໝາກກອກ', 'ຜັກພື້ນບ້ານ', 'ຜັກກິນກັບນ້ຳພິກ', 'ນ້ຳພິກເໜືອ', 'ອາຫານເໜືອ'],
      highlights: [
        'ຍອດໝາກກອກມີລົດສົ້ມຝາດ ຊ່ວຍຕັດຄວາມເຜັດຂອງນ້ຳພິກ',
        'ເລືອກຍອດອ່ອນ ໃບສົດ ບໍ່ຊ້ຳ ແລະບໍ່ແກ່ເກີນໄປ',
        'ລ້າງໃຫ້ສະອາດ ເດັດເປັນຊໍ່ນ້ອຍ ແລ້ວເສີບສົດກັບນ້ຳພິກ',
        'ບົດຄວາມຄວນຕອບວ່າຍອດໝາກກອກແມ່ນຫຍັງ ລົດແນວໃດ ແລະກິນກັບຫຍັງ',
      ],
      content: [
        'ຍອດໝາກກອກເປັນຜັກພື້ນບ້ານທີ່ມີລົດສົ້ມຝາດອ່ອນໆ ແລະກິ່ນຂຽວສົດ ຊ່ວຍໃຫ້ມື້ອາຫານເໜືອທີ່ມີນ້ຳພິກ ຫຼືລາບ ກິນໄດ້ສົດຊື່ນຂຶ້ນ.',
        'ຖ້າຂຽນບົດຄວາມໝວດຜັກພື້ນບ້ານ ຄວນໃຫ້ຍອດໝາກກອກເປັນຫົວຂໍ້ຫຼັກ ບໍ່ຄວນປ່ຽນໄປເປັນສູດນ້ຳພິກ ຫຼືອາຫານອື່ນ.',
        'ເລືອກຍອດອ່ອນ ໃບສົດ ບໍ່ເຫຼືອງ ບໍ່ຊ້ຳ ແລະກ້ານບໍ່ແຂງເກີນໄປ. ຍອດອ່ອນບາງສ່ວນອາດມີສີຂຽວອ່ອນຫຼືປາຍໃບອອກສີນ້ຳຕານແດງ.',
        'ກ່ອນເສີບໃຫ້ລ້າງຫຼາຍນ້ຳ ແຊ່ນ້ຳເຢັນສັ້ນໆ ແລ້ວສະເດັດນ້ຳ ເດັດເປັນຊໍ່ນ້ອຍໃຫ້ກິນງ່າຍ.',
        'ຍອດໝາກກອກເໝາະກັບນ້ຳພິກຕາແດງ ນ້ຳພິກລາບ ແລະອາຫານເຜັດ ເພາະລົດສົ້ມຝາດຊ່ວຍຕັດຄວາມເຄັມ ເຜັດ ແລະຄວາມມັນ.',
        'ສຳລັບສິນຄ້າ KHUA ຍອດໝາກກອກເຂົ້າກັບ KHUA ນ້ຳພິກຕາແດງເໜືອ ແລະ KHUA ນ້ຳພິກລາບເໜືອໄດ້ດີ.',
      ],
    },
    zh: {
      title: '泰北本地蔬菜 Yod Makok：带酸涩清香的嫩叶，适合搭配泰北辣椒酱',
      excerpt:
        '认识 Yod Makok 泰国酸橄榄嫩叶，了解它的味道、挑选、清洗、摆盘，以及如何搭配泰北辣椒酱和撰写 SEO 内容。',
      tags: ['Yod Makok', '泰北本地蔬菜', '泰国酸橄榄嫩叶', '泰北辣椒酱', '本地蔬菜', 'Nam Prik'],
      highlights: [
        'Yod Makok 有清新的酸涩味，能平衡泰北辣椒酱的辣与咸。',
        '选择嫩叶新鲜、不发黄、不压伤的嫩梢。',
        '清洗后摘成小束，可生食搭配辣椒酱或泰北拉布。',
        'SEO 内容应清楚回答它是什么、什么味道、适合搭配什么。',
      ],
      content: [
        'Yod Makok 常被理解为泰国酸橄榄或 hog plum 的嫩叶，是泰北餐桌上的本地蔬菜之一。它带有自然酸涩和清新草本味，适合搭配辣椒酱、拉布和香料味较重的菜。',
        '写这类本地蔬菜文章时，主题应集中在 Yod Makok 本身，而不是转成辣椒酱或其他料理。读者想知道它是什么、味道如何、怎样准备，以及配什么最好吃。',
        '挑选时看嫩梢和嫩叶，叶子要新鲜、不发黄、不压伤。部分嫩叶可能呈浅绿色或略带铜红色，这是嫩梢常见的颜色。',
        '食用前用清水洗数次，短暂泡冷水后沥干，摘成小束。若茎部太硬，可去掉较粗的部分，保留嫩叶口感。',
        'Yod Makok 适合搭配泰北红辣椒酱、Nam Prik Larb、发酵鱼辣椒酱或泰北拉布。它的酸涩感能平衡咸、辣和油脂，使整餐更清爽。',
        '如果搭配 KHUA 产品，Yod Makok 很适合作为 KHUA Nam Prik Ta Daeng Nuea 和 KHUA Nam Prik Larb Nuea 的新鲜蔬菜配菜。',
        'SEO 文章可自然使用 Yod Makok、本地蔬菜、泰北辣椒酱、Nam Prik 配菜等关键词，并回答味道、准备方式和搭配建议。',
      ],
    },
  }
  const text = contentByLocale[locale] || contentByLocale.en

  return {
    slug: `daily-${date}-yod-makok-local-vegetable`,
    title: text.title,
    excerpt: text.excerpt,
    category: localizedLocalVegetableCategory(locale, category),
    date: formatDate(date, locale),
    readTime: locale === 'en' ? '6 min read' : locale === 'zh' ? '6 分钟阅读' : locale === 'lo' ? '6 ນາທີ' : '6 นาที',
    tags: text.tags,
    highlights: text.highlights,
    content: text.content,
  }
}

function topicSearchText(topic) {
  return locales
    .flatMap((locale) => {
      const text = topic[locale]
      return [
        topic.key,
        text.title,
        text.excerpt,
        text.category,
        ...text.tags,
        ...text.highlights,
        ...text.content,
      ]
    })
    .join(' ')
    .toLowerCase()
}

function topicForDate(date, brief = '') {
  const cleanedBrief = String(brief || '').trim().toLowerCase()
  if (!cleanedBrief) {
    const index = Math.abs(date.split('-').join('')) % topics.length
    return topics[index]
  }

  const terms = cleanedBrief
    .split(/[^\p{L}\p{N}]+/u)
    .filter((term) => term.length >= 2)

  const scored = topics.map((topic, index) => {
    const haystack = topicSearchText(topic)
    const score = terms.reduce((total, term) => total + (haystack.includes(term) ? 1 : 0), 0)
    return { topic, score, index }
  })

  scored.sort((a, b) => b.score - a.score || a.index - b.index)
  return scored[0]?.score > 0 ? scored[0].topic : topics[Math.abs(date.split('-').join('')) % topics.length]
}

export function stripEditorialInstructions(article) {
  const instructionStart = [
    'สำหรับ SEO',
    'For SEO',
    'SEO 可',
    'SEO ',
    'ในเชิง SEO',
  ]
  const editorialFragments = [
    'ควรเล่าวัตถุดิบสำคัญ',
    'ไม่ใช่เพียงใส่รายการวัตถุดิบ',
    'ถ้าจะโยงสินค้า KHUA',
    'โยงสินค้า KHUA เฉพาะ',
    'อธิบายรสชาติ วัตถุดิบ และบริบทของเมนู',
    'แนะนำการจัดมื้อหรือเครื่องเคียงที่เหมาะ',
    'ภาพต้องเป็น',
    'ภาพต้องเห็น',
    'ควรถูกนำเสนอเป็น',
    'บทความไม่ควรเปลี่ยน',
    'หัวใจของบทความคือ',
    'ต้องเป็นเมนูหลักของบทความ',
    'ต้องเป็นหัวข้อหลักของบทความ',
    'ต้องเป็นสูตรหรือวิธีทำหลัก',
    'ต้องเป็นผักตัวเอก',
    'ต้องเป็นสมุนไพรตัวเอก',
    'ต้องเป็นขั้นตอนหรือเทคนิคหลักของบทความ',
    'must be the main topic',
    'must answer the selected category intent',
    'Product mentions should appear only',
    'image brief must make',
    'should not be replaced by another',
    'Only mention KHUA',
  ]
  const cleanVisibleText = (value) =>
    String(value || '')
      .replace(/,\s*SEO angle/gi, '')
      .replace(/\s*SEO angle,?\s*/gi, ' ')
      .replace(/SEO-focused cooking guidance/gi, 'practical cooking guidance')
      .replace(/SEO-friendly content angles/gi, 'practical content angles')
      .replace(/SEO-friendly article angles/gi, 'practical article angles')
      .replace(/เหมาะสำหรับบทความ SEO อาหารเหนือ/g, 'เหมาะสำหรับคนที่อยากทำอาหารเหนืออย่างละเอียด')
      .replace(/แนวทางเขียน SEO ให้ตรงคำค้น/g, 'แนวทางเขียนให้ตรงคำค้น')
      .replace(/แนวทาง SEO/g, 'แนวทางการเขียนให้ตรงคำค้น')
      .replace(/SEO 关键词方向/g, '实用关键词方向')
      .replace(/撰写 SEO 内容/g, '撰写实用内容')
      .replace(/SEO 写作方向/g, '实用写作方向')
      .replace(/、SEO/g, '')
      .replace(/SEO\s*与/g, '')
      .replace(/article,\s+and/gi, 'article and')
      .replace(/\s{2,}/g, ' ')
      .trim()
  const isEditorialInstruction = (value) => {
    const text = String(value || '').trim()
    if (!text) return true
    if (text.includes('SEO') || instructionStart.some((prefix) => text.startsWith(prefix))) return true
    if (editorialFragments.some((fragment) => text.includes(fragment))) return true
    return (
      /^(ควร|ไม่ควร|ถ้า|ให้)\S*/u.test(text) &&
      /(บทความ|หัวข้อ|คำค้น|ผู้อ่าน|สินค้า KHUA|โยงสินค้า|เมนูหลัก|ภาพต้อง|Return fields)/u.test(text)
    )
  }

  return {
    ...article,
    excerpt: cleanVisibleText(article.excerpt),
    highlights: Array.isArray(article.highlights)
      ? article.highlights.filter((highlight) => !isEditorialInstruction(highlight)).map(cleanVisibleText)
      : article.highlights,
    content: Array.isArray(article.content)
      ? article.content.filter((paragraph) => !isEditorialInstruction(paragraph)).map(cleanVisibleText)
      : article.content,
  }
}

function customizeArticleForBrief(article, brief, locale, category = '') {
  const cleanedBrief = String(brief || '').trim().replace(/\s+/g, ' ')
  const cleanedCategory = String(category || '').trim().replace(/\s+/g, ' ')
  const articleWithCategory = cleanedCategory ? { ...article, category: cleanedCategory } : article
  if (!cleanedBrief) return articleWithCategory

  const briefLabel = cleanedBrief.length > 140 ? `${cleanedBrief.slice(0, 137)}...` : cleanedBrief
  const leadByLocale = {
    th: `บทความฉบับนี้โฟกัสตามรายละเอียดที่ต้องการสร้าง: ${briefLabel}`,
    en: `This draft focuses on the requested brief: ${briefLabel}`,
    lo: `ຮ່າງບົດຄວາມນີ້ໂຟກັສຕາມລາຍລະອຽດທີ່ຕ້ອງການສ້າງ: ${briefLabel}`,
    zh: `这篇草稿会聚焦于生成需求：${briefLabel}`,
  }
  const tagByLocale = {
    th: 'หัวข้อที่กำหนดเอง',
    en: 'custom brief',
    lo: 'ຫົວຂໍ້ກຳນົດເອງ',
    zh: '自定义主题',
  }

  return {
    ...articleWithCategory,
    slug: `${article.slug}-${briefSlug(cleanedBrief) || 'custom'}`,
    excerpt: `${article.excerpt} ${leadByLocale[locale] || leadByLocale.en}`,
    tags: Array.from(new Set([tagByLocale[locale] || tagByLocale.en, ...article.tags])).slice(0, 7),
    highlights: [leadByLocale[locale] || leadByLocale.en, ...article.highlights].slice(0, 5),
    content: [leadByLocale[locale] || leadByLocale.en, ...article.content],
  }
}

function extractResponseText(response) {
  if (typeof response?.output_text === 'string') return response.output_text
  return (response?.output || [])
    .flatMap((item) => item?.content || [])
    .map((content) => content?.text || '')
    .filter(Boolean)
    .join('\n')
}

function parseJsonResponseText(text) {
  const raw = String(text || '').trim()
  if (!raw) throw new Error('Empty JSON response')
  try {
    return JSON.parse(raw)
  } catch {
    const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1]?.trim()
    if (fenced) return JSON.parse(fenced)
    const start = raw.indexOf('{')
    const end = raw.lastIndexOf('}')
    if (start >= 0 && end > start) return JSON.parse(raw.slice(start, end + 1))
    throw new Error('Could not parse JSON response')
  }
}

function researchGuardrails(brief = '', category = '') {
  if (isSaaJinMenu(brief, category)) {
    return [
      'Known validation guardrail for this exact term:',
      'ส้าจิ้น / ส้าจิ๊น / ส้าเนื้อ is a Northern Thai beef or buffalo dish, often described as Sa Nuea or Saa Jin.',
      'It is not a pork dish and not Nam Prik Ong.',
      'Main visual and content subjects must be fresh beef or buffalo meat, Northern larb spices/paste, herbs, and local vegetables.',
      'Some offal may be included, and offal is often cooked before mixing depending on local style.',
    ].join(' ')
  }

  return ''
}

function researchedArticlePassesGuardrails(articleSet, brief = '', category = '') {
  if (!isSaaJinMenu(brief, category)) return true
  const thText = [
    articleSet?.articles?.th?.title,
    articleSet?.articles?.th?.excerpt,
    ...(articleSet?.articles?.th?.content || []),
    articleSet?.researchImageBrief,
  ].join(' ')
  const lower = thText.toLowerCase()
  const mentionsBeef = /เนื้อวัว|เนื้อควาย|ส้าเนื้อ|beef|buffalo/.test(lower)
  const wronglyPork = /หมูสับดิบ|raw minced pork|เนื้อหมูดิบ/.test(lower)
  const wronglyDip = /น้ำพริกอ่อง|nam prik ong|tomato sauce/.test(lower)
  return mentionsBeef && !wronglyPork && !wronglyDip
}

function articleHasProfessionalShape(article) {
  const highlights = Array.isArray(article?.highlights) ? article.highlights : []
  const content = Array.isArray(article?.content) ? article.content : []
  const visibleText = [
    article?.title,
    article?.excerpt,
    ...highlights,
    ...content,
  ].join(' ')
  const editorialLeak = /(?:Return fields|source notes|for SEO|SEO-focused|keywords|image brief|ควรเล่าวัตถุดิบสำคัญ|บทความไม่ควรเปลี่ยน|หัวใจของบทความคือ|ภาพต้องเป็น|ภาพต้องเห็น)/i

  return (
    highlights.length >= 2 &&
    content.length >= 4 &&
    content.every((paragraph) => String(paragraph || '').trim().length >= 120) &&
    !editorialLeak.test(visibleText)
  )
}

function normalizeGeneratedArticle(article, date, locale, category, slugBase, researchImageBrief = '') {
  if (!article || typeof article !== 'object') return null
  const title = String(article.title || '').trim()
  const excerpt = String(article.excerpt || '').trim()
  const tags = Array.isArray(article.tags) ? article.tags.map((item) => String(item).trim()).filter(Boolean) : []
  const highlights = Array.isArray(article.highlights)
    ? article.highlights.map((item) => String(item).trim()).filter(Boolean)
    : []
  const content = Array.isArray(article.content)
    ? article.content.map((item) => String(item).trim()).filter(Boolean)
    : []

  if (!title || !excerpt || tags.length < 3 || highlights.length < 2 || content.length < 3) return null

  const kind = categoryKind(category)
  const localizedCategory = kind
    ? localizedFocusedCategory(locale, kind, category)
    : String(article.category || category || '').trim()

  const normalized = stripEditorialInstructions({
    slug: `daily-${date}-${slugBase}`,
    title,
    excerpt,
    category: localizedCategory,
    date: formatDate(date, locale),
    readTime: locale === 'en' ? '6 min read' : locale === 'zh' ? '6 分钟阅读' : locale === 'lo' ? '6 ນາທີ' : '6 นาที',
    tags: tags.slice(0, 7),
    highlights: highlights.slice(0, 5),
    content: content.slice(0, 8),
    researchImageBrief,
  })

  if (!articleHasProfessionalShape(normalized)) return null

  return normalized
}

export async function generateResearchedArticleSet(date, brief = '', category = '') {
  if (!process.env.OPENAI_API_KEY) return null

  const subject = cleanBriefSubject(brief)
  if (!subject || !categoryKind(category)) return null

  const prompt = [
    'You are a meticulous Northern Thai culinary researcher, professional magazine food writer, and multilingual SEO food editor for KHUA.',
    'Before writing, use web search to verify the requested topic. Prefer Thai sources for Thai/Northern Thai food terms, then synthesize carefully. Do not invent facts.',
    `Selected category: ${category}`,
    `User generation detail: ${brief}`,
    researchGuardrails(brief, category),
    'The generated article must be about the exact requested subject, not a nearby dish, generic chili paste, or generic Northern Thai scene.',
    'Write like a polished published article for real readers: natural opening, useful context, sensory detail, clear transitions, and a confident closing idea. Do not write an outline, checklist, prompt response, or internal editorial brief.',
    'SEO requirements: title is the page H1 and must include the exact subject naturally; excerpt must work as a meta description around 120-155 characters when possible; tags must be reader-facing search tags; highlights must be H2-style section headings, not instructions; each content paragraph must support the matching heading with useful detail.',
    'Content depth: each locale should have 4-6 substantial paragraphs, normally 80-150 words each for English and equivalent depth for Thai/Lao/Chinese. Avoid thin generic paragraphs.',
    'Heading hierarchy: do not include literal HTML tags in JSON. The website renders title as H1, highlights as H2 section headings, and tags/category as supporting labels.',
    'If the subject is a dish, identify the real dish, main ingredient, seasoning, serving context, and visual identity. If it has raw meat or safety-sensitive preparation, describe it neutrally and professionally.',
    'If the subject is an ingredient, herb, vegetable, cooking technique, kitchen knowledge, ingredient quality, or table idea, explain that category intent directly.',
    'Mention KHUA products only when the menu genuinely uses chili paste, larb paste, or curry paste. Do not force product promotion.',
    'Do not include visible internal writing instructions such as "for SEO", "SEO-focused", "keywords", "H1", "H2", "source notes", "the article should", or similar editorial notes in article fields.',
    'Return JSON only. The slugBase must be lowercase ASCII words separated by hyphens.',
    'Return fields: slugBase, researchImageBrief, articles.th, articles.en, articles.lo, articles.zh. Each article needs title, excerpt, tags array, highlights array, content array.',
    'The researchImageBrief must be in English and must describe exactly what the cover image should show and what to avoid.',
  ].join('\n')

  const schema = {
    type: 'object',
    additionalProperties: false,
    required: ['slugBase', 'researchImageBrief', 'articles'],
    properties: {
      slugBase: { type: 'string' },
      researchImageBrief: { type: 'string' },
      articles: {
        type: 'object',
        additionalProperties: false,
        required: ['th', 'en', 'lo', 'zh'],
        properties: Object.fromEntries(
          locales.map((locale) => [
            locale,
            {
              type: 'object',
              additionalProperties: false,
              required: ['title', 'excerpt', 'tags', 'highlights', 'content'],
              properties: {
                title: { type: 'string' },
                excerpt: { type: 'string' },
                tags: { type: 'array', minItems: 3, maxItems: 7, items: { type: 'string' } },
                highlights: { type: 'array', minItems: 2, maxItems: 5, items: { type: 'string' } },
                content: { type: 'array', minItems: 3, maxItems: 8, items: { type: 'string' } },
              },
            },
          ]),
        ),
      },
    },
  }

  try {
    const response = await fetchWithTimeout('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENAI_RESEARCH_MODEL || process.env.OPENAI_TEXT_MODEL || 'gpt-4o-mini',
        tools: [{ type: 'web_search' }],
        tool_choice: 'auto',
        max_output_tokens: 16000,
        input: prompt,
        text: {
          format: {
            type: 'json_schema',
            name: 'khua_researched_article_set',
            strict: true,
            schema,
          },
        },
      }),
    }, envInt('OPENAI_RESEARCH_TIMEOUT_MS', 9000))

    if (!response.ok) {
      const body = await response.text()
      throw new Error(`OpenAI research failed: ${response.status} ${body.slice(0, 500)}`)
    }

    const json = await response.json()
    const text = extractResponseText(json)
    const data = parseJsonResponseText(text)
    if (!researchedArticlePassesGuardrails(data, brief, category)) {
      console.warn('Article research rejected by local validation guardrails.')
      return null
    }

    const slugBase = isSaaJinMenu(brief, category)
      ? 'saa-jin-northern-menu'
      : briefSlug(data.slugBase) || focusedSubjectSlug(subject, 'researched-article')
    const researchImageBrief = String(data.researchImageBrief || '').trim()
    const articles = Object.fromEntries(
      locales.map((locale) => [
        locale,
        normalizeGeneratedArticle(data.articles?.[locale], date, locale, category, slugBase, researchImageBrief),
      ]),
    )

    if (locales.some((locale) => !articles[locale])) return null

    return { articles, researchImageBrief }
  } catch (error) {
    console.warn('Article research generation failed:', error)
    return null
  }
}

export function buildArticle(date, locale, brief = '', category = '') {
  if (isSaaJinMenu(brief, category)) {
    return buildSaaJinMenuArticle(date, locale, category)
  }

  if (isPhakKhaoTongLocalVegetable(brief, category)) {
    return stripEditorialInstructions(buildPhakKhaoTongLocalVegetableArticle(date, locale, category))
  }

  if (isYodMakokLocalVegetable(brief, category)) {
    return stripEditorialInstructions(buildYodMakokLocalVegetableArticle(date, locale, category))
  }

  if (isNorthernYamGaiNamPrikLarbRecipe(brief, category)) {
    return stripEditorialInstructions(buildNorthernYamGaiNamPrikLarbRecipe(date, locale, category))
  }

  if (isNamPrikOngRecipe(brief, category)) {
    return stripEditorialInstructions(buildNamPrikOngRecipe(date, locale, category))
  }

  if (isLannaIngredientsCategory(category) && cleanBriefSubject(brief)) {
    return stripEditorialInstructions(buildLannaIngredientArticle(date, locale, brief, category))
  }

  const focusedArticle = buildFocusedCategoryArticle(date, locale, brief, category)
  if (focusedArticle) {
    return stripEditorialInstructions(focusedArticle)
  }

  const topic = topicForDate(date, [category, brief].filter(Boolean).join(' '))
  const text = topic[locale]

  return stripEditorialInstructions(customizeArticleForBrief({
    slug: `daily-${date}-${topic.key}`,
    title: text.title,
    excerpt: text.excerpt,
    category: text.category,
    date: formatDate(date, locale),
    readTime: locale === 'en' ? '6 min read' : locale === 'zh' ? '6 分钟阅读' : locale === 'lo' ? '6 ນາທີ' : '6 นาที',
    tags: text.tags,
    highlights: text.highlights,
    content: text.content,
  }, brief, locale, category))
}

async function run() {
  const data = readData()
  const today = todayBangkok()
  const connection = await connectDb()

  if (connection) {
    await ensureSchema(connection)
    await seedLegacyGeneratedArticles(connection, data)
  }

  const latest = connection
    ? (await latestGeneratedDateFromDb(connection)) ?? latestGeneratedDate(data)
    : latestGeneratedDate(data)
  const start = latest ? addDays(latest, 1) : today
  let cursor = start
  let added = 0

  while (cursor <= today) {
    const localizedArticles = {}
    for (const locale of locales) {
      const article = buildArticle(cursor, locale)
      localizedArticles[locale] = article
      const exists = data[locale].some((item) => item.slug === article.slug)
      if (!exists) {
        data[locale].unshift(article)
        added += 1
      }
    }
    if (connection) {
      await upsertArticle(connection, cursor, localizedArticles)
    }
    cursor = addDays(cursor, 1)
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, `${JSON.stringify(data, null, 2)}\n`)
  if (connection) {
    await connection.end()
  }
  console.log(
    added
      ? `Generated ${added} localized daily articles and synced MariaDB.`
      : connection
        ? 'Daily articles are up to date in MariaDB.'
        : 'Daily articles are up to date.',
  )
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  run().catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
}
