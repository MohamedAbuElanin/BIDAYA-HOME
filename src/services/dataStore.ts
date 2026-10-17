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
  CustomerInfo
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
import { EGYPTIAN_GOVERNORATES, Governorate, getDeliveryFeeByGov } from '../data/egyptianGovernorates';
import { captureAppException } from '../lib/posthog';
import { getSupabaseClient } from '../lib/supabase';

const STORAGE_KEYS = {
  SETTINGS: 'bh_settings_v1',
  CATEGORIES: 'bh_categories_v1',
  BRANDS: 'bh_brands_v1',
  PRODUCTS: 'bh_products_v1',
  ORDERS: 'bh_orders_v1',
  ORDERS_DATABASE: 'bh_orders_database_v1',
  ANALYTICS: 'bh_analytics_events_v1',
  ANALYTICS_DATABASE: 'bh_analytics_events_database_v1',
  ANALYTICS_PENDING: 'bh_analytics_events_pending_v1',
  ANALYTICS_ID_MIGRATIONS: 'bh_analytics_event_id_migrations_v1',
  DELIVERY_ZONES: 'bh_delivery_zones_v1',
  ADMIN_USERS: 'bh_admin_users_v1',
  ADMIN_USERS_DATABASE: 'bh_admin_users_database_v1',
  ACTIVITY_LOGS: 'bh_activity_logs_v1',
  ACTIVITY_LOGS_DATABASE: 'bh_activity_logs_database_v1',
  TAXONOMY_VERSION: 'bh_taxonomy_v2',
  DEMO_DATA_CLEANUP_VERSION: 'bh_demo_data_cleanup_v1'
};

class DataStoreService {
  private listeners: Set<() => void> = new Set();
  private analyticsSyncPromise: Promise<void> | null = null;
  private initialized = false;
  private settingsRecordId: string | null = null;
  private deliveryZones: Governorate[] = EGYPTIAN_GOVERNORATES;

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

  private requireSupabase(action: string) {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error(`اتصال قاعدة البيانات غير متاح. تعذر ${action}.`);
    return supabase;
  }

