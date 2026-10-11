# 🏠 بداية هوم — BIDAYA HOME
### **"بداية جديدة.. لبيتك كل ما يستحق"**

---

## 📋 نظرة عامة

**بداية هوم (Bidaya Home)** هو موقع تجارة إلكترونية متكامل لبيع منتجات المنزل في مصر، مبني بتقنية **React + TypeScript + Vite**، ويستخدم **Supabase** كـ Backend، مع دعم كامل للغتين **العربية والإنجليزية (RTL/LTR)**.

---

## 🛠️ Stack التقني

| التقنية | الإصدار | الاستخدام |
|---|---|---|
| React | 19.x | واجهة المستخدم |
| TypeScript | ~6.0.2 | Type Safety |
| Vite | 8.x | Build Tool & Dev Server |
| Supabase JS | ^2.117.2 | Backend / Database |
| PostHog JS | ^1.x | Analytics & Session Replay |
| Lucide React | ^1.51.0 | أيقونات |
| Canvas Confetti | ^1.9.4 | تأثيرات احتفالية |
| OxLint | ^1.81.0 | Linting |

---

## 📁 هيكل المشروع

```
BIDAYA HOME/
├── src/
│   ├── App.tsx                          # Entry Point — Router & Layout الرئيسي
│   ├── main.tsx                         # React Root Mount
│   ├── index.css / App.css              # Global Styles
│   │
│   ├── components/
│   │   ├── common/                      # مكونات مشتركة
│   │   │   ├── Navbar.tsx               # شريط التنقل (33 KB)
│   │   │   ├── Footer.tsx               # التذييل (16 KB)
│   │   │   ├── CartDrawer.tsx           # درج سلة التسوق (12 KB)
│   │   │   ├── CheckoutModal.tsx        # نموذج إتمام الطلب (43 KB)
│   │   │   ├── ProductCard.tsx          # بطاقة المنتج (11 KB)
│   │   │   ├── ProductModal.tsx         # نافذة تفاصيل المنتج (22 KB)
│   │   │   ├── Toast.tsx                # إشعارات Toast
│   │   │   └── WhatsAppFloatingButton.tsx
│   │   │
│   │   ├── customer/                    # صفحات العميل
│   │   │   ├── HeroSection.tsx
│   │   │   ├── CategorySection.tsx
│   │   │   ├── FeaturedProductsSection.tsx
│   │   │   ├── WhyBidayaSection.tsx
│   │   │   ├── CatalogPage.tsx          # (34 KB)
│   │   │   ├── CategoriesPage.tsx
│   │   │   ├── OffersPage.tsx
│   │   │   ├── AboutPage.tsx
│   │   │   └── ContactPage.tsx
│   │   │
│   │   └── admin/                       # لوحة تحكم الإدارة
│   │       ├── AdminAuth.tsx
│   │       ├── AdminLayout.tsx
│   │       ├── DashboardOverview.tsx    # (25 KB)
│   │       ├── ProductManagement.tsx    # (42 KB)
│   │       ├── CategoryManagement.tsx   # (25 KB)
│   │       ├── BrandManagement.tsx
│   │       ├── OrderManagement.tsx      # (23 KB)
│   │       ├── CustomerManagement.tsx
│   │       ├── AnalyticsDashboard.tsx
│   │       ├── UsersManagement.tsx
│   │       ├── ActivityLogs.tsx
│   │       └── SettingsManagement.tsx
│   │
│   ├── context/
│   │   ├── CartContext.tsx              # Context سلة التسوق
│   │   └── LanguageContext.tsx          # Context اللغة (AR/EN + RTL)
│   │
│   ├── services/
│   │   ├── dataStore.ts                 # خدمة البيانات (localStorage + Supabase)
│   │   ├── analytics.ts                 # تتبع الأحداث
│   │   └── whatsapp.ts                  # إرسال رسائل WhatsApp
│   │
│   ├── types/index.ts                   # جميع TypeScript Types
│   ├── data/                            # Seed Data + Translations
│   ├── lib/                             # إعداد Supabase Client
│   └── assets/                          # الصور والأصول
│
├── database/
│   ├── schema.sql                       # مخطط قاعدة البيانات الكامل
│   └── migration_category_taxonomy_v2.sql
│
├── index.html
├── vite.config.ts
└── package.json
```

---

## 🗺️ صفحات الموقع (Customer Routes)

| المسار | الوصف |
|---|---|
| `home` | الصفحة الرئيسية: Hero + الفئات + المنتجات المميزة + لماذا بداية؟ |
| `catalog` | كتالوج المنتجات مع فلاتر الفئات والبحث |
| `categories` | عرض جميع الفئات والفئات الفرعية |
| `offers` | المنتجات ذات العروض الخاصة |
| `about` | من نحن |
| `contact` | تواصل معنا |
| `admin` *(hidden)* | لوحة التحكم الإدارية |

---

## 🔧 لوحة التحكم الإدارية

| التبويب | الوصف |
|---|---|
| `dashboard` | نظرة عامة وإحصاءات سريعة |
| `products` | إضافة / تعديل / حذف المنتجات |
| `categories` | إدارة الفئات والفئات الفرعية |
| `brands` | إدارة الماركات |
| `orders` | متابعة الطلبات وتحديث حالاتها |
| `customers` | عرض بيانات العملاء |
| `analytics` | تقارير وتحليلات الزيارات والمبيعات |
| `users` | إدارة حسابات المديرين *(super_admin فقط)* |
| `logs` | سجل جميع نشاطات الإدارة |
| `settings` | إعدادات الموقع الكاملة |

---

## 🗄️ قاعدة البيانات (Supabase PostgreSQL)

