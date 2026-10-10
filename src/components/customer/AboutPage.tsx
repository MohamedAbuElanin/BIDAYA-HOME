import React from 'react';
import { Sparkles, Heart, ShieldCheck, Truck, Users, MessageCircle } from 'lucide-react';
import { getDirectWhatsAppInquiryUrl } from '../../services/whatsapp';
import { useLanguage } from '../../context/LanguageContext';

export const AboutPage: React.FC = () => {
  const { t, tx } = useLanguage();
  return (
    <div style={{ backgroundColor: 'var(--bg-main)', minHeight: '80vh', padding: '50px 0 80px' }}>
      <div className="container">
        {/* Story Section */}
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
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
              <Sparkles size={16} />
              <span>{tx(t.about.eyebrow)}</span>
            </div>
            <h1 style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '16px', fontFamily: 'Cairo, sans-serif' }}>
              {tx(t.general.slogan)}
            </h1>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
              {tx(t.about.intro)}
            </p>
          </div>

          {/* Core Values */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-xl)',
              padding: '36px',
              border: '1px solid var(--border-default)',
              boxShadow: 'var(--shadow-sm)',
              marginBottom: '40px'
            }}
          >
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '20px', fontFamily: 'Cairo, sans-serif' }}>
              {tx(t.about.valuesTitle)}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'var(--primary-100)', color: 'var(--primary-800)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                    {tx(t.about.qualityTitle)}
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    {tx(t.about.qualityText)}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'var(--accent-100)', color: 'var(--accent-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MessageCircle size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                    {tx(t.about.orderingTitle)}
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    {tx(t.about.orderingText)}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'var(--primary-100)', color: 'var(--primary-800)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Truck size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                    {tx(t.about.shippingTitle)}
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    {tx(t.about.shippingText)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Direct CTA */}
          <div style={{ textAlign: 'center' }}>
            <a
              href={getDirectWhatsAppInquiryUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp btn-lg"
              style={{ borderRadius: 'var(--radius-full)', textDecoration: 'none', padding: '12px 32px' }}
            >
              <MessageCircle size={20} />
              <span>{tx(t.about.cta)}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
