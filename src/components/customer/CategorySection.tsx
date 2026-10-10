import React, { useState, useEffect } from 'react';
import {
  UtensilsCrossed,
  Boxes,
  Sparkles,
  PackageCheck,
  Bath,
  Layers,
  ArrowLeft,
  Grid,
  Zap,
  Palette,
  Shirt,
  Home,
  Flower2,
  Gift
} from 'lucide-react';
import { Category } from '../../types';
import { dataStore } from '../../services/dataStore';
import { analytics } from '../../services/analytics';
import { useLanguage } from '../../context/LanguageContext';

interface CategorySectionProps {
  onSelectCategory: (categoryId: string) => void;
  onViewAllCategories: () => void;
}

export const CategorySection: React.FC<CategorySectionProps> = ({
  onSelectCategory,
  onViewAllCategories
}) => {
  const { lang, t, tx } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    setCategories(dataStore.getCategories());
    return dataStore.subscribe(() => {
      setCategories(dataStore.getCategories());
    });
  }, []);

  const getCategoryIcon = (iconName?: string) => {
    switch (iconName) {
      case 'UtensilsCrossed':
        return <UtensilsCrossed size={22} />;
      case 'Boxes':
        return <Boxes size={22} />;
      case 'Sparkles':
        return <Sparkles size={22} />;
      case 'Zap':
        return <Zap size={22} />;
      case 'Palette':
        return <Palette size={22} />;
      case 'Bath':
        return <Bath size={22} />;
      case 'Shirt':
        return <Shirt size={22} />;
      case 'Home':
        return <Home size={22} />;
      case 'Flower2':
        return <Flower2 size={22} />;
      case 'Gift':
        return <Gift size={22} />;
      case 'PackageCheck':
        return <PackageCheck size={22} />;
      default:
        return <Layers size={22} />;
    }
  };

  const getCategoryProductsCount = (catId: string) => {
    return dataStore.getProducts().filter((p) => p.category_id === catId).length;
  };

  const handleCategoryClick = (cat: Category) => {
    analytics.track('CATEGORY_VIEW', {
      category_id: cat.id,
      category_name: cat.name_ar,
      slug: cat.slug
    });
    onSelectCategory(cat.id);
  };

  return (
    <section style={{ padding: '60px 0', backgroundColor: '#FFFFFF' }}>
      <div className="container">
        {/* Section Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: '36px',
            flexWrap: 'wrap',
            gap: '16px'
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--primary-700)',
                fontWeight: 700,
                fontSize: '0.85rem',
                marginBottom: '6px'
              }}
            >
              <Grid size={16} />
              <span>{tx(t.categories.sectionBadge)}</span>
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'Cairo, sans-serif' }}>
              {tx(t.categories.sectionTitle)}
            </h2>
          </div>

          <button
            onClick={onViewAllCategories}
            className="btn btn-outline"
            style={{ borderRadius: 'var(--radius-full)', padding: '8px 20px', fontWeight: 700 }}
          >
            <span>{tx(t.categories.viewAll)}</span>
            <ArrowLeft size={16} />
          </button>
        </div>

        {/* Categories Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '20px'
          }}
        >
          {categories.map((cat) => {
            const count = getCategoryProductsCount(cat.id);
            return (
              <div
                key={cat.id}
                onClick={() => handleCategoryClick(cat)}
                style={{
                  position: 'relative',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: '1px solid var(--border-default)',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  height: '240px',
                  backgroundColor: 'var(--bg-surface-subtle)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                  e.currentTarget.style.borderColor = 'var(--primary-600)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  e.currentTarget.style.borderColor = 'var(--border-default)';
                }}
              >
                {/* Background Image */}
                <img
                  src={cat.image_url}
                  alt={lang === 'en' ? (cat.name_en || cat.name_ar) : cat.name_ar}
                  loading="lazy"
                  style={{
                    position: 'absolute',
                    top: 0,
                    insetInlineStart: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />

                {/* Dark Gradient Overlay for readability */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    insetInline: 0,
                    bottom: 0,
                    background: 'linear-gradient(to top, rgba(12, 35, 23, 0.88) 0%, rgba(12, 35, 23, 0.35) 60%, rgba(12, 35, 23, 0.1) 100%)'
                  }}
                />

                {/* Category Icon Badge */}
                <div
                  style={{
                    position: 'absolute',
                    top: '14px',
                    insetInlineEnd: '14px',
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.92)',
                    backdropFilter: 'blur(4px)',
                    color: 'var(--primary-800)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
                  }}
                >
                  {getCategoryIcon(cat.icon)}
                </div>

                {/* Content Box */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    insetInline: 0,
                    padding: '20px 18px',
                    color: '#FFFFFF'
                  }}
                >
                  <h3
                    style={{
                      fontSize: '1.2rem',
                      fontWeight: 800,
                      color: '#FFFFFF',
                      marginBottom: '4px',
                      fontFamily: 'Cairo, sans-serif'
                    }}
                  >
                    {lang === 'en' ? (cat.name_en || cat.name_ar) : cat.name_ar}
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.82rem', color: '#D1FAE5', fontWeight: 600 }}>
                      {count} {lang === 'en' ? (count === 1 ? 'product' : tx(t.categories.productsCount)) : (count === 1 ? 'منتج متوفر' : 'منتجات متوفرة')}
                    </span>
                    <span style={{ fontSize: '0.82rem', color: '#FDE68A', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {tx(t.categoriesPage.browseCategory)} ←
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
