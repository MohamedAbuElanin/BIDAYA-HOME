import React, { useState, useEffect } from 'react';
import { Layers, ArrowLeft } from 'lucide-react';
import { Category } from '../../types';
import { dataStore } from '../../services/dataStore';
import { analytics } from '../../services/analytics';
import { useLanguage } from '../../context/LanguageContext';

interface CategoriesPageProps {
  onSelectCategory: (categoryId: string, subcategoryId?: string) => void;
}

export const CategoriesPage: React.FC<CategoriesPageProps> = ({ onSelectCategory }) => {
  const { lang, t, tx } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    setCategories(dataStore.getCategories());
    return dataStore.subscribe(() => {
      setCategories(dataStore.getCategories());
    });
  }, []);

  const getProductCount = (catId: string) => {
    return dataStore.getProducts().filter(p => p.category_id === catId).length;
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-main)', minHeight: '80vh', padding: '40px 0 70px' }}>
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 40px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--primary-700)',
              fontWeight: 700,
              fontSize: '0.85rem',
              marginBottom: '8px'
            }}
          >
            <Layers size={16} />
            <span>{tx(t.categoriesPage.title)}</span>
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '12px', fontFamily: 'Cairo, sans-serif' }}>
            {tx(t.categoriesPage.title)}
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
            {tx(t.categoriesPage.subtitle)}
          </p>
        </div>

        {/* Categories List Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '28px'
          }}
        >
          {categories.map((cat) => {
            const count = getProductCount(cat.id);
            return (
              <div
                key={cat.id}
                onClick={() => {
                  analytics.track('CATEGORY_VIEW', { category_id: cat.id, category_name: lang === 'en' ? (cat.name_en || cat.name_ar) : cat.name_ar });
                  onSelectCategory(cat.id);
                }}
                className="card"
                style={{
                  cursor: 'pointer',
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-xl)',
                  overflow: 'hidden',
                  border: '1px solid var(--border-default)',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  display: 'flex',
                  flexDirection: 'column'
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
                <div style={{ position: 'relative', width: '100%', height: '200px', overflow: 'hidden' }}>
                  <img
                    src={cat.image_url}
                    alt={lang === 'en' ? (cat.name_en || cat.name_ar) : cat.name_ar}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      insetInlineEnd: '12px',
                      backgroundColor: 'rgba(255,255,255,0.92)',
                      padding: '4px 12px',
                      borderRadius: 'var(--radius-full)',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      color: 'var(--primary-800)'
                    }}
                  >
                    {count} {lang === 'en' ? (count === 1 ? 'product' : tx(t.categories.productsCount)) : (count === 1 ? 'منتج' : tx(t.categories.productsCount))}
                  </div>
                </div>

                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px', fontFamily: 'Cairo, sans-serif' }}>
                      {lang === 'en' ? (cat.name_en || cat.name_ar) : cat.name_ar}
                    </h3>
                    {lang === 'ar' && cat.description && (
                      <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.55', marginBottom: '16px' }}>
                        {cat.description}
                      </p>
                    )}

                    {/* Subcategories tags */}
                    {cat.subcategories && cat.subcategories.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                        {cat.subcategories.map((sub) => (
                          <button
                            key={sub.id}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectCategory(cat.id, sub.id);
                            }}
                            style={{
                              fontSize: '0.75rem',
                              backgroundColor: 'var(--bg-surface-subtle)',
                              padding: '3px 8px',
                              borderRadius: 'var(--radius-sm)',
                              color: 'var(--text-secondary)',
                              border: '1px solid var(--border-subtle)',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--primary-50)';
                              e.currentTarget.style.color = 'var(--primary-800)';
                              e.currentTarget.style.borderColor = 'var(--primary-200)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--bg-surface-subtle)';
                              e.currentTarget.style.color = 'var(--text-secondary)';
                              e.currentTarget.style.borderColor = 'var(--border-subtle)';
                            }}
                          >
                            {lang === 'en' ? (sub.name_en || sub.name_ar) : sub.name_ar}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', color: 'var(--primary-700)', fontWeight: 700, fontSize: '0.9rem', gap: '4px' }}>
                    <span>{tx(t.categoriesPage.browseCategory)}</span>
                    <ArrowLeft size={16} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
