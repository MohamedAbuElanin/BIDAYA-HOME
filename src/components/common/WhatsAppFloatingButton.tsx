import React from 'react';
import { MessageCircle } from 'lucide-react';
import { getDirectWhatsAppInquiryUrl } from '../../services/whatsapp';
import { analytics } from '../../services/analytics';
import { useLanguage } from '../../context/LanguageContext';

export const WhatsAppFloatingButton: React.FC = () => {
  const { lang } = useLanguage();
  const handleClick = () => {
    analytics.track('WHATSAPP_CLICK', { source: 'floating_button' });
    const url = getDirectWhatsAppInquiryUrl();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        insetInlineEnd: '24px',
        zIndex: 900,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '8px'
      }}
    >
      <button
        onClick={handleClick}
        className="pulse-whatsapp"
        title={lang === 'en' ? 'Contact us directly on WhatsApp' : 'تواصل معنا مباشرة عبر واتساب'}
        aria-label={lang === 'en' ? 'Order on WhatsApp' : 'اطلب عبر واتساب'}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#25D366',
          color: '#ffffff',
          border: 'none',
          width: '52px',
          height: '52px',
          padding: 0,
          borderRadius: '50px',
          cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(37, 211, 102, 0.4)',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-3px) scale(1.03)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
        }}
      >
        <MessageCircle size={22} />
      </button>
    </div>
  );
};