  // --- SETTINGS ---
  public getSettings(): SiteSettings {
    return this.readLocal(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  }

  public async refreshStorefrontData(): Promise<void> {
    await Promise.all([
      this.refreshSettingsFromDatabase(),
      this.refreshCategoriesFromDatabase(),
      this.refreshBrandsFromDatabase(),
      this.refreshProductsFromDatabase(),
      this.refreshDeliveryZonesFromDatabase()
    ]);
  }

  public async refreshSettingsFromDatabase(): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const { data, error } = await supabase.from('site_settings').select('*').order('created_at').limit(2);
    if (error) throw new Error(`تعذر تحميل إعدادات المتجر من قاعدة البيانات: ${error.message}`);
    if (!data?.length) return;
    if (data.length > 1) throw new Error('يوجد أكثر من سجل لإعدادات المتجر في قاعدة البيانات.');

    const { id, created_at: _createdAt, updated_at: _updatedAt, ...rowSettings } = data[0];
    this.settingsRecordId = id;
    const settings = { ...INITIAL_SETTINGS } as SiteSettings;
    for (const key of Object.keys(INITIAL_SETTINGS) as Array<keyof SiteSettings>) {
      const value = rowSettings[key];
      if (value !== null && value !== undefined) Object.assign(settings, { [key]: value });
    }
    if (!this.save(STORAGE_KEYS.SETTINGS, settings)) {
      throw new Error('تعذر تحديث ذاكرة إعدادات المتجر بعد تحميلها.');
    }
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

  public async updateSettings(newSettings: Partial<SiteSettings>, _adminUser?: AdminUser): Promise<SiteSettings> {
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
    const supabase = this.requireSupabase('حفظ إعدادات المتجر');
    const settingsRow = {
      store_name_ar: updated.store_name_ar,
      store_name_en: updated.store_name_en,
      slogan_ar: updated.slogan_ar,
      logo_url: updated.logo_url || null,
      favicon_url: updated.favicon_url || null,
      whatsapp_number: updated.whatsapp_number,
      support_phone: updated.support_phone || null,
      support_email: updated.support_email || null,
      facebook_url: updated.facebook_url || null,
      instagram_url: updated.instagram_url || null,
      store_address: updated.store_address || null,
      whatsapp_template: updated.whatsapp_template,
      show_prices: updated.show_prices,
      enable_ordering: updated.enable_ordering,
      enable_offers: updated.enable_offers,
      seo_title: updated.seo_title || null,
      seo_description: updated.seo_description || null,
      footer_text: updated.footer_text || null
    };
    const query = this.settingsRecordId
      ? supabase.from('site_settings').update(settingsRow).eq('id', this.settingsRecordId)
      : supabase.from('site_settings').insert(settingsRow);
    const { data, error } = await query.select('id').single();
    if (error) throw new Error(`تعذر حفظ إعدادات المتجر في قاعدة البيانات: ${error.message}`);

    this.settingsRecordId = data.id;
    if (!this.save(STORAGE_KEYS.SETTINGS, updated)) {
      throw new Error('تم حفظ الإعدادات في قاعدة البيانات لكن تعذر تحديث الذاكرة المحلية.');
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

  public async refreshCategoriesFromDatabase(): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const [{ data: categories, error: categoryError }, { data: subcategories, error: subcategoryError }] = await Promise.all([
      supabase.from('categories').select('*').order('display_order'),
      supabase.from('subcategories').select('*').order('display_order')
    ]);
    if (categoryError) throw new Error(`تعذر تحميل الأقسام من قاعدة البيانات: ${categoryError.message}`);
    if (subcategoryError) throw new Error(`تعذر تحميل التصنيفات الفرعية من قاعدة البيانات: ${subcategoryError.message}`);

    const mapped = (categories || []).map((category) => ({
      ...category,
      subcategories: (subcategories || []).filter((subcategory) => subcategory.category_id === category.id)
    })) as Category[];
    if (!this.save(STORAGE_KEYS.CATEGORIES, mapped)) {
      throw new Error('تعذر تخزين الأقسام المحمّلة محليًا.');
    }
  }

  public async saveCategory(category: Partial<Category> & { name_ar: string; slug: string }, _adminUser?: AdminUser): Promise<Category> {
    const list = this.getCategories(true);
    let updatedCategory: Category;

    if (category.id) {
      const index = list.findIndex(c => c.id === category.id);
      if (index !== -1) {
        updatedCategory = { ...list[index], ...category } as Category;
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
    }

    const supabase = this.requireSupabase('حفظ القسم');
    const { error: categoryError } = await supabase.from('categories').upsert({
      id: updatedCategory.id,
      name_ar: updatedCategory.name_ar,
      name_en: updatedCategory.name_en || null,
      slug: updatedCategory.slug,
      icon: updatedCategory.icon || null,
      image_url: updatedCategory.image_url,
      description: updatedCategory.description || null,
      display_order: updatedCategory.display_order,
      is_active: updatedCategory.is_active,
      is_archived: updatedCategory.is_archived || false
    }, { onConflict: 'id' });
    if (categoryError) throw new Error(`تعذر حفظ القسم في قاعدة البيانات: ${categoryError.message}`);

    const subcategoryRows = (updatedCategory.subcategories || []).map((subcategory, index) => ({
      id: subcategory.id,
      category_id: updatedCategory.id,
      name_ar: subcategory.name_ar,
      name_en: subcategory.name_en || null,
      slug: subcategory.slug || `subcategory-${index + 1}`,
      product_types: subcategory.product_types || [],
      display_order: subcategory.display_order || index + 1,
      is_archived: subcategory.is_archived || false
    }));

    if (subcategoryRows.length > 0) {
      const { error } = await supabase.from('subcategories').upsert(subcategoryRows, { onConflict: 'id' });
      if (error) throw new Error(`تم حفظ القسم لكن تعذر حفظ تصنيفاته الفرعية: ${error.message}`);
    }

    const { data: existingSubcategories, error: readError } = await supabase
      .from('subcategories')
      .select('id')
      .eq('category_id', updatedCategory.id);
    if (readError) throw new Error(`تعذر التحقق من التصنيفات الفرعية الحالية: ${readError.message}`);
    const submittedIds = new Set(subcategoryRows.map((subcategory) => subcategory.id));
    const removedIds = (existingSubcategories || [])
      .map((subcategory) => subcategory.id)
      .filter((id) => !submittedIds.has(id));
    if (removedIds.length > 0) {
      const { error } = await supabase.from('subcategories').update({ is_archived: true }).in('id', removedIds);
      if (error) throw new Error(`تم حفظ القسم لكن تعذر أرشفة التصنيفات التي أزيلت: ${error.message}`);
    }

    const currentIndex = list.findIndex((item) => item.id === updatedCategory.id);
    if (currentIndex === -1) list.push(updatedCategory);
    else list[currentIndex] = updatedCategory;
    if (!this.save(STORAGE_KEYS.CATEGORIES, list)) {
      throw new Error('تم حفظ القسم في قاعدة البيانات لكن تعذر تحديث الذاكرة المحلية.');
    }
    return updatedCategory;
  }

  public async archiveCategory(id: string, _adminUser?: AdminUser): Promise<void> {
    const list = this.getCategories(true);
    const cat = list.find(c => c.id === id);
    if (!cat) throw new Error('القسم المطلوب غير موجود.');
    await this.setCategoryArchived(id, true, list, cat);
  }

  public async restoreCategory(id: string, _adminUser?: AdminUser): Promise<void> {
    const list = this.getCategories(true);
    const cat = list.find(c => c.id === id);
    if (!cat) throw new Error('القسم المطلوب غير موجود.');
    await this.setCategoryArchived(id, false, list, cat);
  }

  private async setCategoryArchived(id: string, isArchived: boolean, list: Category[], category: Category): Promise<void> {
    const supabase = this.requireSupabase('تحديث حالة القسم');
    const { error } = await supabase.from('categories').update({ is_archived: isArchived }).eq('id', id);
    if (error) throw new Error(`تعذر تحديث حالة القسم في قاعدة البيانات: ${error.message}`);
    category.is_archived = isArchived;
    if (!this.save(STORAGE_KEYS.CATEGORIES, list)) {
      throw new Error('تم تحديث القسم في قاعدة البيانات لكن تعذر تحديث الذاكرة المحلية.');
    }
  }

  public async deleteCategory(id: string, _adminUser?: AdminUser): Promise<void> {
    const list = this.getCategories(true);
    const target = list.find(c => c.id === id);
    if (!target) return;
    const supabase = this.requireSupabase('حذف القسم');
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw new Error(`تعذر حذف القسم من قاعدة البيانات: ${error.message}`);
    const remaining = list.filter((category) => category.id !== id);
    if (!this.save(STORAGE_KEYS.CATEGORIES, remaining)) {
      throw new Error('تم حذف القسم من قاعدة البيانات لكن تعذر تحديث الذاكرة المحلية.');
    }
  }

  // --- SUBCATEGORIES CRUD ---
  public async saveSubcategory(
    categoryId: string,
    subcategory: Partial<Subcategory> & { name_ar: string },
    _adminUser?: AdminUser
  ): Promise<Subcategory> {
    const list = this.getCategories(true);
    const cat = list.find(c => c.id === categoryId);
    if (!cat) throw new Error('Parent category not found');

    const subcategories = cat.subcategories || [];

    let updatedSub: Subcategory;
    const baseSlug = subcategory.slug || subcategory.name_ar.toLowerCase().replace(/\s+/g, '-');

    if (subcategory.id) {
      const idx = subcategories.findIndex(s => s.id === subcategory.id);
      if (idx !== -1) {
        updatedSub = {
          ...subcategories[idx],
          ...subcategory,
          category_id: categoryId
        };
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
        display_order: subcategory.display_order || subcategories.length + 1,
        is_archived: false
      };
    }

    const supabase = this.requireSupabase('حفظ التصنيف الفرعي');
    const { error } = await supabase.from('subcategories').upsert({
      id: updatedSub.id,
      category_id: categoryId,
      name_ar: updatedSub.name_ar,
      name_en: updatedSub.name_en || null,
      slug: updatedSub.slug,
      product_types: updatedSub.product_types || [],
      display_order: updatedSub.display_order || 0,
      is_archived: updatedSub.is_archived || false
    }, { onConflict: 'id' });
    if (error) throw new Error(`تعذر حفظ التصنيف الفرعي في قاعدة البيانات: ${error.message}`);

    cat.subcategories = subcategories.some((item) => item.id === updatedSub.id)
      ? subcategories.map((item) => item.id === updatedSub.id ? updatedSub : item)
      : [...subcategories, updatedSub];
    if (!this.save(STORAGE_KEYS.CATEGORIES, list)) {
      throw new Error('تم حفظ التصنيف الفرعي في قاعدة البيانات لكن تعذر تحديث الذاكرة المحلية.');
    }
    return updatedSub;
  }

  public async archiveSubcategory(categoryId: string, subcategoryId: string, _adminUser?: AdminUser): Promise<void> {
    const list = this.getCategories(true);
    const cat = list.find(c => c.id === categoryId);
    const sub = cat?.subcategories?.find(s => s.id === subcategoryId);
    if (!sub) throw new Error('التصنيف الفرعي المطلوب غير موجود.');

    const supabase = this.requireSupabase('أرشفة التصنيف الفرعي');
    const { error } = await supabase.from('subcategories').update({ is_archived: true }).eq('id', subcategoryId);
    if (error) throw new Error(`تعذر أرشفة التصنيف الفرعي في قاعدة البيانات: ${error.message}`);
    sub.is_archived = true;
    if (!this.save(STORAGE_KEYS.CATEGORIES, list)) throw new Error('تمت الأرشفة لكن تعذر تحديث الذاكرة المحلية.');
  }

  public async restoreSubcategory(categoryId: string, subcategoryId: string, _adminUser?: AdminUser): Promise<void> {
    const list = this.getCategories(true);
    const cat = list.find(c => c.id === categoryId);
    const sub = cat?.subcategories?.find(s => s.id === subcategoryId);
    if (!sub) throw new Error('التصنيف الفرعي المطلوب غير موجود.');

    const supabase = this.requireSupabase('استعادة التصنيف الفرعي');
    const { error } = await supabase.from('subcategories').update({ is_archived: false }).eq('id', subcategoryId);
    if (error) throw new Error(`تعذر استعادة التصنيف الفرعي في قاعدة البيانات: ${error.message}`);
    sub.is_archived = false;
    if (!this.save(STORAGE_KEYS.CATEGORIES, list)) throw new Error('تمت الاستعادة لكن تعذر تحديث الذاكرة المحلية.');
  }

  public async deleteSubcategory(categoryId: string, subcategoryId: string, _adminUser?: AdminUser): Promise<void> {
    const list = this.getCategories(true);
    const cat = list.find(c => c.id === categoryId);
    if (!cat || !cat.subcategories) return;

    const target = cat.subcategories.find(s => s.id === subcategoryId);
    if (!target) return;
    const supabase = this.requireSupabase('حذف التصنيف الفرعي');
    const { error } = await supabase.from('subcategories').delete().eq('id', subcategoryId);
    if (error) throw new Error(`تعذر حذف التصنيف الفرعي من قاعدة البيانات: ${error.message}`);
    cat.subcategories = cat.subcategories.filter(s => s.id !== subcategoryId);
    if (!this.save(STORAGE_KEYS.CATEGORIES, list)) throw new Error('تم حذف التصنيف الفرعي لكن تعذر تحديث الذاكرة المحلية.');
  }

  // --- BRANDS ---
  public getBrands(includeArchived = false): Brand[] {
    const list = this.load<Brand[]>(STORAGE_KEYS.BRANDS, INITIAL_BRANDS);
    return includeArchived ? list : list.filter(b => !b.is_archived);
  }

  public async refreshBrandsFromDatabase(): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const { data, error } = await supabase.from('brands').select('*').order('name_ar');
    if (error) throw new Error(`تعذر تحميل العلامات التجارية من قاعدة البيانات: ${error.message}`);
    if (!this.save(STORAGE_KEYS.BRANDS, (data || []) as Brand[])) {
      throw new Error('تعذر تخزين العلامات التجارية المحمّلة محليًا.');
    }
  }

  public async saveBrand(brand: Partial<Brand> & { name_ar: string; slug: string }, _adminUser?: AdminUser): Promise<Brand> {
    const list = this.getBrands(true);
    let updatedBrand: Brand;

    if (brand.id) {
      const idx = list.findIndex(b => b.id === brand.id);
      if (idx !== -1) {
        updatedBrand = { ...list[idx], ...brand } as Brand;
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
    }

    const supabase = this.requireSupabase('حفظ العلامة التجارية');
    const { error } = await supabase.from('brands').upsert({
      id: updatedBrand.id,
      name_ar: updatedBrand.name_ar,
      name_en: updatedBrand.name_en || null,
      slug: updatedBrand.slug,
      logo_url: updatedBrand.logo_url || null,
      description: updatedBrand.description || null,
      is_active: updatedBrand.is_active,
      is_archived: updatedBrand.is_archived || false
    }, { onConflict: 'id' });
    if (error) throw new Error(`تعذر حفظ العلامة التجارية في قاعدة البيانات: ${error.message}`);

    const currentIndex = list.findIndex((item) => item.id === updatedBrand.id);
    if (currentIndex === -1) list.push(updatedBrand);
    else list[currentIndex] = updatedBrand;
    if (!this.save(STORAGE_KEYS.BRANDS, list)) {
      throw new Error('تم حفظ العلامة التجارية في قاعدة البيانات لكن تعذر تحديث الذاكرة المحلية.');
    }
    return updatedBrand;
  }

  public async deleteBrand(id: string, _adminUser?: AdminUser): Promise<void> {
    const list = this.getBrands(true);
    const target = list.find(b => b.id === id);
    if (!target) return;
    const supabase = this.requireSupabase('حذف العلامة التجارية');
    const { error } = await supabase.from('brands').delete().eq('id', id);
    if (error) throw new Error(`تعذر حذف العلامة التجارية من قاعدة البيانات: ${error.message}`);
    const remaining = list.filter((brand) => brand.id !== id);
    if (!this.save(STORAGE_KEYS.BRANDS, remaining)) {
      throw new Error('تم حذف العلامة التجارية من قاعدة البيانات لكن تعذر تحديث الذاكرة المحلية.');
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

    const { data, error } = await supabase.from('products').select('*').order('display_order');
    if (error) throw new Error(`تعذر تحميل المنتجات من قاعدة البيانات: ${error.message}`);
    if (!data) return;

    const localProducts = this.getProducts(true);
    const productsById = new Map(localProducts.map((product) => [product.id, product]));
    for (const product of data as Product[]) productsById.set(product.id, product);
    this.save(STORAGE_KEYS.PRODUCTS, [...productsById.values()]);
  }

  public async archiveProduct(id: string, _adminUser?: AdminUser): Promise<void> {
    await this.setProductArchived(id, true);
  }

  public async restoreProduct(id: string, _adminUser?: AdminUser): Promise<void> {
    await this.setProductArchived(id, false);
  }

  private async setProductArchived(id: string, isArchived: boolean): Promise<void> {
    const list = this.getProducts(true);
    const prod = list.find(p => p.id === id);
    if (!prod) throw new Error('المنتج المطلوب غير موجود.');
    const supabase = this.requireSupabase('تحديث حالة المنتج');
    const { error } = await supabase.from('products').update({ is_archived: isArchived }).eq('id', id);
    if (error) throw new Error(`تعذر تحديث حالة المنتج في قاعدة البيانات: ${error.message}`);
    prod.is_archived = isArchived;
    if (!this.save(STORAGE_KEYS.PRODUCTS, list)) {
      throw new Error('تم تحديث المنتج في قاعدة البيانات لكن تعذر تحديث الذاكرة المحلية.');
    }
  }

  public async deleteProduct(id: string, _adminUser?: AdminUser): Promise<void> {
    const list = this.getProducts(true);
    if (!list.some((product) => product.id === id)) return;
    const supabase = this.requireSupabase('حذف المنتج');
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw new Error(`تعذر حذف المنتج من قاعدة البيانات: ${error.message}`);
    if (!this.save(STORAGE_KEYS.PRODUCTS, list.filter((product) => product.id !== id))) {
      throw new Error('تم حذف المنتج من قاعدة البيانات لكن تعذر تحديث الذاكرة المحلية.');
    }
  }

  public getDeliveryZones(): Governorate[] {
    return this.readLocal(STORAGE_KEYS.DELIVERY_ZONES, this.deliveryZones);
  }

  public getDeliveryFeeInfo(governorate?: string): { fee: number | null; textAr: string; textEn: string } {
    const zone = this.getDeliveryZones().find((item) => item.name_ar === governorate || item.id === governorate);
    if (!zone) return getDeliveryFeeByGov(governorate);
    if (zone.delivery_fee === null || zone.delivery_fee === undefined) {
      return { fee: null, textAr: 'لم يحدد بعد', textEn: 'To be determined' };
    }
    return {
      fee: zone.delivery_fee,
      textAr: `${zone.delivery_fee} ج.م`,
      textEn: `${zone.delivery_fee} EGP`
    };
  }

  public async refreshDeliveryZonesFromDatabase(): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const [{ data: zones, error: zoneError }, { data: areas, error: areaError }] = await Promise.all([
      supabase.from('delivery_zones').select('governorate,governorate_en,delivery_fee,is_active').eq('is_active', true).order('governorate'),
      supabase.from('delivery_zone_areas').select('governorate,area_ar').order('area_ar')
    ]);
    if (zoneError) throw new Error(`تعذر تحميل مناطق التوصيل: ${zoneError.message}`);
    if (areaError) throw new Error(`تعذر تحميل المناطق التابعة لمحافظات التوصيل: ${areaError.message}`);

    const areasByGovernorate = new Map<string, string[]>();
    for (const area of areas || []) {
      const list = areasByGovernorate.get(area.governorate) || [];
      list.push(area.area_ar);
      areasByGovernorate.set(area.governorate, list);
    }

    const canonicalByName = new Map(EGYPTIAN_GOVERNORATES.map((zone) => [zone.name_ar, zone]));
    this.deliveryZones = (zones || []).map((zone) => {
      const canonical = canonicalByName.get(zone.governorate);
      return {
        id: canonical?.id || zone.governorate,
        name_ar: zone.governorate,
        name_en: zone.governorate_en || canonical?.name_en || zone.governorate,
        delivery_fee: zone.delivery_fee === null ? null : Number(zone.delivery_fee),
        cities: areasByGovernorate.get(zone.governorate) || []
      };
    });
    if (!this.save(STORAGE_KEYS.DELIVERY_ZONES, this.deliveryZones)) {
      throw new Error('تعذر تخزين بيانات التوصيل المحمّلة محليًا.');
    }
  }

  // --- ORDERS ---
  public getOrders(): Order[] {
    if (getSupabaseClient()) {
      const databaseOrders = this.readLocal<Order[] | null>(STORAGE_KEYS.ORDERS_DATABASE, null);
      if (databaseOrders) return databaseOrders;
    }
    return this.load<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  }

  public async refreshOrdersFromDatabase(): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('اتصال قاعدة البيانات غير متاح.');

    const pageSize = 1000;
    const rows: Array<Record<string, unknown>> = [];
    for (let offset = 0; ; offset += pageSize) {
      const { data, error } = await supabase.from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + pageSize - 1);
      if (error) throw new Error(`تعذر تحميل الطلبات من قاعدة البيانات: ${error.message}`);
      rows.push(...(data || []) as Array<Record<string, unknown>>);
      if (!data || data.length < pageSize) break;
    }

    const orders = rows.map((row) => {
      const { customer_info, ...orderFields } = row as Record<string, unknown> & { customer_info?: CustomerInfo };
      if (!customer_info) throw new Error(`بيانات العميل غير موجودة للطلب ${String(orderFields.id)}.`);
      return { ...orderFields, customer: customer_info } as Order;
    });
    if (!this.save(STORAGE_KEYS.ORDERS_DATABASE, orders)) {
      throw new Error('تعذر تخزين الطلبات المحمّلة محليًا.');
    }
  }

  public getOrderById(id: string): Order | undefined {
    return this.getOrders().find(o => o.id === id);
  }

  public async updateOrderStatus(orderId: string, newStatus: OrderStatus, note?: string, _adminUser?: AdminUser): Promise<Order> {
    const orders = this.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    const supabase = this.requireSupabase('تحديث حالة الطلب');
    const { data, error } = await supabase.rpc('update_order_status', {
      order_id_input: orderId,
      status_input: newStatus,
      note_input: note || null
    });
    if (error) throw new Error(`تعذر تحديث حالة الطلب في قاعدة البيانات: ${error.message}`);
    const { customer_info, ...orderFields } = data as Record<string, unknown> & { customer_info?: CustomerInfo };
    if (!customer_info) throw new Error('تم تحديث الطلب لكن استجابة قاعدة البيانات لا تحتوي بيانات العميل.');
    const updatedOrder = { ...orderFields, customer: customer_info } as Order;
    const updatedOrders = orders.map((current) => current.id === orderId ? updatedOrder : current);
    if (!this.save(STORAGE_KEYS.ORDERS_DATABASE, updatedOrders)) {
      throw new Error('تم تحديث الطلب في قاعدة البيانات لكن تعذر تحديث الذاكرة المحلية.');
    }
    return updatedOrder;
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
    if (getSupabaseClient()) {
      const databaseEvents = this.readLocal<AnalyticsEvent[] | null>(STORAGE_KEYS.ANALYTICS_DATABASE, null);
      if (databaseEvents) return databaseEvents;
    }
    return this.load<AnalyticsEvent[]>(STORAGE_KEYS.ANALYTICS, []);
  }

  public async refreshAnalyticsFromDatabase(): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const { data, error } = await supabase.from('analytics_events').select('*')
      .order('timestamp', { ascending: false })
      .limit(1000);
    if (error) throw new Error(`تعذر تحميل التحليلات من قاعدة البيانات: ${error.message}`);
    if (!this.save(STORAGE_KEYS.ANALYTICS_DATABASE, (data || []) as AnalyticsEvent[])) {
      throw new Error('تعذر تخزين التحليلات المحمّلة محليًا.');
    }
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
    if (getSupabaseClient()) {
      const databaseUsers = this.readLocal<AdminUser[] | null>(STORAGE_KEYS.ADMIN_USERS_DATABASE, null);
      if (databaseUsers) return databaseUsers;
    }
    return this.load<AdminUser[]>(STORAGE_KEYS.ADMIN_USERS, INITIAL_ADMIN_USERS);
  }

