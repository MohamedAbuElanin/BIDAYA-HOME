import { Category, Brand, Product, Order, SiteSettings, AdminUser } from '../types';

export const INITIAL_SETTINGS: SiteSettings = {
  store_name_ar: 'بداية هوم',
  store_name_en: 'Bidaya Home',
  slogan_ar: 'بداية جديدة.. لبيتك كل ما يستحق',
  logo_url: '/logo.svg',
  favicon_url: '/favicon.svg',
  whatsapp_number: '201509990745', // Business WhatsApp phone format
  support_phone: '01509990745',
  support_email: 'bidayahome@gmail.com',
  facebook_url: 'https://www.facebook.com/triple3homeegypt',
  instagram_url: 'https://www.instagram.com/bidaya_home1/',
  store_address: 'جمهورية مصر العربية — خدمة الشحن متوفرة لجميع المحافظات',
  whatsapp_template: `🛍️ *طلب جديد - Bidaya Home*

*بيانات العميل:*
الاسم: {CUSTOMER_NAME}
رقم الهاتف / WhatsApp: {CUSTOMER_PHONE}
المحافظة: {GOVERNORATE}
المنطقة / المركز: {AREA}
العنوان بالتفصيل: {ADDRESS}

*تفاصيل الطلب:*
رقم الطلب: #{ORDER_NUMBER}
عدد المنتجات: {PRODUCTS_COUNT}
المنتجات:
{PRODUCTS_LIST}
إجمالي الطلب: {TOTAL_AMOUNT} ج.م

*تفاصيل الدفع:*
المقدم 50%: {DEPOSIT_AMOUNT} ج.م
طريقة دفع المقدم: {DEPOSIT_PAYMENT_METHOD}
المتبقي 50%: {REMAINING_AMOUNT} ج.م
طريقة دفع المتبقي: {REMAINING_PAYMENT_METHOD}
سعر التوصيل: {DELIVERY_FEE}`,
  show_prices: true,
  enable_ordering: true,
  enable_offers: true,
  seo_title: 'بداية هوم | أحدث الأدوات والمنظمات المنزلية العصرية في مصر',
  seo_description: 'تصفح أحدث تشكيلات أدوات المطبخ، منظمات التخزين، مستلزمات الحمام والتنظيف. اطلب بسهولة وادفع عند الاستلام مع شحن سريع لجميع محافظات مصر.',
  footer_text: 'جميع الحقوق محفوظة © 2026 بداية هوم - Bidaya Home. نسعى لتقديم أفضل المنتجات العملية والراقية للبيت المصري.'
};

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-kitchen',
    name_ar: 'المطبخ والطهي',
    name_en: 'Kitchen & Cooking',
    slug: 'kitchen-cooking',
    icon: 'UtensilsCrossed',
    image_url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80',
    description: 'أدوات طهي راقية، حلول تقديم، وحافظات طعام ذكية تمنح مطبخك العصرية والنظام.',
    display_order: 1,
    is_active: true,
    created_at: '2026-01-10T10:00:00Z',
    subcategories: [
      {
        id: 'sub-k-utensils',
        category_id: 'cat-kitchen',
        name_ar: 'أدوات المطبخ',
        name_en: 'Kitchen Utensils',
        slug: 'kitchen-utensils',
        product_types: ['أدوات التقليب', 'أدوات التقطيع', 'أدوات القياس', 'أدوات المصفاة', 'أدوات التقشير', 'ملاعق ومغارف', 'مبشرات', 'فتاحات', 'ملاقط وأدوات التقديم'],
        display_order: 1
      },
      {
        id: 'sub-k-cookware',
        category_id: 'cat-kitchen',
        name_ar: 'أدوات الطهي',
        name_en: 'Cookware',
        slug: 'cookware',
        product_types: ['حلل', 'طاسات', 'صواني', 'قوالب الكيك', 'أدوات الخَبز', 'أواني الفرن', 'أغطية وأدوات مساعدة'],
        display_order: 2
      },
      {
        id: 'sub-k-tableware',
        category_id: 'cat-kitchen',
        name_ar: 'التقديم والسفرة',
        name_en: 'Tableware & Dining',
        slug: 'tableware-dining',
        product_types: ['أطباق', 'أكواب', 'مجات', 'كاسات', 'أطقم تقديم', 'صواني تقديم', 'أطباق تقديم', 'أدوات المائدة'],
        display_order: 3
      },
      {
        id: 'sub-k-storage',
        category_id: 'cat-kitchen',
        name_ar: 'التخزين وحفظ الطعام',
        name_en: 'Food Storage & Containers',
        slug: 'food-storage',
        product_types: ['علب حفظ الطعام', 'برطمانات', 'زجاجات', 'علب التوابل', 'Lunch Boxes', 'أكياس حفظ الطعام', 'منظمات الثلاجة'],
        display_order: 4
      }
    ]
  },
  {
    id: 'cat-storage-org',
    name_ar: 'التخزين والتنظيم',
    name_en: 'Storage & Organization',
    slug: 'storage-organization',
    icon: 'Boxes',
    image_url: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&auto=format&fit=crop&q=80',
    description: 'منظمات عملية للدواليب، الأدراج، والمطبخ لاستغلال كل شبر في بيتك بنظام وأناقة.',
    display_order: 2,
    is_active: true,
    created_at: '2026-01-10T10:00:00Z',
    subcategories: [
      { id: 'sub-so-drawers', category_id: 'cat-storage-org', name_ar: 'منظمات الأدراج', name_en: 'Drawer Organizers', slug: 'drawer-organizers', display_order: 1 },
      { id: 'sub-so-wardrobe', category_id: 'cat-storage-org', name_ar: 'منظمات الدولاب', name_en: 'Wardrobe Organizers', slug: 'wardrobe-organizers', display_order: 2 },
      { id: 'sub-so-kitchen', category_id: 'cat-storage-org', name_ar: 'منظمات المطبخ', name_en: 'Kitchen Organizers', slug: 'kitchen-organizers', display_order: 3 },
      { id: 'sub-so-bath', category_id: 'cat-storage-org', name_ar: 'منظمات الحمام', name_en: 'Bathroom Storage', slug: 'bathroom-storage', display_order: 4 },
      { id: 'sub-so-boxes', category_id: 'cat-storage-org', name_ar: 'صناديق التخزين', name_en: 'Storage Boxes', slug: 'storage-boxes', display_order: 5 },
      { id: 'sub-so-baskets', category_id: 'cat-storage-org', name_ar: 'سلال التخزين', name_en: 'Storage Baskets', slug: 'storage-baskets', display_order: 6 },
      { id: 'sub-so-clothes-baskets', category_id: 'cat-storage-org', name_ar: 'سلال الملابس', name_en: 'Clothes Baskets', slug: 'clothes-baskets', display_order: 7 },
      { id: 'sub-so-hangers', category_id: 'cat-storage-org', name_ar: 'علاقات الملابس', name_en: 'Clothes Hangers', slug: 'clothes-hangers', display_order: 8 },
      { id: 'sub-so-shoes', category_id: 'cat-storage-org', name_ar: 'منظمات الأحذية', name_en: 'Shoe Racks', slug: 'shoe-racks', display_order: 9 },
      { id: 'sub-so-tools', category_id: 'cat-storage-org', name_ar: 'منظمات الأدوات', name_en: 'Tools Organizers', slug: 'tools-organizers', display_order: 10 },
      { id: 'sub-so-shelves', category_id: 'cat-storage-org', name_ar: 'رفوف ووحدات تخزين صغيرة', name_en: 'Small Shelves & Units', slug: 'small-shelves', display_order: 11 },
      { id: 'sub-so-desk', category_id: 'cat-storage-org', name_ar: 'منظمات المكتب', name_en: 'Desk Organizers', slug: 'desk-organizers', display_order: 12 },
      { id: 'sub-so-wall-hooks', category_id: 'cat-storage-org', name_ar: 'علاقات الحائط', name_en: 'Wall Hooks', slug: 'wall-hooks', display_order: 13 }
    ]
  },
  {
    id: 'cat-home-tools',
    name_ar: 'أدوات المنزل',
    name_en: 'Household Tools',
    slug: 'home-tools',
    icon: 'Sparkles',
    image_url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80',
    description: 'أدوات النظافة الميكانيكية والعناية المنزلية اليومية بدون كيماويات لراحة تدوم.',
    display_order: 3,
    is_active: true,
    created_at: '2026-01-10T10:00:00Z',
    subcategories: [
      {
        id: 'sub-ht-home',
        category_id: 'cat-home-tools',
        name_ar: 'أدوات تنظيف المنزل',
        name_en: 'Home Cleaning Tools',
        slug: 'home-cleaning-tools',
        product_types: ['مكانس يدوية', 'جاروف', 'فرش تنظيف', 'فرش أرضيات', 'ممسحة'],
        display_order: 1
      },
      {
        id: 'sub-ht-kitchen',
        category_id: 'cat-home-tools',
        name_ar: 'أدوات تنظيف المطبخ',
        name_en: 'Kitchen Cleaning Tools',
        slug: 'kitchen-cleaning-tools',
        product_types: ['إسفنج وليف', 'فرش غسيل الأطباق', 'مساحات الحوض'],
        display_order: 2
      },
      {
        id: 'sub-ht-bath',
        category_id: 'cat-home-tools',
        name_ar: 'أدوات تنظيف الحمام',
        name_en: 'Bathroom Cleaning Tools',
        slug: 'bathroom-cleaning-tools',
        product_types: ['فرش التواليت', 'مساحات الأرضيات', 'فرش الفواصل'],
        display_order: 3
      },
      {
        id: 'sub-ht-glass',
        category_id: 'cat-home-tools',
        name_ar: 'أدوات تنظيف الزجاج',
        name_en: 'Glass Cleaning Tools',
        slug: 'glass-cleaning-tools',
        product_types: ['مساحات زجاج', 'مساحات مغناطيسية', 'فوط ميكروفايبر للزجاج'],
        display_order: 4
      },
      {
        id: 'sub-ht-laundry',
        category_id: 'cat-home-tools',
        name_ar: 'أدوات الغسيل',
        name_en: 'Laundry Tools',
        slug: 'laundry-tools',
        product_types: ['مشابك غسيل', 'كرات الغسالة', 'أكياس شبكية'],
        display_order: 5
      },
      {
        id: 'sub-ht-bins',
        category_id: 'cat-home-tools',
        name_ar: 'سلال القمامة',
        name_en: 'Waste Bins',
        slug: 'waste-bins',
        product_types: ['سلال قمامة بدواسة', 'سلال ذكية', 'سلال مكتب'],
        display_order: 6
      },
      {
        id: 'sub-ht-daily',
        category_id: 'cat-home-tools',
        name_ar: 'أدوات الاستخدام اليومي',
        name_en: 'Daily Essentials',
        slug: 'daily-essentials',
        product_types: ['مفكات يدوية صغيرة', 'لوازم تثبيت', 'شريط لاصق مزدوج'],
        display_order: 7
      }
    ]
  },
  {
    id: 'cat-small-appliances',
    name_ar: 'الأجهزة الكهربائية الصغيرة',
    name_en: 'Small Home Appliances',
    slug: 'small-appliances',
    icon: 'Zap',
    image_url: 'https://images.unsplash.com/photo-1588854337236-6889d631faa8?w=800&auto=format&fit=crop&q=80',
    description: 'أجهزة مطبخ ومنزل كهربائية صغيرة ومستلزمات كهرباء معتمدة وآمنة لأداء ذكي وسريع.',
    display_order: 4,
    is_active: true,
    created_at: '2026-01-10T10:00:00Z',
    subcategories: [
      {
        id: 'sub-sa-kitchen',
        category_id: 'cat-small-appliances',
        name_ar: 'أجهزة المطبخ الصغيرة',
        name_en: 'Small Kitchen Appliances',
        slug: 'small-kitchen-appliances',
        product_types: ['غلايات كهربائية', 'خلاطات', 'مضارب كهربائية', 'محضرات طعام صغيرة', 'Air Fryer', 'Toaster', 'Coffee Makers', 'أجهزة تحضير المشروبات'],
        display_order: 1
      },
      {
        id: 'sub-sa-home',
        category_id: 'cat-small-appliances',
        name_ar: 'أجهزة منزلية صغيرة',
        name_en: 'Small Home Appliances',
        slug: 'small-home-appliances',
        product_types: ['مكواة', 'أجهزة بخار الملابس', 'مراوح صغيرة', 'دفايات صغيرة', 'أجهزة كهربائية منزلية صغيرة'],
        display_order: 2
      },
      {
        id: 'sub-sa-accessories',
        category_id: 'cat-small-appliances',
        name_ar: 'مستلزمات كهربائية منزلية',
        name_en: 'Home Electrical Accessories',
        slug: 'home-electrical-accessories',
        product_types: ['مشترك كهرباء', 'وصلات كهرباء', 'مقابس', 'محولات', 'شواحن منزلية', 'لمبات', 'لمبات LED', 'Night Lights'],
        display_order: 3
      }
    ]
  },
  {
    id: 'cat-home-decor',
    name_ar: 'الديكور وتجميل المنزل',
    name_en: 'Home Decor',
    slug: 'home-decor',
    icon: 'Palette',
    image_url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80',
    description: 'لمسات جمالية راقية، فازات، إضاءات ديكورية، ونباتات صناعية تضفي الدفء على بيتك.',
    display_order: 5,
    is_active: true,
    created_at: '2026-01-10T10:00:00Z',
    subcategories: [
      {
        id: 'sub-hd-tables',
        category_id: 'cat-home-decor',
        name_ar: 'ديكور الطاولات والأسطح',
        name_en: 'Table & Surface Decor',
        slug: 'table-surface-decor',
        product_types: ['فازات', 'تحف', 'مجسمات ديكور', 'أطباق ديكور', 'صواني ديكور', 'شمعدانات', 'حاملات ديكور'],
        display_order: 1
      },
      {
        id: 'sub-hd-wall',
        category_id: 'cat-home-decor',
        name_ar: 'ديكور الحائط',
        name_en: 'Wall Decor',
        slug: 'wall-decor',
        product_types: ['لوحات', 'براويز', 'ساعات حائط', 'مرايات ديكور', 'Wall Decor'],
        display_order: 2
      },
      {
        id: 'sub-hd-plants',
        category_id: 'cat-home-decor',
        name_ar: 'النباتات والزهور الصناعية',
        name_en: 'Artificial Plants & Flowers',
        slug: 'artificial-plants-flowers',
        product_types: ['نباتات صناعية', 'زهور صناعية', 'فازات', 'أصص ديكور', 'تنسيقات نباتات'],
        display_order: 3
      },
      {
        id: 'sub-hd-lighting',
        category_id: 'cat-home-decor',
        name_ar: 'الإضاءة الديكورية',
        name_en: 'Decorative Lighting',
        slug: 'decorative-lighting',
        product_types: ['أباجورات', 'لمبات ديكور', 'Night Lamps', 'Lanterns', 'إضاءة LED ديكورية'],
        display_order: 4
      },
      {
        id: 'sub-hd-seasonal',
        category_id: 'cat-home-decor',
        name_ar: 'المناسبات والديكور الموسمي',
        name_en: 'Seasonal & Event Decor',
        slug: 'seasonal-event-decor',
        product_types: ['ديكور رمضان', 'ديكور العيد', 'ديكور أعياد الميلاد', 'ديكور المناسبات', 'Seasonal Decor'],
        display_order: 5
      }
    ]
  },
  {
    id: 'cat-bathroom',
    name_ar: 'الحمام',
    name_en: 'Bathroom',
    slug: 'bathroom',
    icon: 'Bath',
    image_url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80',
    description: 'إكسسوارات وحوامل حمام أنيقة مقاومة للماء والصدأ لتنظيم مثالي ومظهر فندقي.',
    display_order: 6,
    is_active: true,
    created_at: '2026-01-10T10:00:00Z',
    subcategories: [
      {
        id: 'sub-bth-accessories',
        category_id: 'cat-bathroom',
        name_ar: 'إكسسوارات الحمام',
        name_en: 'Bathroom Accessories',
        slug: 'bathroom-accessories',
        product_types: ['حوامل الصابون', 'حوامل فرش الأسنان', 'Soap Dispensers', 'أكواب الحمام', 'Bathroom Accessories'],
        display_order: 1
      },
      {
        id: 'sub-bth-org',
        category_id: 'cat-bathroom',
        name_ar: 'تنظيم الحمام',
        name_en: 'Bathroom Organization',
        slug: 'bathroom-organization',
        product_types: ['منظمات الحمام', 'سلال الحمام', 'شماعات الحمام'],
        display_order: 2
      },
      {
        id: 'sub-bth-holders',
        category_id: 'cat-bathroom',
        name_ar: 'حوامل الحمام',
        name_en: 'Bathroom Holders',
        slug: 'bathroom-holders',
        product_types: ['أرفف لاصقة', 'حوامل زاوية', 'حوامل مناشف', 'حوامل ورق التواليت'],
        display_order: 3
      },
      {
        id: 'sub-bth-baskets',
        category_id: 'cat-bathroom',
        name_ar: 'سلال الحمام',
        name_en: 'Bathroom Baskets',
        slug: 'bathroom-baskets',
        product_types: ['سلال تنظيم', 'سلال مهملات الحمام'],
        display_order: 4
      },
      {
        id: 'sub-bth-brushes',
        category_id: 'cat-bathroom',
        name_ar: 'فرش الحمام',
        name_en: 'Bathroom Brushes',
        slug: 'bathroom-brushes',
        product_types: ['فرش التواليت', 'حوامل الفرش'],
        display_order: 5
      },
      {
        id: 'sub-bth-curtains',
        category_id: 'cat-bathroom',
        name_ar: 'ستائر الحمام',
        name_en: 'Shower Curtains',
        slug: 'shower-curtains',
        product_types: ['ستائر حمام مقاومة للماء', 'حلقات ستائر'],
        display_order: 6
      }
    ]
  },
  {
    id: 'cat-laundry',
    name_ar: 'الغسيل والملابس',
    name_en: 'Laundry & Clothes Care',
    slug: 'laundry-care',
    icon: 'Shirt',
    image_url: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=800&auto=format&fit=crop&q=80',
    description: 'سلال غسيل، مناشر عملية، وعلاقات متينة تجعل العناية بالملابس وترتيبها في غاية السهولة.',
    display_order: 7,
    is_active: true,
    created_at: '2026-01-10T10:00:00Z',
    subcategories: [
      { id: 'sub-ln-baskets', category_id: 'cat-laundry', name_ar: 'سلال الغسيل', name_en: 'Laundry Baskets', slug: 'laundry-baskets', display_order: 1 },
      { id: 'sub-ln-pegs', category_id: 'cat-laundry', name_ar: 'مشابك الغسيل', name_en: 'Clothes Pegs', slug: 'clothes-pegs', display_order: 2 },
      { id: 'sub-ln-hangers', category_id: 'cat-laundry', name_ar: 'علاقات الملابس', name_en: 'Clothes Hangers', slug: 'clothes-hangers', display_order: 3 },
      { id: 'sub-ln-dryers', category_id: 'cat-laundry', name_ar: 'مناشر الغسيل', name_en: 'Drying Racks', slug: 'drying-racks', display_order: 4 },
      { id: 'sub-ln-org', category_id: 'cat-laundry', name_ar: 'منظمات الملابس', name_en: 'Clothes Organizers', slug: 'clothes-organizers', display_order: 5 },
      { id: 'sub-ln-ironing', category_id: 'cat-laundry', name_ar: 'أدوات كي الملابس', name_en: 'Ironing Accessories', slug: 'ironing-accessories', display_order: 6 },
      { id: 'sub-ln-shoes', category_id: 'cat-laundry', name_ar: 'منظمات الأحذية', name_en: 'Shoe Organizers', slug: 'shoe-organizers', display_order: 7 },
      { id: 'sub-ln-storage-bags', category_id: 'cat-laundry', name_ar: 'أكياس حفظ الملابس', name_en: 'Garment Bags', slug: 'garment-bags', display_order: 8 },
      { id: 'sub-ln-wash-bags', category_id: 'cat-laundry', name_ar: 'أكياس الغسيل', name_en: 'Washing Bags', slug: 'washing-bags', display_order: 9 }
    ]
  },
  {
    id: 'cat-home-supplies',
    name_ar: 'مستلزمات المنزل',
    name_en: 'Home Essentials',
    slug: 'home-supplies',
    icon: 'Home',
    image_url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80',
    description: 'مستلزمات الاستخدام اليومي، مرايات، ساعات، وإكسسوارات عامة تجعل منزلك متكاملاً.',
    display_order: 8,
    is_active: true,
    created_at: '2026-01-10T10:00:00Z',
    subcategories: [
      { id: 'sub-hs-accessories', category_id: 'cat-home-supplies', name_ar: 'إكسسوارات المنزل', name_en: 'Home Accessories', slug: 'home-accessories', display_order: 1 },
      { id: 'sub-hs-daily', category_id: 'cat-home-supplies', name_ar: 'مستلزمات الاستخدام اليومي', name_en: 'Daily Essentials', slug: 'daily-essentials', display_order: 2 },
      { id: 'sub-hs-hangers', category_id: 'cat-home-supplies', name_ar: 'شماعات وعلاقات', name_en: 'Hooks & Hangers', slug: 'hooks-hangers', display_order: 3 },
      { id: 'sub-hs-baskets-boxes', category_id: 'cat-home-supplies', name_ar: 'سلال وصناديق', name_en: 'Baskets & Boxes', slug: 'baskets-boxes', display_order: 4 },
      { id: 'sub-hs-mirrors', category_id: 'cat-home-supplies', name_ar: 'مرايات', name_en: 'Mirrors', slug: 'mirrors', display_order: 5 },
      { id: 'sub-hs-clocks', category_id: 'cat-home-supplies', name_ar: 'ساعات', name_en: 'Clocks', slug: 'clocks', display_order: 6 },
      { id: 'sub-hs-desk', category_id: 'cat-home-supplies', name_ar: 'مستلزمات المكتب المنزلي', name_en: 'Home Office Essentials', slug: 'home-office-essentials', display_order: 7 }
    ]
  },
  {
    id: 'cat-home-garden',
    name_ar: 'المنزل والحديقة',
    name_en: 'Home & Garden',
    slug: 'home-garden',
    icon: 'Flower2',
    image_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&auto=format&fit=crop&q=80',
    description: 'أصص نباتات، رشاشات، ومستلزمات العناية بالنباتات وديكور البلكونة الخفيف والمميز.',
    display_order: 9,
    is_active: true,
    created_at: '2026-01-10T10:00:00Z',
    subcategories: [
      { id: 'sub-hg-pots', category_id: 'cat-home-garden', name_ar: 'أصص النباتات', name_en: 'Plant Pots', slug: 'plant-pots', display_order: 1 },
      { id: 'sub-hg-supplies', category_id: 'cat-home-garden', name_ar: 'مستلزمات النباتات', name_en: 'Plant Supplies', slug: 'plant-supplies', display_order: 2 },
      { id: 'sub-hg-planting-tools', category_id: 'cat-home-garden', name_ar: 'أدوات الزراعة المنزلية', name_en: 'Home Gardening Tools', slug: 'home-gardening-tools', display_order: 3 },
      { id: 'sub-hg-sprayers', category_id: 'cat-home-garden', name_ar: 'رشاشات النباتات', name_en: 'Plant Sprayers', slug: 'plant-sprayers', display_order: 4 },
      { id: 'sub-hg-small-tools', category_id: 'cat-home-garden', name_ar: 'أدوات الحدائق الصغيرة', name_en: 'Small Garden Tools', slug: 'small-garden-tools', display_order: 5 },
      { id: 'sub-hg-balcony', category_id: 'cat-home-garden', name_ar: 'ديكور البلكونة', name_en: 'Balcony Decor', slug: 'balcony-decor', display_order: 6 },
      { id: 'sub-hg-lighting', category_id: 'cat-home-garden', name_ar: 'إضاءة خارجية صغيرة', name_en: 'Outdoor Accent Lights', slug: 'outdoor-accent-lights', display_order: 7 },
      { id: 'sub-hg-bbq', category_id: 'cat-home-garden', name_ar: 'مستلزمات الشواء الخفيفة', name_en: 'Light BBQ Accessories', slug: 'light-bbq-accessories', display_order: 8 }
    ]
  },
  {
    id: 'cat-gifts-bundles',
    name_ar: 'الهدايا والمجموعات',
    name_en: 'Gifts & Bundles',
    slug: 'gifts-bundles',
    icon: 'Gift',
    image_url: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=800&auto=format&fit=crop&q=80',
    description: 'أطقم هدايا متناسقة، باقات للعرائس، وعروض حصرية تلبي كل مناسبة خاصة.',
    display_order: 10,
    is_active: true,
    created_at: '2026-01-10T10:00:00Z',
    subcategories: [
      { id: 'sub-gb-home', category_id: 'cat-gifts-bundles', name_ar: 'هدايا للمنزل', name_en: 'Home Gifts', slug: 'home-gifts', display_order: 1 },
      { id: 'sub-gb-kitchen', category_id: 'cat-gifts-bundles', name_ar: 'أطقم مطبخ', name_en: 'Kitchen Sets', slug: 'kitchen-sets', display_order: 2 },
      { id: 'sub-gb-org', category_id: 'cat-gifts-bundles', name_ar: 'أطقم تنظيم', name_en: 'Organization Bundles', slug: 'organization-bundles', display_order: 3 },
      { id: 'sub-gb-decor', category_id: 'cat-gifts-bundles', name_ar: 'أطقم ديكور', name_en: 'Decor Sets', slug: 'decor-sets', display_order: 4 },
      { id: 'sub-gb-bride', category_id: 'cat-gifts-bundles', name_ar: 'هدايا للعروسة', name_en: 'Bridal Gifts', slug: 'bridal-gifts', display_order: 5 },
      { id: 'sub-gb-housewarming', category_id: 'cat-gifts-bundles', name_ar: 'Housewarming Gifts', name_en: 'Housewarming Gifts', slug: 'housewarming-gifts', display_order: 6 },
      { id: 'sub-gb-offers', category_id: 'cat-gifts-bundles', name_ar: 'عروض ومجموعات', name_en: 'Bundles & Deals', slug: 'bundles-deals', display_order: 7 }
    ]
  }
];

