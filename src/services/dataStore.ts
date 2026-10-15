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
  INITIAL_ADMIN_USERS,
  LEGACY_DEMO_PRODUCT_IDS,
  LEGACY_DEMO_ORDER_IDS,
  LEGACY_DEMO_ADMIN_USER_IDS
} from '../data/seedData';
import { captureAppException } from '../lib/posthog';
import { getSupabaseClient } from '../lib/supabase';

const STORAGE_KEYS = {
  SETTINGS: 'bh_settings_v1',
  CATEGORIES: 'bh_categories_v1',
  BRANDS: 'bh_brands_v1',
  PRODUCTS: 'bh_products_v1',
  ORDERS: 'bh_orders_v1',
  ANALYTICS: 'bh_analytics_events_v1',
  ANALYTICS_PENDING: 'bh_analytics_events_pending_v1',
  ANALYTICS_ID_MIGRATIONS: 'bh_analytics_event_id_migrations_v1',
  ADMIN_USERS: 'bh_admin_users_v1',
  ACTIVITY_LOGS: 'bh_activity_logs_v1',
  ORDER_COUNTER: 'bh_order_counter_v1',
  TAXONOMY_VERSION: 'bh_taxonomy_v2',
  DEMO_DATA_CLEANUP_VERSION: 'bh_demo_data_cleanup_v1'
};

class DataStoreService {
  private listeners: Set<() => void> = new Set();
  private analyticsSyncPromise: Promise<void> | null = null;
  private initialized = false;

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

