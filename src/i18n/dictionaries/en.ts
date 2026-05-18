import { Dictionary } from '../types'

const dict: Dictionary = {
  locale: 'en',
  localeName: 'English',

  site: {
    name: 'KHUA',
    nameThai: 'Khua',
    tagline: 'Crafted Northern Soul',
    description:
      'Premium Northern Thai chili pastes. Traditional Lanna recipes, artisanal quality, freshly prepared for every order.',
    lineId: '@khua',
    phone: '081-234-5678',
    email: 'hello@khua-foods.com',
  },

  nav: {
    home: 'Home',
    products: 'Products',
    articles: 'Articles',
    about: 'About',
    contact: 'Contact',
    account: 'Account',
  },

  hero: {
    subtitle: 'Premium Northern Thai Chili Paste',
    title: 'Phayao Chili Paste, Crafted from Lanna Recipes',
    description:
      'KHUA crafts premium Northern Thai chili paste from Phayao Province using Lanna recipes, slow-roasted spices, local ingredients, and fresh small-batch preparation.',
    cta: 'Explore Our Pastes',
  },

  phayaoSeo: {
    label: 'Phayao Chili Paste',
    title: 'Phayao Chili Paste Crafted with Lanna Precision',
    paragraphs: [
      'KHUA brings Phayao chili paste into a premium everyday format. The flavor begins with slow-roasted dried chilies, local herbs, and Northern spices opened gently over low heat.',
      'Every recipe is built around Lanna flavor while keeping Phayao Province as the brand origin. This makes KHUA clearly focused on Northern Thai chili paste from Phayao, including larb paste, red eye chili paste, curry paste, and nam ngiao paste.',
      'If you are looking for Phayao chili paste, Phayao food souvenirs, or premium Northern Thai food, KHUA offers a roasted Lanna flavor made for the modern table.',
    ],
  },

  faq: {
    label: 'FAQ',
    title: 'Questions About KHUA Phayao Chili Paste',
    items: [
      {
        question: 'Where is KHUA chili paste from?',
        answer:
          'KHUA chili paste is positioned as a premium Northern Thai chili paste from Phayao Province, crafted from Lanna recipes.',
      },
      {
        question: 'What makes KHUA Phayao chili paste different?',
        answer:
          'Its signature comes from slow-roasting chilies and spices over low heat for a deep aroma, bold flavor, and balanced Northern Thai character.',
      },
      {
        question: 'Which products are available?',
        answer:
          'KHUA offers Northern larb chili paste, red eye chili paste, Northern curry paste, and nam ngiao chili paste, all with Phayao as the stated origin.',
      },
      {
        question: 'How can I order KHUA products?',
        answer:
          'You can add products to the website cart and complete your order through KHUA LINE Official.',
      },
    ],
  },

  story: {
    label: 'Our Story',
    title: 'Every Legend Has a Flavor',
    p1: 'In a countryside kitchen nestled in the heart of Lanna, the scent of fire-roasted chilies and mountain-dried herbs marks the beginning of KHUA.',
    p2: 'We have inherited Lanna chili paste recipes across generations — over half a century of belief that great food is not just ingredients, but wisdom, intention, and the roots we take pride in.',
  },

  lanna: {
    label: 'Lanna Spirit',
    title: 'Northern flavor shaped by fire, time, and hands',
    subtitle:
      'KHUA carries the details of a Lanna kitchen in every jar, from slow-roasted dried chilies and stone mortar rhythm to bright ma-khwaen pepper from the hills.',
    quote: '"Eat well, live well, keep the old ways close."',
    items: [
      {
        title: 'Slow Roasting',
        description:
          'Low heat gently opens chilies, shallots, garlic, and spices into a deep aroma without harsh bitterness.',
      },
      {
        title: 'Stone Mortar',
        description:
          'Hand grinding keeps the texture alive, layered, and connected to the ingredients themselves.',
      },
      {
        title: 'Highland Ma-khwaen',
        description:
          'Its bright, tingling fragrance is a Northern signature that makes each bite unmistakable.',
      },
    ],
  },

  products: {
    label: 'Our Collection',
    title: 'Lanna Heritage Pastes',
    subtitle: 'Crafted in small batches, delivered fresh to your door',
    viewAll: 'View All Products',
    viewDetail: 'View Details',
    notFound: 'Product Not Found',
    notFoundDesc: 'The product you are looking for does not exist.',
    orderViaLine: 'Order via LINE',
    ingredients: 'Ingredients',
    originLabel: 'Origin',
    originValue: 'Phayao Province',
    pricePerUnit: 'Price per jar',
    addToCart: 'Add to Cart',
    addedToCart: 'Added to Cart',
    seoTagsBase: [
      'Phayao chili paste',
      'Northern Thai chili paste',
      'Lanna chili paste',
      'Phayao food souvenir',
      'premium Northern Thai food',
      'KHUA',
    ],
  },

  cart: {
    title: 'Shopping Cart',
    empty: 'Your cart is empty',
    emptyDesc: 'Choose your favorite pastes and we will prepare them fresh.',
    open: 'Open cart',
    close: 'Close cart',
    subtotal: 'Subtotal',
    checkout: 'Order via LINE',
    continueShopping: 'Continue Shopping',
    remove: 'Remove',
    decrease: 'Decrease quantity',
    increase: 'Increase quantity',
    quantity: 'Quantity',
    items: 'items',
    currency: '฿',
  },

  account: {
    label: 'KHUA Member',
    title: 'A private space for Lanna flavor lovers',
    subtitle: 'Create a member profile to save contact details, see benefits, and prepare for full online ordering.',
    signIn: 'Sign In',
    register: 'Register',
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    password: 'Password',
    save: 'Save Profile',
    logout: 'Log Out',
    welcome: 'Welcome',
    memberSince: 'Member since',
    benefitsTitle: 'Member Benefits',
    benefits: [
      'Save contact details for faster ordering',
      'Receive new product notes and seasonal batch updates',
      'Prepare for loyalty points and order history in the next release',
    ],
    ordersTitle: 'Order History',
    noOrders: 'No orders yet. This section is ready to connect when full online checkout is enabled.',
  },

  articles: {
    label: 'KHUA Journal',
    title: 'Articles and Inspiration',
    subtitle: 'Stories from the stone mortar, slow roast, and Lanna table',
    homeTitle: 'Phayao Chili Paste Stories and Lanna Flavor',
    homeSubtitle:
      'Notes from Phayao Province on local ingredients, Northern Thai chili paste, and everyday ways to enjoy Lanna flavor.',
    searchPlaceholder: 'Search articles, e.g. Phayao, Lanna, ma-khwaen',
    searchButton: 'Search',
    clearSearch: 'Clear Search',
    noResults: 'No articles matched your search.',
    pageLabel: 'Page',
    previousPage: 'Previous',
    nextPage: 'Next',
    readMore: 'Read More',
    backToArticles: 'Back to Articles',
    notFound: 'Article Not Found',
  },

  craftsmanship: {
    label: 'Our Craft',
    title: 'Wisdom in Every Detail',
    items: [
      {
        title: 'Local Ingredients',
        description:
          'We source from local farmers across Northern Thailand, supporting communities and seasonal harvests.',
      },
      {
        title: 'Traditional Methods',
        description:
          'Stone-ground by hand, slow-roasted over low heat. Every batch is made fresh to order — no machines, no preservatives.',
      },
      {
        title: 'Authentic Flavor',
        description:
          'Preserving recipes passed down through generations. Every spoonful tastes like a kitchen in the heart of the North.',
      },
    ],
  },

  about: {
    label: 'About KHUA',
    title: 'A Legacy of Flavor',
    subtitle: 'A legacy of flavor, a promise of quality',
    paragraphs: [
      'KHUA — kitchen in the Lanna tongue — is the heart of every home, where flavor and memory pass from one generation to the next. We were founded on the belief that food is living culture, a heritage we must preserve.',
      'Every jar begins with carefully selected ingredients from Phayao Province. Dried chilies, local herbs, and Northern spices are prepared with patience and precision. We believe in the quality of our ingredients and the hands that prepare them.',
      'We grind each batch in a stone mortar, roast our spices over a low flame until the aroma fills the room. Every step is deliberate, unhurried, uncompromised — just as our grandmothers did. Because good food takes time.',
      'KHUA is more than chili paste — it is an invitation to taste the Lanna we are so proud of.',
    ],
  },

  contact: {
    label: 'Get in Touch',
    title: 'Contact Us',
    lineTitle: 'LINE Official',
    lineDesc: 'Order, inquire, follow promotions',
    addLine: 'Add on LINE',
    phoneTitle: 'Phone',
    phoneDesc: 'Mon — Sat 09:00 — 18:00',
    callNow: 'Call Now',
    followUs: 'Follow us on',
  },

  footer: {
    menu: 'Menu',
    contact: 'Contact',
    line: 'LINE',
    phone: 'Phone',
    email: 'Email',
    proudly: 'Proudly Lanna',
    rights: 'All rights reserved',
  },

  products_data: [
    {
      slug: 'nam-prik-larb-nuea',
      name: 'Nam Prik Larb Nuea',
      nameEn: 'Northern Larb Chili Paste',
      description:
        'An original Lanna recipe. Fragrant dry-roasted spices ground by hand in every batch. Rich, bold, and unmistakably Northern Thai.',
      longDescription:
        'Nam Prik Larb Nuea — an ancient recipe from Phayao Province passed through generations. We use freshly roasted dried chilies, aromatic ma-khwaen, and over 10 Northern spices, stone-ground to a smooth, intense paste. Perfect for Northern larb, or simply with warm sticky rice.',
      ingredients: [
        'Dried roasted chilies',
        'Shallots',
        'Garlic',
        'Ma-khwaen peppercorns',
        'Long pepper',
        'Himalayan salt',
      ],
      price: '189',
      weight: '200 g',
      featured: true,
      image: '/khua-larb-nuea.png',
    },
    {
      slug: 'nam-prik-ta-daeng',
      name: 'Nam Prik Ta Daeng Nuea',
      nameEn: 'Red Eye Chili Paste',
      description:
        'A fiery Northern classic. Dry-roasted chilies ground with shallots and garlic — bold heat with a smoky, aromatic finish.',
      longDescription:
        'Nam Prik Ta Daeng Nuea — the hallmark of Northern chili pastes is the dry-roasting of chilies and spices before grinding. Intensely spicy yet rounded, with a smoky depth from fire-roasted chilies. Enjoy with sticky rice, boiled eggs, or seasonal blanched vegetables.',
      ingredients: [
        'Dried roasted chilies',
        'Roasted shallots',
        'Roasted garlic',
        'Himalayan salt',
        'Northern fermented fish sauce',
      ],
      price: '169',
      weight: '200 g',
      featured: true,
      image: '/khua-ta-daeng.png',
    },
    {
      slug: 'nam-prik-kaeng-nuea',
      name: 'Nam Prik Kaeng Nuea',
      nameEn: 'Northern Curry Paste',
      description:
        'Authentic Northern Thai curry paste. Freshly ground from local ingredients — ready for Hang Lay, Gaeng Ho, and all Northern curries.',
      longDescription:
        'Nam Prik Kaeng Nuea is the soul of Northern Thai cuisine. We select fresh ingredients from community gardens — galangal, lemongrass, turmeric, fresh chilies — and grind them together into a ready-to-cook paste. No preservatives, no artificial coloring, no shortcuts.',
      ingredients: [
        'Dried chilies',
        'Galangal',
        'Lemongrass',
        'Turmeric',
        'Garlic',
        'Shallots',
        'Shrimp paste',
      ],
      price: '159',
      weight: '250 g',
      featured: true,
      image: '/khua-kaeng-nuea.png',
    },
    {
      slug: 'nam-prik-nam-ngiao-nuea',
      name: 'Nam Prik Nam Ngiao Nuea',
      nameEn: 'Northern Nam Ngiao Chili Paste',
      description:
        'A Phayao-origin paste for Nam Ngiao. Roasted dried chilies, fermented soybean, and Northern herbs create a rich noodle soup base.',
      longDescription:
        'Nam Prik Nam Ngiao Nuea is made for lovers of true Northern noodle soup. We blend roasted dried chilies, garlic, shallots, fermented soybean, and Lanna herbs into a deep aromatic paste ready for Nam Ngiao with rice noodles, fresh vegetables, and crispy garlic.',
      ingredients: [
        'Roasted dried chilies',
        'Fermented soybean',
        'Garlic',
        'Shallots',
        'Coriander root',
        'Mineral salt',
      ],
      price: '159',
      weight: '200 g',
      featured: true,
      image: '/khua-nam-ngiao.png',
    },
  ],

  articles_data: [
    {
      slug: 'how-to-pair-nam-prik',
      title: 'Phayao Chili Paste: How to Pair Northern Flavor with Everyday Meals',
      excerpt:
        'A practical guide to pairing Phayao-origin chili paste with sticky rice, blanched vegetables, boiled eggs, and simple premium meals.',
      category: 'Flavor Guide',
      date: 'May 18, 2026',
      readTime: '8 min read',
      tags: [
        'Phayao chili paste',
        'Northern Thai chili paste',
        'Phayao souvenir',
        'Lanna food',
        'authentic Lanna recipe',
      ],
      highlights: [
        'Choosing the right paste for the meal makes Northern flavor feel clear without adding too many condiments.',
        'Phayao ingredients bring roasted depth, gentle heat, and a natural fit with sticky rice, vegetables, eggs, and grilled dishes.',
        'A premium Phayao food souvenir should be practical in the kitchen and carry a clear story of place.',
      ],
      content: [
        'Great Phayao chili paste should not be reserved for special meals. The roasted aroma of chilies and local herbs can instantly bring depth to simple food.',
        'Phayao food has a calm, grounded character. Dried chilies, shallots, garlic, and local spices become expressive when slowly roasted, giving heat that builds with aroma instead of overwhelming the plate.',
        'For an elegant Northern Thai meal at home, start with warm sticky rice, seasonal blanched vegetables, boiled eggs, and one grilled or fried protein. Then choose the chili paste that matches the weight of the dish.',
        'Nam Prik Larb Nuea works beautifully with warm sticky rice, boiled eggs, and sweet fresh vegetables because its dry spices add structure without overwhelming the plate.',
        'Nam Prik Ta Daeng Nuea is for days when you want bold heat and clear smoke. Try a small touch with grilled pork or blanched greens for a balanced bite of heat, salt, and aroma.',
        'Nam Prik Kaeng Nuea is best for hot cooking such as curries, stir-fries, or marinades because it has a stronger flavor structure and herbs that hold up well to heat.',
        'Nam Prik Nam Ngiao Nuea is made for anyone who wants a convenient base for Northern noodle soup while keeping the character of roasted chilies, fermented soybean, and Lanna herbs.',
        'To keep the aroma stable, use a clean dry spoon, close the lid tightly, and refrigerate after opening. This helps preserve the roasted notes that make Phayao chili paste memorable.',
        'The secret is restraint. A small spoon of chili paste can turn an ordinary plate into a memorable meal.',
      ],
    },
    {
      slug: 'slow-roasted-lanna-craft',
      title: 'Why Slow Roasting Matters in Lanna Chili Paste',
      excerpt:
        'Behind KHUA’s deep aroma are time, low heat, and patience that let dried chilies and spices fully open up.',
      category: 'Craft',
      date: 'May 12, 2026',
      readTime: '7 min read',
      tags: [
        'slow roasted chilies',
        'Lanna chili paste',
        'Phayao chili paste',
        'Northern Thai kitchen',
        'artisan Thai food',
      ],
      highlights: [
        'Slow roasting draws aromatic oils from chilies, shallots, garlic, and spices.',
        'Stable low heat creates deeper aroma while reducing harsh bitterness or burnt notes.',
        'Stone-ground texture gives the paste more dimension than a flat, industrial condiment.',
      ],
      content: [
        'Roasting is not only about cooking ingredients. It wakes the aromatic oils in chilies, shallots, garlic, and spices.',
        'In Lanna cooking, heat is part of the language of flavor. If the pan is too hot, dried chilies burn before their aroma opens. With patient low heat, the scent becomes deeper, rounder, and more elegant.',
        'Properly roasted garlic and shallots bring natural sweetness. They soften the chili heat and help the paste feel balanced rather than sharp.',
        'High heat gives quick char, but low heat gives depth and roundness. This is why traditional chili paste needs time and a careful eye.',
        'At KHUA, consistency matters. Color, aroma, and texture should feel reliable from jar to jar because premium chili paste should perform well every time it is opened.',
        'After roasting, stone grinding keeps the texture alive. Tiny pieces of ingredients remain, making every bite feel crafted rather than flat.',
        'This is why a premium Phayao chili paste should show more than heat. It should offer roasted fragrance, layered spice, and a clean herbal finish.',
      ],
    },
    {
      slug: 'lanna-pantry-essentials',
      title: 'Essential Lanna Pantry Ingredients to Keep at Home',
      excerpt:
        'Meet dried chilies, ma-khwaen peppercorns, mineral salt, and herbs that make Northern Thai flavor unmistakable.',
      category: 'Ingredients',
      date: 'May 5, 2026',
      readTime: '7 min read',
      tags: [
        'Lanna ingredients',
        'ma-khwaen',
        'roasted dried chili',
        'Northern Thai chili paste',
        'Phayao food',
      ],
      highlights: [
        'Dried chilies, shallots, garlic, and ma-khwaen form the aromatic base of many Lanna recipes.',
        'Sourcing with a sense of place helps the flavor speak clearly of Phayao and Northern Thailand.',
        'Good ingredients allow a chili paste to taste deep and aromatic without becoming overly salty or aggressive.',
      ],
      content: [
        'A Lanna pantry earns its character from a few ingredients chosen carefully. Dried chilies bring heat and color; ma-khwaen gives a bright, tingling aroma.',
        'Phayao food is often about quiet detail. Ingredients do not need to be excessive, but they should be clean, aromatic, and ready to reveal themselves when roasted.',
        'Mineral salt sharpens flavor without making it harsh, while roasted shallots and garlic form the warm base of many pastes.',
        'Ma-khwaen is one of the ingredients that makes Northern Thai flavor distinct from other regional heat. Its citrusy, tingling aroma gives larb, chili paste, and curry a recognizable Lanna profile.',
        'Good dried chilies should provide color, aroma, and balanced heat. Once roasted, they create the deep fragrance that defines authentic Lanna chili paste.',
        'Fermented soybean and local herbs matter in certain recipes, especially Nam Prik Nam Ngiao Nuea, where they add umami and make the soup base feel fuller.',
        'For a home pantry, keep at least two styles of chili paste: a dry aromatic paste for rice and vegetables, and a curry-style paste for hot cooking.',
        'When good ingredients meet experienced hands, the flavor does not need to shout. That restraint is what makes Northern food elegant.',
      ],
    },
  ],

  social: {
    instagram: 'https://instagram.com/khua.foods',
    facebook: 'https://facebook.com/khuafoods',
    line: 'https://line.me/R/ti/p/@khua',
  },
}

export default dict
