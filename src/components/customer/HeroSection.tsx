import React from 'react';
import {
  Sparkles,
  ArrowLeft,
  MessageCircle,
  Truck,
  ShieldCheck,
  PackageCheck,
  Grid
} from 'lucide-react';
import { getDirectWhatsAppInquiryUrl } from '../../services/whatsapp';
import { analytics } from '../../services/analytics';
import { useLanguage } from '../../context/LanguageContext';

interface HeroSectionProps {
  onNavigate: (route: string) => void;
  onSelectCategory?: (categoryId: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate, onSelectCategory }) => {
  const { t, tx } = useLanguage();
  return (
    <section
      style={{
        position: 'relative',
        backgroundColor: 'var(--bg-surface-subtle)',
        borderBottom: '1px solid var(--border-default)',
        overflow: 'hidden',
        padding: '48px 0 60px'
      }}
    >
      {/* Background soft ambient accents */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          insetInlineEnd: '-5%',
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56, 149, 93, 0.08) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-10%',
          insetInlineStart: '-5%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(217, 112, 54, 0.06) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}
      />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '40px',
            alignItems: 'center'
          }}
        >
          {/* Text Content */}
          <div>
            {/* Slogan Pill */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--primary-100)',
                color: 'var(--primary-800)',
                fontSize: '0.85rem',
                fontWeight: 700,
                marginBottom: '20px',
                border: '1px solid var(--primary-200)'
              }}
            >
              <Sparkles size={16} />
              <span>{tx(t.hero.pill)}</span>
            </div>

            {/* Main Headline */}
            <h1
              style={{
                fontSize: 'clamp(2rem, 4.5vw, 3rem)',
                fontWeight: 900,
                color: 'var(--text-main)',
                lineHeight: '1.25',
                marginBottom: '18px',
                fontFamily: 'Cairo, sans-serif'
              }}
            >
              {tx(t.hero.headline)}{' '}
              <span style={{ color: 'var(--primary-700)', position: 'relative', display: 'inline-block' }}>
                {tx(t.hero.headlineAccent)}
              </span>
            </h1>

            {/* Supporting Text */}
            <p
              style={{
                fontSize: 'clamp(1rem, 2vw, 1.12rem)',
                color: 'var(--text-secondary)',
                lineHeight: '1.7',
                marginBottom: '28px',
                maxWidth: '540px'
              }}
            >
              {tx(t.hero.subtext)}
            </p>

            {/* CTAs */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '14px',
                marginBottom: '32px'
              }}
            >
              <button
                onClick={() => onNavigate('catalog')}
                className="btn btn-primary btn-lg"
                style={{ borderRadius: 'var(--radius-full)', padding: '12px 28px', fontWeight: 800 }}
              >
                <Grid size={18} />
                <span>{tx(t.hero.ctaBrowse)}</span>
                <ArrowLeft size={18} />
              </button>

              <button
                onClick={() => onNavigate('contact')}
                className="btn btn-outline btn-lg"
                style={{ borderRadius: 'var(--radius-full)', padding: '12px 24px', fontWeight: 700 }}
              >
                <span>{tx(t.hero.ctaContact)}</span>
              </button>

              <a
                href={getDirectWhatsAppInquiryUrl()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => analytics.track('WHATSAPP_CLICK', { source: 'hero_button' })}
                className="btn btn-whatsapp"
                style={{
                  borderRadius: 'var(--radius-full)',
                  padding: '12px 20px',
                  fontWeight: 700,
                  textDecoration: 'none'
                }}
              >
                <MessageCircle size={18} />
                <span>{tx(t.hero.ctaWhatsapp)}</span>
              </a>
            </div>

            {/* Feature Highlights */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '16px',
                paddingTop: '20px',
                borderTop: '1px solid var(--border-default)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                <Truck size={18} color="var(--primary-700)" />
                <span>{tx(t.hero.featShipping)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                <ShieldCheck size={18} color="var(--accent-600)" />
                <span>{tx(t.hero.featInspect)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                <PackageCheck size={18} color="var(--primary-700)" />
                <span>{tx(t.hero.featQuality)}</span>
              </div>
            </div>
          </div>

          {/* Hero Visual Showcase */}
          <div style={{ position: 'relative' }}>
            <div
              style={{
                position: 'relative',
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-xl)',
                border: '4px solid #FFFFFF',
                backgroundColor: '#FFFFFF'
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=900&auto=format&fit=crop&q=80"
                alt="Bidaya Home Kitchen & Living"
                style={{
                  width: '100%',
                  height: '420px',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />

              {/* Floating Highlight Card: Kitchen & Food Storage */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '20px',
                  insetInlineEnd: '20px',
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(8px)',
                  padding: '12px 18px',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  border: '1px solid rgba(255,255,255,0.8)'
                }}
              >
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--primary-700)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800
                  }}
                >
                  <Sparkles size={22} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-main)' }}>
                    {tx(t.hero.collectionLabel)}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--accent-600)', fontWeight: 700 }}>
                    {tx(t.hero.collectionBadge)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
