import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
  MessageCircle,
  Sparkles,
  CheckCircle2,
  Plus,
  Minus,
  ShieldCheck,
  Truck,
  RotateCcw,
  Share2,
  Layers
} from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { getDirectWhatsAppInquiryUrl } from '../../services/whatsapp';
import { dataStore } from '../../services/dataStore';
import { analytics } from '../../services/analytics';
import { useLanguage } from '../../context/LanguageContext';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onSelectProduct: (p: Product) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, onClose, onSelectProduct }) => {
  const { lang, t, tx } = useLanguage();
  const { addToCart, openCheckout, showToast } = useCart();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const settings = dataStore.getSettings();

  if (!product) return null;

  const productName = lang === 'en' ? (product.name_en || product.name_ar) : product.name_ar;

  const category = dataStore.getCategoryById(product.category_id);
  const brand = product.brand_id ? dataStore.getBrands().find(b => b.id === product.brand_id) : undefined;
  const relatedProducts = dataStore
    .getProducts()
    .filter(p => p.id !== product.id && p.category_id === product.category_id)
    .slice(0, 3);

  const images = product.images && product.images.length > 0 ? product.images : [
    'https://images.unsplash.com/photo-1584473457406-6240486418e9?w=800&auto=format&fit=crop&q=80'
  ];

  const currentImage = images[selectedImageIndex] || images[0];

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const handleOrderNow = () => {
    addToCart(product, quantity);
    onClose();
    openCheckout();
  };

  const handleWhatsAppInquiry = () => {
    analytics.track('WHATSAPP_CLICK', {
      source: 'product_modal',
      product_id: product.id,
      product_name: productName
    });
    const url = getDirectWhatsAppInquiryUrl(productName, product.sku);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: productName,
        text: lang === 'en' ? `See ${productName} from Bidaya Home` : `شاهد منتج "${productName}" من بداية هوم`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast(lang === 'en' ? 'Product link copied' : 'تم نسخ رابط المنتج إلى الحافظة 📋');
    }
  };

  const discountPercent =
    product.old_price && product.old_price > product.price
      ? Math.round(((product.old_price - product.price) / product.old_price) * 100)
      : 0;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        overflowY: 'auto'
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          width: '100%',
          maxWidth: '960px',
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: 'var(--shadow-xl)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          animation: 'fadeIn 0.25s ease-out'
        }}
      >
        {/* Modal Header Bar */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            backgroundColor: '#FFFFFF',
            zIndex: 10
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <span>{category ? (lang === 'en' ? (category.name_en || category.name_ar) : category.name_ar) : (lang === 'en' ? 'Bidaya Home Products' : 'منتجات بداية هوم')}</span>
            <span>/</span>
            <span style={{ color: 'var(--primary-700)', fontWeight: 600 }}>{product.sku}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleShare}
              className="btn btn-ghost"
              style={{ padding: '8px', borderRadius: '50%' }}
              title={lang === 'en' ? 'Share product' : 'مشاركة المنتج'}
            >
              <Share2 size={18} />
            </button>
            <button
              onClick={onClose}
              className="btn btn-ghost"
              style={{ padding: '8px', borderRadius: '50%' }}
              title={tx(t.general.close)}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '32px'
            }}
          >
            {/* Gallery Section */}
            <div>
              {/* Main Image */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  paddingTop: '85%',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  backgroundColor: 'var(--bg-surface-subtle)',
                  border: '1px solid var(--border-default)',
                  marginBottom: '12px'
                }}
              >
                <img
                  src={currentImage}
                  alt={productName}
                  style={{
                    position: 'absolute',
                    top: 0,
                    insetInlineStart: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />

                {discountPercent > 0 && (
                  <span
                    className="badge badge-offer"
                    style={{
                      position: 'absolute',
                      top: '12px',
                      insetInlineEnd: '12px',
                      backgroundColor: 'var(--accent-500)',
                      color: '#FFFFFF',
                      fontSize: '0.85rem',
                      padding: '4px 10px',
                      fontWeight: 800
                    }}
                  >
                    {tx(t.offers.off)} {discountPercent}%
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      style={{
                        width: '68px',
                        height: '68px',
                        borderRadius: 'var(--radius-md)',
                        overflow: 'hidden',
                        border: `2px solid ${selectedImageIndex === idx ? 'var(--primary-700)' : 'var(--border-default)'}`,
                        padding: 0,
                        cursor: 'pointer',
                        flexShrink: 0,
                        backgroundColor: 'var(--bg-surface-subtle)'
                      }}
                    >
                      <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </button>
                  ))}
                </div>
              )}

              {/* Trust Badges */}
              <div
                style={{
                  marginTop: '20px',
                  padding: '14px',
                  backgroundColor: 'var(--bg-surface-subtle)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  fontSize: '0.82rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                  <Truck size={16} color="var(--primary-700)" />
                  <span>{lang === 'en' ? 'Fast delivery across Egypt with inspection before payment' : 'شحن سريع لجميع محافظات مصر مع إمكانية المعاينة قبل الاستلام'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                  <ShieldCheck size={16} color="var(--primary-700)" />
                  <span>{lang === 'en' ? 'Secure cash on delivery' : 'دفع نقداً عند الاستلام بكل أمان وراحة بال'}</span>
                </div>
              </div>
            </div>

            {/* Info & Purchase Section */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                {/* Brand & Stock Status */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  {brand ? (
                    <span
                      style={{
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: 'var(--accent-600)',
                        backgroundColor: 'var(--accent-50)',
                        padding: '3px 10px',
                        borderRadius: 'var(--radius-full)',
                        border: '1px solid var(--accent-100)'
                      }}
                    >
                      {lang === 'en' ? (brand.name_en || brand.name_ar) : brand.name_ar}
                    </span>
                  ) : <span></span>}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: product.is_available ? '#16A34A' : '#DC2626', fontWeight: 600 }}>
                    <CheckCircle2 size={16} />
                    <span>{product.is_available ? tx(t.product.inStock) : tx(t.product.outOfStock)}</span>
                  </div>
                </div>

                {/* Title */}
                <h1
                  style={{
                    fontSize: '1.45rem',
                    fontWeight: 800,
                    color: 'var(--text-main)',
                    lineHeight: '1.35',
                    marginBottom: '12px'
                  }}
                >
                  {productName}
                </h1>

                {/* SKU */}
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px', fontWeight: 600 }}>
                  {lang === 'en' ? 'Product code:' : 'كود المنتج:'} <span style={{ fontFamily: 'monospace', color: 'var(--text-main)' }}>{product.sku}</span>
                </div>

                {/* Price Display */}
                {settings.show_prices !== false && (
                  <div
                    style={{
                      padding: '14px 18px',
                      backgroundColor: 'var(--primary-50)',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--primary-200)',
                      marginBottom: '20px',
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: '12px'
                    }}
                  >
                    {product.pricing_mode === 'on_request' ? (
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-800)' }}>
                        {tx(t.product.onRequest)}
                      </div>
                    ) : product.pricing_mode === 'starting_at' ? (
                      <div>
                        <span style={{ fontSize: '0.85rem', color: 'var(--primary-700)', fontWeight: 600, marginInlineEnd: '6px' }}>{tx(t.product.startingAt)}:</span>
                        <span style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--primary-900)', fontFamily: 'Cairo, sans-serif' }}>
                          {product.price.toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-EG')}
                        </span>
                        <span style={{ fontSize: '0.9rem', color: 'var(--primary-700)', marginInlineStart: '4px' }}>{tx(t.general.currency)}</span>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                        <span style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--primary-900)', fontFamily: 'Cairo, sans-serif' }}>
                          {product.price.toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-EG')}
                        </span>
                        <span style={{ fontSize: '0.95rem', color: 'var(--primary-700)', fontWeight: 700 }}>{tx(t.general.currency)}</span>
                        {product.old_price && product.old_price > product.price && (
                          <span style={{ fontSize: '1.05rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                            {product.old_price.toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-EG')} {tx(t.general.currency)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Description */}
                {lang === 'ar' && <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)' }}>
                    الوصف والمميزات:
                  </h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.7', whiteSpace: 'pre-line' }}>
                    {product.description}
                  </p>
                </div>}

                {/* Specifications Table */}
                {lang === 'ar' && product.specifications && product.specifications.length > 0 && (
                  <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)' }}>
                      المواصفات الفنية:
                    </h4>
                    <div style={{ border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                      {product.specifications.map((spec, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '130px 1fr',
                            padding: '8px 12px',
                            backgroundColor: idx % 2 === 0 ? 'var(--bg-surface-subtle)' : '#FFFFFF',
                            fontSize: '0.85rem',
                            borderBottom: idx < product.specifications.length - 1 ? '1px solid var(--border-subtle)' : 'none'
                          }}
                        >
                          <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{spec.key}</span>
                          <span style={{ color: 'var(--text-main)' }}>{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Quantity Selector & Action CTAs */}
              <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
                {/* Quantity Control */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {tx(t.product.quantity)}:
                  </span>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      border: '1.5px solid var(--border-default)',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-surface-subtle)'
                    }}
                  >
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      style={{ border: 'none', background: 'none', padding: '6px 12px', cursor: 'pointer', color: 'var(--text-main)' }}
                    >
                      <Minus size={16} />
                    </button>
                    <span style={{ minWidth: '36px', textAlign: 'center', fontWeight: 700, fontSize: '1rem' }}>
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      style={{ border: 'none', background: 'none', padding: '6px 12px', cursor: 'pointer', color: 'var(--text-main)' }}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {/* Primary CTA Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <button
                      onClick={handleAddToCart}
                      className="btn btn-outline"
                      style={{ padding: '12px', borderRadius: 'var(--radius-md)', fontWeight: 700 }}
                    >
                      <ShoppingBag size={18} />
                      <span>{tx(t.product.addToCart)}</span>
                    </button>

                    <button
                      onClick={handleOrderNow}
                      className="btn btn-primary"
                      style={{ padding: '12px', borderRadius: 'var(--radius-md)', fontWeight: 700 }}
                    >
                      <span>{tx(t.product.orderNow)}</span>
                    </button>
                  </div>

                  {/* Direct WhatsApp Instant Consultation */}
                  <button
                    onClick={handleWhatsAppInquiry}
                    className="btn btn-whatsapp"
                    style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)' }}
                  >
                    <MessageCircle size={20} />
                    <span>{tx(t.product.whatsappOrder)}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Related Products Carousel / Grid */}
          {relatedProducts.length > 0 && (
            <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid var(--border-default)' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-main)' }}>
                {tx(t.product.relatedProducts)}:
              </h3>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px'
                }}
              >
                {relatedProducts.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => {
                      setSelectedImageIndex(0);
                      setQuantity(1);
                      onSelectProduct(rel);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      backgroundColor: 'var(--bg-surface)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary-600)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)'; }}
                  >
                    <img
                      src={rel.images[0]}
                      alt={lang === 'en' ? (rel.name_en || rel.name_ar) : rel.name_ar}
                      style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                    />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: '1.3', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {lang === 'en' ? (rel.name_en || rel.name_ar) : rel.name_ar}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--primary-700)', fontWeight: 800 }}>
                        {rel.price > 0 ? `${rel.price.toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-EG')} ${tx(t.general.currency)}` : tx(t.product.onRequest)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
