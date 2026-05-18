import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const outputPath = path.join(root, 'src', 'data', 'articles.generated.json')
const locales = ['th', 'en', 'lo', 'zh']

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
]

function todayBangkok() {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  return formatter.format(new Date())
}

function addDays(date, amount) {
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

function latestGeneratedDate(data) {
  const dates = locales.flatMap((locale) =>
    data[locale]
      .map((article) => article.slug.match(/^daily-(\d{4}-\d{2}-\d{2})-/)?.[1])
      .filter(Boolean),
  )
  return dates.sort().at(-1)
}

function buildArticle(date, locale) {
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

function run() {
  const data = readData()
  const today = todayBangkok()
  const latest = latestGeneratedDate(data)
  const start = latest ? addDays(latest, 1) : today
  let cursor = start
  let added = 0

  while (cursor <= today) {
    for (const locale of locales) {
      const article = buildArticle(cursor, locale)
      const exists = data[locale].some((item) => item.slug === article.slug)
      if (!exists) {
        data[locale].unshift(article)
        added += 1
      }
    }
    cursor = addDays(cursor, 1)
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, `${JSON.stringify(data, null, 2)}\n`)
  console.log(added ? `Generated ${added} localized daily articles.` : 'Daily articles are up to date.')
}

run()