### الجداول

| الجدول | الوصف |
|---|---|
| `site_settings` | إعدادات الموقع العامة |
| `categories` | الفئات الرئيسية |
| `subcategories` | الفئات الفرعية (مرتبطة بـ categories) |
| `brands` | الماركات والعلامات التجارية |
| `products` | المنتجات مع الصور والمواصفات |
| `customers` | بيانات العملاء (مجمّعة برقم الهاتف) |
| `orders` | الطلبات |
| `analytics_events` | أحداث التحليلات |
| `admin_users` | حسابات الإدارة |
| `admin_activity_logs` | سجل نشاطات الإدارة |

### نظام التسعير

| القيمة | المعنى |
|---|---|
| `fixed` | سعر ثابت |
| `starting_at` | يبدأ من... |
| `on_request` | السعر عند الطلب |

### حالات المخزون

| القيمة | المعنى |
|---|---|
| `in_stock` | متوفر |
| `low_stock` | كمية محدودة |
| `out_of_stock` | غير متوفر |

### مسار حالة الطلب

```
new → contacted → confirmed → preparing → shipped → delivered
                                                   ↘ cancelled
```

---

## 🛒 نظام سلة التسوق

- **التخزين**: `localStorage` (مفتاح: `bh_cart_items_v1`)
- **الوظائف**: إضافة / حذف / تعديل الكمية / مسح السلة
- **إشعارات**: Toast messages باللغتين
- **يشمل**: حالة CartDrawer + CheckoutModal

---

## 💬 نظام الطلبات عبر WhatsApp

- ملخص الطلب يُرسل عبر **WhatsApp** عند الإتمام
- رقم الواتساب: `+20 150 999 0745`
- تنسيق رقم الطلب: `BH-YYYY-XXXXXX`
- يدعم نظام **العربون (Deposit) + المتبقي**

### طرق الدفع

| نوع | الطرق المتاحة |
|---|---|
| العربون | InstaPay، محفظة، تحويل بنكي |
| المتبقي | كاش، InstaPay، محفظة، تحويل بنكي |

---

## 🌐 دعم اللغتين (i18n)

- **الافتراضي**: العربية (RTL)
- **الثانية**: الإنجليزية (LTR)
- **التبديل**: `toggleLanguage()` — محفوظ في `localStorage`
- **الخطوط**: متغيرات CSS منفصلة `--font-arabic` / `--font-latin`
- **التطبيق**: `dir` و `lang` على عنصر `<html>`

---

## 📊 نظام التحليلات

| الحدث | الوصف |
|---|---|
| `PAGE_VIEW` | عند الدخول لأي صفحة |
| `PRODUCT_CLICK` | عند النقر على بطاقة منتج (مؤشر نية) |
| `PRODUCT_VIEW` | عند فتح نافذة تفاصيل منتج |
| `SEARCH` | عند البحث (يُرسل طول الاستعلام فقط للخصوصية) |
| `CATEGORY_VIEW` | عند الدخول لفئة |
| `ADD_TO_CART` | إضافة منتج للسلة |
| `REMOVE_FROM_CART` | حذف منتج من السلة |
| `BEGIN_CHECKOUT` | فتح نافذة إتمام الطلب |
| `ORDER_SUBMIT_ATTEMPT` | عند الضغط على زر تأكيد الطلب (قبل الحفظ) |
| `ORDER_CREATED` | بعد تأكيد حفظ الطلب محلياً |
| `WHATSAPP_CLICK` | عند فتح محادثة WhatsApp بعد الطلب أو عائماً |

---

## 👥 أدوار المستخدمين الإداريين

| الدور | الصلاحيات |
|---|---|
| `super_admin` | وصول كامل لجميع الأقسام |
| `admin` | وصول لمعظم الأقسام |
| `catalog_manager` | المنتجات والفئات والماركات فقط |
| `order_manager` | إدارة الطلبات فقط |

---

## 🔒 نظام الأمان (Supabase RLS)

- **Row Level Security** مفعّل على جميع الجداول
- **العامة (Anon)**: قراءة المنتجات/الفئات/الإعدادات + إنشاء الطلبات
- **Authenticated (Admins)**: وصول كامل CRUD

---

## ⚙️ إعدادات الموقع (`SiteSettings`)

| الحقل | الوصف |
|---|---|
| `store_name_ar / en` | اسم المتجر |
| `slogan_ar` | الشعار |
| `logo_url / favicon_url` | الشعار والأيقونة |
| `whatsapp_number` | رقم التواصل |
| `support_phone / email` | الدعم الفني |
| `facebook_url / instagram_url` | التواصل الاجتماعي |
| `show_prices` | إظهار/إخفاء الأسعار |
| `enable_ordering` | تفعيل/تعطيل الطلبات |
| `enable_offers` | تفعيل/تعطيل صفحة العروض |
| `seo_title / seo_description` | بيانات SEO |
| `whatsapp_template` | قالب رسالة WhatsApp |
| `supabase_url / anon_key` | إعداد Supabase |

---

## 🚀 تشغيل المشروع

```bash
# تثبيت الحزم
npm install

# تشغيل بيئة التطوير
npm run dev

# بناء نسخة الإنتاج
npm run build

# معاينة نسخة الإنتاج
npm run preview

# فحص الكود
npm run lint
```

---

## 🔗 روابط

| | الرابط |
|---|---|
| Facebook | https://www.facebook.com/triple3homeegypt |
| Instagram | https://www.instagram.com/bidaya_home1/ |
| WhatsApp | +20 150 999 0745 |

---

*آخر تحديث: أكتوبر 2026*
