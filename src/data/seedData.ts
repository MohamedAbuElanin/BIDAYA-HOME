import { Category, Brand, Product, Order, SiteSettings, AdminUser } from '../types';

export const INITIAL_SETTINGS: SiteSettings = {
  store_name_ar: 'بداية هوم',
  store_name_en: 'Bidaya Home',
  slogan_ar: 'بداية جديدة.. لبيتك كل ما يستحق',
  logo_url: '/logo.svg',
  favicon_url: '/favicon.svg',
  whatsapp_number: '201509990745', // Business WhatsApp phone format
  support_phone: '01509990745',
  support_email: 'info@bidayahome.com',
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

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    name_ar: 'طقم علب ثلاجة وحفظ طعام محكمة الإغلاق (6 قطع بأحجام متدرجة)',
    name_en: 'Airtight Food Container Set (6 Pieces)',
    slug: 'airtight-food-container-set-6pcs',
    description: 'طقم حفظ طعام فائق الجودة مصنوع من بلاستيك صحي خالٍ من مادة BPA الضارة. مزود بإطار سيليكون محكم يمنع تسرب السوائل ويحافظ على نضارة الخضراوات والفواكه والأطعمة المطبوخة داخل الثلاجة لفترات أطول بكثير. آمن للاستخدام في الميكروويف وغسالة الأطباق والفريزر.',
    short_description: '6 علب بأحجام مختلفة محكمة الغلق 100% مع أغطية سيليكون متطورة.',
    sku: 'BH-KIT-0101',
    price: 385,
    old_price: 490,
    pricing_mode: 'fixed',
    category_id: 'cat-kitchen',
    subcategory_id: 'sub-k-storage',
    product_type: 'علب حفظ الطعام',
    brand_id: 'brand-lockeasy',
    images: [
      'https://images.unsplash.com/photo-1584473457406-6240486418e9?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80'
    ],
    primary_image_index: 0,
    is_featured: true,
    is_new: true,
    is_offer: true,
    is_available: true,
    stock_status: 'in_stock',
    display_order: 1,
    specifications: [
      { key: 'العدد', value: '6 علب متدرجة من 300 مل حتى 2.5 لتر' },
      { key: 'الخامة', value: 'بولي بروبيلين صحي معتمد Food Grade BPA Free' },
      { key: 'الإغلاق', value: 'أقفال جانبية رباعية مع حشية سيليكون مانعة للتسريب' },
      { key: 'الاستخدام', value: 'آمن للغسالة، الميكروويف، والفريزر' }
    ],
    views_count: 428,
    request_count: 67,
    created_at: '2026-01-15T12:00:00Z',
    updated_at: '2026-02-01T14:30:00Z'
  },
  {
    id: 'prod-002',
    name_ar: 'مساحة أرضيات سحرية دوارة 360 درجة مع جردل تجفيف ذاتي مزدوج',
    name_en: 'Self-Wringing 360 Spin Mop with Dual Bucket',
    slug: 'self-wringing-spin-mop-dual-bucket',
    description: 'المساحة الأكثر طلباً لتنظيف الأرضيات بكفاءة تامة بدون لمس الماء المتسخ. تصميم مبتكر بنظام فصل الماء النظيف عن الماء العادم، مع رأس ميكروفايبر عالي الامتصاص للأتربة والشعر والسوائل في ثوانٍ معدودة. تناسب السيراميك والبورسلين والباركية.',
    short_description: 'تنظيف وتجفيف ذاتي بدون انحناء مع رأس ميكروفايبر إضافي هدية.',
    sku: 'BH-CLN-0204',
    price: 460,
    old_price: 580,
    pricing_mode: 'fixed',
    category_id: 'cat-home-tools',
    subcategory_id: 'sub-ht-home',
    product_type: 'ممسحة',
    brand_id: 'brand-cleantech',
    images: [
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=800&auto=format&fit=crop&q=80'
    ],
    primary_image_index: 0,
    is_featured: true,
    is_new: false,
    is_offer: true,
    is_available: true,
    stock_status: 'in_stock',
    display_order: 2,
    specifications: [
      { key: 'محتويات العلبة', value: 'جردل ذكي + يد ستانلس متينة + 2 غيار ميكروفايبر' },
      { key: 'زاوية الدوران', value: '360 درجة للوصول لأسفل الكنب والأسرة' },
      { key: 'الخامة', value: 'معدن ستانلس ستيل مع بلاستيك ABS مقوى' }
    ],
    views_count: 512,
    request_count: 89,
    created_at: '2026-01-18T09:00:00Z',
    updated_at: '2026-02-03T11:00:00Z'
  },
  {
    id: 'prod-003',
    name_ar: 'منظم توابل وعطور دوار 360 درجة بطبقتين للمطبخ والتسريحة',
    name_en: '2-Tier 360 Rotating Spice & Cosmetics Organizer',
    slug: '2-tier-rotating-spice-organizer',
    description: 'الحل العملي لإنهاء فوضى التوابل والزيوت في المطبخ أو مستحضرات التجميل على التسريحة. دوران سلس وهادئ يتيح لك الوصول لأي غرض بلمسة واحدة بدون إسقاط باقي البرطمانات.',
    short_description: 'منظم دورين دوار بقاعدة مانعة للانزلاق لتوفير 70% من المساحة.',
    sku: 'BH-ORG-0312',
    price: 245,
    old_price: 320,
    pricing_mode: 'fixed',
    category_id: 'cat-storage-org',
    subcategory_id: 'sub-so-kitchen',
    product_type: 'منظمات المطبخ',
    brand_id: 'brand-bidaya',
    images: [
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&auto=format&fit=crop&q=80'
    ],
    primary_image_index: 0,
    is_featured: true,
    is_new: true,
    is_offer: true,
    is_available: true,
    stock_status: 'in_stock',
    display_order: 3,
    specifications: [
      { key: 'القطر', value: '25 سم' },
      { key: 'الارتفاع', value: '34 سم قابل للتعديل' },
      { key: 'المادة', value: 'أكريليك متين عالي الشفافية ومقاوم للصدمات' }
    ],
    views_count: 389,
    request_count: 54,
    created_at: '2026-01-20T14:00:00Z',
    updated_at: '2026-02-04T16:00:00Z'
  },
  {
    id: 'prod-004',
    name_ar: 'رف حمام زاوية لاصق فائق القوة بدون حفر (طقم قطعتين مع خطافات)',
    name_en: 'No-Drill Adhesive Corner Bathroom Shelf Set',
    slug: 'no-drill-corner-bathroom-shelf-set',
    description: 'أرفف زاوية أنيقة مقاومة للمياه والرطوبة والصدأ مع لاصق نانو جبار يتحمل حتى 15 كجم بدون أي حاجة لثقب السيراميك أو استخدام الشنيور. تتضمن خطافات لتعليق اللوف والمناشف.',
    short_description: 'تثبيت قوي جداً بدون تخريم، مقاوم تماماً للصدأ بتصميم شبكي لتصريف المياه.',
    sku: 'BH-BTH-0418',
    price: 195,
    old_price: 260,
    pricing_mode: 'fixed',
    category_id: 'cat-bathroom',
    subcategory_id: 'sub-bth-holders',
    product_type: 'حوامل الحمام',
    brand_id: 'brand-bidaya',
    images: [
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80'
    ],
    primary_image_index: 0,
    is_featured: false,
    is_new: true,
    is_offer: true,
    is_available: true,
    stock_status: 'in_stock',
    display_order: 4,
    specifications: [
      { key: 'الكمية', value: '2 رف زاوية + 4 لصقات نانو احتياطية' },
      { key: 'المعدن', value: 'ألومنيوم فضائي معالج ومطلي بطلاء أسود مط' },
      { key: 'أقصى وزن', value: '15 كجم لكل رف' }
    ],
    views_count: 275,
    request_count: 42,
    created_at: '2026-01-22T11:00:00Z',
    updated_at: '2026-02-05T10:00:00Z'
  },
  {
    id: 'prod-005',
    name_ar: 'ترولي تنظيم بلاستيكي مودرن 4 أدوار بعجلات متحركة ومقابض',
    name_en: '4-Tier Slim Storage Cart with Wheels',
    slug: '4-tier-slim-storage-cart-with-wheels',
    description: 'ترولي ضيق متعدد الاستخدامات يستغل أضيق المساحات الميتة بجوار الغسالة أو الثلاجة أو داخل الحمام. مزود بـ 4 عجلات دوارة 360 درجة لسهولة الحركة ومقابض علوية مريحة وسلات بفتحات تهوية.',
    short_description: 'استغل المساحات الضيقة في المطبخ والحمام مع رفوف متينة بعجلات سلسة.',
    sku: 'BH-PLS-0520',
    price: 340,
    old_price: 420,
    pricing_mode: 'starting_at',
    category_id: 'cat-storage-org',
    subcategory_id: 'sub-so-shelves',
    product_type: 'رفوف ووحدات تخزين صغيرة',
    brand_id: 'brand-bidaya',
    images: [
      'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&auto=format&fit=crop&q=80'
    ],
    primary_image_index: 0,
    is_featured: true,
    is_new: false,
    is_offer: false,
    is_available: true,
    stock_status: 'in_stock',
    display_order: 5,
    specifications: [
      { key: 'الأبعاد', value: 'ارتفاع 95 سم × عرض 13 سم × عمق 40 سم' },
      { key: 'عدد الأدوار', value: '4 أدوار واسعة مع فواصل جانبية' },
      { key: 'العجلات', value: '4 عجلات مطاطية سلسة الحركة لا تخدش الأرضيات' }
    ],
    views_count: 610,
    request_count: 94,
    created_at: '2026-01-25T15:00:00Z',
    updated_at: '2026-02-06T12:00:00Z'
  },
  {
    id: 'prod-006',
    name_ar: 'طقم منظمات ملابس ودواليب مقسم (3 قطع قابلة للطي للشرابات واللانجري)',
    name_en: '3-Piece Foldable Drawer Underwear Organizer',
    slug: '3-piece-foldable-drawer-organizer',
    description: 'وداعاً للكركبة في أدراج الملابس. طقم مكون من 3 مقسمات بأحجام وخانات مختلفة (6 خانات، 7 خانات، 11 خانة) لترتيب الطرح، الشرابات، الملابس الداخلية والربطات بنظام فندقي راقي.',
    short_description: '3 مقسمات قماشية معززة بشبك مسامي قابل للغسل لترتيب كامل للدولاب.',
    sku: 'BH-ORG-0630',
    price: 135,
    old_price: 180,
    pricing_mode: 'fixed',
    category_id: 'cat-storage-org',
    subcategory_id: 'sub-so-wardrobe',
    product_type: 'منظمات الدولاب',
    brand_id: 'brand-bidaya',
    images: [
      'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&auto=format&fit=crop&q=80'
    ],
    primary_image_index: 0,
    is_featured: false,
    is_new: true,
    is_offer: true,
    is_available: true,
    stock_status: 'in_stock',
    display_order: 6,
    specifications: [
      { key: 'محتويات الطقم', value: 'منظم 6 خانات + منظم 7 خانات + منظم 11 خانة' },
      { key: 'الخامة', value: 'نايلون شبكي متين عالي الجودة قابل للغسيل الفوري' }
    ],
    views_count: 340,
    request_count: 48,
    created_at: '2026-01-28T16:00:00Z',
    updated_at: '2026-02-07T08:00:00Z'
  },
  {
    id: 'prod-007',
    name_ar: 'مصفاة أطباق وكاسات قابلة للطي فوق الحوض من السيليكون والستانلس',
    name_en: 'Over-The-Sink Roll-Up Dish Drying Rack',
    slug: 'over-the-sink-roll-up-drying-rack',
    description: 'مصفاة أطباق عملية جداً توضع مباشرة فوق حوض المطبخ لتصفية الأطباق والخضراوات المغسولة مباشرة في الحوض دون تبليل الرخام. تتحمل الأواني الساخنة حتى 240 درجة وتُطوى لتخزين فائق الصغر.',
    short_description: 'توضع فوق الحوض مباشرة وتُلف للتخزين الفوري، وتتحمل الحرارة العالية.',
    sku: 'BH-KIT-0740',
    price: 175,
    old_price: 230,
    pricing_mode: 'fixed',
    category_id: 'cat-kitchen',
    subcategory_id: 'sub-k-utensils',
    product_type: 'أدوات المصفاة',
    brand_id: 'brand-bidaya',
    images: [
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80'
    ],
    primary_image_index: 0,
    is_featured: false,
    is_new: false,
    is_offer: true,
    is_available: true,
    stock_status: 'in_stock',
    display_order: 7,
    specifications: [
      { key: 'الأبعاد', value: '47 سم × 30 سم تناسب معظم أحواض المطابخ القياسية' },
      { key: 'الخامة', value: 'قضبان ستانلس ستيل مع حواف سيليكون مانعة للانزلاق' }
    ],
    views_count: 290,
    request_count: 36,
    created_at: '2026-02-01T10:00:00Z',
    updated_at: '2026-02-08T11:00:00Z'
  },
  {
    id: 'prod-008',
    name_ar: 'جزامة تنظيم أحذية متعددة الطبقات بتصميم مودرن قابل للتخصيص',
    name_en: 'Multi-Tier Modular Shoe Rack Organizer',
    slug: 'multi-tier-modular-shoe-rack',
    description: 'جزامة ذكية وعملية مصممة لاستيعاب حتى 18 زوجاً من الأحذية. خفيفة الوزن وشديدة المتانة، يمكن تجميعها وتركيبها بأشكال وأطوال متعددة تناسب مدخل البيت أو داخل غرف النوم.',
    short_description: 'تستوعب حتى 18 زوج أحذية بتصميم عصري مقاوم للأتربة والأوساخ.',
    sku: 'BH-ORG-0850',
    price: 0,
    pricing_mode: 'on_request',
    category_id: 'cat-storage-org',
    subcategory_id: 'sub-so-shoes',
    product_type: 'منظمات الأحذية',
    brand_id: 'brand-bidaya',
    images: [
      'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&auto=format&fit=crop&q=80'
    ],
    primary_image_index: 0,
    is_featured: true,
    is_new: true,
    is_offer: false,
    is_available: true,
    stock_status: 'in_stock',
    display_order: 8,
    specifications: [
      { key: 'سعة الاستيعاب', value: 'من 12 إلى 18 زوج أحذية' },
      { key: 'الخامة', value: 'أنابيب معدنية مجلفنة وأقمشة غير منسوجة مقاومة للماء' }
    ],
    views_count: 480,
    request_count: 73,
    created_at: '2026-02-02T13:00:00Z',
    updated_at: '2026-02-09T14:00:00Z'
  },
  {
    id: 'prod-009',
    name_ar: 'غلاية مياه كهربائية ستانلس ستيل مع تحكم ذكي بالحرارة (1.7 لتر)',
    name_en: 'Smart Temperature Control Electric Kettle (1.7L)',
    slug: 'smart-electric-kettle-1-7l',
    description: 'غلاية كهربائية أنيقة من الستانلس ستيل 304 المقاوم للصدأ مع ميزة الفصل التلقائي والتحكم الدقيق بدرجة الحرارة لتحضير مختلف أنواع الشاي والقهوة بأفضل مذاق. قاعدة دوارة 360 درجة وعزل حراري خارجي مزدوج.',
    short_description: 'سعة 1.7 لتر، فصل تلقائي وحفظ حرارة فائق، ستانلس ستيل صحي بالكامل.',
    sku: 'BH-APP-0960',
    price: 490,
    old_price: 620,
    pricing_mode: 'fixed',
    category_id: 'cat-small-appliances',
    subcategory_id: 'sub-sa-kitchen',
    product_type: 'غلايات كهربائية',
    brand_id: 'brand-bidaya',
    images: [
      'https://images.unsplash.com/photo-1588854337236-6889d631faa8?w=800&auto=format&fit=crop&q=80'
    ],
    primary_image_index: 0,
    is_featured: true,
    is_new: true,
    is_offer: true,
    is_available: true,
    stock_status: 'in_stock',
    display_order: 9,
    specifications: [
      { key: 'السعة', value: '1.7 لتر' },
      { key: 'القدرة', value: '1850 - 2200 واط' },
      { key: 'الخامة', value: 'ستانلس ستيل 304 الغذائي مع بلاستيك عازل للحرارة BPA Free' }
    ],
    views_count: 310,
    request_count: 45,
    created_at: '2026-02-05T10:00:00Z',
    updated_at: '2026-02-10T12:00:00Z'
  },
  {
    id: 'prod-010',
    name_ar: 'طقم فازات سيراميك مودرن للصالون والأسطح (3 قطع بتصميم انسيابي)',
    name_en: 'Modern Ceramic Decorative Vase Set (3 Pieces)',
    slug: 'modern-ceramic-vase-set-3pcs',
    description: 'طقم فازات ديكورية راقية مصنوعة من السيراميك المطلي يدوياً بلون ناعم وملمس جذاب. مثالية لوضع الزهور المجففة أو الطبيعية على طاولات السفرة أو أرفف المعيشة لإضفاء طابع الدفء والجمال.',
    short_description: '3 فازات سيراميك بأطوال متناسقة بتصميم بوهيمي أنيق يناسب كل ديكور.',
    sku: 'BH-DEC-1070',
    price: 320,
    old_price: 420,
    pricing_mode: 'fixed',
    category_id: 'cat-home-decor',
    subcategory_id: 'sub-hd-tables',
    product_type: 'فازات',
    brand_id: 'brand-bidaya',
    images: [
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80'
    ],
    primary_image_index: 0,
    is_featured: true,
    is_new: true,
    is_offer: false,
    is_available: true,
    stock_status: 'in_stock',
    display_order: 10,
    specifications: [
      { key: 'العدد', value: '3 فازات بأحجام مختلفة (كبير، وسط، صغير)' },
      { key: 'الخامة', value: 'سيراميك عالي الكثافة مع طلاء مط مقاوم للخدوش' }
    ],
    views_count: 245,
    request_count: 32,
    created_at: '2026-02-06T11:00:00Z',
    updated_at: '2026-02-10T13:00:00Z'
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-101',
    order_number: 'BH-2026-000142',
    customer: {
      name: 'مروة عبد العزيز',
      phone: '01098765432',
      governorate: 'القاهرة',
      area: 'مدينة نصر',
      address: 'شارع الطيران بجوار مسجد رابعة، عمارة 14 الدور الثالث',
      notes: 'يرجى الاتصال قبل الوصول بنصف ساعة'
    },
    items: [
      {
        product_id: 'prod-001',
        product_name: 'طقم علب ثلاجة وحفظ طعام محكمة الإغلاق (6 قطع)',
        product_sku: 'BH-KIT-0101',
        product_image: 'https://images.unsplash.com/photo-1584473457406-6240486418e9?w=800&auto=format&fit=crop&q=80',
        unit_price: 385,
        pricing_mode: 'fixed',
        quantity: 2,
        total_price: 770
      },
      {
        product_id: 'prod-003',
        product_name: 'منظم توابل وعطور دوار 360 درجة',
        product_sku: 'BH-ORG-0312',
        product_image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80',
        unit_price: 245,
        pricing_mode: 'fixed',
        quantity: 1,
        total_price: 245
      }
    ],
    total_amount: 1015,
    status: 'new',
    whatsapp_sent: true,
    visitor_id: 'vis_cairo_1092',
    device_type: 'mobile',
    traffic_source: 'facebook',
    status_history: [
      {
        status: 'new',
        timestamp: '2026-02-10T14:22:00Z',
        note: 'تم استلام الطلب بنجاح عبر الموقع وتحويله للواتساب'
      }
    ],
    created_at: '2026-02-10T14:22:00Z',
    updated_at: '2026-02-10T14:22:00Z'
  },
  {
    id: 'ord-102',
    order_number: 'BH-2026-000141',
    customer: {
      name: 'أحمد محمود القاضي',
      phone: '01123456789',
      governorate: 'الجيزة',
      area: 'الشيخ زايد',
      address: 'كمبوند زايد ديونز، فيلا 22',
      notes: 'التسليم بعد الساعة 5 مساءً'
    },
    items: [
      {
        product_id: 'prod-002',
        product_name: 'مساحة أرضيات سحرية دوارة 360 درجة مع جردل تجفيف',
        product_sku: 'BH-CLN-0204',
        product_image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80',
        unit_price: 460,
        pricing_mode: 'fixed',
        quantity: 1,
        total_price: 460
      }
    ],
    total_amount: 460,
    status: 'confirmed',
    whatsapp_sent: true,
    visitor_id: 'vis_giza_8832',
    device_type: 'mobile',
    traffic_source: 'instagram',
    status_history: [
      {
        status: 'new',
        timestamp: '2026-02-09T18:10:00Z',
        note: 'طلب جديد'
      },
      {
        status: 'contacted',
        timestamp: '2026-02-09T18:30:00Z',
        note: 'تم التواصل هاتفياً لتأكيد العنوان'
      },
      {
        status: 'confirmed',
        timestamp: '2026-02-09T18:45:00Z',
        note: 'تم التأكيد وجاهز للشحن'
      }
    ],
    created_at: '2026-02-09T18:10:00Z',
    updated_at: '2026-02-09T18:45:00Z'
  },
  {
    id: 'ord-103',
    order_number: 'BH-2026-000140',
    customer: {
      name: 'سارة طارق إبراهيم',
      phone: '01234567890',
      governorate: 'الإسكندرية',
      area: 'سموحة',
      address: 'شارع فوزي معاذ، برج الصفوة، الدور 8',
      notes: ''
    },
    items: [
      {
        product_id: 'prod-005',
        product_name: 'ترولي تنظيم بلاستيكي مودرن 4 أدوار',
        product_sku: 'BH-PLS-0520',
        product_image: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=800&auto=format&fit=crop&q=80',
        unit_price: 340,
        pricing_mode: 'starting_at',
        quantity: 2,
        total_price: 680
      },
      {
        product_id: 'prod-004',
        product_name: 'رف حمام زاوية لاصق فائق القوة (طقم قطعتين)',
        product_sku: 'BH-BTH-0418',
        product_image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80',
        unit_price: 195,
        pricing_mode: 'fixed',
        quantity: 1,
        total_price: 195
      }
    ],
    total_amount: 875,
    status: 'delivered',
    whatsapp_sent: true,
    visitor_id: 'vis_alex_3301',
    device_type: 'desktop',
    traffic_source: 'google',
    status_history: [
      { status: 'new', timestamp: '2026-02-08T11:15:00Z' },
      { status: 'confirmed', timestamp: '2026-02-08T12:00:00Z' },
      { status: 'shipped', timestamp: '2026-02-08T16:00:00Z' },
      { status: 'delivered', timestamp: '2026-02-09T15:30:00Z', note: 'تم استلام الشحنة والدفع عند الاستلام' }
    ],
    created_at: '2026-02-08T11:15:00Z',
    updated_at: '2026-02-09T15:30:00Z'
  }
];

export const INITIAL_ADMIN_USERS: AdminUser[] = [
  {
    id: 'usr-super',
    name: 'المدير العام (Super Admin)',
    email: 'admin@bidayahome.com',
    role: 'super_admin',
    last_login_at: '2026-02-10T12:00:00Z',
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'usr-orders',
    name: 'مسؤول الطلبات والمبيعات',
    email: 'orders@bidayahome.com',
    role: 'order_manager',
    last_login_at: '2026-02-10T10:30:00Z',
    created_at: '2026-01-05T00:00:00Z'
  },
  {
    id: 'usr-catalog',
    name: 'مدير الكتالوج والمنتجات',
    email: 'catalog@bidayahome.com',
    role: 'catalog_manager',
    last_login_at: '2026-02-09T15:45:00Z',
    created_at: '2026-01-05T00:00:00Z'
  }
];
