export type PricingMode = 'fixed' | 'starting_at' | 'on_request';

export type ProductAvailability = 'in_stock' | 'low_stock' | 'out_of_stock';

export interface ProductSpecification {
  key: string;
  value: string;
}

export interface Product {
  id: string;
  name_ar: string;
  name_en?: string;
  slug: string;
  description: string;
  short_description?: string;
  sku: string;
  price: number;
  old_price?: number;
  pricing_mode: PricingMode;
  category_id: string;
  subcategory_id?: string;
  product_type?: string;
  brand_id?: string;
  images: string[];
  primary_image_index: number;
  is_featured: boolean;
  is_new: boolean;
  is_offer: boolean;
  is_available: boolean;
  stock_status: ProductAvailability;
  display_order: number;
  specifications: ProductSpecification[];
  views_count: number;
  request_count: number;
  created_at: string;
  updated_at: string;
  is_archived?: boolean;
}

export interface Subcategory {
  id: string;
  category_id: string;
  name_ar: string;
  name_en?: string;
  slug: string;
  product_types?: string[];
  display_order?: number;
  is_archived?: boolean;
}

export interface Category {
  id: string;
  name_ar: string;
  name_en?: string;
  slug: string;
  icon?: string;
  image_url: string;
  description?: string;
  display_order: number;
  is_active: boolean;
  subcategories: Subcategory[];
  created_at: string;
  is_archived?: boolean;
}

export interface Brand {
  id: string;
  name_ar: string;
  name_en?: string;
  slug: string;
  logo_url: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  is_archived?: boolean;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  alternate_phone?: string;
  governorate: string;
  area: string;
  address: string;
  notes?: string;
}

export type DepositPaymentMethod = 'instapay' | 'wallet' | 'bank_transfer';
export type RemainingPaymentMethod = 'cash' | 'instapay' | 'wallet' | 'bank_transfer';

export interface Customer extends CustomerInfo {
  id: string;
  orders_count: number;
  total_spent: number;
  created_at: string;
  last_order_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selected_image: string;
}

export interface OrderItem {
  product_id: string;
  product_name: string;
  product_sku: string;
  product_image: string;
  unit_price: number;
  pricing_mode: PricingMode;
  quantity: number;
  total_price: number;
}

export type OrderStatus =
  | 'new'
  | 'contacted'
  | 'confirmed'
  | 'preparing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface OrderStatusHistoryItem {
  status: OrderStatus;
  timestamp: string;
  note?: string;
  changed_by?: string;
}

export interface Order {
  id: string;
  order_number: string; // e.g. BH-2026-000123
  customer: CustomerInfo;
  items: OrderItem[];
  total_amount: number;
  deposit_percentage?: number;
  deposit_amount?: number;
  deposit_payment_method?: DepositPaymentMethod;
  remaining_percentage?: number;
  remaining_amount?: number;
  remaining_payment_method?: RemainingPaymentMethod;
  delivery_fee?: number | null;
  delivery_fee_text?: string;
  status: OrderStatus;
  whatsapp_sent: boolean;
  visitor_id?: string;
  device_type?: string;
  traffic_source?: string;
  status_history: OrderStatusHistoryItem[];
  created_at: string;
  updated_at: string;
}

export type AnalyticsEventType =
  | 'PAGE_VIEW'
  | 'PRODUCT_VIEW'
  | 'PRODUCT_CLICK'
  | 'SEARCH'
  | 'CATEGORY_VIEW'
  | 'ADD_TO_CART'
  | 'REMOVE_FROM_CART'
  | 'BEGIN_CHECKOUT'
  | 'ORDER_CREATED'
  | 'ORDER_SUBMIT_ATTEMPT'
  | 'WHATSAPP_CLICK';

export interface AnalyticsEvent {
  id: string;
  event_name: AnalyticsEventType;
  visitor_id: string;
  session_id: string;
  timestamp: string;
  page_url: string;
  device_type: 'mobile' | 'tablet' | 'desktop';
  traffic_source: 'facebook' | 'instagram' | 'google' | 'direct' | 'other';
  location_governorate?: string;
  metadata?: Record<string, any>;
}

export type AdminRole = 'super_admin' | 'admin' | 'catalog_manager' | 'order_manager';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  avatar_url?: string;
  last_login_at?: string;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  admin_id: string;
  admin_name: string;
  admin_role: AdminRole;
  action: string;
  target_type: 'product' | 'category' | 'brand' | 'order' | 'customer' | 'setting' | 'auth';
  target_id?: string;
  target_title?: string;
  details?: string;
  timestamp: string;
}

export interface SiteSettings {
  store_name_ar: string;
  store_name_en: string;
  slogan_ar: string;
  logo_url: string;
  favicon_url: string;
  whatsapp_number: string;
  support_phone: string;
  support_email: string;
  facebook_url: string;
  instagram_url: string;
  store_address: string;
  whatsapp_template: string;
  show_prices: boolean;
  enable_ordering: boolean;
  enable_offers: boolean;
  seo_title: string;
  seo_description: string;
  footer_text: string;
  supabase_url?: string;
  supabase_anon_key?: string;
}