  private save<T>(key: string, data: T): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      this.notifyListeners();
      return true;
    } catch (e) {
      console.warn(`Error saving ${key} to storage:`, e);
      return false;
    }
  }

  private writeLocal<T>(key: string, data: T): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (e) {
      console.warn(`Error saving ${key} to localStorage:`, e);
      return false;
    }
  }

  private readLocal<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) as T : defaultValue;
    } catch (e) {
      console.warn(`Error loading ${key} from localStorage:`, e);
      return defaultValue;
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
        captureAppException(e, { source: 'dataStore.notifyListeners' });
      }
    });
  }

  // --- SETTINGS ---
  public getSettings(): SiteSettings {
    return this.readLocal(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  }

  public initializeSettings(): void {
    let settings: SiteSettings;
    let hasChanges = false;

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!stored) {
        settings = { ...INITIAL_SETTINGS };
        hasChanges = true;
      } else {
        try {
          settings = JSON.parse(stored) as SiteSettings;
        } catch (error) {
          console.warn('Invalid stored settings; restoring defaults:', error);
          settings = { ...INITIAL_SETTINGS };
          hasChanges = true;
        }
      }
    } catch (error) {
      console.warn('Unable to initialize stored settings:', error);
      return;
    }

    // Auto-migration & sanitization:
    // If cached localStorage has the old incorrect number (containing 14878411) or is missing,
    // seamlessly migrate to the correct official number: 201509990745 / 01509990745
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

    if (!settings.support_email || settings.support_email === 'info@bidayahome.com') {
      settings.support_email = INITIAL_SETTINGS.support_email;
      hasChanges = true;
    }

    if (hasChanges) {
      this.save(STORAGE_KEYS.SETTINGS, settings);
    }
  }

  private removeLegacyDemoData(): void {
    try {
      if (localStorage.getItem(STORAGE_KEYS.DEMO_DATA_CLEANUP_VERSION) === 'v1') return;

      const removeRecordsById = (key: string, ids: Set<string>) => {
        const stored = localStorage.getItem(key);
        if (!stored) return;

        const records = JSON.parse(stored) as Array<{ id?: string }>;
        if (!Array.isArray(records)) throw new Error(`Expected an array in ${key}.`);

        const filtered = records.filter((record) => !record?.id || !ids.has(record.id));
        if (filtered.length !== records.length && !this.writeLocal(key, filtered)) {
          throw new Error(`Unable to save cleaned data in ${key}.`);
        }
      };

      removeRecordsById(STORAGE_KEYS.PRODUCTS, new Set(LEGACY_DEMO_PRODUCT_IDS));
      removeRecordsById(STORAGE_KEYS.ORDERS, new Set(LEGACY_DEMO_ORDER_IDS));
      removeRecordsById(STORAGE_KEYS.ADMIN_USERS, new Set(LEGACY_DEMO_ADMIN_USER_IDS));
      removeRecordsById(STORAGE_KEYS.ACTIVITY_LOGS, new Set(['log-1']));
      localStorage.setItem(STORAGE_KEYS.DEMO_DATA_CLEANUP_VERSION, 'v1');
    } catch (error) {
      console.warn('Unable to remove legacy demo data; existing data was retained where cleanup failed:', error);
    }
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
        const legacyDemoProductIds = new Set(LEGACY_DEMO_PRODUCT_IDS);
        const nonDemoProducts = parsedProducts.filter((product) => !legacyDemoProductIds.has(product.id));
        let productsModified = nonDemoProducts.length !== parsedProducts.length;

        const migratedProducts = nonDemoProducts.map(p => {
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

  private async persistProductImages(product: Product): Promise<string[]> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('اتصال قاعدة البيانات غير متاح. سجّل الدخول مرة أخرى أو تحقق من إعدادات الموقع.');

    const uploadedPaths: string[] = [];
    try {
      const images: string[] = [];
      for (const [index, image] of product.images.entries()) {
        if (!image.startsWith('data:')) {
          images.push(image);
          continue;
        }

        const response = await fetch(image);
        if (!response.ok) throw new Error('تعذر تجهيز إحدى صور المنتج.');
        const file = await response.blob();
        const extension = file.type === 'image/webp' ? 'webp' : file.type === 'image/png' ? 'png' : file.type === 'image/jpeg' ? 'jpg' : 'img';
        const path = `${product.id}/${index}.${extension}`;
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(path, file, { contentType: file.type, upsert: true });
        if (uploadError) {
          const isPolicyError = uploadError.message.toLowerCase().includes('row-level security');
          const message = isPolicyError
            ? 'صلاحية رفع صور المنتجات غير مفعّلة في Supabase. طبّق migration ‏20261014000100_product_image_storage.sql، وتأكد أن حسابك يحمل دور super_admin أو admin أو catalog_manager.'
            : uploadError.message;
          throw new Error(`تعذر رفع صورة المنتج: ${message}`);
        }
        uploadedPaths.push(path);
        images.push(supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl);
      }
      return images;
    } catch (error) {
      if (uploadedPaths.length > 0) {
        const { error: cleanupError } = await supabase.storage.from('product-images').remove(uploadedPaths);
        if (cleanupError) console.error('Failed to clean up product image uploads:', cleanupError.message);
      }
      throw error;
    }
  }

  private async ensureProductReferences(product: Product): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('اتصال قاعدة البيانات غير متاح.');

    const category = this.getCategories(true).find((item) => item.id === product.category_id);
    if (!category) throw new Error('القسم المحدد غير موجود.');

    const { data: existingCategory, error: categoryReadError } = await supabase
      .from('categories').select('id').eq('id', category.id).maybeSingle();
    if (categoryReadError) throw new Error(`تعذر التحقق من القسم في قاعدة البيانات: ${categoryReadError.message}`);
    if (!existingCategory) {
      const { error } = await supabase.from('categories').insert({
        id: category.id,
        name_ar: category.name_ar,
        name_en: category.name_en || null,
        slug: category.slug,
        icon: category.icon || null,
        image_url: category.image_url,
        description: category.description || null,
        display_order: category.display_order,
        is_active: category.is_active,
        is_archived: category.is_archived || false
      });
      if (error) throw new Error(`تعذر حفظ القسم المطلوب في قاعدة البيانات: ${error.message}`);
    }

    if (product.subcategory_id) {
      const subcategory = category.subcategories?.find((item) => item.id === product.subcategory_id);
      if (!subcategory) throw new Error('التصنيف الفرعي المحدد غير موجود.');
      const { data: existingSubcategory, error: subcategoryReadError } = await supabase
        .from('subcategories').select('id').eq('id', subcategory.id).eq('category_id', category.id).maybeSingle();
      if (subcategoryReadError) throw new Error(`تعذر التحقق من التصنيف الفرعي في قاعدة البيانات: ${subcategoryReadError.message}`);
      if (!existingSubcategory) {
        const { error } = await supabase.from('subcategories').insert({
          id: subcategory.id,
          category_id: category.id,
          name_ar: subcategory.name_ar,
          name_en: subcategory.name_en || null,
          slug: subcategory.slug,
          product_types: subcategory.product_types || [],
          display_order: subcategory.display_order || 0,
          is_archived: subcategory.is_archived || false
        });
        if (error) throw new Error(`تعذر حفظ التصنيف الفرعي في قاعدة البيانات: ${error.message}`);
      }
    }

    if (product.brand_id) {
      const brand = this.getBrands(true).find((item) => item.id === product.brand_id);
      if (!brand) throw new Error('العلامة التجارية المحددة غير موجودة.');
      const { data: existingBrand, error: brandReadError } = await supabase
        .from('brands').select('id').eq('id', brand.id).maybeSingle();
      if (brandReadError) throw new Error(`تعذر التحقق من العلامة التجارية في قاعدة البيانات: ${brandReadError.message}`);
      if (!existingBrand) {
        const { error } = await supabase.from('brands').insert({
          id: brand.id,
          name_ar: brand.name_ar,
          name_en: brand.name_en || null,
          slug: brand.slug,
          logo_url: brand.logo_url || null,
          description: brand.description || null,
          is_active: brand.is_active,
          is_archived: brand.is_archived || false
        });
        if (error) throw new Error(`تعذر حفظ العلامة التجارية في قاعدة البيانات: ${error.message}`);
      }
    }
  }

  public async saveProduct(product: Partial<Product> & { name_ar: string; sku: string; price: number; category_id: string }, adminUser?: AdminUser): Promise<Product> {
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
    }

    await this.ensureProductReferences(updatedProduct);
    updatedProduct.images = await this.persistProductImages(updatedProduct);

    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('اتصال قاعدة البيانات غير متاح.');
    const { error: databaseError } = await supabase.from('products').upsert(updatedProduct, { onConflict: 'id' });
    if (databaseError) throw new Error(`تعذر حفظ المنتج في قاعدة البيانات: ${databaseError.message}`);

    if (!this.save(STORAGE_KEYS.PRODUCTS, list)) {
      console.warn('Product was saved to Supabase, but the browser cache could not be updated.');
      this.notifyListeners();
    }
    if (adminUser) {
      const isUpdate = Boolean(product.id);
      this.logActivity(
        adminUser,
        isUpdate ? 'تعديل منتج' : 'إضافة منتج جديد',
        'product',
        updatedProduct.id,
        updatedProduct.name_ar,
        isUpdate
          ? `تم تحديث بيانات وسعر منتج SKU: ${updatedProduct.sku}`
          : `تمت إضافة منتج جديد SKU: ${updatedProduct.sku}`
      );
    }
    return updatedProduct;
  }

  public async refreshProductsFromDatabase(): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const { data, error } = await supabase.from('products').select('*');
    if (error) throw new Error(`تعذر تحميل المنتجات من قاعدة البيانات: ${error.message}`);
    if (!data) return;

    const localProducts = this.getProducts(true);
    const productsById = new Map(localProducts.map((product) => [product.id, product]));
    for (const product of data as Product[]) productsById.set(product.id, product);
    this.save(STORAGE_KEYS.PRODUCTS, [...productsById.values()]);
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

  public async refreshOrdersFromDatabase(): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('اتصال قاعدة البيانات غير متاح.');

    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (error) throw new Error(`تعذر تحميل الطلبات من قاعدة البيانات: ${error.message}`);

    const storedOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);
    const demoOrderIds = new Set(LEGACY_DEMO_ORDER_IDS);
    const localOrders = storedOrders
      ? (JSON.parse(storedOrders) as Order[]).filter((order) => !demoOrderIds.has(order.id))
      : [];
    const ordersById = new Map(localOrders.map((order) => [order.id, order]));
    for (const row of data || []) {
      const orderRow = row as typeof row & { customer_info?: CustomerInfo };
      const { customer_info, ...orderFields } = orderRow;
      if (!customer_info) throw new Error(`بيانات العميل غير موجودة للطلب ${orderRow.id}.`);
      ordersById.set(orderRow.id, { ...orderFields, customer: customer_info } as Order);
    }

    this.save(STORAGE_KEYS.ORDERS, [...ordersById.values()]);
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
      id: this.createAnalyticsEventId(),
      timestamp: new Date().toISOString()
    };

    const pendingEvents = this.getPendingAnalyticsEvents();
    if (!pendingEvents) {
      console.warn('Analytics event was saved locally but could not be queued for synchronization.');
      this.saveAnalyticsEventLocally(events, newEvent);
      return;
    }

    if (!this.writePendingAnalyticsEvents([newEvent, ...pendingEvents])) {
      console.warn('Analytics event was saved locally but could not be queued for synchronization.');
      this.saveAnalyticsEventLocally(events, newEvent);
      return;
    }

    this.saveAnalyticsEventLocally(events, newEvent);
    void this.syncPendingAnalyticsEvents();
  }

  private saveAnalyticsEventLocally(events: AnalyticsEvent[], newEvent: AnalyticsEvent): void {
    // Keep max 2000 events in localStorage for smooth performance
    events.unshift(newEvent);
    if (events.length > 2000) {
      events.pop();
    }
    this.save(STORAGE_KEYS.ANALYTICS, events);
  }

  private isUuid(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
  }

  private createAnalyticsEventId(): string {
    if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();

    const bytes = crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  private getPendingAnalyticsEvents(): AnalyticsEvent[] | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ANALYTICS_PENDING);
      if (!stored) return [];
      const events: unknown = JSON.parse(stored);
      if (!Array.isArray(events)) {
        console.warn('Invalid pending analytics queue; leaving it untouched.');
        return null;
      }
      return events as AnalyticsEvent[];
    } catch (error) {
      console.warn('Unable to read pending analytics queue; leaving it untouched:', error);
      return null;
    }
  }

  private writePendingAnalyticsEvents(events: AnalyticsEvent[]): boolean {
    return this.writeLocal(STORAGE_KEYS.ANALYTICS_PENDING, events);
  }

  public initialize(): void {
    if (this.initialized) return;
    this.initialized = true;

    this.removeLegacyDemoData();
    this.initializeSettings();
    this.migrateLegacyAnalyticsEventIds();
    void this.syncPendingAnalyticsEvents();
    window.addEventListener('online', () => {
      void this.syncPendingAnalyticsEvents();
    });
  }

  private migrateLegacyAnalyticsEventIds(): void {
    const events = this.readLocal<AnalyticsEvent[] | null>(STORAGE_KEYS.ANALYTICS, null);
    if (!events || !Array.isArray(events)) return;

    const pendingEvents = this.getPendingAnalyticsEvents();
    if (!pendingEvents) return;

    let idMigrations: Record<string, string>;
    try {
      const storedMigrations = localStorage.getItem(STORAGE_KEYS.ANALYTICS_ID_MIGRATIONS);
      idMigrations = storedMigrations ? JSON.parse(storedMigrations) as Record<string, string> : {};
    } catch (error) {
      console.warn('Unable to read analytics ID migration map; legacy events were left untouched:', error);
      return;
    }

    const pendingIds = new Set(pendingEvents.map((event) => event.id));
    let hasChanges = false;
    const migratedEvents = events.map((event) => {
      if (this.isUuid(event.id)) return event;
      const legacyId = event.id;
      const storedMigratedId = idMigrations[legacyId];
      const migratedId = storedMigratedId && this.isUuid(storedMigratedId)
        ? storedMigratedId
        : this.createAnalyticsEventId();
      idMigrations[legacyId] = migratedId;
      const migratedEvent = { ...event, id: migratedId };
      if (!pendingIds.has(migratedId)) {
        pendingEvents.unshift(migratedEvent);
        pendingIds.add(migratedId);
      }
      hasChanges = true;
      return migratedEvent;
    });

    if (!hasChanges) return;
    if (!this.writeLocal(STORAGE_KEYS.ANALYTICS_ID_MIGRATIONS, idMigrations)) return;
    if (!this.writePendingAnalyticsEvents(pendingEvents)) {
      console.warn('Legacy analytics events were preserved but could not be queued for synchronization.');
      return;
    }

    if (!this.writeLocal(STORAGE_KEYS.ANALYTICS, migratedEvents)) {
      console.warn('Legacy analytics events were queued but their local IDs could not be updated.');
      return;
    }

    try {
      localStorage.removeItem(STORAGE_KEYS.ANALYTICS_ID_MIGRATIONS);
    } catch (error) {
      console.warn('Unable to clear analytics ID migration map:', error);
    }
  }

  public syncPendingAnalyticsEvents(): Promise<void> {
    if (this.analyticsSyncPromise) return this.analyticsSyncPromise;

    this.analyticsSyncPromise = this.syncAnalyticsQueue().finally(() => {
      this.analyticsSyncPromise = null;
    });
    return this.analyticsSyncPromise;
  }

  private async syncAnalyticsQueue(): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    while (true) {
      const pendingEvents = this.getPendingAnalyticsEvents();
      if (!pendingEvents || pendingEvents.length === 0) return;

      const batch = pendingEvents.slice(0, 100);
      const rows = batch.map((event) => ({
        id: event.id,
        event_name: event.event_name,
        visitor_id: event.visitor_id,
        session_id: event.session_id,
        timestamp: event.timestamp,
        page_url: event.page_url,
        device_type: event.device_type,
        traffic_source: event.traffic_source,
        location_governorate: event.location_governorate,
        metadata: event.metadata || {}
      }));

      const acknowledgedIds = new Set<string>();
      try {
        const { error } = await supabase
          .from('analytics_events')
          .insert(rows);

        if (error?.code === '23505') {
          for (const row of rows) {
            const { error: rowError } = await supabase
              .from('analytics_events')
              .insert(row);

            if (rowError && rowError.code !== '23505') {
              console.warn('Analytics sync failed; pending events retained for retry:', rowError.message);
              break;
            }
            acknowledgedIds.add(row.id);
          }
        } else if (error) {
          console.warn('Analytics sync failed; pending events retained for retry:', error.message);
          return;
        } else {
          batch.forEach((event) => acknowledgedIds.add(event.id));
        }
      } catch (syncError) {
        console.warn('Analytics sync failed; pending events retained for retry:', syncError);
        return;
      }

      if (acknowledgedIds.size === 0) return;

      const currentPendingEvents = this.getPendingAnalyticsEvents();
      if (!currentPendingEvents) return;
      const remainingEvents = currentPendingEvents.filter((event) => !acknowledgedIds.has(event.id));
      if (!this.writePendingAnalyticsEvents(remainingEvents)) {
        console.warn('Analytics events synchronized but remain queued because the queue could not be updated.');
        return;
      }
      if (acknowledgedIds.size < batch.length) return;
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
    return this.load<ActivityLog[]>(STORAGE_KEYS.ACTIVITY_LOGS, []);
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
