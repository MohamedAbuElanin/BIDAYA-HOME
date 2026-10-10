import {
  Product,
  Category,
  Subcategory,
  Brand,
  Order,
  Customer,
  SiteSettings,
  AnalyticsEvent,
  ActivityLog,
  AdminUser,
  OrderStatus,
  CustomerInfo,
  OrderItem,
  DepositPaymentMethod,
  RemainingPaymentMethod
} from '../types';
import {
  INITIAL_SETTINGS,
  INITIAL_CATEGORIES,
  INITIAL_BRANDS,
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_ADMIN_USERS
} from '../data/seedData';
import { getSupabaseClient } from '../lib/supabase';

const STORAGE_KEYS = {
  SETTINGS: 'bh_settings_v1',
  CATEGORIES: 'bh_categories_v1',
  BRANDS: 'bh_brands_v1',
  PRODUCTS: 'bh_products_v1',
  ORDERS: 'bh_orders_v1',
  ANALYTICS: 'bh_analytics_events_v1',
  ADMIN_USERS: 'bh_admin_users_v1',
  ACTIVITY_LOGS: 'bh_activity_logs_v1',
  ORDER_COUNTER: 'bh_order_counter_v1',
  TAXONOMY_VERSION: 'bh_taxonomy_v2'
};

class DataStoreService {
  private listeners: Set<() => void> = new Set();

