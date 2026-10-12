import React from 'react';
import { ShoppingBag, Eye, Sparkles, Check, Flame, Heart, GitCompare } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { analytics } from '../../services/analytics';
import { dataStore } from '../../services/dataStore';
import { useLanguage } from '../../context/LanguageContext';
import { useProductPreferences } from '../../context/ProductPreferencesContext';

interface ProductCardProps {
  product: Product;
  onOpenDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenDetails }) => {
  const { addToCart, items } = useCart();
  const { isWishlisted, isCompared, toggleWishlist, toggleCompare } = useProductPreferences();
  const settings = dataStore.getSettings();
  const { lang, t, tx } = useLanguage();
  const productName = lang === 'en' ? (product.name_en || product.name_ar) : product.name_ar;

  const cartItem = items.find((i) => i.product.id === product.id);
  const isInCart = Boolean(cartItem);

  const primaryImage =
    product.images[product.primary_image_index || 0] ||
    product.images[0] ||
    'https://images.unsplash.com/photo-1584473457406-6240486418e9?w=600&auto=format&fit=crop&q=80';

  const discountPercent =
    product.old_price && product.old_price > product.price
      ? Math.round(((product.old_price - product.price) / product.old_price) * 100)
      : 0;

  const handleCardClick = () => {
    // PRODUCT_CLICK = user tapped/clicked the card (intent signal).
    // PRODUCT_VIEW = fires in App.tsx/handleOpenDetails when the modal is fully open (actual detail view).
    // Keeping them separate prevents double-counting a single user action as two product views.
    analytics.track('PRODUCT_CLICK', {
      product_id: product.id,
      product_name: productName,
      sku: product.sku
    });
    dataStore.incrementProductViews(product.id);
    onOpenDetails(product);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handlePreference = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  return (
    <div
      onClick={handleCardClick}
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        position: 'relative',
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-default)',
        overflow: 'hidden',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        height: '100%'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
        e.currentTarget.style.borderColor = 'var(--border-hover)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        e.currentTarget.style.borderColor = 'var(--border-default)';
      }}
    >
      {/* Image Container with Badges */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          paddingTop: '80%', // 4:3 Aspect ratio
          overflow: 'hidden',
          backgroundColor: 'var(--bg-surface-subtle)'
        }}
      >
        <img
          src={primaryImage}
          alt={productName}
          loading="lazy"
          style={{
            position: 'absolute',
            top: 0,
            insetInlineStart: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        />

        <div style={{ position: 'absolute', top: '10px', insetInlineStart: '10px', zIndex: 3, display: 'flex', gap: '6px' }}>
          <button
            type="button"
            onClick={(event) => handlePreference(event, () => toggleWishlist(product.id))}
            aria-label={isWishlisted(product.id) ? (lang === 'ar' ? 'إزالة من المفضلة' : 'Remove from wishlist') : (lang === 'ar' ? 'إضافة للمفضلة' : 'Add to wishlist')}
            title={lang === 'ar' ? 'المفضلة' : 'Wishlist'}
            style={{ width: '34px', height: '34px', borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,.94)', color: isWishlisted(product.id) ? 'var(--accent-600)' : 'var(--text-main)', display: 'grid', placeItems: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,.12)' }}
          ><Heart size={17} fill={isWishlisted(product.id) ? 'currentColor' : 'none'} /></button>
          <button
            type="button"
            onClick={(event) => handlePreference(event, () => toggleCompare(product.id))}
            aria-label={isCompared(product.id) ? (lang === 'ar' ? 'إزالة من المقارنة' : 'Remove from comparison') : (lang === 'ar' ? 'إضافة للمقارنة' : 'Add to comparison')}
            title={lang === 'ar' ? 'المقارنة' : 'Compare'}
            style={{ width: '34px', height: '34px', borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,.94)', color: isCompared(product.id) ? 'var(--primary-700)' : 'var(--text-main)', display: 'grid', placeItems: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,.12)' }}
          ><GitCompare size={17} /></button>
        </div>

        {/* Badges Container */}
        <div
          style={{
            position: 'absolute',
            top: '10px',
            insetInlineEnd: '10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            zIndex: 2
          }}
        >
          {product.is_offer && discountPercent > 0 && (
            <span
              className="badge badge-offer"
              style={{
                boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
                backgroundColor: 'var(--accent-500)',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 800
              }}
            >
              <Flame size={12} fill="#FFFFFF" />
              {tx(t.offers.off)} {discountPercent}%
            </span>
          )}

          {product.is_featured && (
            <span
              className="badge badge-featured"
              style={{
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                backgroundColor: 'var(--primary-700)',
                color: '#FFFFFF',
                border: 'none'
              }}
            >
              <Sparkles size={12} />
              {tx(t.product.featured)}
            </span>
          )}

          {product.is_new && (
            <span className="badge badge-new" style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }}>
              {tx(t.product.new)}
            </span>
          )}
        </div>

        {/* Quick View overlay button */}
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            insetInlineStart: '10px',
            zIndex: 2,
            background: 'rgba(255,255,255,0.92)',
            borderRadius: '50%',
            width: '34px',
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            color: 'var(--text-main)',
            transition: 'all 0.2s ease'
          }}
          title={tx(t.product.viewDetails)}
        >
          <Eye size={17} />
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
        <div>
          {/* SKU / Code */}
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>
            {lang === 'ar' ? 'كود' : 'Code'}: {product.sku}
          </div>

          {/* Title */}
          <h3
            style={{
              fontSize: '1rem',
              fontWeight: 700,
              lineHeight: '1.45',
              color: 'var(--text-main)',
              marginBottom: '8px',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: '2.9rem'
            }}
          >
            {productName}
          </h3>

          {/* Short description */}
          {product.short_description && lang === 'ar' && (
            <p
              style={{
                fontSize: '0.82rem',
                color: 'var(--text-secondary)',
                lineHeight: '1.4',
                marginBottom: '12px',
                display: '-webkit-box',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {product.short_description}
            </p>
          )}
        </div>

        {/* Pricing & CTA Section */}
        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            
            {/* Price Display */}
            {settings.show_prices !== false ? (
              <div>
                {product.pricing_mode === 'on_request' ? (
                  <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary-700)' }}>
                    {tx(t.product.onRequest)}
                  </span>
                ) : product.pricing_mode === 'starting_at' ? (
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{tx(t.product.startingAt)}</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                      <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-800)', fontFamily: 'Cairo, sans-serif' }}>
                        {product.price.toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-EG')}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{tx(t.general.currency)}</span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                      <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-800)', fontFamily: 'Cairo, sans-serif' }}>
                        {product.price.toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-EG')}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{tx(t.general.currency)}</span>
                    </div>
                    {product.old_price && product.old_price > product.price && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                        {product.old_price.toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-EG')} {tx(t.general.currency)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{tx(t.product.onRequest)}</span>
            )}

            {/* Stock indicator */}
            <div style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', color: product.is_available ? '#16A34A' : '#DC2626' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: product.is_available ? '#16A34A' : '#DC2626' }}></span>
              <span>{product.is_available ? tx(t.product.inStock) : tx(t.product.outOfStock)}</span>
            </div>
          </div>

          {/* Add to Cart Button */}
          {settings.enable_ordering !== false && (
            <button
              onClick={handleAddToCart}
              disabled={!product.is_available}
              className={isInCart ? 'btn btn-outline' : 'btn btn-primary'}
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '0.88rem',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                opacity: product.is_available ? 1 : 0.6
              }}
            >
              {isInCart ? (
                <>
                  <Check size={16} color="var(--primary-700)" />
                  <span style={{ color: 'var(--primary-700)' }}>
                    {tx(t.product.inCart)} ({cartItem?.quantity}) +
                  </span>
                </>
              ) : (
                <>
                  <ShoppingBag size={16} />
                  <span>{tx(t.product.addToCart)}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
