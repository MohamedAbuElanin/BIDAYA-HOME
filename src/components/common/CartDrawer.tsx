import React from 'react';
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  Truck,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';

export const CartDrawer: React.FC = () => {
  const { lang, t, tx } = useLanguage();
  const {
    items,
    isCartOpen,
    closeCart,
    openCheckout,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalAmount
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(3px)',
        zIndex: 950,
        display: 'flex',
        justifyContent: 'flex-start'
      }}
      onClick={closeCart}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '460px',
          height: '100%',
          backgroundColor: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-xl)',
          animation: 'slideInRight 0.25s ease-out'
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '18px 20px',
            borderBottom: '1px solid var(--border-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--bg-surface)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: 'var(--primary-100)',
                color: 'var(--primary-800)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ShoppingBag size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {tx(t.cart.title)}
              </h2>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {items.length} {lang === 'en' ? (items.length === 1 ? 'item' : 'items') : 'منتجات مضافة'}
              </span>
            </div>
          </div>

          <button
            onClick={closeCart}
            className="btn btn-ghost"
            style={{ padding: '8px', borderRadius: '50%' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Free Shipping / Delivery notice bar */}
        <div
          style={{
            padding: '8px 20px',
            backgroundColor: 'var(--primary-50)',
            borderBottom: '1px solid var(--primary-100)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.8rem',
            color: 'var(--primary-800)',
            fontWeight: 600
          }}
        >
          <Truck size={15} />
          <span>{lang === 'en' ? 'Fast delivery across Egypt, with cash on delivery' : 'توصيل سريع ومتاح لكافة محافظات مصر والدفع عند الاستلام'}</span>
        </div>

        {/* Drawer Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {items.length === 0 ? (
            /* Empty State */
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                textAlign: 'center',
                padding: '20px'
              }}
            >
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-surface-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                  marginBottom: '16px'
                }}
              >
                <ShoppingBag size={36} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px' }}>
                {tx(t.cart.empty)}
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '24px', maxWidth: '280px' }}>
                {tx(t.cart.emptyDesc)}
              </p>
              <button
                onClick={closeCart}
                className="btn btn-primary"
                style={{ borderRadius: 'var(--radius-full)', padding: '10px 24px' }}
              >
                <Sparkles size={16} />
                <span>{tx(t.cart.browseCatalog)}</span>
              </button>
            </div>
          ) : (
            /* Cart Items List */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {items.map((item) => (
                <div
                  key={item.product.id}
                  style={{
                    display: 'flex',
                    gap: '12px',
                    padding: '12px',
                    backgroundColor: 'var(--bg-surface-subtle)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-default)',
                    position: 'relative'
                  }}
                >
                  <img
                    src={item.selected_image}
                    alt={lang === 'en' ? (item.product.name_en || item.product.name_ar) : item.product.name_ar}
                    style={{
                      width: '74px',
                      height: '74px',
                      objectFit: 'cover',
                      borderRadius: 'var(--radius-sm)',
                      flexShrink: 0,
                      backgroundColor: '#FFFFFF'
                    }}
                  />

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h4
                          style={{
                            fontSize: '0.9rem',
                            fontWeight: 700,
                            lineHeight: '1.3',
                            color: 'var(--text-main)',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            maxWidth: '220px'
                          }}
                        >
                          {lang === 'en' ? (item.product.name_en || item.product.name_ar) : item.product.name_ar}
                        </h4>

                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          style={{
                            border: 'none',
                            background: 'none',
                            color: '#DC2626',
                            cursor: 'pointer',
                            padding: '2px',
                            opacity: 0.8
                          }}
                          title={tx(t.cart.remove)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {lang === 'ar' ? 'كود' : 'Code'}: {item.product.sku}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
                      {/* Price */}
                      <div style={{ fontWeight: 800, color: 'var(--primary-900)', fontSize: '0.95rem' }}>
                        {item.product.pricing_mode === 'on_request'
                          ? tx(t.product.onRequest)
                          : `${(item.product.price * item.quantity).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-EG')} ${tx(t.general.currency)}`}
                      </div>

                      {/* Quantity Modifier */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          border: '1px solid var(--border-default)',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: '#FFFFFF'
                        }}
                      >
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          style={{ border: 'none', background: 'none', padding: '4px 8px', cursor: 'pointer', color: 'var(--text-main)' }}
                        >
                          <Minus size={14} />
                        </button>
                        <span style={{ minWidth: '26px', textAlign: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          style={{ border: 'none', background: 'none', padding: '4px 8px', cursor: 'pointer', color: 'var(--text-main)' }}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                <button
                  onClick={clearCart}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Trash2 size={14} />
                  <span>{lang === 'en' ? 'Clear cart' : 'تفريغ السلة بالكامل'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer Summary & Checkout Action */}
        {items.length > 0 && (
          <div
            style={{
              padding: '18px 20px',
              borderTop: '1px solid var(--border-default)',
              backgroundColor: 'var(--bg-surface)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                {tx(t.cart.total)}:
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--primary-900)', fontFamily: 'Cairo, sans-serif' }}>
                  {totalAmount.toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-EG')}
                </span>
                <span style={{ fontSize: '0.9rem', color: 'var(--primary-700)', fontWeight: 700 }}>{tx(t.general.currency)}</span>
              </div>
            </div>

            <button
              onClick={openCheckout}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', borderRadius: 'var(--radius-md)', fontWeight: 800 }}
            >
              <span>{tx(t.checkout.title)}</span>
              <ArrowLeft size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
