-- =========================================================
-- BIDAYA HOME (بداية هوم) - PRODUCTION SUPABASE POSTGRESQL SCHEMA
-- Brand Slogan: "بداية جديدة.. لبيتك كل ما يستحق"
-- =========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. SITE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_name_ar TEXT NOT NULL DEFAULT 'بداية هوم',
    store_name_en TEXT NOT NULL DEFAULT 'Bidaya Home',
    slogan_ar TEXT NOT NULL DEFAULT 'بداية جديدة.. لبيتك كل ما يستحق',
    logo_url TEXT,
    favicon_url TEXT,
    whatsapp_number TEXT NOT NULL DEFAULT '201509990745',
    support_phone TEXT,
    support_email TEXT,
    facebook_url TEXT DEFAULT 'https://www.facebook.com/triple3homeegypt',
    instagram_url TEXT DEFAULT 'https://www.instagram.com/bidaya_home1/',
    store_address TEXT DEFAULT 'جمهورية مصر العربية — خدمة الشحن متوفرة لجميع المحافظات',
    whatsapp_template TEXT NOT NULL,
    show_prices BOOLEAN DEFAULT TRUE,
    enable_ordering BOOLEAN DEFAULT TRUE,
    enable_offers BOOLEAN DEFAULT TRUE,
    seo_title TEXT,
    seo_description TEXT,
    footer_text TEXT,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY DEFAULT ('cat-' || substr(md5(random()::text), 1, 8)),
    name_ar TEXT NOT NULL,
    name_en TEXT,
    slug TEXT NOT NULL UNIQUE,
    icon TEXT,
    image_url TEXT NOT NULL,
    description TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 3. SUBCATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.subcategories (
    id TEXT PRIMARY KEY DEFAULT ('sub-' || substr(md5(random()::text), 1, 8)),
    category_id TEXT NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    name_ar TEXT NOT NULL,
    name_en TEXT,
    slug TEXT NOT NULL,
    product_types JSONB DEFAULT '[]'::jsonb,
    display_order INT DEFAULT 0,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 4. BRANDS TABLE
CREATE TABLE IF NOT EXISTS public.brands (
    id TEXT PRIMARY KEY DEFAULT ('brand-' || substr(md5(random()::text), 1, 8)),
    name_ar TEXT NOT NULL,
    name_en TEXT,
    slug TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 5. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY DEFAULT ('prod-' || substr(md5(random()::text), 1, 8)),
    name_ar TEXT NOT NULL,
    name_en TEXT,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    short_description TEXT,
    sku TEXT NOT NULL UNIQUE,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    old_price NUMERIC(10, 2),
    pricing_mode TEXT NOT NULL DEFAULT 'fixed' CHECK (pricing_mode IN ('fixed', 'starting_at', 'on_request')),
    category_id TEXT NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    subcategory_id TEXT REFERENCES public.subcategories(id) ON DELETE SET NULL,
    product_type TEXT,
    brand_id TEXT REFERENCES public.brands(id) ON DELETE SET NULL,
    images JSONB NOT NULL DEFAULT '[]'::jsonb,
    primary_image_index INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    is_new BOOLEAN DEFAULT FALSE,
    is_offer BOOLEAN DEFAULT FALSE,
    is_available BOOLEAN DEFAULT TRUE,
    stock_status TEXT DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock', 'low_stock', 'out_of_stock')),
    display_order INT DEFAULT 0,
    specifications JSONB DEFAULT '[]'::jsonb,
    views_count INT DEFAULT 0,
    request_count INT DEFAULT 0,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 6. CUSTOMERS TABLE (Aggregated by phone number for guest checkout)
CREATE TABLE IF NOT EXISTS public.customers (
    id TEXT PRIMARY KEY DEFAULT ('cust-' || substr(md5(random()::text), 1, 8)),
    name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    governorate TEXT NOT NULL,
    area TEXT,
    address TEXT,
    notes TEXT,
    orders_count INT DEFAULT 1,
    total_spent NUMERIC(10, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()),
    last_order_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 7. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY DEFAULT ('ord-' || substr(md5(random()::text), 1, 8)),
    order_number TEXT NOT NULL UNIQUE,
    customer_info JSONB NOT NULL,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    deposit_percentage NUMERIC(5, 2) DEFAULT 50,
    deposit_amount NUMERIC(10, 2),
    deposit_payment_method TEXT,
    remaining_percentage NUMERIC(5, 2) DEFAULT 50,
    remaining_amount NUMERIC(10, 2),
    remaining_payment_method TEXT,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled')),
    whatsapp_sent BOOLEAN DEFAULT TRUE,
    visitor_id TEXT,
    device_type TEXT,
    traffic_source TEXT,
    status_history JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 8. ANALYTICS EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_name TEXT NOT NULL,
    visitor_id TEXT NOT NULL,
    session_id TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()),
    page_url TEXT,
    device_type TEXT,
    traffic_source TEXT,
    location_governorate TEXT,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 9. ADMIN USERS TABLE
CREATE TABLE IF NOT EXISTS public.admin_users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'catalog_manager', 'order_manager')),
    avatar_url TEXT,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 10. ADMIN ACTIVITY LOGS TABLE
CREATE TABLE IF NOT EXISTS public.admin_activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id TEXT NOT NULL,
    admin_name TEXT NOT NULL,
    admin_role TEXT NOT NULL,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id TEXT,
    target_title TEXT,
    details TEXT,
    timestamp TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON public.products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_is_offer ON public.products(is_offer);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_event_name ON public.analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON public.analytics_events(timestamp);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- Public can read active non-archived products, categories, subcategories, brands, and settings
CREATE POLICY "Public can view active products" ON public.products FOR SELECT USING (is_archived = false AND is_available = true);
CREATE POLICY "Public can view active categories" ON public.categories FOR SELECT USING (is_archived = false AND is_active = true);
CREATE POLICY "Public can view subcategories" ON public.subcategories FOR SELECT USING (true);
CREATE POLICY "Public can view brands" ON public.brands FOR SELECT USING (is_archived = false AND is_active = true);
CREATE POLICY "Public can view site settings" ON public.site_settings FOR SELECT USING (true);

-- Public can insert orders and analytics events
CREATE POLICY "Public can insert orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can insert analytics events" ON public.analytics_events FOR INSERT WITH CHECK (true);

-- Authenticated admins have full access to everything
CREATE POLICY "Admins full access to products" ON public.products TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admins full access to categories" ON public.categories TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admins full access to orders" ON public.orders TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admins full access to customers" ON public.customers TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admins full access to analytics" ON public.analytics_events TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admins full access to settings" ON public.site_settings TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admins full access to activity logs" ON public.admin_activity_logs TO authenticated USING (true) WITH CHECK (true);
