-- =======================================================================
-- BIDAYA HOME - SAFE NON-DESTRUCTIVE DATABASE MIGRATION: CATEGORY TAXONOMY V2
-- =======================================================================
-- Instructions: Run this migration in Supabase SQL Editor.
-- This script does NOT drop tables or delete any existing products, orders, or customers.
-- =======================================================================

-- 1. ADD NEW COLUMNS SAFELY (IF NOT EXISTS)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS product_type TEXT;
ALTER TABLE public.subcategories ADD COLUMN IF NOT EXISTS product_types JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.subcategories ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0;
ALTER TABLE public.subcategories ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;

-- Index for product type and display order
CREATE INDEX IF NOT EXISTS idx_products_product_type ON public.products(product_type);
CREATE INDEX IF NOT EXISTS idx_subcategories_category_id ON public.subcategories(category_id);

-- 2. SAFE UPSERT FOR THE 10 OFFICIAL MAIN CATEGORIES
INSERT INTO public.categories (id, name_ar, name_en, slug, icon, image_url, description, display_order, is_active, is_archived)
VALUES
('cat-kitchen', 'المطبخ والطهي', 'Kitchen & Cooking', 'kitchen-cooking', 'UtensilsCrossed', 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80', 'أدوات طهي راقية، حلول تقديم، وحافظات طعام ذكية تمنح مطبخك العصرية والنظام.', 1, TRUE, FALSE),
('cat-storage-org', 'التخزين والتنظيم', 'Storage & Organization', 'storage-organization', 'Boxes', 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&auto=format&fit=crop&q=80', 'منظمات عملية للدواليب، الأدراج، والمطبخ لاستغلال كل شبر في بيتك بنظام وأناقة.', 2, TRUE, FALSE),
('cat-home-tools', 'أدوات المنزل', 'Household Tools', 'home-tools', 'Sparkles', 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80', 'أدوات النظافة الميكانيكية والعناية المنزلية اليومية بدون كيماويات لراحة تدوم.', 3, TRUE, FALSE),
('cat-small-appliances', 'الأجهزة الكهربائية الصغيرة', 'Small Home Appliances', 'small-appliances', 'Zap', 'https://images.unsplash.com/photo-1588854337236-6889d631faa8?w=800&auto=format&fit=crop&q=80', 'أجهزة مطبخ ومنزل كهربائية صغيرة ومستلزمات كهرباء معتمدة وآمنة لأداء ذكي وسريع.', 4, TRUE, FALSE),
('cat-home-decor', 'الديكور وتجميل المنزل', 'Home Decor', 'home-decor', 'Palette', 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80', 'لمسات جمالية راقية، فازات، إضاءات ديكورية، ونباتات صناعية تضفي الدفء على بيتك.', 5, TRUE, FALSE),
('cat-bathroom', 'الحمام', 'Bathroom', 'bathroom', 'Bath', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80', 'إكسسوارات وحوامل حمام أنيقة مقاومة للماء والصدأ لتنظيم مثالي ومظهر فندقي.', 6, TRUE, FALSE),
('cat-laundry', 'الغسيل والملابس', 'Laundry & Clothes Care', 'laundry-care', 'Shirt', 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=800&auto=format&fit=crop&q=80', 'سلال غسيل، مناشر عملية، وعلاقات متينة تجعل العناية بالملابس وترتيبها في غاية السهولة.', 7, TRUE, FALSE),
('cat-home-supplies', 'مستلزمات المنزل', 'Home Essentials', 'home-supplies', 'Home', 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80', 'مستلزمات الاستخدام اليومي، مرايات، ساعات، وإكسسوارات عامة تجعل منزلك متكاملاً.', 8, TRUE, FALSE),
('cat-home-garden', 'المنزل والحديقة', 'Home & Garden', 'home-garden', 'Flower2', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&auto=format&fit=crop&q=80', 'أصص نباتات، رشاشات، ومستلزمات العناية بالنباتات وديكور البلكونة الخفيف والمميز.', 9, TRUE, FALSE),
('cat-gifts-bundles', 'الهدايا والمجموعات', 'Gifts & Bundles', 'gifts-bundles', 'Gift', 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=800&auto=format&fit=crop&q=80', 'أطقم هدايا متناسقة، باقات للعرائس، وعروض حصرية تلبي كل مناسبة خاصة.', 10, TRUE, FALSE)
ON CONFLICT (id) DO UPDATE SET
    name_ar = EXCLUDED.name_ar,
    name_en = EXCLUDED.name_en,
    slug = EXCLUDED.slug,
    icon = EXCLUDED.icon,
    image_url = EXCLUDED.image_url,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    is_archived = EXCLUDED.is_archived;

-- 3. SAFE RE-MAPPING OF ANY OLD CATEGORY IDS (IF MIGRATING FROM OLD SCHEMA)
-- Map old food storage to kitchen
UPDATE public.products
SET category_id = 'cat-kitchen', subcategory_id = 'sub-k-storage', product_type = COALESCE(product_type, 'علب حفظ الطعام')
WHERE category_id = 'cat-food-storage';

-- Map old cleaning to home-tools
UPDATE public.products
SET category_id = 'cat-home-tools', subcategory_id = 'sub-ht-home', product_type = COALESCE(product_type, 'ممسحة')
WHERE category_id = 'cat-cleaning';

-- Map old plastics to storage-org
UPDATE public.products
SET category_id = 'cat-storage-org', subcategory_id = 'sub-so-shelves', product_type = COALESCE(product_type, 'رفوف ووحدات تخزين صغيرة')
WHERE category_id = 'cat-plastics';

-- =======================================================================
-- MIGRATION COMPLETED SAFELY WITHOUT DATA LOSS.
-- =======================================================================
