import React, { useState, useEffect } from 'react';
import { Flame, Sparkles, Tag, ArrowLeft } from 'lucide-react';
import { Product } from '../../types';
import { dataStore } from '../../services/dataStore';
import { ProductCard } from '../common/ProductCard';
import { useLanguage } from '../../context/LanguageContext';

interface OffersPageProps {
  onOpenDetails: (product: Product) => void;
  onNavigateToProducts: () => void;
}

export const OffersPage: React.FC<OffersPageProps> = ({ onOpenDetails, onNavigateToProducts }) => {
  const { t, tx } = useLanguage();
  const [offers, setOffers] = useState<Product[]>([]);

  useEffect(() => {
    const all = dataStore.getProducts();
    setOffers(all.filter((p) => p.is_offer || (p.old_price && p.old_price > p.price)));

    return dataStore.subscribe(() => {
      const updated = dataStore.getProducts();
      setOffers(updated.filter((p) => p.is_offer || (p.old_price && p.old_price > p.price)));
    });
  }, []);

  return (
    <div style={{ backgroundColor: 'var(--bg-main)', minHeight: '80vh', padding: '40px 0 70px' }}>
      <div className="container">
        {/* Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, var(--accent-700) 0%, var(--accent-500) 100%)',
            color: '#FFFFFF',
            borderRadius: 'var(--radius-xl)',
            padding: '36px 32px',
            marginBottom: '40px',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px'
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'rgba(255,255,255,0.2)',
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.85rem',
                fontWeight: 700,
                marginBottom: '12px'
              }}
            >
              <Flame size={16} />
              <span>{tx(t.offers.eyebrow)}</span>
            </div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '8px', fontFamily: 'Cairo, sans-serif' }}>
              {tx(t.offers.headline)}
            </h1>
            <p style={{ fontSize: '0.95rem', opacity: 0.95, maxWidth: '500px' }}>
              {tx(t.offers.bannerText)}
            </p>
          </div>

          <div
            style={{
              backgroundColor: '#FFFFFF',
              color: 'var(--accent-700)',
              padding: '16px 24px',
              borderRadius: 'var(--radius-lg)',
              fontWeight: 900,
              fontSize: '1.2rem',
              textAlign: 'center',
              boxShadow: '0 4px 14px rgba(0,0,0,0.1)'
            }}
          >
            <div>{tx(t.offers.upTo)}</div>
            <div style={{ fontSize: '2rem', fontFamily: 'Cairo, sans-serif' }}>30%</div>
          </div>
        </div>

        {/* Offers Grid */}
        {offers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)' }}>
            <p style={{ color: 'var(--text-muted)' }}>{tx(t.offers.noOffers)}</p>
            <button onClick={onNavigateToProducts} className="btn btn-primary" style={{ marginTop: '16px' }}>
              {tx(t.offers.browseAll)}
            </button>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '24px'
            }}
          >
            {offers.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenDetails={onOpenDetails}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
