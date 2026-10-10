import React from 'react';
import {
  Sparkles,
  MessageCircle,
  Truck,
  ShieldCheck,
  CheckCircle2,
  PhoneCall,
  HeartHandshake
} from 'lucide-react';
import { getDirectWhatsAppInquiryUrl } from '../../services/whatsapp';
import { analytics } from '../../services/analytics';
import { useLanguage } from '../../context/LanguageContext';

export const WhyBidayaSection: React.FC = () => {
  const { t, tx } = useLanguage();
  const reasons = [
    {
      icon: Sparkles,
      title: tx(t.why.r1Title),
      desc: tx(t.why.r1Desc)
    },
    {
      icon: MessageCircle,
      title: tx(t.why.r2Title),
      desc: tx(t.why.r2Desc)
    },
    {
      icon: ShieldCheck,
      title: tx(t.why.r3Title),
      desc: tx(t.why.r3Desc)
    },
    {
      icon: Truck,
      title: tx(t.why.r4Title),
      desc: tx(t.why.r4Desc)
    },
    {
      icon: PhoneCall,
      title: tx(t.why.r5Title),
      desc: tx(t.why.r5Desc)
    },
    {
      icon: HeartHandshake,
      title: tx(t.why.r6Title),
      desc: tx(t.why.r6Desc)
    }
  ];

  return (
    <section style={{ padding: '70px 0', backgroundColor: '#FFFFFF', borderTop: '1px solid var(--border-default)' }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px' }}>
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
            <CheckCircle2 size={16} />
            <span>{tx(t.why.badge)}</span>
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '12px', fontFamily: 'Cairo, sans-serif' }}>
            {tx(t.why.title)}
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            {tx(t.why.subtitle)}
          </p>
        </div>

        {/* Reasons Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
            marginBottom: '40px'
          }}
        >
          {reasons.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                style={{
                  padding: '28px 24px',
                  backgroundColor: 'var(--bg-surface-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-default)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.borderColor = 'var(--primary-400)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--border-default)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: '#FFFFFF',
                    color: 'var(--primary-700)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'var(--shadow-sm)',
                    marginBottom: '18px'
                  }}
                >
                  <Icon size={24} />
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px', fontFamily: 'Cairo, sans-serif' }}>
                  {item.title}
                </h3>

                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.65' }}>
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* WhatsApp Banner Callout */}
        <div
          style={{
            background: 'linear-gradient(135deg, var(--primary-900) 0%, var(--primary-800) 100%)',
            color: '#FFFFFF',
            borderRadius: 'var(--radius-xl)',
            padding: '32px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px',
            boxShadow: 'var(--shadow-lg)'
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '6px', fontFamily: 'Cairo, sans-serif' }}>
              {tx(t.why.ctaQuestion)}
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#D1FAE5' }}>
              {tx(t.why.ctaDesc)}
            </p>
          </div>

          <a
            href={getDirectWhatsAppInquiryUrl()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => analytics.track('WHATSAPP_CLICK', { source: 'why_bidaya_banner' })}
            className="btn btn-whatsapp btn-lg"
            style={{ borderRadius: 'var(--radius-full)', textDecoration: 'none', padding: '12px 28px' }}
          >
            <MessageCircle size={20} />
            <span>{tx(t.why.cta)}</span>
          </a>
        </div>
      </div>
    </section>
  );
};
