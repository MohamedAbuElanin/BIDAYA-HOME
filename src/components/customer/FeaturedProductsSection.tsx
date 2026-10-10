import React, { useState, useEffect } from 'react';
import { Sparkles, Flame, Clock, ArrowLeft } from 'lucide-react';
import { Product } from '../../types';
import { dataStore } from '../../services/dataStore';
import { ProductCard } from '../common/ProductCard';
import { useLanguage } from '../../context/LanguageContext';

interface FeaturedProductsSectionProps {
  onOpenDetails: (product: Product) => void;
  onViewAllProducts: () => void;
}

type TabType = 'featured' | 'offers' | 'new';

export const FeaturedProductsSection: React.FC<FeaturedProductsSectionProps> = ({
  onOpenDetails,
  onViewAllProducts
}) => {
  const { t, tx } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>('featured');
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    setProducts(dataStore.getProducts());
    return dataStore.subscribe(() => {
      setProducts(dataStore.getProducts());
    });
  }, []);

  const getFilteredProducts = () => {
    switch (activeTab) {
      case 'offers':
        return products.filter((p) => p.is_offer || (p.old_price && p.old_price > p.price));
      case 'new':
        return products.filter((p) => p.is_new);
      case 'featured':
      default:
        return products.filter((p) => p.is_featured);
    }
  };

  const displayProducts = getFilteredProducts();

  return (
    <section style={{ padding: '60px 0', backgroundColor: 'var(--bg-main)' }}>
      <div className="container">
        {/* Header & Tabs Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '32px',
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
                color: 'var(--accent-600)',
                fontWeight: 700,
                fontSize: '0.85rem',
                marginBottom: '6px'
              }}
            >
              <Sparkles size={16} />
              <span>{tx(t.featured.sectionBadge)}</span>
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'Cairo, sans-serif' }}>
              {tx(t.featured.sectionTitle)}
            </h2>
          </div>

          {/* Tabs Filter */}
          <div
            style={{
              display: 'inline-flex',
              backgroundColor: '#FFFFFF',
              padding: '4px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-default)',
              boxShadow: 'var(--shadow-xs)'
            }}
          >
            <button
              onClick={() => setActiveTab('featured')}
              style={{
                border: 'none',
                background: activeTab === 'featured' ? 'var(--primary-700)' : 'transparent',
                color: activeTab === 'featured' ? '#FFFFFF' : 'var(--text-secondary)',
                padding: '8px 18px',
                borderRadius: 'var(--radius-full)',
                fontWeight: activeTab === 'featured' ? 700 : 500,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              <Sparkles size={15} />
              <span>{tx(t.featured.tabFeatured)}</span>
            </button>

            <button
              onClick={() => setActiveTab('offers')}
              style={{
                border: 'none',
                background: activeTab === 'offers' ? 'var(--accent-500)' : 'transparent',
                color: activeTab === 'offers' ? '#FFFFFF' : 'var(--text-secondary)',
                padding: '8px 18px',
                borderRadius: 'var(--radius-full)',
                fontWeight: activeTab === 'offers' ? 700 : 500,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              <Flame size={15} />
              <span>{tx(t.featured.tabOffers)}</span>
            </button>

            <button
              onClick={() => setActiveTab('new')}
              style={{
                border: 'none',
                background: activeTab === 'new' ? 'var(--primary-700)' : 'transparent',
                color: activeTab === 'new' ? '#FFFFFF' : 'var(--text-secondary)',
                padding: '8px 18px',
                borderRadius: 'var(--radius-full)',
                fontWeight: activeTab === 'new' ? 700 : 500,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              <Clock size={15} />
              <span>{tx(t.featured.tabNew)}</span>
            </button>
          </div>
        </div>

        {/* Product Cards Grid */}
        {displayProducts.length === 0 ? (
          <div
            style={{
              padding: '48px',
              textAlign: 'center',
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-default)'
            }}
          >
            <p style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>{tx(t.featured.noProducts)}</p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '24px'
            }}
          >
            {displayProducts.slice(0, 8).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenDetails={onOpenDetails}
              />
            ))}
          </div>
        )}

        {/* Footer View All CTA */}
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <button
            onClick={onViewAllProducts}
            className="btn btn-outline btn-lg"
            style={{
              borderRadius: 'var(--radius-full)',
              padding: '12px 32px',
              fontWeight: 700,
              backgroundColor: '#FFFFFF'
            }}
          >
            <span>{tx(t.featured.viewAllBtn)} ({products.length})</span>
            <ArrowLeft size={18} />
          </button>
        </div>
      </div>
    </section>
  );
};