  private load<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      if (!item) {
        this.save(key, defaultValue);
        return defaultValue;
      }
      return JSON.parse(item);
    } catch (e) {
      console.warn(`Error loading ${key} from storage:`, e);
      return defaultValue;
    }
  }

  private save<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      this.notifyListeners();
    } catch (e) {
      console.warn(`Error saving ${key} to storage:`, e);
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (e) {
        console.error('Error in store listener:', e);
      }
    });
  }

  // --- SETTINGS ---
  public getSettings(): SiteSettings {
    const settings = this.load<SiteSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    
    // Auto-migration & sanitization:
    // If cached localStorage has the old incorrect number (containing 14878411) or is missing,
    // seamlessly migrate to the correct official number: 201509990745 / 01509990745
    let hasChanges = false;
    if (
      !settings.whatsapp_number ||
      settings.whatsapp_number.includes('14878411') ||
      settings.whatsapp_number === '201014878411' ||
      settings.whatsapp_number === '01014878411'
    ) {
      settings.whatsapp_number = '201509990745';
      hasChanges = true;
    }

    if (
      !settings.support_phone ||
      settings.support_phone.includes('14878411') ||
      settings.support_phone === '01014878411'
    ) {
      settings.support_phone = '01509990745';
      hasChanges = true;
    }

    if (hasChanges) {
      this.save(STORAGE_KEYS.SETTINGS, settings);
    }

    return settings;
  }

  public updateSettings(newSettings: Partial<SiteSettings>, adminUser?: AdminUser): SiteSettings {
    const current = this.getSettings();
    const sanitized = { ...newSettings };

    // Sanitize WhatsApp number if updated
    if (sanitized.whatsapp_number) {
      let cleaned = sanitized.whatsapp_number.replace(/\D/g, '');
      if (cleaned.startsWith('01') && cleaned.length === 11) {
        cleaned = `20${cleaned.substring(1)}`;
      } else if (!cleaned.startsWith('20') && cleaned.length === 10 && cleaned.startsWith('1')) {
        cleaned = `20${cleaned}`;
      }
      sanitized.whatsapp_number = cleaned;
    }

    const updated = { ...current, ...sanitized };
    this.save(STORAGE_KEYS.SETTINGS, updated);

    if (adminUser) {
      this.logActivity(adminUser, 'تعديل إعدادات المتجر', 'setting', 'settings', 'إعدادات الموقع', 'تم حفظ التعديلات العامة وتحديث بيانات التواصل');
    }

    return updated;
  }

  // --- CATEGORY TAXONOMY AUTO-MIGRATION ---
  private ensureTaxonomyMigrated(): void {
    try {
      const version = localStorage.getItem(STORAGE_KEYS.TAXONOMY_VERSION);
      if (version === 'v2') return;

      const storedCategories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      const storedProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS);

      // Check if categories need migration
      if (storedCategories) {
        const parsedCats: Category[] = JSON.parse(storedCategories);
        const hasOldCats = parsedCats.some(c =>
          c.id === 'cat-food-storage' ||
          c.id === 'cat-cleaning' ||
          c.id === 'cat-plastics' ||
          c.slug === 'kitchen-tools'
        );

        if (hasOldCats || parsedCats.length < 10) {
          // Merge custom categories created by admin if any
          const defaultIds = new Set(INITIAL_CATEGORIES.map(c => c.id));
          const customCategories = parsedCats.filter(c =>
            !['cat-kitchen', 'cat-organization', 'cat-cleaning', 'cat-food-storage', 'cat-bathroom', 'cat-plastics'].includes(c.id) &&
            !defaultIds.has(c.id)
          );

          const newCategories = [...INITIAL_CATEGORIES, ...customCategories];
          this.save(STORAGE_KEYS.CATEGORIES, newCategories);
        }
      } else {
        this.save(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
      }

      // Check and safely migrate existing products
      if (storedProducts) {
        const parsedProducts: Product[] = JSON.parse(storedProducts);
        let productsModified = false;

        const migratedProducts = parsedProducts.map(p => {
          let updated = { ...p };

          // Map old categories & subcategories
          if (p.category_id === 'cat-food-storage') {
            updated.category_id = 'cat-kitchen';
            updated.subcategory_id = 'sub-k-storage';
            updated.product_type = updated.product_type || 'علب حفظ الطعام';
            productsModified = true;
          } else if (p.category_id === 'cat-cleaning') {
            updated.category_id = 'cat-home-tools';
            updated.subcategory_id = 'sub-ht-home';
            updated.product_type = updated.product_type || 'ممسحة';
            productsModified = true;
          } else if (p.category_id === 'cat-plastics') {
            updated.category_id = 'cat-storage-org';
            updated.subcategory_id = 'sub-so-shelves';
            updated.product_type = updated.product_type || 'رفوف ووحدات تخزين صغيرة';
            productsModified = true;
          } else if (p.id === 'prod-003' && p.category_id === 'cat-kitchen') {
            updated.category_id = 'cat-storage-org';
            updated.subcategory_id = 'sub-so-kitchen';
            updated.product_type = updated.product_type || 'منظمات المطبخ';
            productsModified = true;
          } else if (p.id === 'prod-004' && p.subcategory_id === 'sub-b1') {
            updated.subcategory_id = 'sub-bth-holders';
            updated.product_type = updated.product_type || 'حوامل الحمام';
            productsModified = true;
          } else if (p.id === 'prod-006' && p.subcategory_id === 'sub-o1') {
            updated.subcategory_id = 'sub-so-wardrobe';
            updated.product_type = updated.product_type || 'منظمات الدولاب';
            productsModified = true;
          } else if (p.id === 'prod-007' && p.subcategory_id === 'sub-k2') {
            updated.subcategory_id = 'sub-k-utensils';
            updated.product_type = updated.product_type || 'أدوات المصفاة';
            productsModified = true;
          } else if (p.id === 'prod-008' && p.subcategory_id === 'sub-o3') {
            updated.subcategory_id = 'sub-so-shoes';
            updated.product_type = updated.product_type || 'منظمات الأحذية';
            productsModified = true;
          }

          return updated;
        });

        // Ensure newly introduced seed products exist if not already present
        const currentIds = new Set(migratedProducts.map(p => p.id));
        INITIAL_PRODUCTS.forEach(ip => {
          if (!currentIds.has(ip.id)) {
            migratedProducts.push(ip);
            productsModified = true;
          }
        });

        if (productsModified) {
          this.save(STORAGE_KEYS.PRODUCTS, migratedProducts);
        }
      } else {
        this.save(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
      }

      localStorage.setItem(STORAGE_KEYS.TAXONOMY_VERSION, 'v2');
    } catch (e) {
      console.warn('Taxonomy migration note:', e);
    }
  }

  // --- CATEGORIES ---
  public getCategories(includeArchived = false): Category[] {
    this.ensureTaxonomyMigrated();
    const list = this.load<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    return includeArchived ? list : list.filter(c => !c.is_archived);
  }

  public getCategoryById(id: string): Category | undefined {
    return this.getCategories(true).find(c => c.id === id);
  }

  public getCategoryBySlug(slug: string): Category | undefined {
    return this.getCategories(true).find(c => c.slug === slug);
  }

  public saveCategory(category: Partial<Category> & { name_ar: string; slug: string }, adminUser?: AdminUser): Category {
    const list = this.getCategories(true);
    let updatedCategory: Category;

    if (category.id) {
      const index = list.findIndex(c => c.id === category.id);
      if (index !== -1) {
        updatedCategory = { ...list[index], ...category } as Category;
        list[index] = updatedCategory;
        if (adminUser) {
          this.logActivity(adminUser, 'تعديل قسم', 'category', updatedCategory.id, updatedCategory.name_ar, `تم تعديل بيانات قسم ${updatedCategory.name_ar}`);
        }
      } else {
        throw new Error('Category not found');
      }
    } else {
      updatedCategory = {
        id: `cat-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
        name_ar: category.name_ar,
        name_en: category.name_en || '',
        slug: category.slug,
        icon: category.icon || 'Boxes',
        image_url: category.image_url || 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=600&auto=format&fit=crop&q=80',
        description: category.description || '',
        display_order: category.display_order || list.length + 1,
        is_active: category.is_active !== undefined ? category.is_active : true,
        subcategories: category.subcategories || [],
        created_at: new Date().toISOString(),
        is_archived: false
      };
      list.push(updatedCategory);
      if (adminUser) {
        this.logActivity(adminUser, 'إضافة قسم جديد', 'category', updatedCategory.id, updatedCategory.name_ar, `تم إنشاء قسم جديد: ${updatedCategory.name_ar}`);
      }
    }

    this.save(STORAGE_KEYS.CATEGORIES, list);
    return updatedCategory;
  }

  public archiveCategory(id: string, adminUser?: AdminUser): void {
    const list = this.getCategories(true);
    const cat = list.find(c => c.id === id);
    if (cat) {
      cat.is_archived = true;
      this.save(STORAGE_KEYS.CATEGORIES, list);
      if (adminUser) {
        this.logActivity(adminUser, 'أرشفة قسم', 'category', cat.id, cat.name_ar, `تم أرشفة قسم: ${cat.name_ar}`);
      }
    }
  }

  public restoreCategory(id: string, adminUser?: AdminUser): void {
    const list = this.getCategories(true);
    const cat = list.find(c => c.id === id);
    if (cat) {
      cat.is_archived = false;
      this.save(STORAGE_KEYS.CATEGORIES, list);
      if (adminUser) {
        this.logActivity(adminUser, 'استعادة قسم', 'category', cat.id, cat.name_ar, `تمت استعادة قسم: ${cat.name_ar}`);
      }
    }
  }

  public deleteCategory(id: string, adminUser?: AdminUser): void {
    let list = this.getCategories(true);
    const target = list.find(c => c.id === id);
    list = list.filter(c => c.id !== id);
    this.save(STORAGE_KEYS.CATEGORIES, list);
    if (adminUser && target) {
      this.logActivity(adminUser, 'حذف نهائي لقسم', 'category', target.id, target.name_ar, `تم حذف قسم: ${target.name_ar}`);
    }
  }

  // --- SUBCATEGORIES CRUD ---
  public saveSubcategory(
    categoryId: string,
    subcategory: Partial<Subcategory> & { name_ar: string },
    adminUser?: AdminUser
  ): Subcategory {
    const list = this.getCategories(true);
    const cat = list.find(c => c.id === categoryId);
    if (!cat) throw new Error('Parent category not found');

    if (!cat.subcategories) {
      cat.subcategories = [];
    }

    let updatedSub: Subcategory;
    const baseSlug = subcategory.slug || subcategory.name_ar.toLowerCase().replace(/\s+/g, '-');

    if (subcategory.id) {
      const idx = cat.subcategories.findIndex(s => s.id === subcategory.id);
      if (idx !== -1) {
        updatedSub = {
          ...cat.subcategories[idx],
          ...subcategory,
          category_id: categoryId
        };
        cat.subcategories[idx] = updatedSub;
        if (adminUser) {
          this.logActivity(adminUser, 'تعديل تصنيف فرعي', 'category', updatedSub.id, updatedSub.name_ar, `تم تعديل فرع ${updatedSub.name_ar} في ${cat.name_ar}`);
        }
      } else {
        throw new Error('Subcategory not found');
      }
    } else {
      updatedSub = {
        id: `sub-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
        category_id: categoryId,
        name_ar: subcategory.name_ar,
        name_en: subcategory.name_en || '',
        slug: baseSlug,
        product_types: subcategory.product_types || [],
        display_order: subcategory.display_order || cat.subcategories.length + 1,
        is_archived: false
      };
      cat.subcategories.push(updatedSub);
      if (adminUser) {
        this.logActivity(adminUser, 'إضافة تصنيف فرعي', 'category', updatedSub.id, updatedSub.name_ar, `تمت إضافة فرع ${updatedSub.name_ar} إلى ${cat.name_ar}`);
      }
    }

    this.save(STORAGE_KEYS.CATEGORIES, list);
    return updatedSub;
  }

  public archiveSubcategory(categoryId: string, subcategoryId: string, adminUser?: AdminUser): void {
    const list = this.getCategories(true);
    const cat = list.find(c => c.id === categoryId);
    if (!cat || !cat.subcategories) return;

    const sub = cat.subcategories.find(s => s.id === subcategoryId);
    if (sub) {
      sub.is_archived = true;
      this.save(STORAGE_KEYS.CATEGORIES, list);
      if (adminUser) {
        this.logActivity(adminUser, 'أرشفة تصنيف فرعي', 'category', sub.id, sub.name_ar, `تم أرشفة فرع ${sub.name_ar}`);
      }
    }
  }

  public restoreSubcategory(categoryId: string, subcategoryId: string, adminUser?: AdminUser): void {
    const list = this.getCategories(true);
    const cat = list.find(c => c.id === categoryId);
    if (!cat || !cat.subcategories) return;

    const sub = cat.subcategories.find(s => s.id === subcategoryId);
    if (sub) {
      sub.is_archived = false;
      this.save(STORAGE_KEYS.CATEGORIES, list);
      if (adminUser) {
        this.logActivity(adminUser, 'استعادة تصنيف فرعي', 'category', sub.id, sub.name_ar, `تمت استعادة فرع ${sub.name_ar}`);
      }
    }
  }

  public deleteSubcategory(categoryId: string, subcategoryId: string, adminUser?: AdminUser): void {
    const list = this.getCategories(true);
    const cat = list.find(c => c.id === categoryId);
    if (!cat || !cat.subcategories) return;

    const target = cat.subcategories.find(s => s.id === subcategoryId);
    cat.subcategories = cat.subcategories.filter(s => s.id !== subcategoryId);
    this.save(STORAGE_KEYS.CATEGORIES, list);
    if (adminUser && target) {
      this.logActivity(adminUser, 'حذف تصنيف فرعي', 'category', target.id, target.name_ar, `تم حذف فرع ${target.name_ar} من ${cat.name_ar}`);
    }
  }

  // --- BRANDS ---
  public getBrands(includeArchived = false): Brand[] {
    const list = this.load<Brand[]>(STORAGE_KEYS.BRANDS, INITIAL_BRANDS);
    return includeArchived ? list : list.filter(b => !b.is_archived);
  }

  public saveBrand(brand: Partial<Brand> & { name_ar: string; slug: string }, adminUser?: AdminUser): Brand {
    const list = this.getBrands(true);
    let updatedBrand: Brand;

    if (brand.id) {
      const idx = list.findIndex(b => b.id === brand.id);
      if (idx !== -1) {
        updatedBrand = { ...list[idx], ...brand } as Brand;
        list[idx] = updatedBrand;
        if (adminUser) {
          this.logActivity(adminUser, 'تعديل ماركة / علامة تجارية', 'brand', updatedBrand.id, updatedBrand.name_ar);
        }
      } else {
        throw new Error('Brand not found');
      }
    } else {
      updatedBrand = {
        id: `brand-${Date.now().toString(36)}`,
        name_ar: brand.name_ar,
        name_en: brand.name_en || '',
        slug: brand.slug,
        logo_url: brand.logo_url || 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=120&auto=format&fit=crop&q=80',
        description: brand.description || '',
        is_active: brand.is_active !== undefined ? brand.is_active : true,
        created_at: new Date().toISOString(),
        is_archived: false
      };
      list.push(updatedBrand);
      if (adminUser) {
        this.logActivity(adminUser, 'إضافة علامة تجارية', 'brand', updatedBrand.id, updatedBrand.name_ar);
      }
    }

    this.save(STORAGE_KEYS.BRANDS, list);
    return updatedBrand;
  }

  public deleteBrand(id: string, adminUser?: AdminUser): void {
    let list = this.getBrands(true);
    const target = list.find(b => b.id === id);
    list = list.filter(b => b.id !== id);
    this.save(STORAGE_KEYS.BRANDS, list);
    if (adminUser && target) {
      this.logActivity(adminUser, 'حذف علامة تجارية', 'brand', target.id, target.name_ar);
    }
  }

  // --- PRODUCTS ---
  public getProducts(includeArchived = false): Product[] {
    this.ensureTaxonomyMigrated();
    const list = this.load<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    return includeArchived ? list : list.filter(p => !p.is_archived);
  }

  public getProductById(id: string): Product | undefined {
    return this.getProducts(true).find(p => p.id === id);
  }

  public getProductBySlug(slug: string): Product | undefined {
    return this.getProducts(true).find(p => p.slug === slug);
  }

  public saveProduct(product: Partial<Product> & { name_ar: string; sku: string; price: number; category_id: string }, adminUser?: AdminUser): Product {
    const list = this.getProducts(true);
    let updatedProduct: Product;

    const baseSlug = product.slug || product.name_ar.toLowerCase().replace(/[^\u0621-\u064A\w\s-]/g, '').replace(/\s+/g, '-');

    if (product.id) {
      const idx = list.findIndex(p => p.id === product.id);
      if (idx !== -1) {
        updatedProduct = {
          ...list[idx],
          ...product,
          product_type: product.product_type !== undefined ? product.product_type : list[idx].product_type,
          updated_at: new Date().toISOString()
        } as Product;
        list[idx] = updatedProduct;
        if (adminUser) {
          this.logActivity(adminUser, 'تعديل منتج', 'product', updatedProduct.id, updatedProduct.name_ar, `تم تحديث بيانات وسعر منتج SKU: ${updatedProduct.sku}`);
        }
      } else {
        throw new Error('Product not found');
      }
    } else {
      updatedProduct = {
        id: `prod-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
        name_ar: product.name_ar,
        name_en: product.name_en || '',
        slug: baseSlug,
        description: product.description || '',
        short_description: product.short_description || '',
        sku: product.sku,
        price: Number(product.price) || 0,
        old_price: product.old_price ? Number(product.old_price) : undefined,
        pricing_mode: product.pricing_mode || 'fixed',
        category_id: product.category_id,
        subcategory_id: product.subcategory_id,
        product_type: product.product_type || undefined,
        brand_id: product.brand_id,
        images: product.images && product.images.length > 0 ? product.images : ['https://images.unsplash.com/photo-1584473457406-6240486418e9?w=800&auto=format&fit=crop&q=80'],
        primary_image_index: product.primary_image_index || 0,
        is_featured: Boolean(product.is_featured),
        is_new: product.is_new !== undefined ? product.is_new : true,
        is_offer: Boolean(product.is_offer),
        is_available: product.is_available !== undefined ? product.is_available : true,
        stock_status: product.stock_status || 'in_stock',
        display_order: product.display_order || list.length + 1,
        specifications: product.specifications || [],
        views_count: 0,
        request_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_archived: false
      };
      list.push(updatedProduct);
      if (adminUser) {
        this.logActivity(adminUser, 'إضافة منتج جديد', 'product', updatedProduct.id, updatedProduct.name_ar, `تمت إضافة منتج جديد SKU: ${updatedProduct.sku}`);
      }
    }

    this.save(STORAGE_KEYS.PRODUCTS, list);
    return updatedProduct;
  }

  public archiveProduct(id: string, adminUser?: AdminUser): void {
    const list = this.getProducts(true);
    const prod = list.find(p => p.id === id);
    if (prod) {
      prod.is_archived = true;
      this.save(STORAGE_KEYS.PRODUCTS, list);
      if (adminUser) {
        this.logActivity(adminUser, 'أرشفة منتج', 'product', prod.id, prod.name_ar);
      }
    }
  }

  public restoreProduct(id: string, adminUser?: AdminUser): void {
    const list = this.getProducts(true);
    const prod = list.find(p => p.id === id);
    if (prod) {
      prod.is_archived = false;
      this.save(STORAGE_KEYS.PRODUCTS, list);
      if (adminUser) {
        this.logActivity(adminUser, 'استعادة منتج', 'product', prod.id, prod.name_ar);
      }
    }
  }

  public deleteProduct(id: string, adminUser?: AdminUser): void {
    let list = this.getProducts(true);
    const target = list.find(p => p.id === id);
    list = list.filter(p => p.id !== id);
    this.save(STORAGE_KEYS.PRODUCTS, list);
    if (adminUser && target) {
      this.logActivity(adminUser, 'حذف نهائي لمنتج', 'product', target.id, target.name_ar);
    }
  }

  public incrementProductViews(id: string): void {
    const list = this.getProducts(true);
    const prod = list.find(p => p.id === id);
    if (prod) {
      prod.views_count = (prod.views_count || 0) + 1;
      this.save(STORAGE_KEYS.PRODUCTS, list);
    }
  }

  public incrementProductRequests(id: string): void {
    const list = this.getProducts(true);
    const prod = list.find(p => p.id === id);
    if (prod) {
      prod.request_count = (prod.request_count || 0) + 1;
      this.save(STORAGE_KEYS.PRODUCTS, list);
    }
  }

  // --- ORDERS ---
  private getNextOrderNumber(): string {
    const counter = Number(localStorage.getItem(STORAGE_KEYS.ORDER_COUNTER) || '142') + 1;
    localStorage.setItem(STORAGE_KEYS.ORDER_COUNTER, counter.toString());
    const padded = counter.toString().padStart(6, '0');
    return `BH-2026-${padded}`;
  }

  public getOrders(): Order[] {
    return this.load<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  }

  public getOrderById(id: string): Order | undefined {
    return this.getOrders().find(o => o.id === id);
  }

  public createOrder(orderData: {
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
    visitor_id?: string;
    device_type?: string;
    traffic_source?: string;
  }): Order {
    const orders = this.getOrders();
    const orderNumber = this.getNextOrderNumber();
    const now = new Date().toISOString();

    const newOrder: Order = {
      id: `ord-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      order_number: orderNumber,
      customer: orderData.customer,
      items: orderData.items,
      total_amount: orderData.total_amount,
      deposit_percentage: orderData.deposit_percentage,
      deposit_amount: orderData.deposit_amount,
      deposit_payment_method: orderData.deposit_payment_method,
      remaining_percentage: orderData.remaining_percentage,
      remaining_amount: orderData.remaining_amount,
      remaining_payment_method: orderData.remaining_payment_method,
      delivery_fee: orderData.delivery_fee,
      delivery_fee_text: orderData.delivery_fee_text,
      status: 'new',
      whatsapp_sent: true,
      visitor_id: orderData.visitor_id,
      device_type: orderData.device_type || 'mobile',
      traffic_source: orderData.traffic_source || 'direct',
      status_history: [
        {
          status: 'new',
          timestamp: now,
          note: 'تم استلام طلب الشراء عبر الموقع وجاهز للإرسال على الواتساب'
        }
      ],
      created_at: now,
      updated_at: now
    };

    orders.unshift(newOrder);
    this.save(STORAGE_KEYS.ORDERS, orders);

    // Increment request count for products
    orderData.items.forEach(item => {
      this.incrementProductRequests(item.product_id);
    });

    // Sync / insert order to Supabase if connected
    const supabase = getSupabaseClient();
    if (supabase) {
      supabase.from('orders').insert([{
        id: newOrder.id,
        order_number: newOrder.order_number,
        customer_info: newOrder.customer,
        items: newOrder.items,
        total_amount: newOrder.total_amount,
        deposit_percentage: newOrder.deposit_percentage,
        deposit_amount: newOrder.deposit_amount,
        deposit_payment_method: newOrder.deposit_payment_method,
        remaining_percentage: newOrder.remaining_percentage,
        remaining_amount: newOrder.remaining_amount,
        remaining_payment_method: newOrder.remaining_payment_method,
        delivery_fee: newOrder.delivery_fee,
        delivery_fee_text: newOrder.delivery_fee_text,
        status: newOrder.status,
        whatsapp_sent: true,
        visitor_id: newOrder.visitor_id,
        device_type: newOrder.device_type,
        traffic_source: newOrder.traffic_source,
        status_history: newOrder.status_history
      }]).then(({ error }) => {
        if (error) console.warn('Supabase order sync notice:', error.message);
      });
    }

    return newOrder;
  }

  public updateOrderStatus(orderId: string, newStatus: OrderStatus, note?: string, adminUser?: AdminUser): Order {
    const orders = this.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    const now = new Date().toISOString();
    order.status = newStatus;
    order.updated_at = now;
    order.status_history.push({
      status: newStatus,
      timestamp: now,
      note: note || `تغيير الحالة إلى ${this.getStatusArabicName(newStatus)}`,
      changed_by: adminUser?.name || 'النظام'
    });

    this.save(STORAGE_KEYS.ORDERS, orders);

    if (adminUser) {
      this.logActivity(
        adminUser,
        'تحديث حالة طلب',
        'order',
        order.id,
        order.order_number,
        `تم تغيير حالة الطلب إلى: ${this.getStatusArabicName(newStatus)} للعميل ${order.customer.name}`
      );
    }

    return order;
  }

  public getStatusArabicName(status: OrderStatus): string {
    const map: Record<OrderStatus, string> = {
      new: 'جديد',
      contacted: 'تم التواصل',
      confirmed: 'مؤكد',
      preparing: 'جاري التجهيز',
      shipped: 'تم الشحن',
      delivered: 'تم التسليم',
      cancelled: 'ملغي'
    };
    return map[status] || status;
  }

  // --- CUSTOMERS (Aggregated from orders) ---
  public getCustomers(): Customer[] {
    const orders = this.getOrders();
    const customerMap = new Map<string, Customer>();

    orders.forEach(order => {
      const phone = order.customer.phone.trim();
      const existing = customerMap.get(phone);

      if (existing) {
        existing.orders_count += 1;
        existing.total_spent += Number(order.total_amount) || 0;
        if (new Date(order.created_at) > new Date(existing.last_order_at)) {
          existing.last_order_at = order.created_at;
          existing.name = order.customer.name;
          existing.governorate = order.customer.governorate;
          existing.area = order.customer.area;
          existing.address = order.customer.address;
        }
      } else {
        customerMap.set(phone, {
          id: `cust-${phone.replace(/\D/g, '')}`,
          name: order.customer.name,
          phone: order.customer.phone,
          governorate: order.customer.governorate,
          area: order.customer.area,
          address: order.customer.address,
          notes: order.customer.notes,
          orders_count: 1,
          total_spent: Number(order.total_amount) || 0,
          created_at: order.created_at,
          last_order_at: order.created_at
        });
      }
    });

    return Array.from(customerMap.values());
  }

  // --- ANALYTICS EVENTS ---
  public getAnalyticsEvents(): AnalyticsEvent[] {
    return this.load<AnalyticsEvent[]>(STORAGE_KEYS.ANALYTICS, []);
  }

  public logAnalyticsEvent(event: Omit<AnalyticsEvent, 'id' | 'timestamp'>): void {
    const events = this.getAnalyticsEvents();
    const newEvent: AnalyticsEvent = {
      ...event,
      id: `evt-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString()
    };

    // Keep max 2000 events in localStorage for smooth performance
    events.unshift(newEvent);
    if (events.length > 2000) {
      events.pop();
    }
    this.save(STORAGE_KEYS.ANALYTICS, events);

    // Sync to Supabase if connected
    const supabase = getSupabaseClient();
    if (supabase) {
      supabase.from('analytics_events').insert([newEvent]).then(({ error }) => {
        if (error) console.warn('Analytics sync notice:', error.message);
      });
    }
  }

  // --- ADMIN USERS & AUTH ---
  public getAdminUsers(): AdminUser[] {
    return this.load<AdminUser[]>(STORAGE_KEYS.ADMIN_USERS, INITIAL_ADMIN_USERS);
  }

  public saveAdminUser(user: Partial<AdminUser> & { name: string; email: string; role: any }): AdminUser {
    const list = this.getAdminUsers();
    let updated: AdminUser;

    if (user.id) {
      const idx = list.findIndex(u => u.id === user.id);
      if (idx !== -1) {
        updated = { ...list[idx], ...user } as AdminUser;
        list[idx] = updated;
      } else {
        throw new Error('User not found');
      }
    } else {
      updated = {
        id: `usr-${Date.now().toString(36)}`,
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: new Date().toISOString()
      };
      list.push(updated);
    }

    this.save(STORAGE_KEYS.ADMIN_USERS, list);
    return updated;
  }

  // --- ACTIVITY LOGS ---
  public getActivityLogs(): ActivityLog[] {
    return this.load<ActivityLog[]>(STORAGE_KEYS.ACTIVITY_LOGS, [
      {
        id: 'log-1',
        admin_id: 'usr-super',
        admin_name: 'المدير العام (Super Admin)',
        admin_role: 'super_admin',
        action: 'تسجيل دخول للنظام',
        target_type: 'auth',
        details: 'تم الدخول بنجاح إلى لوحة الإدارة',
        timestamp: new Date(Date.now() - 3600000).toISOString()
      }
    ]);
  }

  public logActivity(
    admin: AdminUser,
    action: string,
    target_type: ActivityLog['target_type'],
    target_id?: string,
    target_title?: string,
    details?: string
  ): void {
    const logs = this.getActivityLogs();
    const newLog: ActivityLog = {
      id: `log-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
      admin_id: admin.id,
      admin_name: admin.name,
      admin_role: admin.role,
      action,
      target_type,
      target_id,
      target_title,
      details,
      timestamp: new Date().toISOString()
    };

    logs.unshift(newLog);
    if (logs.length > 500) {
      logs.pop();
    }
    this.save(STORAGE_KEYS.ACTIVITY_LOGS, logs);
  }

  // Reset database to initial seed data for demo/testing
  public resetToInitialData(): void {
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.BRANDS);
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.ANALYTICS);
    localStorage.removeItem(STORAGE_KEYS.ADMIN_USERS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVITY_LOGS);
    localStorage.removeItem(STORAGE_KEYS.ORDER_COUNTER);

    this.save(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    this.save(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    this.save(STORAGE_KEYS.BRANDS, INITIAL_BRANDS);
    this.save(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    this.save(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    this.save(STORAGE_KEYS.ADMIN_USERS, INITIAL_ADMIN_USERS);
    localStorage.setItem(STORAGE_KEYS.TAXONOMY_VERSION, 'v2');
    this.notifyListeners();
  }
}

export const dataStore = new DataStoreService();
