import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  X,
  Sparkles,
  Flame,
  Clock,
  Layers,
  Check,
  Grid3X3,
  ListFilter,
  RotateCcw
} from 'lucide-react';
import { Product, Category, Brand } from '../../types';
import { dataStore } from '../../services/dataStore';
import { ProductCard } from '../common/ProductCard';
import { analytics } from '../../services/analytics';
import { useLanguage } from '../../context/LanguageContext';

interface CatalogPageProps {
  initialCategoryId?: string;
  initialSubcategoryId?: string;
  initialSearchQuery?: string;
  onOpenDetails: (product: Product) => void;
  onSelectCategory: (catId: string, subId?: string) => void;
}

type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'most_viewed' | 'featured';
export type DynamicCollection = 'all' | 'offers' | 'new' | 'best_sellers' | 'most_viewed' | 'featured';

export const CatalogPage: React.FC<CatalogPageProps> = ({
  initialCategoryId,
  initialSubcategoryId,
  initialSearchQuery = '',
  onOpenDetails,
  onSelectCategory
}) => {
  const { lang, t, tx } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  // Filter States
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategoryId || 'all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>(initialSubcategoryId || 'all');
  const [selectedProductType, setSelectedProductType] = useState<string>('all');
  const [selectedCollection, setSelectedCollection] = useState<DynamicCollection>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [filterOffersOnly, setFilterOffersOnly] = useState(false);
  const [filterNewOnly, setFilterNewOnly] = useState(false);
  const [filterFeaturedOnly, setFilterFeaturedOnly] = useState(false);
  const [filterInStockOnly, setFilterInStockOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  useEffect(() => {
    setProducts(dataStore.getProducts());
    setCategories(dataStore.getCategories());
    setBrands(dataStore.getBrands());

    return dataStore.subscribe(() => {
      setProducts(dataStore.getProducts());
      setCategories(dataStore.getCategories());
      setBrands(dataStore.getBrands());
    });
  }, []);

  useEffect(() => {
    if (initialCategoryId) {
      setSelectedCategory(initialCategoryId);
      setSelectedSubcategory(initialSubcategoryId || 'all');
      setSelectedProductType('all');
    }
  }, [initialCategoryId, initialSubcategoryId]);

  useEffect(() => {
    if (initialSearchQuery) {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  // Subcategories of selected category
  const currentCategoryObj = categories.find((c) => c.id === selectedCategory);
  const availableSubcategories = currentCategoryObj 
    ? (currentCategoryObj.subcategories || []).filter((s) => !s.is_archived) 
    : [];
  const currentSubcategoryObj = availableSubcategories.find((s) => s.id === selectedSubcategory);
  const availableProductTypes = currentSubcategoryObj?.product_types || [];

  // Filter and Sort calculation
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = product.name_ar.toLowerCase().includes(q) || (product.name_en || '').toLowerCase().includes(q);
        const matchSku = product.sku.toLowerCase().includes(q);
        const matchDesc = product.description.toLowerCase().includes(q);
        if (!matchName && !matchSku && !matchDesc) return false;
      }

      // Category
      if (selectedCategory !== 'all' && product.category_id !== selectedCategory) {
        return false;
      }

      // Subcategory
      if (selectedSubcategory !== 'all' && product.subcategory_id !== selectedSubcategory) {
        return false;
      }

      // Product Type
      if (selectedProductType !== 'all' && product.product_type !== selectedProductType) {
        return false;
      }

      // Dynamic Collections (Without duplication)
      if (selectedCollection === 'offers' && !product.is_offer && !(product.old_price && product.old_price > product.price)) {
        return false;
      }
      if (selectedCollection === 'new' && !product.is_new) {
        return false;
      }
      if (selectedCollection === 'best_sellers' && (product.request_count || 0) <= 0 && !product.is_featured) {
        return false;
      }
      if (selectedCollection === 'most_viewed' && (product.views_count || 0) <= 0) {
        return false;
      }
      if (selectedCollection === 'featured' && !product.is_featured) {
        return false;
      }

      // Brand
      if (selectedBrand !== 'all' && product.brand_id !== selectedBrand) {
        return false;
      }

      // Badges & Status
      if (filterOffersOnly && !product.is_offer && !(product.old_price && product.old_price > product.price)) {
        return false;
      }
      if (filterNewOnly && !product.is_new) {
        return false;
      }
      if (filterFeaturedOnly && !product.is_featured) {
        return false;
      }
      if (filterInStockOnly && !product.is_available) {
        return false;
      }

      // Price
      if (product.price > maxPrice && product.pricing_mode !== 'on_request') {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === 'price_asc') {
        return a.price - b.price;
      }
      if (sortBy === 'price_desc') {
        return b.price - a.price;
      }
      if (sortBy === 'most_viewed') {
        return (b.views_count || 0) - (a.views_count || 0);
      }
      if (sortBy === 'featured') {
        if (selectedCollection === 'best_sellers') {
          return (b.request_count || 0) - (a.request_count || 0);
        }
        if (selectedCollection === 'most_viewed') {
          return (b.views_count || 0) - (a.views_count || 0);
        }
        if (a.is_featured && !b.is_featured) return -1;
        if (!a.is_featured && b.is_featured) return 1;
        return a.display_order - b.display_order;
      }
      return 0;
    });
  }, [
    products,
    searchQuery,
    selectedCategory,
    selectedSubcategory,
    selectedProductType,
    selectedCollection,
    selectedBrand,
    filterOffersOnly,
    filterNewOnly,
    filterFeaturedOnly,
    filterInStockOnly,
    maxPrice,
    sortBy
  ]);

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedSubcategory('all');
    setSelectedProductType('all');
    setSelectedCollection('all');
    setSelectedBrand('all');
    setFilterOffersOnly(false);
    setFilterNewOnly(false);
    setFilterFeaturedOnly(false);
    setFilterInStockOnly(false);
    setMaxPrice(1000);
    setSortBy('featured');
  };

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedCategory !== 'all' ||
    selectedSubcategory !== 'all' ||
    selectedProductType !== 'all' ||
    selectedCollection !== 'all' ||
    selectedBrand !== 'all' ||
    filterOffersOnly ||
    filterNewOnly ||
    filterFeaturedOnly ||
    filterInStockOnly ||
    maxPrice < 1000;

  return (
    <div style={{ backgroundColor: 'var(--bg-main)', minHeight: '80vh', padding: '36px 0 64px' }}>
      <div className="container">
        {/* Page Title & Breadcrumb */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
            <span>{tx(t.nav.home)}</span>
            <span>/</span>
            <span style={{ color: 'var(--primary-700)', fontWeight: 600 }}>{tx(t.catalog.title)}</span>
            {currentCategoryObj && (
              <>
                <span>/</span>
                <span style={{ color: 'var(--text-main)', fontWeight: 700 }}>{lang === 'en' ? (currentCategoryObj.name_en || currentCategoryObj.name_ar) : currentCategoryObj.name_ar}</span>
              </>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-main)', fontFamily: 'Cairo, sans-serif' }}>
                {tx(t.catalog.title)}
              </h1>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                {products.length} {tx(t.catalog.resultsCount)}
              </p>
            </div>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
              className="btn btn-outline"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <Filter size={18} />
              <span>{tx(t.catalog.filters)}{hasActiveFilters && (lang === 'en' ? ' (active)' : ' (مفعل)')}</span>
            </button>
          </div>
        </div>

        {/* Layout Grid: Sidebar Filters + Products Section */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '280px 1fr',
            gap: '32px',
            alignItems: 'start'
          }}
          className="catalog-grid-layout"
        >
          {/* Filters Sidebar */}
          <aside
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-default)',
              padding: '24px',
              boxShadow: 'var(--shadow-xs)',
              position: 'sticky',
              top: '100px'
            }}
            className={isMobileFiltersOpen ? 'mobile-filter-drawer-open' : 'catalog-sidebar'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Filter size={18} color="var(--primary-700)" />
                <span>{tx(t.catalog.filters)}</span>
              </h3>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent-600)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {tx(t.catalog.resetFilters)}
                </button>
              )}
            </div>

            {/* Categories list */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '10px', color: 'var(--text-main)' }}>
                {tx(t.catalog.mainCategory)}
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedSubcategory('all');
                  }}
                  style={{
                    textAlign: lang === 'ar' ? 'right' : 'left',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    backgroundColor: selectedCategory === 'all' ? 'var(--primary-100)' : 'transparent',
                    color: selectedCategory === 'all' ? 'var(--primary-900)' : 'var(--text-secondary)',
                    fontWeight: selectedCategory === 'all' ? 700 : 500,
                    fontSize: '0.88rem',
                    cursor: 'pointer'
                  }}
                >
                  {tx(t.catalog.allCategories)} ({products.length})
                </button>

                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  const catCount = products.filter((p) => p.category_id === cat.id).length;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setSelectedSubcategory('all');
                      }}
                      style={{
                        textAlign: lang === 'ar' ? 'right' : 'left',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-md)',
                        border: 'none',
                        backgroundColor: isSelected ? 'var(--primary-100)' : 'transparent',
                        color: isSelected ? 'var(--primary-900)' : 'var(--text-secondary)',
                        fontWeight: isSelected ? 700 : 500,
                        fontSize: '0.88rem',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <span>{lang === 'en' ? (cat.name_en || cat.name_ar) : cat.name_ar}</span>
                      <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>({catCount})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Subcategories (if available) */}
            {availableSubcategories && availableSubcategories.length > 0 && (
              <div style={{ marginBottom: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '10px', color: 'var(--text-main)' }}>
                  {tx(t.catalog.subcategory)}
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <button
                    onClick={() => {
                      setSelectedSubcategory('all');
                      setSelectedProductType('all');
                    }}
                    style={{
                      textAlign: lang === 'ar' ? 'right' : 'left',
                      padding: '6px 10px',
                      borderRadius: 'var(--radius-sm)',
                      border: 'none',
                      backgroundColor: selectedSubcategory === 'all' ? 'var(--primary-50)' : 'transparent',
                      color: selectedSubcategory === 'all' ? 'var(--primary-800)' : 'var(--text-secondary)',
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      fontWeight: selectedSubcategory === 'all' ? 700 : 500
                    }}
                  >
                    {tx(t.catalog.all)}
                  </button>
                  {availableSubcategories.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => {
                        setSelectedSubcategory(sub.id);
                        setSelectedProductType('all');
                      }}
                      style={{
                        textAlign: lang === 'ar' ? 'right' : 'left',
                        padding: '6px 10px',
                        borderRadius: 'var(--radius-sm)',
                        border: 'none',
                        backgroundColor: selectedSubcategory === sub.id ? 'var(--primary-50)' : 'transparent',
                        color: selectedSubcategory === sub.id ? 'var(--primary-800)' : 'var(--text-secondary)',
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        fontWeight: selectedSubcategory === sub.id ? 700 : 500
                      }}
                    >
                      {lang === 'en' ? (sub.name_en || sub.name_ar) : sub.name_ar}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Product Types (Hierarchy Level 3) */}
            {availableProductTypes && availableProductTypes.length > 0 && (
              <div style={{ marginBottom: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '10px', color: 'var(--text-main)' }}>
                  {lang === 'ar' ? 'نوع المنتج' : 'Product Type'}
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  <button
                    onClick={() => setSelectedProductType('all')}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 'var(--radius-full)',
                      border: '1px solid var(--border-default)',
                      backgroundColor: selectedProductType === 'all' ? 'var(--primary-700)' : '#FFFFFF',
                      color: selectedProductType === 'all' ? '#FFFFFF' : 'var(--text-secondary)',
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      fontWeight: selectedProductType === 'all' ? 700 : 500,
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {tx(t.catalog.all)}
                  </button>
                  {availableProductTypes.map((pt, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedProductType(pt)}
                      style={{
                        padding: '5px 12px',
                        borderRadius: 'var(--radius-full)',
                        border: '1px solid var(--border-default)',
                        backgroundColor: selectedProductType === pt ? 'var(--primary-700)' : '#FFFFFF',
                        color: selectedProductType === pt ? '#FFFFFF' : 'var(--text-secondary)',
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        fontWeight: selectedProductType === pt ? 700 : 500,
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {pt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Badges Filters */}
            <div style={{ marginBottom: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '10px', color: 'var(--text-main)' }}>
                {tx(t.catalog.offerType)}
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input
                    type="checkbox"
                    checked={filterOffersOnly}
                    onChange={(e) => setFilterOffersOnly(e.target.checked)}
                    style={{ accentColor: 'var(--accent-500)' }}
                  />
                  <span>{tx(t.catalog.offersOnly)} 🔥</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input
                    type="checkbox"
                    checked={filterNewOnly}
                    onChange={(e) => setFilterNewOnly(e.target.checked)}
                    style={{ accentColor: 'var(--primary-700)' }}
                  />
                  <span>{tx(t.catalog.newOnly)}</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input
                    type="checkbox"
                    checked={filterFeaturedOnly}
                    onChange={(e) => setFilterFeaturedOnly(e.target.checked)}
                    style={{ accentColor: 'var(--primary-700)' }}
                  />
                  <span>{tx(t.catalog.featuredOnly)}</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input
                    type="checkbox"
                    checked={filterInStockOnly}
                    onChange={(e) => setFilterInStockOnly(e.target.checked)}
                    style={{ accentColor: 'var(--primary-700)' }}
                  />
                  <span>{tx(t.catalog.inStockOnly)}</span>
                </label>
              </div>
            </div>

            {/* Price Slider */}
            <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {tx(t.catalog.maxPrice)}
                </label>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary-900)' }}>
                  {maxPrice.toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-EG')} {tx(t.general.currency)}
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="1000"
                step="25"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--primary-700)' }}
              />
            </div>
          </aside>

          {/* Main Products Grid */}
          <main>
            {/* Dynamic Collections Tab Bar */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                overflowX: 'auto',
                paddingBottom: '12px',
                marginBottom: '16px',
                scrollbarWidth: 'none'
              }}
            >
              {[
                { id: 'all', label: lang === 'en' ? 'All Products' : 'جميع المنتجات', icon: '🛍️' },
                { id: 'offers', label: lang === 'en' ? 'Special Offers' : 'العروض والتخفيضات', icon: '🔥' },
                { id: 'new', label: lang === 'en' ? 'New Arrivals' : 'وصل حديثًا', icon: '✨' },
                { id: 'best_sellers', label: lang === 'en' ? 'Best Sellers' : 'الأكثر مبيعًا', icon: '🏆' },
                { id: 'most_viewed', label: lang === 'en' ? 'Most Viewed' : 'الأكثر مشاهدة', icon: '👁️' },
                { id: 'featured', label: lang === 'en' ? "Bidaya's Choice" : 'اختيارات Bidaya Home', icon: '⭐' }
              ].map((col) => {
                const isSelected = selectedCollection === col.id;
                return (
                  <button
                    key={col.id}
                    onClick={() => setSelectedCollection(col.id as DynamicCollection)}
                    style={{
                      whiteSpace: 'nowrap',
                      padding: '8px 16px',
                      borderRadius: 'var(--radius-full)',
                      border: `1.5px solid ${isSelected ? 'var(--primary-700)' : 'var(--border-default)'}`,
                      backgroundColor: isSelected ? 'var(--primary-700)' : '#FFFFFF',
                      color: isSelected ? '#FFFFFF' : 'var(--text-main)',
                      fontSize: '0.85rem',
                      fontWeight: isSelected ? 800 : 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span>{col.icon}</span>
                    <span>{col.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Top Toolbar: Search summary, active tags, and Sorting dropdown */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                padding: '16px 20px',
                border: '1px solid var(--border-default)',
                marginBottom: '24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '1rem' }}>
                  {filteredProducts.length}
                </span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  {tx(t.catalog.matchingResults)}
                </span>
              </div>

              {/* Sorting Select */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ArrowUpDown size={16} color="var(--text-muted)" />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{tx(t.catalog.sortBy)}:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  style={{
                    border: '1.5px solid var(--border-default)',
                    borderRadius: 'var(--radius-md)',
                    padding: '6px 12px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    outline: 'none',
                    backgroundColor: 'var(--bg-surface-subtle)',
                    cursor: 'pointer'
                  }}
                >
                  <option value="featured">{tx(t.catalog.sortFeatured)}</option>
                  <option value="newest">{tx(t.catalog.sortNewest)}</option>
                  <option value="price_asc">{tx(t.catalog.sortPriceAsc)}</option>
                  <option value="price_desc">{tx(t.catalog.sortPriceDesc)}</option>
                  <option value="most_viewed">{tx(t.catalog.sortMostViewed)}</option>
                </select>
              </div>
            </div>

            {/* Active Filters Pills Bar */}
            {hasActiveFilters && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{tx(t.catalog.activeFilters)}</span>
                
                {searchQuery && (
                  <span className="badge" style={{ backgroundColor: 'var(--primary-50)', color: 'var(--primary-800)', border: '1px solid var(--primary-200)' }}>
                    {tx(t.catalog.searchTag)}: "{searchQuery}"
                    <X size={12} style={{ cursor: 'pointer', marginInlineStart: '4px' }} onClick={() => setSearchQuery('')} />
                  </span>
                )}

                {selectedCategory !== 'all' && (
                  <span className="badge" style={{ backgroundColor: 'var(--primary-50)', color: 'var(--primary-800)', border: '1px solid var(--primary-200)' }}>
                    {lang === 'en' ? (currentCategoryObj?.name_en || currentCategoryObj?.name_ar) : currentCategoryObj?.name_ar}
                    <X size={12} style={{ cursor: 'pointer', marginInlineStart: '4px' }} onClick={() => { setSelectedCategory('all'); setSelectedSubcategory('all'); setSelectedProductType('all'); }} />
                  </span>
                )}

                {selectedSubcategory !== 'all' && (
                  <span className="badge" style={{ backgroundColor: 'var(--primary-50)', color: 'var(--primary-800)', border: '1px solid var(--primary-200)' }}>
                    {lang === 'en' ? (currentSubcategoryObj?.name_en || currentSubcategoryObj?.name_ar) : currentSubcategoryObj?.name_ar}
                    <X size={12} style={{ cursor: 'pointer', marginInlineStart: '4px' }} onClick={() => { setSelectedSubcategory('all'); setSelectedProductType('all'); }} />
                  </span>
                )}

                {selectedProductType !== 'all' && (
                  <span className="badge" style={{ backgroundColor: 'var(--primary-100)', color: 'var(--primary-900)', border: '1px solid var(--primary-300)' }}>
                    {lang === 'ar' ? `نوع المنتج: ${selectedProductType}` : `Type: ${selectedProductType}`}
                    <X size={12} style={{ cursor: 'pointer', marginInlineStart: '4px' }} onClick={() => setSelectedProductType('all')} />
                  </span>
                )}

                {selectedCollection !== 'all' && (
                  <span className="badge" style={{ backgroundColor: '#FEF3C7', color: '#92400E', border: '1px solid #FCD34D' }}>
                    {selectedCollection === 'offers' ? '🔥 العروض' :
                     selectedCollection === 'new' ? '✨ وصل حديثًا' :
                     selectedCollection === 'best_sellers' ? '🏆 الأكثر مبيعًا' :
                     selectedCollection === 'most_viewed' ? '👁️ الأكثر مشاهدة' :
                     '⭐ اختيارات Bidaya Home'}
                    <X size={12} style={{ cursor: 'pointer', marginInlineStart: '4px' }} onClick={() => setSelectedCollection('all')} />
                  </span>
                )}

                {filterOffersOnly && (
                  <span className="badge badge-offer">
                    {tx(t.catalog.offersOnly)}
                    <X size={12} style={{ cursor: 'pointer', marginInlineStart: '4px' }} onClick={() => setFilterOffersOnly(false)} />
                  </span>
                )}

                {filterNewOnly && (
                  <span className="badge badge-new">
                    {tx(t.catalog.newOnly)}
                    <X size={12} style={{ cursor: 'pointer', marginInlineStart: '4px' }} onClick={() => setFilterNewOnly(false)} />
                  </span>
                )}

                <button
                  onClick={clearAllFilters}
                  style={{ background: 'none', border: 'none', color: '#DC2626', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 700 }}
                >
                  {tx(t.catalog.clearAll)}
                </button>
              </div>
            )}

            {/* Products Grid / Empty State */}
            {filteredProducts.length === 0 ? (
              <div
                style={{
                  padding: '60px 20px',
                  textAlign: 'center',
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-default)'
                }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--bg-surface-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    color: 'var(--text-muted)'
                  }}
                >
                  <Search size={28} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-main)' }}>
                  {tx(t.catalog.noProducts)}
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '24px', maxWidth: '360px', margin: '0 auto 24px' }}>
                  {tx(t.catalog.noProductsDesc)}
                </p>
                <button
                  onClick={clearAllFilters}
                  className="btn btn-primary"
                  style={{ borderRadius: 'var(--radius-full)' }}
                >
                  {tx(t.catalog.showAllProducts)}
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                  gap: '20px'
                }}
              >
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onOpenDetails={onOpenDetails}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .catalog-grid-layout {
            grid-template-columns: 1fr !important;
          }
          .catalog-sidebar {
            display: none !important;
          }
          .mobile-filter-drawer-open {
            display: block !important;
            margin-bottom: 24px;
          }
        }
      `}</style>
    </div>
  );
};
