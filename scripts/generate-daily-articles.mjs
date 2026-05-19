import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import mysql from 'mysql2/promise'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const outputPath = path.join(root, 'src', 'data', 'articles.generated.json')
const uploadsDir = path.join(root, 'public', 'uploads', 'articles')
const websiteLogoPath = path.join(root, 'public', 'khua-logo.webp')
const locales = ['th', 'en', 'lo', 'zh']

loadEnvFile(path.join(root, '.env'))
loadEnvFile(path.join(root, '.env.local'))

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

export function buildImagePrompt(article) {
  const tags = Array.isArray(article.tags) ? article.tags.slice(0, 6).join(', ') : ''
  const highlights = Array.isArray(article.highlights) ? article.highlights.slice(0, 3).join(' | ') : ''
  const opening = Array.isArray(article.content) ? article.content[0] : ''

  return [
    `Create a premium professional editorial cover image for a KHUA article titled "${article.title}".`,
    `Most important requirement: the image must clearly support this exact article topic, not a generic Northern Thai food scene. Category: ${article.category || 'Northern Thai food'}. Excerpt: ${article.excerpt || ''}. Tags: ${tags}. Key points: ${highlights}. Opening idea: ${opening}.`,
    'Translate the article topic into simple, instantly understandable visual storytelling: choose ingredients, props, dish style, and mood that directly match the title and key points.',
    'Use one clear main subject, one supporting subject, and clean negative space. The viewer should understand the article theme within two seconds.',
    'Photorealistic commercial food photography for a high-end Northern Thai chili paste brand.',
    'Composition must look professionally art-directed and easy to read: clear focal point, balanced foreground/midground/background, refined negative space, strong depth, elegant visual hierarchy, no random clutter, no scattered props that do not serve the article.',
    'Use a warm Lanna craft mood with a wooden table, roasted dried chilies, herbs, sticky rice, fresh vegetables, small ceramic bowls, and refined food styling.',
    'Do not generate product packaging, jars, boxes, pouches, product labels, blank labels, fake labels, or any branded objects. If a product shot is needed, it will be added later from the real KHUA website product assets, not generated by AI.',
    'Absolutely no generated text or typography anywhere in the image: no Thai text, no English text, no fake letters, no random glyphs, no captions, no signs, no product names, no label text, no packaging typography, no watermarks.',
    'Absolutely no generated logos or brand marks anywhere in the image. The real KHUA website logo will be composited as a separate website badge after generation.',
    'Leave clean negative space for article text overlay on the website.',
    'Lighting: soft directional natural light, realistic shadows, warm highlights, crisp food texture, premium magazine quality, 50mm lens feel, shallow depth of field but main objects sharp.',
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
  const prompt = buildImagePrompt(article)

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

  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
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
    })

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

export function buildArticle(date, locale) {
  const index = Math.abs(date.split('-').join('')) % topics.length
  const topic = topics[index]
  const text = topic[locale]

  return {
    slug: `daily-${date}-${topic.key}`,
    title: text.title,
    excerpt: text.excerpt,
    category: text.category,
    date: formatDate(date, locale),
    readTime: locale === 'en' ? '6 min read' : locale === 'zh' ? '6 分钟阅读' : locale === 'lo' ? '6 ນາທີ' : '6 นาที',
    tags: text.tags,
    highlights: text.highlights,
    content: text.content,
  }
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
