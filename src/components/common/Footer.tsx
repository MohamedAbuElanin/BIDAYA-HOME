import React, { useState, useEffect } from 'react';
import {
  MessageCircle,
  Truck,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Heart
} from 'lucide-react';
import { dataStore } from '../../services/dataStore';
import { getDirectWhatsAppInquiryUrl } from '../../services/whatsapp';
import { analytics } from '../../services/analytics';
import { useLanguage } from '../../context/LanguageContext';

interface FooterProps {
  onNavigate: (route: string) => void;
  onSelectCategory?: (categoryId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onSelectCategory }) => {
  const { lang, t, tx } = useLanguage();
  const [settings, setSettings] = useState(dataStore.getSettings());
  const categories = dataStore.getCategories().slice(0, 5);

  useEffect(() => {
    return dataStore.subscribe(() => {
      setSettings(dataStore.getSettings());
    });
  }, []);

  return (
    <footer style={{ backgroundColor: 'var(--bg-dark)', color: '#D6D9D6', marginTop: 'auto', borderTop: '4px solid var(--primary-700)' }}>
      {/* Guarantees banner */}
      <div style={{ backgroundColor: 'var(--bg-dark-surface)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '24px 0' }}>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '20px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(56, 149, 93, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4ADE80' }}>
                <Truck size={24} />
              </div>
              <div>
                <div style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '0.95rem' }}>{tx(t.footer.shippingTitle)}</div>
                <div style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>{tx(t.footer.shippingDesc)}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(213, 175, 52, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-400)' }}>
                <ShieldCheck size={24} />
              </div>
              <div>
                <div style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '0.95rem' }}>{tx(t.footer.inspectTitle)}</div>
                <div style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>{tx(t.footer.inspectDesc)}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(56, 149, 93, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4ADE80' }}>
                <Sparkles size={24} />
              </div>
              <div>
                <div style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '0.95rem' }}>{tx(t.footer.qualityTitle)}</div>
                <div style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>{tx(t.footer.qualityDesc)}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(37, 211, 102, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#25D366' }}>
                <MessageCircle size={24} />
              </div>
              <div>
                <div style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '0.95rem' }}>{tx(t.footer.whatsappTitle)}</div>
                <div style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>{tx(t.footer.whatsappDesc)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="container" style={{ padding: '48px 16px 32px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '36px'
          }}
        >
          {/* Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <img
                src="/Logo/Icon Black & White.svg"
                alt={lang === 'ar' ? 'شعار بداية هوم' : 'Bidaya Home logo'}
                style={{
                  width: '44px',
                  height: '44px',
                  objectFit: 'contain',
                  flexShrink: 0
                }}
              />
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', fontFamily: 'Cairo, sans-serif' }}>
                  {settings.store_name_ar || 'بداية هوم'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-400)', fontWeight: 600 }}>
                  {settings.store_name_en || 'Bidaya Home'}
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.88rem', color: '#9CA3AF', lineHeight: '1.7', marginBottom: '20px' }}>
                  {lang === 'en' ? 'A complete range of practical home solutions, smart kitchen tools, and modern organizers for a more comfortable home.' : `${settings.slogan_ar || tx(t.general.slogan)}. نقدم لك تشكيلة متكاملة من الحلول المنزلية، أدوات المطبخ الذكية، والمنظمات العصرية التي تمنح منزلك الراحة والأناقة.`}
            </p>

            {/* Social Media Links */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <a
                href={settings.facebook_url || 'https://www.facebook.com/triple3homeegypt'}
                target="_blank"
                rel="noopener noreferrer"
                title="صفحتنا على فيسبوك"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#1877F2'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
              >
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>

              <a
                href={settings.instagram_url || 'https://www.instagram.com/bidaya_home1/'}
                target="_blank"
                rel="noopener noreferrer"
                title="حسابنا على انستغرام"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#E1306C'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
              >
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>

              <a
                href={getDirectWhatsAppInquiryUrl()}
                target="_blank"
                rel="noopener noreferrer"
                title="تواصل معنا عبر واتساب"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: '#25D366',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                <MessageCircle size={20} />
              </a>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>
              {tx(t.footer.storeCategories)}
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => {
                      if (onSelectCategory) onSelectCategory(cat.id);
                      onNavigate('catalog');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#9CA3AF',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      padding: 0,
                      transition: 'color 0.15s ease'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#4ADE80'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#9CA3AF'; }}
                  >
                    {lang === 'en' ? (cat.name_en || cat.name_ar) : cat.name_ar}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => onNavigate('categories')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent-400)',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  {tx(t.footer.allCategories)}
                </button>
              </li>
            </ul>
          </div>

          {/* Useful Links */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>
              {tx(t.footer.quickLinks)}
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li>
                <button
                  onClick={() => onNavigate('catalog')}
                  style={{ background: 'none', border: 'none', color: '#9CA3AF', fontSize: '0.9rem', cursor: 'pointer', padding: 0 }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#4ADE80'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#9CA3AF'; }}
                >
                  {tx(t.footer.allProducts)}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('offers')}
                  style={{ background: 'none', border: 'none', color: '#9CA3AF', fontSize: '0.9rem', cursor: 'pointer', padding: 0 }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#4ADE80'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#9CA3AF'; }}
                >
                  {tx(t.footer.currentOffers)}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  style={{ background: 'none', border: 'none', color: '#9CA3AF', fontSize: '0.9rem', cursor: 'pointer', padding: 0 }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#4ADE80'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#9CA3AF'; }}
                >
                  {tx(t.footer.aboutLink)}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  style={{ background: 'none', border: 'none', color: '#9CA3AF', fontSize: '0.9rem', cursor: 'pointer', padding: 0 }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#4ADE80'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#9CA3AF'; }}
                >
                  {tx(t.nav.contact)}
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>
              {tx(t.footer.contactInfo)}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <MapPin size={18} color="var(--primary-400)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{lang === 'en' ? 'Egypt — delivery available nationwide' : (settings.store_address || tx(t.footer.addressEgypt))}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={18} color="var(--primary-400)" style={{ flexShrink: 0 }} />
                <span dir="ltr">{settings.support_phone || '01509990745'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={18} color="var(--primary-400)" style={{ flexShrink: 0 }} />
                <span>{settings.support_email || 'bidayahome@gmail.com'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div
          style={{
            marginTop: '40px',
            paddingTop: '20px',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            fontSize: '0.82rem',
            color: '#9CA3AF'
          }}
        >
          <div>
            {lang === 'en'
              ? `© 2026 ${settings.store_name_en || 'Bidaya Home'}. ${tx(t.footer.rights)}.`
              : `جميع الحقوق محفوظة © 2026 ${settings.store_name_ar || 'بداية هوم'}`}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>{tx(t.footer.madeWithCare)}</span>
            <Heart size={14} color="#EF4444" fill="#EF4444" />
          </div>
        </div>
      </div>
    </footer>
  );
};