export const INITIAL_BRANDS: Brand[] = [
  {
    id: 'brand-bidaya',
    name_ar: 'بداية هوم بريميوم',
    name_en: 'Bidaya Premium',
    slug: 'bidaya-premium',
    logo_url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=120&auto=format&fit=crop&q=80',
    description: 'الخط الخاص من بداية هوم بتصاميم عصرية وخامات متينة تدوم طويلاً.',
    is_active: true,
    created_at: '2026-01-10T10:00:00Z'
  },
  {
    id: 'brand-lockeasy',
    name_ar: 'لوك إيزي',
    name_en: 'LockEasy',
    slug: 'lockeasy',
    logo_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=120&auto=format&fit=crop&q=80',
    description: 'خبراء حفظ الأطعمة بالعلب المحكمة بتقنية السيليكون الرباعي.',
    is_active: true,
    created_at: '2026-01-10T10:00:00Z'
  },
  {
    id: 'brand-cleantech',
    name_ar: 'كلين تك',
    name_en: 'CleanTech',
    slug: 'cleantech',
    logo_url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=120&auto=format&fit=crop&q=80',
    description: 'حلول نظافة مبتكرة للأرضيات والأسطح مع أقل استهلاك للمياه والجهد.',
    is_active: true,
    created_at: '2026-01-10T10:00:00Z'
  }
];

export const LEGACY_DEMO_PRODUCT_IDS = [
  'prod-001',
  'prod-002',
  'prod-003',
  'prod-004',
  'prod-005',
  'prod-006',
  'prod-007',
  'prod-008',
  'prod-009',
  'prod-010'
];

export const INITIAL_PRODUCTS: Product[] = [];

export const LEGACY_DEMO_ORDER_IDS = ['ord-101', 'ord-102', 'ord-103'];

export const INITIAL_ORDERS: Order[] = [];

export const LEGACY_DEMO_ADMIN_USER_IDS = ['usr-super', 'usr-orders', 'usr-catalog'];

export const INITIAL_ADMIN_USERS: AdminUser[] = [];
