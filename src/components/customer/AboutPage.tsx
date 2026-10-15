import React from 'react';
import { Home, MessageCircle, ShieldCheck, Sparkles, Truck } from 'lucide-react';
import { getDirectWhatsAppInquiryUrl } from '../../services/whatsapp';
import { useLanguage } from '../../context/LanguageContext';

export const AboutPage: React.FC = () => {
  const { t, tx } = useLanguage();
  return (
    <div style={{ backgroundColor: 'var(--bg-main)', minHeight: '80vh', padding: 'clamp(40px, 6vw, 80px) 0' }}>
      <div className="container">
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <header style={{ textAlign: 'center', marginBottom: '40px' }}>
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
            <h1 style={{ fontWeight: 900, color: 'var(--text-main)', marginBottom: '16px' }}>
              {tx(t.general.slogan)}
            </h1>
            <p style={{ fontSize: '1.05rem', maxWidth: '680px', margin: '0 auto', lineHeight: '1.8' }}>
              {tx(t.about.intro)}
            </p>
            <div
              style={{
                margin: '32px auto 0',
                padding: '24px',
                maxWidth: '680px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <img
                src="/Logo/Official Logo.svg"
                alt={tx(t.general.storeName)}
                style={{ display: 'block', width: '100%', maxWidth: '455px', margin: '0 auto' }}
              />
            </div>
          </header>

          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-xl)',
              padding: 'clamp(24px, 5vw, 40px)',
              border: '1px solid var(--border-default)',
              boxShadow: 'var(--shadow-sm)',
              marginBottom: '40px'
            }}
          >
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '28px' }}>
              <div style={{ width: '46px', height: '46px', borderRadius: '14px', backgroundColor: 'var(--primary-100)', color: 'var(--primary-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Home size={24} />
              </div>
              <div>
                <h2 style={{ fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>
                  {tx(t.about.story)}
                </h2>
                <p style={{ lineHeight: '1.8' }}>{tx(t.about.storyText)}</p>
              </div>
            </div>
          </div>

          <section style={{ marginBottom: '40px' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontWeight: 800, marginBottom: '8px' }}>{tx(t.about.identityTitle)}</h2>
              <p>{tx(t.about.identityText)}</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '16px' }}>
              <div className="card" style={{ padding: '24px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: 'var(--primary-700)', flexShrink: 0 }} aria-hidden="true" />
                <div>
                  <h3 style={{ fontWeight: 800, marginBottom: '6px' }}>{tx(t.about.blueTitle)}</h3>
                  <p>{tx(t.about.blueText)}</p>
                </div>
              </div>
              <div className="card" style={{ padding: '24px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: 'var(--accent-500)', flexShrink: 0 }} aria-hidden="true" />
                <div>
                  <h3 style={{ fontWeight: 800, marginBottom: '6px' }}>{tx(t.about.goldTitle)}</h3>
                  <p>{tx(t.about.goldText)}</p>
                </div>
              </div>
            </div>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ textAlign: 'center', fontWeight: 800, marginBottom: '24px' }}>
              {tx(t.about.valuesTitle)}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '16px' }}>
              <div className="card" style={{ padding: '24px' }}>
                <ShieldCheck size={24} color="var(--primary-700)" />
                <h3 style={{ fontWeight: 800, margin: '12px 0 6px' }}>{tx(t.about.qualityTitle)}</h3>
                <p>{tx(t.about.qualityText)}</p>
              </div>
              <div className="card" style={{ padding: '24px' }}>
                <MessageCircle size={24} color="var(--primary-700)" />
                <h3 style={{ fontWeight: 800, margin: '12px 0 6px' }}>{tx(t.about.orderingTitle)}</h3>
                <p>{tx(t.about.orderingText)}</p>
              </div>
              <div className="card" style={{ padding: '24px' }}>
                <Truck size={24} color="var(--primary-700)" />
                <h3 style={{ fontWeight: 800, margin: '12px 0 6px' }}>{tx(t.about.shippingTitle)}</h3>
                <p>{tx(t.about.shippingText)}</p>
              </div>
            </div>
          </section>

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