  public async refreshAdminUsersFromDatabase(): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const { data, error } = await supabase.from('admin_users')
      .select('id,auth_user_id,name,email,role,avatar_url,last_login_at,created_at')
      .order('created_at');
    if (error) throw new Error(`تعذر تحميل حسابات الإدارة من قاعدة البيانات: ${error.message}`);
    if (!this.save(STORAGE_KEYS.ADMIN_USERS_DATABASE, (data || []) as AdminUser[])) {
      throw new Error('تعذر تخزين حسابات الإدارة المحمّلة محليًا.');
    }
  }

  public async inviteAdminUser(input: { name: string; email: string; role: AdminUser['role'] }): Promise<AdminUser> {
    const supabase = this.requireSupabase('دعوة مستخدم إداري');
    const { data, error } = await supabase.functions.invoke<{ adminUser?: AdminUser; error?: string }>('invite-admin-user', {
      body: {
        name: input.name.trim(),
        email: input.email.trim(),
        role: input.role
      }
    });
    if (error) throw new Error(`تعذر إرسال دعوة المستخدم الإداري: ${error.message}`);
    if (!data?.adminUser) throw new Error(data?.error || 'لم تُرجع خدمة الدعوات حسابًا إداريًا.');
    await this.refreshAdminUsersFromDatabase();
    return data.adminUser;
  }

  // --- ACTIVITY LOGS ---
  public getActivityLogs(): ActivityLog[] {
    if (getSupabaseClient()) {
      const databaseLogs = this.readLocal<ActivityLog[] | null>(STORAGE_KEYS.ACTIVITY_LOGS_DATABASE, null);
      if (databaseLogs) return databaseLogs;
    }
    return this.load<ActivityLog[]>(STORAGE_KEYS.ACTIVITY_LOGS, []);
  }

  public async refreshActivityLogsFromDatabase(): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const { data, error } = await supabase.from('admin_activity_logs').select('*')
      .order('timestamp', { ascending: false })
      .limit(500);
    if (error) throw new Error(`تعذر تحميل سجل العمليات من قاعدة البيانات: ${error.message}`);
    if (!this.save(STORAGE_KEYS.ACTIVITY_LOGS_DATABASE, (data || []) as ActivityLog[])) {
      throw new Error('تعذر تخزين سجل العمليات المحمّل محليًا.');
    }
  }

  public logActivity(
    _admin: AdminUser,
    _action: string,
    _target_type: ActivityLog['target_type'],
    _target_id?: string,
    _target_title?: string,
    _details?: string
  ): void {
    void this.refreshActivityLogsFromDatabase().catch((error: unknown) => {
      console.error('Failed to refresh audit logs after an administrative change:', error);
      captureAppException(error, { source: 'dataStore.refreshActivityLogs' });
    });
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
